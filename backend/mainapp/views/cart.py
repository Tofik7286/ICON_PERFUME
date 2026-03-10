import json
import logging

from rest_framework.decorators import api_view , APIView, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.utils import append_log
from accounts.models import *
from mainapp.serializers import *
from mainapp.models import *
from mainapp.responses import success_response, error_response

logger = logging.getLogger(__name__)



class UserCart(APIView):
    permission_classes = [IsAuthenticated]
    """ This function takes user token from query params and return and user cart with username and products. """
    def get(self, request):
        # first get user token cause authorize user only can access cart
        user = request.user
        try:
            cart_items = Cart.objects.filter(user=user).select_related('variant__product__series').prefetch_related('variant__product__category', 'variant__images', 'variant__notes')
            if not cart_items.exists():
                return Response({'success':True,'message':'No Items in cart', 'cart_items': []},status=status.HTTP_200_OK)

            serializer = CartSerializer(cart_items,many=True)
            cart_serialized = serializer.data

            return Response({'success':True,'cart_items':cart_serialized},status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Error in UserCart.get")
            return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, id=None):
        """
        ATOMIC CART UPDATE: Add or update product in cart.
        Supports two modes:
        1. Legacy: POST /cart/<id>/?quantity=X (backward compatible)
        2. Modern: POST /cart/ with JSON body: {"variant_id": X, "quantity": Y}
        """
        user = request.user
        
        try:
            # Determine variant_id and quantity from request
            if id:
                # Legacy mode: variant_id from URL path
                variant_id = id
                quantity = request.query_params.get('quantity', 1)
            else:
                # Modern mode: JSON body with variant_id and quantity
                try:
                    data = json.loads(request.body)
                    variant_id = data.get('variant_id')
                    quantity = data.get('quantity', 1)
                    if not variant_id:
                        return Response(
                            {'success': False, 'message': 'variant_id is required'},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                except json.JSONDecodeError:
                    return Response(
                        {'success': False, 'message': 'Invalid JSON body'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            # Always convert quantity to int
            try:
                quantity = int(quantity)
                if quantity < 1:
                    return Response(
                        {'success': False, 'message': 'Quantity must be at least 1'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            except ValueError:
                return Response(
                    {'success': False, 'message': 'Invalid quantity'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verify variant exists
            try:
                variant = ProductVariant.objects.get(id=variant_id)
            except ProductVariant.DoesNotExist:
                return Response(
                    {'success': False, 'message': 'This variant does not exist'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # ATOMIC OPERATION: Use update_or_create for idempotent cart updates
            # If item exists, update quantity; if not, create new item
            cart_item, created = Cart.objects.update_or_create(
                user=user,
                variant=variant,
                defaults={'quantity': quantity}
            )
            
            serializer = CartSerializer(cart_item)
            
            # Return appropriate status code and message
            status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
            message = "Product Added To Cart Successfully" if created else "Cart Updated Successfully"
            
            return Response(
                {
                    'success': True,
                    'message': message,
                    'cart': serializer.data,
                    'created': created
                },
                status=status_code
            )
        except Exception as e:
            logger.exception("Error in UserCart.post")
            return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def delete(self,request,id):
        """ This function takes token in query params and product id in url parameter and delete the product from the user cart."""
        user = request.user
        try:
            try:
                variant = ProductVariant.objects.get(id=id)
            except ProductVariant.DoesNotExist:
                return error_response('Product does not exist', status_code=status.HTTP_404_NOT_FOUND)
            
            try:
                cart = Cart.objects.get(user=user, variant=variant)
                cart.delete()
                return Response({'success':True,'message':'Item Removed From Cart successfully'},status=status.HTTP_200_OK)
            except Cart.DoesNotExist:
                return error_response('Product is not exists in cart', status_code=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.exception("Error in UserCart.delete")
            return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def plus_cart(request, id):
    try:
        user = request.user
        cart = Cart.objects.get(id=id, user=user)
        if (cart.quantity + 1) > cart.variant.stock:
            title = cart.variant.product.title
            short_title = (title[:12] + '...') if len(title) > 12 else title
            return Response(
                {'success': False, 'message': f'Currently Only {cart.variant.stock} Quantity is Available for {short_title}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        cart.quantity += 1
        cart.save()
        return Response({'success': True, 'message': 'Cart updated'}, status=status.HTTP_200_OK)
    except Cart.DoesNotExist:
        return error_response('Cart item not found', status_code=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception("Error in plus_cart")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def minus_cart(request, id):
    user = request.user
    try:
        try: 
            variant = ProductVariant.objects.get(id=id)
        except ProductVariant.DoesNotExist:
            return error_response('Product does not exist', status_code=status.HTTP_404_NOT_FOUND)

        try:
            cart = Cart.objects.get(user=user,variant=variant)
            if cart.quantity > 1 :
                cart.quantity -= 1
                cart.save()
                return Response({'success': True,'message':'Quantity Updated Successfully'},status=status.HTTP_200_OK)
            else:
                return Response({'success':False,'message':'Do you want to remove product from cart?'},status=status.HTTP_406_NOT_ACCEPTABLE)
        except  Cart.DoesNotExist:
            return error_response('Product Does not exists in cart', status_code=status.HTTP_404_NOT_FOUND)    
    except Exception as e:
        logger.exception("Error in minus_cart")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
