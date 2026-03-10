import logging
import os
from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required

from django.shortcuts import get_object_or_404
from django.http import JsonResponse, FileResponse, HttpResponseNotFound
from django.conf import settings

from rest_framework.decorators import api_view , APIView, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.utils import append_log
from accounts.models import *
from mainapp.serializers import *
from mainapp.models import *
from mainapp.responses import success_response, error_response
from mainapp.views.utils import generate_invoice

logger = logging.getLogger(__name__)

class UserOrders(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        user = request.user
        try:
            # get the orders for user that requested
            orders = Order.objects.filter(user=user).prefetch_related('items__variant__product__category', 'items__variant__product__series', 'items__variant__images', 'items__variant__notes')
            if orders.exists():
                serializer = OrderSerializer(orders,many=True)
                orders_serialized = serializer.data
                
                return Response({'success':True,'orders':serializer.data},status=status.HTTP_200_OK)
            else:
                return Response({'success': True, 'message': 'No orders found', 'orders':[]}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.exception("Error in UserOrders.get")
            return Response({'success':False,'message':"Something went wrong. Please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self,request,id):
        try:
            user = request.user
            # now find the order for requested user
            order = get_object_or_404(Order,id=id,user=user)
            # if order found then delete it 
            order.delete()
            return Response({'success':True,'message':'Order deleted successfully'},status=status.HTTP_200_OK)
        
        except Order.DoesNotExist: # if order not found then send error
            return error_response('Order does not exist', status_code=status.HTTP_400_BAD_REQUEST)
        
        # if some error then send internal server error
        except Exception as e:
            logger.exception("Error in UserOrders.delete")
            return Response({'success':False,'message':"Something went wrong. Please try again later."},status=status.HTTP_400_BAD_REQUEST)


# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getOrder(request, id):
    try:
        user = request.user
        order = Order.objects.prefetch_related('items__variant__product__category', 'items__variant__product__series', 'items__variant__images', 'items__variant__notes').get(id=id, user=user)
        serializer = OrderSerializer(order)
        return Response({'success': True, 'order': serializer.data}, status=status.HTTP_200_OK)
    except Order.DoesNotExist:
        return error_response('Order not found', status_code=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception("Error in getOrder")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def re_order(request, id):
    try:
        user = request.user
        order = Order.objects.get(id=id, user=user)
        order_items = OrderItem.objects.filter(order=order).select_related('variant__product')
        for item in order_items:
            if not item.variant or not item.variant.stock or item.variant.stock < item.quantity:
                continue
            cart_item, created = Cart.objects.get_or_create(
                user=user, variant=item.variant,
                defaults={'quantity': item.quantity}
            )
            if not created:
                cart_item.quantity += item.quantity
                cart_item.save()
        return Response({'success': True, 'message': 'Items added to cart'}, status=status.HTTP_200_OK)
    except Order.DoesNotExist:
        return error_response('Order not found', status_code=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception("Error in re_order")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_order(request, id):
    try:
        user = request.user
        order = Order.objects.get(id=id, user=user)
        if order.order_status in ('Pending', 'Confirmed'):
            order.order_status = 'Cancelled'
            order.save()
            return Response({'success': True, 'message': 'Order Cancelled Successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'success': False, 'message': 'Order cannot be cancelled at this stage'}, status=status.HTTP_400_BAD_REQUEST)
    except Order.DoesNotExist:
        return error_response('Order not found', status_code=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception("Error in cancel_order")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def return_order(request, id):
    try:
        user = request.user
        data = request.data
        order = get_object_or_404(Order,id=id,user=user)
        if order.order_status == 'Delivered':
            order.order_status = 'Returned'
            order.save()
            return Response({'success':True,'message':'Order Returned successfully'},status=status.HTTP_200_OK)
        else:
            return Response({'success':False,'message':'You can only return Delivered orders'},status=status.HTTP_200_OK)

    except Order.DoesNotExist:
        return error_response('Order not found', status_code=status.HTTP_404_NOT_FOUND)

    except Exception as e:
        logger.exception("Error in return_order")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_invoice(request, order_number):
    """Download invoice PDF for a specific order. Only the order owner can access."""
    try:
        order = Order.objects.get(order_number=order_number, user=request.user)

        # Generate invoice on-the-fly if not already generated
        if not order.invoice:
            result = generate_invoice(order.email, order.order_number)
            if not result:
                return Response(
                    {'success': False, 'message': 'Failed to generate invoice'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            order.refresh_from_db()

        file_path = order.invoice.path
        if not os.path.exists(file_path):
            # File record exists but file is missing — regenerate
            result = generate_invoice(order.email, order.order_number)
            if not result:
                return Response(
                    {'success': False, 'message': 'Failed to generate invoice'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            order.refresh_from_db()
            file_path = order.invoice.path

        return FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf',
            as_attachment=True,
            filename=f'invoice_{order.order_number}.pdf'
        )
    except Order.DoesNotExist:
        return Response(
            {'success': False, 'message': 'Order not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.exception("Error in download_invoice")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


# SEC-01: Fixed — Added staff_member_required authentication
@staff_member_required
def order_change(request):
    if request.method == "GET":
        order_id = request.GET.get('order_id')
        try:
            order = Order.objects.get(id=order_id)
            order.is_new = False
            order.save()
            return JsonResponse({"success": True, "message": "Order status updated"})
        except Order.DoesNotExist:
            return JsonResponse({"error": "Order not found"}, status=404)
    return JsonResponse({"error": "Method not allowed"}, status=405)

# SEC-01: Fixed — Added staff_member_required authentication
@staff_member_required
def order_check(request):
    if request.method == "GET":
        new_orders = Order.objects.filter(is_new=True).count()
        return JsonResponse({"success": True, "new_orders": new_orders})
    return JsonResponse({"error": "Method not allowed"}, status=405)