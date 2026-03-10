import logging
import requests

from decouple import config
from django.http import JsonResponse

logger = logging.getLogger('error_log')

BASE_URL = config('BASE_URL')

def get_client_ip(request):
    """
    Retrive the client's IP address from the request

    Args: 
        request (HttpRequest): The incoming request object

    Returns:
        str: The client's IP address.
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def append_log(message):
    logger.error(message)