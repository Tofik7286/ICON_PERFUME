import logging

from django.utils import timezone
from django.db import transaction
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from mainapp.models import ProductVariant, CheckoutSession
from mainapp.serializers import ProductVariantSerializer
from mainapp.responses import error_response

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
@transaction.atomic
def create_buynow_session(request):
    """
    POST /api/buy-now/
    Creates a CheckoutSession with a 30-min expiry.
    Body: { "variant_id": <int>, "quantity": <int> }
    Returns: { "success": true, "session_token": "<uuid>" }
    Atomically locks and validates stock using select_for_update().
    """
    try:
        variant_id = request.data.get('variant_id')
        quantity = int(request.data.get('quantity', 1))

        if not variant_id or quantity < 1:
            return error_response('variant_id and quantity (>=1) required', status_code=status.HTTP_400_BAD_REQUEST)

        variant = ProductVariant.objects.select_for_update().get(id=variant_id)

        if not variant.available:
            return error_response('This product is currently unavailable', status_code=status.HTTP_400_BAD_REQUEST)

        if variant.stock < quantity:
            return error_response(
                f'Only {variant.stock} unit(s) available',
                status_code=status.HTTP_409_CONFLICT
            )

        # Determine user (authenticated or guest)
        user = request.user if request.user.is_authenticated else None

        # Create checkout session with price snapshot from DB
        session = CheckoutSession.objects.create(
            variant=variant,
            quantity=quantity,
            price_snapshot=variant.discounted_price,
            user=user,
            expires_at=timezone.now() + timezone.timedelta(minutes=30),
        )

        return Response({
            'success': True,
            'session_token': str(session.session_token),
            'expires_at': session.expires_at.isoformat(),
        }, status=status.HTTP_201_CREATED)

    except ProductVariant.DoesNotExist:
        return error_response('Product variant not found', status_code=status.HTTP_404_NOT_FOUND)
    except (ValueError, TypeError):
        return error_response('Invalid variant_id or quantity', status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Error in create_buynow_session")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_buynow_session(request):
    """
    GET /api/buy-now-session/?session_token=<uuid>
    Returns fresh session data with live prices from DB.
    """
    try:
        session_token = request.query_params.get('session_token')
        if not session_token:
            return error_response('session_token required', status_code=status.HTTP_400_BAD_REQUEST)

        session = CheckoutSession.objects.select_related(
            'variant', 'variant__product'
        ).get(session_token=session_token)

        if session.is_expired():
            session.delete()
            return error_response('Session expired. Please try again.', status_code=status.HTTP_410_GONE)

        # Always return live price from DB, not snapshot
        variant = session.variant
        variant_data = ProductVariantSerializer(variant, context={'request': request}).data

        return Response({
            'success': True,
            'session_token': str(session.session_token),
            'item': variant_data,
            'quantity': session.quantity,
            'price_snapshot': str(session.price_snapshot),
            'live_price': str(variant.discounted_price),
            'expires_at': session.expires_at.isoformat(),
        }, status=status.HTTP_200_OK)

    except CheckoutSession.DoesNotExist:
        return error_response('Session not found or expired', status_code=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception("Error in get_buynow_session")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
