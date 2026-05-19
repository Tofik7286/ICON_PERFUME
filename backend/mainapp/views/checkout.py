import json
import traceback
import hashlib
import logging
import uuid
import string
import random
import requests
from hashlib import sha256
from datetime import datetime
from datetime import timedelta
from decimal import Decimal
from django.conf import settings
from django.core.cache import cache
from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view , permission_classes, APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from mainapp.views.utils import *
from accounts.models import *
from mainapp.serializers import *
from mainapp.models import *
from mainapp.views.utils import *
from mainapp.responses import success_response, error_response

logger = logging.getLogger(__name__)
DEFAULT_SHIPPING_CHARGE = Decimal("45")
FREE_SHIPPING_MINIMUM = Decimal("499")


def get_local_shipping_info(charge=DEFAULT_SHIPPING_CHARGE):
    return {
        "company_id": None,
        "company_name": "Standard Delivery",
        "company_rate": float(charge),
    }

def generate_transaction_id():
    """Generate a random 12-character alphanumeric transaction ID."""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=12))

class VerifyPaymentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def _verify_payment(self, data):
        """Verify payment with PayU"""
        payu_key = settings.PAYU_MERCHANT_KEY
        payu_salt = settings.PAYU_MERCHANT_SALT
        payu_txnid = data.get("txnid")

        hash_str = f"{payu_key}|verify_payment|{payu_txnid}|{payu_salt}"
        hashh = hashlib.sha512(hash_str.encode('utf-8')).hexdigest().lower()

        payload = {
            "key": payu_key,
            "command": "verify_payment",
            "var1": payu_txnid,
            "hash": hashh
        }

        url = "https://info.payu.in/merchant/postservice"
        resp = None
        try:
            resp = requests.post(url, data=payload, timeout=15)
            resp.raise_for_status()
            result = resp.json()
            logger.info(
                "payu.verify_api_response txnid=%s http_status=%s gateway_status=%s",
                payu_txnid, resp.status_code, result.get('status'),
            )
            return result
        except requests.Timeout:
            logger.error("payu.verify_api_timeout txnid=%s url=%s", payu_txnid, url)
            raise
        except requests.ConnectionError as e:
            logger.error("payu.verify_api_connection_error txnid=%s error=%s", payu_txnid, str(e))
            raise
        except ValueError:
            logger.error(
                "payu.verify_api_invalid_json txnid=%s http_status=%s",
                payu_txnid, resp.status_code if resp is not None else 'N/A',
            )
            raise
    
    def post(self, request):
        try:
            data = request.data
            payu_txnid = data.get("txnid")
            logger.info(
                "payu.verify_start txnid=%s source=%s user_id=%s",
                payu_txnid,
                request.query_params.get('source'),
                request.user.id if request.user.is_authenticated else 'guest',
            )

            # Verify payment
            response = self._verify_payment(data)
            gateway_status = response.get('status')
            logger.info(
                "payu.verify_gateway_result txnid=%s gateway_status=%s",
                payu_txnid, gateway_status,
            )
            if gateway_status != 1:
                logger.warning(
                    "payu.verify_gateway_failed txnid=%s gateway_response=%s",
                    payu_txnid, response,
                )
                return Response({"success": False, "message": "Payment failed ❌"}, status=400)
            
            # Find transaction and order
            transaction = Transaction.objects.filter(transaction_id=payu_txnid).first()
            if not transaction:
                logger.error("payu.verify_txn_not_found txnid=%s", payu_txnid)
                return Response({
                    'success': False,
                    'message': 'Transaction not found',
                    'data': []
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Fast-path idempotency for double callbacks.
            if transaction.order.payment_status == "Paid":
                logger.info(
                    "payu.verify_already_paid txnid=%s order_id=%s",
                    payu_txnid, transaction.order.id,
                )
                return Response({
                    'success': False,
                    'message': 'Order already processed',
                    'order_id': transaction.order.id
                }, status=status.HTTP_400_BAD_REQUEST)

            payment_session = PaymentSession.objects.filter(txnid=payu_txnid).first()

            with db_transaction.atomic():
                order = Order.objects.select_for_update().get(id=transaction.order_id)

                # Re-check inside the lock to close the double-callback race.
                if order.payment_status == "Paid":
                    logger.info(
                        "payu.double_callback_ignored txnid=%s order_id=%s",
                        payu_txnid, order.id,
                    )
                    return Response({
                        'success': False,
                        'message': 'Order already processed',
                        'order_id': order.id
                    }, status=status.HTTP_400_BAD_REQUEST)

                order_items = list(
                    OrderItem.objects.filter(order=order).select_related('variant')
                )

                # Lock + validate stock now that payment is confirmed.
                locked_variants = {}
                for oi in order_items:
                    if oi.variant_id is None:
                        continue
                    v = ProductVariant.objects.select_for_update().get(id=oi.variant_id)
                    locked_variants[oi.id] = v
                    if not v.stock or v.stock < oi.quantity:
                        if payment_session:
                            payment_session.mark('FAILED')
                        logger.warning(
                            "payu.oversell_block txnid=%s order_id=%s variant_id=%s need=%s have=%s",
                            payu_txnid, order.id, v.id, oi.quantity, v.stock,
                        )
                        return Response({
                            'success': False,
                            'message': 'Payment received but an item is out of stock. A refund will be initiated.',
                            'order_id': order.id,
                        }, status=status.HTTP_409_CONFLICT)

                # Decrement stock exactly once, post-payment.
                for oi in order_items:
                    v = locked_variants.get(oi.id)
                    if v is None:
                        continue
                    v.stock -= oi.quantity
                    v.save()
                logger.info(
                    "payu.stock_decremented txnid=%s order_id=%s",
                    payu_txnid, order.id,
                )

                order.payment_status = "Paid"
                order.save()

                transaction.transaction_status = "Paid"
                transaction.save()

                if payment_session:
                    payment_session.mark('SUCCESS')

                if payment_session and payment_session.checkout_session_id:
                    CheckoutSession.objects.filter(
                        id=payment_session.checkout_session_id
                    ).delete()

            # Generate invoice (outside the lock; external/slow work).
            generate_invoice(order.email, order.order_number)

            logger.info(
                "payu.verify_success txnid=%s order_id=%s order_number=%s amount=%s",
                payu_txnid, order.id, order.order_number, order.final_price,
            )
            return Response({
                'success': True,
                'message': 'Payment verified successfully',
                'order_id': order.id
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.exception("Error in VerifyPaymentAPIView")
            return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DRY-04: Fixed — @api_view MUST be outermost decorator
# SEC: AllowAny with internal auth logic per source (cart vs buynow)
@api_view(['POST'])
@permission_classes([AllowAny])
def calculate_checkout_total(request):
    try:
        data = json.loads(request.body)
        source = data.get('source')
        
        # Auth check: cart checkout requires login, buynow allows guest
        if source == 'cart' and not request.user.is_authenticated:
            return error_response('Login required for cart checkout', status_code=status.HTTP_401_UNAUTHORIZED)
        
        promo_code = data.get('promo_code', '').strip()
        vat_rate = 0
        original_price = 0
        discount_amount = 0
        user = request.user
        # Authenticated users: ONLY trust DB data, ignore any cookie/frontend prices
        if user.is_authenticated and source == 'cart':
            data.pop('cart_data', None)  # PAYLOAD DEBUG: Strip cart_data from request for authenticated users
        
        # PAYLOAD DEBUG: For guest users, explicitly validate that request body contains cart_data
        if not user.is_authenticated and source == 'cart':
            if 'cart_data' not in data or not data.get('cart_data'):
                return error_response('cart_data required for guest checkout', status_code=status.HTTP_400_BAD_REQUEST)

        # For buynow, load session from DB
        buynow_session = None
        if source == 'buynow':
            session_token = data.get('session_token')
            if not session_token:
                return error_response('session_token required for buynow', status_code=status.HTTP_400_BAD_REQUEST)
            try:
                buynow_session = CheckoutSession.objects.select_related('variant', 'variant__product').get(session_token=session_token)
            except CheckoutSession.DoesNotExist:
                return error_response('Session not found or expired', status_code=status.HTTP_404_NOT_FOUND)
            if buynow_session.is_expired():
                buynow_session.delete()
                return error_response('Session expired. Please try again.', status_code=status.HTTP_410_GONE)

        # Calculate original price based on source
        outof_stock_products = []
        if source == 'cart':
            # DB is the ONLY source of truth — fetch fresh cart and prices from database
            db_cart = Cart.objects.filter(user=user).select_related('variant', 'variant__product')
            
            # ZERO-TRUST LOGIC: Empty cart = 200 OK with total=0 + auto-sync trigger
            if not db_cart.exists():
                return Response({
                    'success': True,
                    'message': 'Cart is out of sync. Please refresh.',
                    'sync_required': True,  # AUTO-SYNC TRIGGER: Tell frontend to call fetchCart()
                    'amount': {
                        'original_price': '0.00',
                        'shipping': {},
                        'sub_total': '0.00',
                        'tax': '0.00',
                        'tax_rate': 0,
                        'discount': '0.00',
                        'total': '0.00',
                    }
                }, status=status.HTTP_200_OK)

            cart_items = []
            for item in db_cart:
                # Re-fetch variant to get the latest price from Product model
                variant = ProductVariant.objects.get(id=item.variant_id)
                quantity = item.quantity
                cart_items.append({'variant': variant, 'quantity': quantity})
                if variant.stock < int(quantity):
                    title = variant.product.title
                    short_title = (title[:12] + '...') if len(title) > 12 else title 
                    outof_stock_products.append(short_title)
            
            original_price = sum(item['variant'].discounted_price * item['quantity'] for item in cart_items)
        else:
            # buynow: use session data from DB — never trust frontend prices
            product_variant = ProductVariant.objects.get(id=buynow_session.variant_id)
            variant_id = product_variant.id
            quantity = buynow_session.quantity
            original_price = product_variant.discounted_price * int(quantity)
            if product_variant.stock < int(quantity):
                title = product_variant.product.title
                short_title = (title[:12] + '...') if len(title) > 12 else title 
                outof_stock_products.append(short_title)

        subtotal = original_price / Decimal(1 + vat_rate)

        if len(outof_stock_products) > 0:
            return Response({
                'success':False, 
                'message':f"Sorry following product(s) are currently unavailable {' ,'.join(outof_stock_products)}",
                'amount': {
                    'original_price': 0,
                    'shipping':{},
                    'sub_total': 0,
                    'tax': 0,
                    'tax_rate': 0,
                    'discount': 0,
                    'total': 0,
                }
            },status=status.HTTP_409_CONFLICT)
        
        if promo_code:
            try:
                promo = getPromocodes(promo_code)
                discount_type = promo.get('type', '')

                if discount_type == 'promotion':
                    promotion = Promotion.objects.get(coupon_code=promo_code, is_active=True)
                    if not promotion.is_valid():
                        return error_response('Invalid or expired promo code', status_code=status.HTTP_400_BAD_REQUEST)

                    # Check for WELCOME10 restriction
                    if promotion.coupon_code == 'WELCOME10' and user and Order.objects.filter(user=user).exists():
                        return error_response('This coupon is valid only on first order', status_code=status.HTTP_400_BAD_REQUEST)

                    if source == 'cart' and promotion.promotion_type == 'cart':
                        discount_amount = promotion.calculate_discount(original_price)
                    elif promotion.promotion_type == 'product':
                        if source == 'cart':
                            for item in cart_items: 
                                if item['variant'].id == promotion.product_variant.id:
                                    discount_amount = promotion.calculate_discount(item['variant'].discounted_price) * item['quantity']
                                    break
                            else:
                                return error_response('Promo code is not valid for these products', status_code=status.HTTP_400_BAD_REQUEST)
                        elif promotion.product_variant.id == variant_id:
                            discount_amount = promotion.calculate_discount(original_price)
                        else:
                            return error_response('Promo code is not valid for this product', status_code=status.HTTP_400_BAD_REQUEST)
                    else:
                        return error_response('Promo code is not valid for this purchase type', status_code=status.HTTP_400_BAD_REQUEST)


                else:
                    return error_response('Invalid promo code', status_code=status.HTTP_400_BAD_REQUEST)

                # Ensure discount doesn't exceed original price
                discount_amount = min(discount_amount, original_price)

                # Recalculate with discount
                discounted_price = original_price - Decimal(discount_amount)
                subtotal = discounted_price / Decimal(1 + vat_rate)
            except Promotion.DoesNotExist:
                return error_response('Invalid promo code', status_code=status.HTTP_400_BAD_REQUEST)

        # Calculate final amounts
        vat_amount = original_price - subtotal
        total_ex_ship = float(original_price) - float(discount_amount)
        if total_ex_ship >= float(FREE_SHIPPING_MINIMUM):
            shipping_charge = Decimal("0")
            shipping_info = get_local_shipping_info(shipping_charge)
        else:
            shipping_charge = DEFAULT_SHIPPING_CHARGE
            shipping_info = get_local_shipping_info(shipping_charge)
        
        # SEC-05: Fixed — Use is_staff/is_superuser instead of hardcoded user IDs
        if request.user.is_staff or request.user.is_superuser:
            shipping_charge = Decimal("0")
            shipping_info = get_local_shipping_info(shipping_charge)

        total_amount = float(original_price) + float(shipping_charge) - float(discount_amount)
        # Prepare response 
        response_data = {
            'success': True,
            'sync_required': False,  # AUTO-SYNC TRIGGER: Flag to indicate if frontend needs to refresh cart
            'amount': {
                'original_price': "{:.2f}".format(original_price),
                'shipping':shipping_info,
                'sub_total': "{:.2f}".format(subtotal),
                'tax': "{:.2f}".format(vat_amount),
                'tax_rate': round(vat_rate * 100),
                'discount': "{:.2f}".format(discount_amount),
                'total': "{:.2f}".format(total_amount),
            }
        }

        if promo_code and discount_amount > 0:
            response_data['discount_type'] = discount_type
            response_data['message'] = f"{'Promo code'} applied successfully! You saved ₹{discount_amount:.2f}"

        response = Response(response_data, status=status.HTTP_200_OK)

        # No-Cache headers: force browser to always fetch fresh data
        response['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'

        # Delete stale checkout cookies — only fresh data should persist
        response.delete_cookie('checkout_hashData')
        response.delete_cookie('cart_data')
        response.delete_cookie('buynow')

        return response

    except ProductVariant.DoesNotExist:
        return error_response('Product variant not found', status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Error in calculate_checkout_total")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

class PaymentOrderAPIView(APIView):
    permission_classes = [AllowAny]

    def _create_transaction_id(self):
        """Generate a unique transaction ID"""
        return 'ICP' + str(generate_transaction_id())

    def _create_order_number(self, user, order_id):
        """Generate order number based on user and timestamp"""
        now = datetime.now()
        return f"ICP{user.id}{now.day}{now.month}{now.year}{order_id}"

    def _process_promo_code(self, discount_obj, discount_amount):
        """Process and validate promo code"""
        if not discount_obj or discount_amount == "0.00":
            return None

        discount_code = dict(discount_obj).get('code')
        promo = getPromocodes(discount_code)
        discount_type = promo.get('type', '')

        if not discount_type or not (discount_type == "promotion" and discount_obj.get('type', '') == "promotion"):
            return None

        try:
            promotion = Promotion.objects.get(coupon_code=discount_code, is_active=True)
            return promotion
        except Promotion.DoesNotExist:
            return None

    def _create_order(self, user, data, payment_method, source):
        """Create order based on source (buynow or cart)"""
        promotion = self._process_promo_code(data.get('promo'), data.get('amount', {}).get('discount', "0.00"))
        transaction_id = self._create_transaction_id()
        
        if source == 'buynow':
            return self._create_buynow_order(user, data, payment_method, promotion, transaction_id)
        elif source == 'cart':
            return self._create_cart_order(user, data, payment_method, promotion, transaction_id)
        else:
            return None, "Invalid source"

    def _create_buynow_order(self, user, data, payment_method, promotion, transaction_id):
        """Create order for buynow flow — reads from CheckoutSession (DB truth)"""
        with db_transaction.atomic():
            session_token = data.get('session_token')
            if not session_token:
                return None, "session_token is required for buynow"

            try:
                session = CheckoutSession.objects.select_related('variant', 'variant__product').get(session_token=session_token)
            except CheckoutSession.DoesNotExist:
                return None, "Checkout session not found or expired"

            if session.is_expired():
                session.delete()
                return None, "Session expired. Please try again."

            variant = ProductVariant.objects.select_for_update().get(id=session.variant_id)
            quantity = session.quantity

            if not variant.stock or variant.stock < int(quantity):
                return None, f'{variant} is out of stock'

            # COD decrements now; ONLINE defers stock until payment is
            # verified (VerifyPaymentAPIView) to prevent orphan stock locks.
            if payment_method != 'ONLINE':
                variant.stock -= int(quantity)
                variant.save()

            # Calculate prices
            original_price = variant.discounted_price * quantity
            discount = Decimal(str(data.get('amount', {}).get('discount', 0)))
            discounted_price = original_price - discount
            
            shipping_obj = data.get('shipping', {})
            shipping_price = Decimal('0') if discounted_price >= Decimal('500') else Decimal(str(shipping_obj.get('company_rate', 0)))
            
            final_price = discounted_price + shipping_price
            
            # Create order
            order = Order.objects.create(
                user=user,
                name=data.get('name'),
                address=data.get('address'),
                city=data.get('city'),
                state=data.get('state'),
                country=data.get('country'),
                pincode=data.get('pincode'),
                sub_total=discounted_price,
                discount=discount,
                gst=0,
                courier_company_id=shipping_obj.get('company_id'),
                courier_company=shipping_obj.get('company_name'),
                shipping_charges=shipping_price,
                final_price=final_price,
                transaction_id=transaction_id,
                payment_status="Pending",
                payment_method=payment_method,
                email=data.get('email'),
                phone_number=data.get('phone')
            )
            
            # Create order item
            price = variant.discounted_price * Decimal(quantity)
            order_item = OrderItem.objects.create(
                order=order,
                variant=variant,
                quantity=quantity,
                price=price,
                final_price=price
            )
            
            # Apply promotion if applicable
            if promotion and promotion.promotion_type == "product" and promotion.product_variant == variant:
                item_discount = promotion.calculate_discount(price)
                order_item.discount = item_discount
                order_item.final_price = price - item_discount
                order_item.promotion = promotion
                order_item.save()

            # COD: clean up the session now. ONLINE: keep it until payment is
            # verified (deleted in VerifyPaymentAPIView on success).
            if payment_method != 'ONLINE':
                session.delete()

            return order, None

    def _create_cart_order(self, user, data, payment_method, promotion, transaction_id):
        """Create order for cart flow"""
        with db_transaction.atomic():
            cart_items = Cart.objects.filter(user=user).select_related('variant')
            # Lock and validate stock for all variants
            for item in cart_items:
                variant = ProductVariant.objects.select_for_update().get(id=item.variant_id)
                if not variant.stock or variant.stock < item.quantity:
                    return None, f'{variant} is out of stock'

            # COD decrements now; ONLINE defers stock until payment is
            # verified (VerifyPaymentAPIView) to prevent orphan stock locks.
            if payment_method != 'ONLINE':
                for item in cart_items:
                    variant = ProductVariant.objects.select_for_update().get(id=item.variant_id)
                    variant.stock -= item.quantity
                    variant.save()

            # Calculate prices
            original_price = sum((item.variant.discounted_price * item.quantity for item in cart_items))
            discount = Decimal(str(data.get('amount', {}).get('discount', 0)))
            discounted_price = original_price - discount
            
            shipping_obj = data.get('shipping', {})
            shipping_price = Decimal('0') if discounted_price >= Decimal('500') else Decimal(str(shipping_obj.get('company_rate', 0)))
            
            final_price = discounted_price + shipping_price
            
            # Create order
            order = Order.objects.create(
                user=user,
                name=data.get('name'),
                address=data.get('address'),
                city=data.get('city'),
                state=data.get('state'),
                country=data.get('country'),
                pincode=data.get('pincode'),
                sub_total=discounted_price,
                discount=discount,
                gst=0,
                courier_company_id=shipping_obj.get('company_id'),
                courier_company=shipping_obj.get('company_name'),
                shipping_charges=shipping_price,
                final_price=final_price,
                transaction_id=transaction_id,
                payment_status="Pending",
                payment_method="Prepaid" if payment_method == "ONLINE" else "COD",
                email=data.get('email'),
                phone_number=data.get('phone')
            )
            
            # Create order items
            for item in cart_items:
                price = item.variant.discounted_price * Decimal(item.quantity)
                order_item = OrderItem.objects.create(
                    order=order,
                    variant=item.variant,
                    quantity=item.quantity,
                    price=price,
                    final_price=price
                )
                
                # Apply promotion if applicable
                if promotion and promotion.promotion_type == "cart":
                    proportion = (item.variant.discounted_price * Decimal(item.quantity)) / (order.sub_total + discount)
                    item_discount = discount * proportion
                    order_item.discount = item_discount
                    order_item.final_price = price - item_discount
                    order_item.promotion = promotion
                    order_item.save()
            
            return order, None

    def _save_address(self, user, data):
        addresses = Address.objects.filter(user=user)
        address = data.get('address')
        if addresses.count() < 5 and not Address.objects.filter(address=address).exists():
            Address.objects.create(
                user=user,
                address=address,
                city=data.get("city"),
                country=data.get("country"),
                state=data.get("state"),
                pincode=data.get("pincode"),
                default=False
            )

    def _finalize_order_number(self, user, order, data):
        """Assign order number + save address (authenticated) or guest tag."""
        if user.is_authenticated:
            order.order_number = self._create_order_number(user, order.id)
            order.save()
            self._save_address(user, data)
        else:
            order.order_number = f"GUEST{order.id}"
            order.save()

    def _build_payu_payload(self, order):
        """Build the PayU payload + hash for an order (stable per txnid)."""
        key = settings.PAYU_MERCHANT_KEY
        salt = settings.PAYU_MERCHANT_SALT
        # Normalize amount to PayU's canonical 2-decimal form so the hashed
        # amount matches the posted amount (avoids hash mismatch).
        amount_str = format(order.final_price, ".2f")
        hash_str = f"{key}|{order.transaction_id}|{amount_str}|Order Payment|{order.name}|{order.email}|||||||||||{salt}"
        hashh = hashlib.sha512(hash_str.encode('utf-8')).hexdigest().lower()
        logger.info(
            "payu.hash_generated txnid=%s amount=%s productinfo=Order Payment",
            order.transaction_id, amount_str,
        )
        payu_payload = {
            "key": key,
            "txnid": order.transaction_id,
            "amount": amount_str,
            "productinfo": "Order Payment",
            "firstname": order.name,
            "email": order.email,
            "phone": order.phone_number,
            "surl": f"{settings.WEB_URL}{settings.PAYU_SUCCESS_URL}?txnid={order.transaction_id}&status=success",
            "furl": f"{settings.WEB_URL}{settings.PAYU_FAILURE_URL}?status=failed",
            "hash": hashh,
        }
        return payu_payload, hashh

    def _payment_response(self, user, order):
        """Build PayU response; ensure exactly one Transaction per txnid."""
        payu_payload, hashh = self._build_payu_payload(order)
        Transaction.objects.get_or_create(
            transaction_id=order.transaction_id,
            defaults={
                'user': user,
                'name': order.name,
                'amount': str(order.final_price),
                'phone_number': order.phone_number,
                'token': hashh,
                'order': order,
            },
        )
        return Response({
            "success": True,
            "payu_url": settings.PAYU_BASE_URL,
            "params": payu_payload,
            "order_id": order.id,
        }, status=status.HTTP_201_CREATED)

    def post(self, request):
        payment_method = None
        short_lock_key = None
        got_lock = False
        try:
            data = request.data
            source = request.query_params.get('source')
            logger.info(
                "payu.initiate_start source=%s payment_method=%s user_id=%s",
                source,
                data.get('paymentMethod', 'COD'),
                request.user.id if request.user.is_authenticated else 'guest',
            )

            # Auth check: cart checkout requires login, buynow allows guest
            if source == 'cart' and not request.user.is_authenticated:
                return error_response('Login required for cart checkout', status_code=status.HTTP_401_UNAUTHORIZED)

            user = request.user
            payment_method = data.get('paymentMethod', 'COD')

            if payment_method != 'ONLINE':
                # COD / offline: unchanged behaviour (no PaymentSession).
                order, error = self._create_order(user, data, payment_method, source)
                if error:
                    return error_response(error, status_code=status.HTTP_400_BAD_REQUEST)
                self._finalize_order_number(user, order, data)
                logger.info(
                    "payu.cod_order_created txnid=%s order_id=%s amount=%s",
                    order.transaction_id, order.id, order.final_price,
                )
                return self._payment_response(user, order)

            # ---- ONLINE payment: idempotent PaymentSession flow ----
            amount_data = data.get('amount', {}) or {}
            lock_fingerprint = "|".join([
                str(source or ''),
                str(getattr(user, 'id', '') if user.is_authenticated else 'guest'),
                str(data.get('email', '')).strip().lower(),
                str(data.get('phone', '')).strip(),
                str(amount_data.get('total', '')),
            ])
            fp = sha256(lock_fingerprint.encode('utf-8')).hexdigest()
            short_lock_key = f"payu:initiate:{fp}"

            # Brief lock only to serialize simultaneous double-clicks before a
            # PaymentSession row exists (not a 60s user-facing block).
            got_lock = cache.add(short_lock_key, '1', timeout=10)

            with db_transaction.atomic():
                existing = (PaymentSession.objects
                            .select_for_update()
                            .filter(cart_fingerprint=fp,
                                    status__in=PaymentSession.REUSABLE_STATUSES)
                            .order_by('-created_at')
                            .first())
                if existing:
                    if existing.is_expired():
                        existing.mark('EXPIRED')
                    elif not existing.order_id:
                        existing.mark('ABANDONED')
                    elif existing.order.payment_status == 'Paid':
                        existing.mark('SUCCESS')
                    elif existing.order.payment_status != 'Pending':
                        existing.mark('ABANDONED')
                    else:
                        # Retry: generate a fresh txnid so PayU doesn't reject
                        # the duplicate within its 60-second window.
                        new_txnid = self._create_transaction_id()
                        order = existing.order
                        order.transaction_id = new_txnid
                        order.save(update_fields=['transaction_id'])
                        existing.txnid = new_txnid
                        existing.retry_count += 1
                        existing.status = 'PAYMENT_PENDING'
                        existing.save(update_fields=['txnid', 'retry_count', 'status', 'updated_at'])
                        logger.info(
                            "payu.retry new_txnid=%s order_id=%s retry_count=%s",
                            new_txnid, order.id, existing.retry_count,
                        )
                        resp = self._payment_response(user, order)
                        if got_lock:
                            cache.delete(short_lock_key)
                        return resp

            # No reusable session -> create a fresh order + PaymentSession.
            if not got_lock:
                # A concurrent request holds the brief lock and is creating the
                # session; ask the client to retry instead of duplicating.
                logger.warning("payu.initiate_lock_rejected fp=%s", fp[:12])
                return Response({
                    "success": False,
                    "message": "Payment is being initialized. Please wait a moment and try again."
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)

            order, error = self._create_order(user, data, payment_method, source)
            if error:
                cache.delete(short_lock_key)
                return error_response(error, status_code=status.HTTP_400_BAD_REQUEST)
            self._finalize_order_number(user, order, data)

            checkout_session = None
            if source == 'buynow':
                token = data.get('session_token')
                if token:
                    checkout_session = CheckoutSession.objects.filter(session_token=token).first()

            PaymentSession.objects.create(
                user=user if user.is_authenticated else None,
                source=source,
                cart_fingerprint=fp,
                checkout_session=checkout_session,
                order=order,
                txnid=order.transaction_id,
                amount=order.final_price,
                status='PAYMENT_PENDING',
            )
            logger.info(
                "payu.initiate txnid=%s order_id=%s source=%s fp=%s amount=%s payment_method=%s",
                order.transaction_id, order.id, source, fp[:12],
                format(order.final_price, '.2f'), payment_method,
            )
            resp = self._payment_response(user, order)
            cache.delete(short_lock_key)
            return resp

        except Exception as e:
            if payment_method == 'ONLINE' and short_lock_key and got_lock:
                cache.delete(short_lock_key)
            logger.exception("Error in PaymentOrderAPIView")
            return Response({"success":False, "message": "Something went wrong. Please try again later."}, status=status.HTTP_400_BAD_REQUEST)
