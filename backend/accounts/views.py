import random
import string
import json
import traceback
import logging
import secrets
import ipaddress
from urllib.parse import urlparse

from django.http import JsonResponse
import jwt
import hashlib
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, APIView, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import authenticate,logout, login
from rest_framework.response import Response
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.shortcuts import redirect 
from rest_framework import status
from datetime import timedelta
from django.conf import settings
from datetime import datetime
from django.db.models import Q
from django.utils import timezone
from .serializers import *
from .models import *
from mainapp.models import Cart , ProductVariant , Wishlist
from django.views.decorators.csrf import csrf_exempt
from django.core.cache import cache
from dotenv import load_dotenv
import os
from decouple import config
from decouple import Config, RepositoryEnv
from mainapp.responses import success_response, error_response
try:
    config = Config(RepositoryEnv('/var/www/icon_perfumes/backend/.env'))
except:
    pass

load_dotenv(settings.BASE_DIR / '.env')

logger = logging.getLogger(__name__)

BASE_URL = config('WEB_URL') + "/login/reset-password/"
current_year = datetime.now().year
OTP_HEADER = "Your Sign-in Code"
OTP_SUBJECT = "Here is your verification code"

# SEC-03: Whitelist of allowed fields for profile update
ALLOWED_UPDATE_FIELDS = {'name', 'email', 'phone_number'}


def _sanitize_cookie_domain(raw_domain):
    """Return a valid cookie domain or None when domain should be host-only."""
    if not raw_domain:
        return None

    domain = str(raw_domain).strip()
    if not domain:
        return None

    # Accept values like https://example.com, example.com/, :443 and normalize.
    if '://' in domain:
        parsed = urlparse(domain)
        domain = parsed.hostname or ''

    domain = domain.split('/')[0].split(':')[0].strip().lstrip('.')

    if not domain or domain.lower() in {'localhost', '127.0.0.1'}:
        return None

    # Domain attribute should not be set for IP hosts; use host-only cookies instead.
    try:
        ipaddress.ip_address(domain)
        return None
    except ValueError:
        pass

    # Browsers accept both "example.com" and ".example.com". Keep explicit shared form.
    return f".{domain}"


def _cookie_scope():
    def _env_bool(name, default=None):
        value = os.environ.get(name)
        if value is None:
            return default
        return str(value).strip().lower() in {'1', 'true', 'yes', 'on'}

    # Allow explicit override from env for emergency production toggles.
    forced_secure = _env_bool('AUTH_COOKIE_SECURE', default=None)

    web_url = str(getattr(settings, 'WEB_URL', '') or '').strip().lower()
    web_url_is_https = web_url.startswith('https://')

    # Default behavior:
    # - local/debug or non-https deployments: host-only cookies with Lax
    # - https deployments: cross-site compatible cookies (Secure + SameSite=None)
    should_secure = forced_secure if forced_secure is not None else (not settings.DEBUG and web_url_is_https)
    same_site = 'None' if should_secure else 'Lax'

    raw_domain = (
        os.environ.get('AUTH_COOKIE_DOMAIN')
        or os.environ.get('COOKIE_DOMAIN')
        or os.environ.get('DOMAIN')
        or settings.WEB_URL
    )
    domain = _sanitize_cookie_domain(raw_domain)

    return {
        'secure': should_secure,
        'samesite': same_site,
        'domain': domain,
    }


def _delete_auth_cookies(response):
    scope = _cookie_scope()
    domain = scope.get('domain')

    for key in ('token', 'is_logged_in', 'sessionid', 'csrftoken'):
        # Clear host-only cookie.
        response.delete_cookie(key=key)
        # Clear shared-domain cookie when configured.
        if domain:
            response.delete_cookie(key=key, domain=domain)

    return response


def _parse_positive_int(value, default=1):
    try:
        parsed = int(value)
        return parsed if parsed > 0 else default
    except (TypeError, ValueError):
        return default


def merge_guest_cart_and_wishlist(user, cart_data=None, wishlist_data=None):
    """Merge guest cart/wishlist into user account with stock-safe quantity handling."""
    cart_data = cart_data or []
    wishlist_data = wishlist_data or []

    for item in cart_data:
        variant_info = item.get('variant') if isinstance(item, dict) else None
        variant_id = None

        if isinstance(variant_info, dict):
            variant_id = variant_info.get('id')
        if variant_id is None and isinstance(item, dict):
            variant_id = item.get('variant_id')

        if not variant_id:
            continue

        quantity = _parse_positive_int(item.get('quantity') if isinstance(item, dict) else 1)
        variant = ProductVariant.objects.filter(id=variant_id).first()
        if not variant or variant.stock < 1:
            continue

        user_cart, created = Cart.objects.get_or_create(user=user, variant=variant)
        merged_quantity = quantity if created else (user_cart.quantity + quantity)
        merged_quantity = min(merged_quantity, variant.stock)
        user_cart.quantity = merged_quantity
        user_cart.save()

    for item in wishlist_data:
        variant_info = item.get('variant') if isinstance(item, dict) else None
        variant_id = variant_info.get('id') if isinstance(variant_info, dict) else None
        if not variant_id:
            continue

        variant = ProductVariant.objects.filter(id=variant_id).first()
        if not variant:
            continue

        Wishlist.objects.get_or_create(user=user, variant=variant)


def build_auth_cookies_response(response, access_token):
    scope = _cookie_scope()
    cookie_kwargs = {
        'secure': scope['secure'],
        'samesite': scope['samesite'],
        'domain': scope['domain'],
        'expires': timezone.now() + timedelta(days=30),
    }

    response.set_cookie(
        key="token",
        value=str(access_token),
        httponly=True,
        **cookie_kwargs,
    )
    response.set_cookie(
        key="is_logged_in",
        value="true",
        httponly=False,
        **cookie_kwargs,
    )
    return response

def hash_otp(otp):
    '''
    Returns the hash of the otp
    '''
    return hashlib.sha256(otp.encode()).hexdigest()

@api_view(["POST"])
def signup(request):
    try:
        data = json.loads(request.body)
        email = str(data.get('email') or data.get('identifier') or data.get('contact') or '').strip().lower()
        cart_data = data.get('cart_data') or []
        wishlist_data = data.get('wishlist_data') or []

        if not email or '@' not in email:
            return error_response('Please provide a valid email address', status_code=status.HTTP_400_BAD_REQUEST)

        existing_user = CustomUser.objects.filter(email=email).first()
        if existing_user:
            return error_response('Account already exists. Please login with email OTP.', status_code=status.HTTP_400_BAD_REQUEST)

        user = CustomUser(
            email=email,
            phone_number=None,
            is_active=False,
        )
        user.set_password(secrets.token_urlsafe(16))
        user.save()

        otp = str(random.randint(100000, 999999))
        otpObj, _ = Otp.objects.get_or_create(user=user)
        otpObj.otp = hash_otp(otp)
        otpObj.attempts = 0
        otpObj.count = 1
        otpObj.save()

        email_html = render_to_string('emails/otp_email.html', {
            'header': 'Complete Your Registration',
            'message': 'Please enter the following confirmation code to complete your account setup:',
            'otp': otp,
            'current_year': current_year,
        })
        send_mail(
            subject=OTP_SUBJECT,
            html_message=email_html,
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )
        masked_email = get_masked_email(user.email)
        return Response(
            {
                "success": True,
                "requires_otp": True,
                "message": f"OTP sent to {masked_email} email successfully.",
                "email": user.email,
                "masked_email": masked_email,
                "flow": "signup",
                "cart_data": cart_data,
                "wishlist_data": wishlist_data,
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        logger.exception("Error in signup")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


        
# This code is for login with password 
@api_view(["POST"])
def user_login(request):
    try:
        data = json.loads(request.body)
        email = str(data.get('email') or data.get('identifier') or data.get('contact') or '').strip().lower()
        cart_data = data.get('cart_data') or []
        wishlist_data = data.get('wishlist_data') or []

        if not email or '@' not in email:
            return error_response('Please provide a valid email address', status_code=status.HTTP_400_BAD_REQUEST)

        user = CustomUser.objects.get(email=email)

        otp = str(random.randint(100000, 999999))
        otpObj, _ = Otp.objects.get_or_create(user=user)
        otpObj.otp = hash_otp(otp)
        otpObj.attempts = 0
        otpObj.count = 1 if otpObj.updated_at.date() < timezone.now().date() else (otpObj.count + 1)
        otpObj.save()

        email_html = render_to_string('emails/otp_email.html', {
            'header': 'Your Sign-in Code',
            'message': 'Please use the code below to sign in to your account:',
            'otp': otp,
            'current_year': current_year,
        })
        send_mail(
            subject=OTP_SUBJECT,
            html_message=email_html,
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

        masked_email = get_masked_email(user.email)
        return Response(
            {
                'success': True,
                'requires_otp': True,
                'message': f'OTP sent to {masked_email} email successfully.',
                'email': user.email,
                'masked_email': masked_email,
                'flow': 'login',
                'cart_data': cart_data,
                'wishlist_data': wishlist_data,
            },
            status=status.HTTP_200_OK,
        )
    except json.JSONDecodeError:
        return error_response('Invalid request format', status_code=status.HTTP_400_BAD_REQUEST)
    except CustomUser.DoesNotExist:
        return error_response('No account found with this email. Please sign up first.', status_code=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception("Error in user_login")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(["POST"])
def verify_otp(request):
    try:
        data = json.loads(request.body)
        identifier = data.get('email','')
        otp = data.get('otp','')
        
        if not identifier or not otp:
            return error_response('Email/Phone Number and OTP are required.', status_code=status.HTTP_400_BAD_REQUEST)

        if '@' in identifier:
            user = CustomUser.objects.get(email=identifier)
        else:
            user = CustomUser.objects.get(phone_number=identifier)

        # Retrieve OTP from cache
        otpObj = Otp.objects.get(user=user)

        # SEC-07: Check OTP attempts before verifying
        if otpObj.attempts >= 5:
            otpObj.delete()
            return error_response('Too many attempts. Please request a new OTP.', status_code=status.HTTP_429_TOO_MANY_REQUESTS)
        otpObj.attempts += 1
        otpObj.save()

        if hash_otp(str(otp)) != otpObj.otp or not otpObj.is_valid:
            return error_response('Invalid or expired OTP.', status_code=status.HTTP_400_BAD_REQUEST)

        was_new_user = bool(user.is_new)

        # Activate user account
        user.is_active = True
        user.save()

        if data.get('data'):
          wishlist_data = data['data'].get('wishlist_data')
          cart_data = data['data'].get('cart_data')
          merge_guest_cart_and_wishlist(user, cart_data=cart_data, wishlist_data=wishlist_data)
              
        # Clear OTP from cache
        otpObj.delete()
            
        email_html = render_to_string('emails/welcome_email.html', {
            'user_name': user.name,
            'current_year': current_year,
        })
        if user.is_new == True:
          send_mail(
              subject="Welcome to Icon Perfumes! 🎉",
              html_message=email_html,
              message='',
              from_email=settings.DEFAULT_FROM_EMAIL,
              recipient_list=[user.email],
          )
        user.is_new = False
        user.save()
        refresh = RefreshToken.for_user(user)   
        token = str(refresh.access_token)
        response = JsonResponse({
            "success": True,
            "message": "Email verified successfully.",
            "profile_redirect": was_new_user,
        },status=status.HTTP_200_OK)
        response = build_auth_cookies_response(response, token)
        # Clear stale checkout cookies on fresh login
        response.delete_cookie('checkout_hashData')
        response.delete_cookie('cart_data')
        response.delete_cookie('buynow')
        return response
    except CustomUser.DoesNotExist:
        return error_response('User not found.', status_code=status.HTTP_404_NOT_FOUND)
                
    except Otp.DoesNotExist:
        return error_response('OTP is invalid or expired', status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Error in verify_otp")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

def get_masked_email(email):
    name, domain = email.split('@')
    
    if len(name) > 3:
        masked_email = name[0] + '*' * (len(name) - 3) + name[-2:] + '@' + domain
    elif len(name) == 3:
        masked_email = name[0] + '*' + name[-1] + '@' + domain
    else:
        masked_email = '*' * len(name) + '@' + domain  # Mask fully if very short
    
    return masked_email


@api_view(['POST'])
def send_otp(request):
    try:
        data = json.loads(request.body)
        identifier = data.get('email')
        if not identifier:
            return error_response('Email/Phone Number is required', status_code=status.HTTP_400_BAD_REQUEST)
        
        if '@' in identifier:
            user = CustomUser.objects.get(email=identifier)
        else:
            user = CustomUser.objects.get(phone_number=identifier)

        
        today = timezone.now().date()
        otpObj = Otp.objects.get(user=user)
        if otpObj.updated_at.date() < today:
            otpObj.count = 1
            otpObj.save()
        elif otpObj.count >= 5:
            return error_response('You can send upto 5 OTPs in a day please try again tomorrow.', status_code=status.HTTP_400_BAD_REQUEST)
        
        otp = str(random.randint(100000,999999))
        try:
            otpObj = Otp.objects.get(user=user)
            otpObj.otp = hash_otp(otp)
            otpObj.count += 1
            otpObj.attempts = 0  # SEC-07: Reset attempts when new OTP is sent
            otpObj.save()
        except Otp.DoesNotExist:
            otpObj = Otp.objects.create(user=user,otp=hash_otp(otp))


        email_html = render_to_string('emails/otp_email.html', {
            'header': 'Email Verification Code',
            'message': 'Please use the code below to verify your email address and complete your account setup:',
            'otp': otp,
            'current_year': current_year,
        })
        send_mail(
            subject=OTP_SUBJECT,
            html_message=email_html,
            message='',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

        masked_email = get_masked_email(user.email)
        message = f'OTP successfully sent to your Email {masked_email}'
            
        return Response({'success':True,'email':user.email,'masked_email':masked_email,"message": message},status=status.HTTP_200_OK)

    except CustomUser.DoesNotExist:
        return error_response('User not found.', status_code=status.HTTP_404_NOT_FOUND)
                
    except Otp.DoesNotExist:
        return error_response('OTP is invalid or expired', status_code=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.exception("Error in send_otp")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# SEC-06: Use secrets module for longer, cryptographically secure tokens
def generate_token():
    return secrets.token_urlsafe(32)

@api_view(['POST'])
def forgot_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')

        try:
            user = CustomUser.objects.get(email=email)
            if not user:
                return Response({"success":False,'message':'User with this email not found'},status=status.HTTP_404_NOT_FOUND)

            reset_token = generate_token()
            user.reset_password_token = reset_token
            user.save()

            reset_link = BASE_URL + f"{reset_token}/"
            subject = 'Reset Your Password – Icon Perfumes 🔒 '
            html_message = render_to_string('emails/reset_password_email.html', {
                'user_name': user.name,
                'reset_link': reset_link,
                'current_year': current_year,
            })
            send_mail(
                subject,
                '',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                html_message=html_message,
                fail_silently=False
            )
            data = {
                'success':True,"message":'Please Check your email for reset password'}
            return Response(data,status=status.HTTP_200_OK)
        
        except CustomUser.DoesNotExist:
            return error_response('No user found with this phone number', status_code=status.HTTP_404_NOT_FOUND)      
    else:
        return error_response('Method not allowed', status_code=status.HTTP_405_METHOD_NOT_ALLOWED)

@api_view(['POST'])
def reset_password(request,token):
    try:
        user = CustomUser.objects.get(reset_password_token=token)
    except CustomUser.DoesNotExist:
        return error_response('user not found', status_code=status.HTTP_404_NOT_FOUND)
    try:
        if request.method == 'POST':
            data = json.loads(request.body)
            new_password = data.get('new_password')
            user.set_password(new_password)
            user.reset_password_token = None
            user.save()
        return Response({'success':True,'message':'Your password has been reset successfully. You can now log in with your new password.'},status=status.HTTP_200_OK)
    except:
        return error_response('method not allowed', status_code=status.HTTP_405_METHOD_NOT_ALLOWED)

# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    try:
        user=request.user
        data = json.loads(request.body)
        old_password = data.get('old_password')
        if user.check_password(old_password):
            new_password = data.get('new_password')
            
            # Set the new password (this hashes the password before saving)
            user.set_password(new_password)
            user.save()
            return Response({'success':True,'message':'your password has been changed'},status=status.HTTP_200_OK)
        
        else:
            return error_response('Invalid password', status_code=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        logger.exception("Error in change_password")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetallAddresses(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        user = request.user
        try:
              all_addresses = Address.objects.filter(user=user.id)
              try :
                  user = CustomUser.objects.get(id=user.id)
              except CustomUser.DoesNotExist :
                  user = None

              if all_addresses.count() > 0 :
                  serializer = AddressSerializer(all_addresses, many=True)
                  data = {'success':True,'address':serializer.data}
                  if user:
                      data["username"] = user.username
                      data["user email"] = user.email
                      data["phone number"] = user.phone_number

                  return Response(data,status=status.HTTP_200_OK)
              else: 
                  data = {'success':False,"message":'No Addresses were found'}
                  return Response(data,status=status.HTTP_200_OK)
              
        except Exception as e:
            logger.exception("Error in GetallAddresses")
            return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class Addresses(APIView):
    permission_classes = [IsAuthenticated]

    # SEC-08: Fixed — Added ownership check
    def get(self,request):
      # Get the address_id 
      address_id = request.GET.get('address_id')
      if not address_id : # Check address id is provided or not
          return error_response('Address id is not provided', status_code=status.HTTP_400_BAD_REQUEST)
      
      # Check address exists AND belongs to the requesting user
      try:
          address = Address.objects.get(id=address_id, user=request.user)
          serializer = AddressSerializer(address)
          return Response({'success':True,'address':serializer.data},status=status.HTTP_200_OK)
      except Address.DoesNotExist:
          return error_response('Address does not exist', status_code=status.HTTP_404_NOT_FOUND)
            
    def post(self,request):
        if request.method == 'POST': # Check method
            user = request.user
            
            address_count = Address.objects.filter(user=user).count() # Find the provided user total address 
            # Max limit of address is 5
            if address_count >= 5:
                return error_response('You can add upto 5 addresses', status_code=status.HTTP_404_NOT_FOUND)
            # get all the details or fields
            data = json.loads(request.body)
            address = data.get('address')
            city = data.get('city')
            state = data.get('state')
            country = data.get('country')
            pincode = data.get('pincode')

            # Now create a new address object
            if not address  or not city or not state or not pincode :
                return error_response('Please Provide all details', status_code=status.HTTP_400_BAD_REQUEST)

            new_address = Address(user=user,address=address,city=city,state=state,country=country,pincode=pincode)
            # Save the new address to the object
            new_address.save()
            serializer = AddressSerializer(new_address)
            data = {'success':True,"message":'New Address Added Successfully','address':serializer.data}
            return Response(data,status=status.HTTP_201_CREATED)

        else: # Method not allowed
            return error_response('Method Not Allowed', status_code=status.HTTP_405_METHOD_NOT_ALLOWED)

    # SEC-09: Fixed — Added ownership check
    def put(self,request):
        if request.method == 'PUT':
            try:
              # Get address from address id
              address_id = request.GET.get('address_id')

              if not address_id:
                  return error_response('Address not found', status_code=status.HTTP_404_NOT_FOUND)
              
              try:
                  address = Address.objects.get(id=address_id, user=request.user)  # SEC-09: ownership check
              except Address.DoesNotExist:
                  return error_response('Address Does not exist', status_code=status.HTTP_404_NOT_FOUND)
              
              # Get address update data from request body
              data = json.loads(request.body)
              # Update the address if it found
              if data.get('address') is not None and data.get('address') != "null":
                  address.address = data.get('address') #If address is not null then set the address
              if data.get('city') is not None and data.get('city') != "null":
                  address.city = data.get('city') #If city is not null then set the city
              if data.get('country') is not None and data.get('country') != "null":
                  address.country = data.get('country') #If city is not null then set the city
              if data.get('state') is not None and data.get('state') != "null":
                  address.state = data.get('state') #If state is not then set the state
              if data.get('pincode') is not None and data.get('pincode') != "null":
                  address.pincode = data.get('pincode') #If pincode is not null then set the pincode
              address.save() # Save the new updated address
              data = {'success':True,"message":"Address updated successfully"} # Send success
              return Response(data,status=status.HTTP_200_OK)
            except Exception as e:
                logger.exception("Error in Addresses.put")
                return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

        
    def delete(self,request):
        try:
          address_id = request.GET.get('address_id')
          user_id = request.user.id
          try:
              address = Address.objects.get(id=address_id)
              if user_id == address.user.id: # Check user id and address user id is same or not
                  address.delete() # if same then delete the address
                  data = {'success':True,"message":"Address Delete Successfully"}
                  return Response(data,status=status.HTTP_200_OK)
              else:
                  return error_response('Authentication Failed', status_code=status.HTTP_400_BAD_REQUEST)
          except Address.DoesNotExist:
              return error_response('Address does not exist', status_code=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return error_response('Authentication Error', status_code=status.HTTP_400_BAD_REQUEST)

# DRY-04: Fixed — @api_view MUST be outermost decorator
# SEC-03: Fixed — Only allow whitelisted fields via setattr
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def verify_profile_otp(request):
        data = request.data
        otp = data.get('otp','')
        user_id=request.user.id
        updated_data = data.get('data',{})
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return error_response('User does not exist', status_code=status.HTTP_400_BAD_REQUEST)

        try:
            otpObj = Otp.objects.get(user=user)

            # SEC-07: Check OTP attempts before verifying
            if otpObj.attempts >= 5:
                otpObj.delete()
                return error_response('Too many attempts. Please request a new OTP.', status_code=status.HTTP_429_TOO_MANY_REQUESTS)
            otpObj.attempts += 1
            otpObj.save()

            if hash_otp(str(otp)) != otpObj.otp or not otpObj.is_valid:
                return error_response('Invalid or expired OTP', status_code=status.HTTP_400_BAD_REQUEST)
            
            # SEC-03: Only update whitelisted fields — prevents privilege escalation
            for key, value in updated_data.items():
                if key in ALLOWED_UPDATE_FIELDS:
                    setattr(user, key, value)
                # Silently ignore disallowed fields like is_staff, is_superuser, etc.

            user.is_active = True
            # Only save the fields we allow
            fields_to_update = [k for k in updated_data.keys() if k in ALLOWED_UPDATE_FIELDS]
            fields_to_update.append('is_active')
            user.save(update_fields=fields_to_update)
            user.refresh_from_db() 

            return Response({
                'success':True,
                'message':'Profile updated successfully',
                'updated_data':{k: v for k, v in updated_data.items() if k in ALLOWED_UPDATE_FIELDS},
            },status=status.HTTP_200_OK)
        
        except Otp.DoesNotExist:
            return error_response('OTP not found or expired', status_code=status.HTTP_400_BAD_REQUEST)


class UserProfile(APIView):
        permission_classes=[IsAuthenticated]
        
        def get(self,request):
          user_id = request.user.id
          try:
              user = CustomUser.objects.get(id=user_id)
          except:
              user = None
          
          if user is None:
              return error_response('User not found', status_code=status.HTTP_404_NOT_FOUND)
          
          if not user.name:
              user.name = ''

          if not user.email:
              user.email = ''

          phone_number = user.phone_number
          if phone_number and str(phone_number).startswith('tmp'):
              phone_number = ''

          data = {
              "success":True,
              "phone_number":str(phone_number or ''),
              "email":str(user.email),
              "name":str(user.name),
          }
          return Response(data ,status=status.HTTP_200_OK)
        

        def put(self,request):
          user_id = request.user.id
          try:
              user = CustomUser.objects.get(id=user_id)
          except:
              user = None

          if user is None:
              return error_response('User not found', status_code=status.HTTP_404_NOT_FOUND)
          data = json.loads(request.body)
          changed_fields = []
          # Check for valid email and update
          if 'email' in data:
              email = str(data.get('email') or '').strip().lower()
              email_value = email if email else None
              if email_value:
                  email_exists = CustomUser.objects.filter(email=email_value).exclude(id=user.id).exists()
                  if email_exists:
                      return error_response('User with this email already exists!', status_code=status.HTTP_400_BAD_REQUEST)
              if user.email != email_value:
                  user.email = email_value
                  changed_fields.append('email')

          if 'phone_number' in data:
              phone_number = str(data.get('phone_number') or '').strip()
              phone_value = phone_number if phone_number else None
              if phone_value:
                  phone_number_exists = CustomUser.objects.filter(phone_number=phone_value).exclude(id=user.id).exists()
                  if phone_number_exists:
                      return error_response('User with this Phone Number already exists!', status_code=status.HTTP_400_BAD_REQUEST)
              if user.phone_number != phone_value:
                  user.phone_number = phone_value
                  changed_fields.append('phone_number')
              
          if 'name' in data:
              name = str(data.get('name') or '').strip()
              if user.name != name:
                  user.name = name
                  changed_fields.append('name')

          if not changed_fields:
              return error_response('No changes found to update', status_code=status.HTTP_400_BAD_REQUEST)

          user.save(update_fields=list(set(changed_fields)))
          return Response({'success':True, 'message':'Profile updated successfully'}, status=status.HTTP_200_OK)
            
        def delete(self,request):
            try:
                user=request.user
                if user is not None:
                    logout(request)
                    user.delete()
                    response = Response({'success':True,'message':'User deleted successfully'},status=status.HTTP_200_OK)
                    return _delete_auth_cookies(response)
            except:
                return error_response('Authentication failed', status_code=status.HTTP_400_BAD_REQUEST)
            

# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getUser(request):
    try:
        user_id=request.user.id
        user = CustomUser.objects.get(id=user_id)
        user_data = CustomUserSerializer(user).data
        return Response({"success":True,"user":user_data,"is_staff":user.is_staff,'is_superuser':user.is_superuser},status=status.HTTP_200_OK)
            
    except CustomUser.DoesNotExist:
        return Response({"error":"User not found","message":"User does not exist"},status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.exception("Error in getUser")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DRY-04: Fixed — @api_view MUST be outermost decorator
# SEC-04: Fixed — Only staff can view other users' data
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getUserById(request):
    try:
        # SEC-04: Restrict to staff users only
        if not request.user.is_staff:
            return Response({"error":"Forbidden","message":"You are not authorized to access this endpoint"},status=status.HTTP_403_FORBIDDEN)

        id = request.GET.get("id")
        user = CustomUser.objects.get(id=id)
        user_data = CustomUserSerializer(user).data
        return Response({"success":True,"user":user_data,"is_staff":user.is_staff},status=status.HTTP_200_OK)
    
    except CustomUser.DoesNotExist:
        return Response({"error":"User not found","message":"User does not exist"},status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.exception("Error in getUserById")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getAllUsers(request):
    try:
      user_id=request.user.id
      user = CustomUser.objects.get(id=user_id)
      if not user.is_staff:
          return Response({"error":"You are not authorized to access this endpoint","message":"You are not authorized to access this endpoint"},status=status.HTTP_403_FORBIDDEN)
      users = CustomUser.objects.all()
      users_data = CustomUserSerializer(users,many=True).data
      return Response({"success":True,"users":users_data},status=status.HTTP_200_OK)
            
    except CustomUser.DoesNotExist:
        return Response({"error":"User not found","message":"User does not exist"},status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        logger.exception("Error in getAllUsers")
        return error_response('Something went wrong. Please try again later.', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DRY-04: Fixed — @api_view MUST be outermost decorator    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def logout_account(request):
    # Invalidate Django session
    logout(request)
    
    response = JsonResponse({'success':True, 'message':"Logged out Successfully"})
    return _delete_auth_cookies(response)