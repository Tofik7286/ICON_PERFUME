import json,os,random
import jwt
import logging

from datetime import datetime
from decouple import Config, RepositoryEnv, config
from django.core.mail import send_mail
from django.core.cache import cache
from django.http import HttpResponse, JsonResponse, HttpResponseForbidden
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view , permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from playwright.sync_api import sync_playwright
# from .views import *
from accounts.models import *
from mainapp.serializers import *
from mainapp.models import *
from celery import shared_task

User = get_user_model()
try:
    config = Config(RepositoryEnv('/var/www/icon_perfumes/backend/.env'))
except:
    pass

logger = logging.getLogger(__name__)

# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(['POST'])
@permission_classes([AllowAny])
def subscribe_news_letter(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')

        if not email:
            return error_response('Please enter email', status_code=status.HTTP_400_BAD_REQUEST)
        
        try:
            news = NewsLetter.objects.get(email=email)
            return error_response('Email already subscribed', status_code=status.HTTP_400_BAD_REQUEST)
        except NewsLetter.DoesNotExist:
            news_letter = NewsLetter(email=email)
            news_letter.save()
            html_content = render_to_string('emails/newsletter_email.html', {
                'current_year': current_year,
            })
            send_email_task(
                subject=" You’re In! Welcome to Icon Perfumes 💌",
                message='',
                html_message=html_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email]
            )
            return Response({'success':True,'message':"News Letter subscribed successfully"},status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.exception("Error in subscribe_news_letter")
        return Response({'success':False,'message':'Something went wrong. Please try again later.'},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def unsubscribe_newsletter(request):
    data = json.loads(request.body)
    email = data.get('email')
    
    if not email:
        return error_response('Please enter email', status_code=status.HTTP_400_BAD_REQUEST)
    
    try:
        news = NewsLetter.objects.get(email=email)
        news.delete()
        return Response({'success':True,'message':"You have successfullly unsubscribed"},status=status.HTTP_200_OK)

    except NewsLetter.DoesNotExist:
        return error_response('Subscribe first', status_code=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def contact_us(request):
    try:
        data = json.loads(request.body)

        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        subject = data.get('subject')
        message = data.get('message')

        contact = ContactUs(
            name=name,
            email=email,
            phone=phone,
            subject=subject,
            message=message
        )
        contact.save()
        html_content = render_to_string('emails/contact_confirm_email.html', {
            'name': name,
            'current_year': current_year,
        })
        send_email_task(
                subject=f"We Received Your Message!",
                message='',  # Fallback text-only version
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                html_message=html_content,  # HTML version of the email
            )

        admin_html_message = render_to_string('emails/contact_admin_email.html', {
            'name': name,
            'email': email,
            'phone': phone,
            'subject': subject,
            'message': message,
            'current_year': current_year,
        })
        send_email_task.delay(
                subject=f"New Inquiry from Icon Perfumes Website ",
                message='',  # Fallback text-only version
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[ADMIN_EMAIL],
                html_message=admin_html_message,  # HTML version of the email
        )

        return Response({'success':True,'message':'Successfully Submitted'},status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.exception("Unexpected error")
        return error_response('Internal Server Error', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

def generate_invoice(email, order_number):
    """Generate a PDF invoice for an order and save it to the Order.invoice field.
    Uses OrderItem.price/discount/final_price (order-time snapshots) — never current variant prices."""
    from io import BytesIO
    from django.core.files.base import ContentFile
    from xhtml2pdf import pisa

    try:
        order = Order.objects.prefetch_related('items__variant__product').get(order_number=order_number)
        items = order.items.all()
        html = render_to_string('invoice.html', {'order': order, 'items': items})
        pdf_buffer = BytesIO()
        pisa_status = pisa.CreatePDF(html, dest=pdf_buffer)
        if pisa_status.err:
            logger.error(f"PDF generation failed for order {order_number}")
            return None
        filename = f"invoice_{order_number}.pdf"
        order.invoice.save(filename, ContentFile(pdf_buffer.getvalue()), save=True)
        logger.info(f"Invoice generated for order {order_number}")
        return order.invoice
    except Order.DoesNotExist:
        logger.error(f"Order {order_number} not found for invoice generation")
        return None
    except Exception as e:
        logger.exception(f"Error generating invoice for order {order_number}")
        return None


def serve_invoices(request, path):
    if not request.user.is_staff:
        return HttpResponseForbidden("You are not Authenticated")
    
    invoice_path = os.path.join(settings.MEDIA_ROOT,'invoices',path)
    if os.path.exists(invoice_path):
        with open(invoice_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'inline; filename={os.path.basename(invoice_path)}'
            return response
    else:
        return HttpResponseForbidden("File Not Found")

from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated
from rest_framework.response import Response
from rest_framework.views import exception_handler
from mainapp.responses import success_response, error_response


def custom_exception_handler(exc, context):
    """
    Changing the default exception handler of DRF to show message on frontend
    """
    # Get the default response
    response = exception_handler(exc, context)

    if isinstance(exc, AuthenticationFailed):
        return Response(
            {"success": False, "message": "Session Expired. Please log in again."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if isinstance(exc, NotAuthenticated):
        return Response(
            {"success": False, "message": "Session Expired. Please Login Again"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return response

def get_user_from_jwt(request):
    token = request.COOKIES.get('token') if request else None  # Get JWT token from cookie
    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=['HS256'])
        user_id = payload.get('user_id')
        user = User.objects.get(id=user_id)
        return user
    except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist):
        return None

@shared_task
def send_email_task(subject, message, from_email, recipient_list, html_message):
    send_mail(
        subject=subject,
        message=message,  # Fallback text-only version
        from_email=from_email,
        recipient_list=recipient_list,
        html_message=html_message,  # HTML version of the email
    )

@api_view(['GET'])
@permission_classes([AllowAny])
def getBanners(request):
    """
    API endpoint to fetch all active banners
    Returns banners in the format expected by frontend
    """
    try:
        banners = Banner.objects.all()
        serializer = BannerSerializer(banners, many=True)
        return Response({
            'success': True,
            'banners': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("Error fetching banners")
        return error_response('Internal Server Error', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def getPromocodes(request):
    """
    API endpoint to fetch all active promotions/promos
    Returns promotions in the format expected by frontend
    """
    try:
        promotions = Promotion.objects.filter(is_active=True)
        serializer = PromotionSerializer(promotions, many=True)
        return Response({
            'success': True,
            'promotions': serializer.data
        }, status=status.HTTP_200_OK)
    except Exception as e:
        logger.exception("Error fetching promotions")
        return error_response('Internal Server Error', status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)