import os
import urllib3

from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta
import dj_database_url  # For parsing DATABASE_URL
from urllib.parse import quote_plus
from distutils.util import strtobool

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

DEBUG = bool(strtobool(os.getenv("DEBUG", "True")))

SECRET_KEY = os.environ.get('SECRET_KEY')

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', default='').split(',')

SHIPROCKET_EMAIL = os.environ.get('SHIPROCKET_EMAIL')

WEB_URL = os.environ.get("WEB_URL")

SHIPROCKET_PASSWORD = os.environ.get('SHIPROCKET_PASSWORD')

RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID')

RAZORPAY_SECRET_KEY = os.environ.get('RAZORPAY_SECRET_KEY')

PICKUP_POSTCODE = os.environ.get('PICKUP_POSTCODE')

PAYU_MERCHANT_KEY = os.environ.get('PAYU_MERCHANT_KEY')

PAYU_MERCHANT_SALT = os.environ.get('PAYU_MERCHANT_SALT')

PAYU_BASE_URL = os.environ.get('PAYU_BASE_URL')

PAYU_SUCCESS_URL = os.environ.get('PAYU_SUCCESS_URL')

PAYU_FAILURE_URL = os.environ.get('PAYU_FAILURE_URL')

AUTH_USER_MODEL = 'accounts.CustomUser'



# Application definition

INSTALLED_APPS = [      
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'accounts',
    'nested_admin',
    'mainapp',
    'rest_framework',
    "rest_framework_simplejwt",
    "corsheaders",
    'import_export',
    'mptt',
    # 'django_elasticsearch_dsl',
    "django_summernote",
]
JAZZMIN_DASHBOARD = 'mainapp.dashboard.CustomAdminDashboard'

JAZZMIN_UI_TWEAKS = {
    "theme": "united",
    "sidebar_bg": "#bbc2c9",  # Dark background
    "sidebar_color": "#ffffff",  # Light text
    "sidebar_hover_bg": "#343a40",  # Hover background
    "sidebar_active_bg": "#495057", 
    "icons": True,  # Ensure icons are enabled globally
}

# (['default', 'cerulean', 'cosmo', 'flatly', 'journal', 'litera', 'lumen', 'lux', 'materia', 'minty', 'pulse', 'sandstone', 'simplex', 'sketchy', 'spacelab', 'united', 'yeti', 'darkly', 'cyborg', 'slate', 'solar', 'superhero']), using default
JAZZMIN_SETTINGS = {
    "icons": {
        "auth": "fas fa-users-cog",  # Example of setting icons for Django apps
        "auth.user": "fas fa-user",
        "auth.group": "fas fa-users",
    },
    "site_title": "Admin Panel",
    "site_header": "My Admin",
    "show_ui_builder": False,
    "site_brand": "Admin Panel",
    "site_icon": "fas fa-cogs",  # Customize the admin icon
    "welcome_sign": "Welcome to My Admin Panel!",
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "mainapp.middleware.SetCustomUserMiddleware",
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'accounts.middleware.JWTAuthenticationMiddleware',
]

ROOT_URLCONF = 'backend.urls'


CORS_ALLOWED_ORIGINS = os.environ.get('ALLOWED_ORIGINS', '').split(',') if os.environ.get('ALLOWED_ORIGINS') else []
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'content-type',
    'accept',
    'authorization',
    'x-csrftoken',
    # 'Upgrade-Insecure-Requests',  # Add this line
]

# Allow all methods (GET, POST, OPTIONS, etc.)
CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
]

JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
# Added Manually 
REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES" : ("rest_framework.renderers.JSONRenderer",),
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'EXCEPTION_HANDLER': 'mainapp.views.utils.custom_exception_handler',  # Use custom exception handler
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(days=30),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": False,

    "ALGORITHM": "HS256",
    "SIGNING_KEY": JWT_SECRET_KEY,
    "VERIFYING_KEY": "",
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,

    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",

    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",

    "JTI_CLAIM": "jti",
}

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

TEST_PAYMENTS_API_KEY = os.environ.get('TEST_PAYMENTS_API_KEY')


# DATABASES = {
#     'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
# }

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.postgresql',
#         'NAME': 'icon_perfumes_local',
#         'USER': 'icon_perfumes',
#         'PASSWORD': 'icon',  # Use the password you set in Step 1
#         'HOST': 'localhost',
#         'PORT': '5432',
#     }
# }

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    DATABASES = {
    "default": dj_database_url.parse(DATABASE_URL)
    }
else:
    DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "icon_perfumes_local"),
        "USER": os.getenv("DB_USER", "icon_perfumes"),
        "PASSWORD": os.getenv("DB_PASSWORD", "icon"),
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": os.getenv("DB_PORT", "5432"),
        }
    }
# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kolkata'

USE_I18N = True

USE_TZ = False


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_URL = os.environ.get('MEDIA_URL')
MEDIA_ROOT = BASE_DIR / 'media'

SUMMERNOTE_CONFIG = {
    'iframe': True,  # Ensure content is isolated
    'summernote': {
        'width': '120%',
        'height': '400px',
    },
}

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

STATICFILES_DIRS = [
    BASE_DIR / "static"
]

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters':{
        'verbose':{
            'format':'{message}',
            'style':'{',
        },
        'simple':{
            'format':'{levelname} {message}',
            'style':'{',
        }
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': os.environ.get('LOG_FILE_PATH'),  
            'formatter':'verbose',
        },
        'console':{
            'level': 'INFO',
            'class':'logging.StreamHandler',
            'formatter':'simple'
        },
        'error_handler':{
            'level': 'INFO',
            'class':'logging.FileHandler',
            'filename': os.environ.get('ERROR_LOG_FILE'),  
            'formatter':'simple'
        }
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'custom_logger':{
            'handlers': ['file'],
            'level':'INFO',
            'propagate': False,
        },
        'error_log':{
            'handlers': ['error_handler'],
            'level':'DEBUG',
            'propagate': False
        }
    },
}


# E-mail settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

EMAIL_HOST = os.environ.get('EMAIL_HOST')
EMAIL_PORT = os.environ.get('EMAIL_PORT')
EMAIL_HOST_USER  = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL')

GDAL_LIBRARY_PATH = '/usr/local/opt/gdal/lib/libgdal.dylib'  # Update with the actual path from above

# # ElasticSearch Configurations
# if DEBUG == False: # In Production
#     CERT_PATH = '/etc/elasticsearch/certs/fullchain.pem'
#     CLIENT_CERT_KEY = os.path.join(BASE_DIR, 'certs/client-cert-key.pem')
#     ELASTICSEARCH_URL = os.environ.get('ELASTICSEARCH_URL')
#     ELASTICSEARCH_USERNAME = os.environ.get('ELASTICSEARCH_USERNAME')
#     ELASTICSEARCH_PASSWORD = os.environ.get('ELASTICSEARCH_PASSWORD')
#     ELASTICSEARCH_INDEX_PREFIX = os.environ.get('ELASTICSEARCH_INDEX_PREFIX')
#     ELASTICSEARCH_DSL = {
#         'default':{
#             'hosts': [ELASTICSEARCH_URL],
#             'http_auth': (ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD),
#             #'use_ssl': True,
#             'verify_certs': False,
#             # 'ca_certs': CERT_PATH,
# #            'client_cert': CLIENT_CERT_KEY,
# #            'client_key': CLIENT_CERT_KEY,
#         }
#     }
# else:
#     ELASTIC_USERNAME='elastic'
#     ELASTIC_PASSWORD='wPIVz*cH_up7TopaqEkV'
#     ELASTICSEARCH_DSL = {
#         'default': {
#             'hosts': ['http://localhost:9200'],
#             'http_auth': (ELASTIC_USERNAME, ELASTIC_PASSWORD),
#             # 'use_ssl': True,
#             'verify_certs': False,
#             #'ca_certs': os.path.join(BASE_DIR, 'certs/http_ca.crt'),  # Update this if path is different
#         },
#     }

# Redis Configurations
if DEBUG == False:
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")

    CACHES = {
        "default":{
            "BACKEND":"django_redis.cache.RedisCache",
            "LOCATION":f"redis://:{REDIS_PASSWORD}@127.0.0.1:6379/1",
            "OPTIONS":{
                "CLIENT_CLASS":"django_redis.client.DefaultClient"
            }
        }
    }
else:
    CACHES = {
        "default":{
            "BACKEND":"django_redis.cache.RedisCache",
            "LOCATION":"redis://127.0.0.1:6379/1",
            "OPTIONS":{
                "CLIENT_CLASS":"django_redis.client.DefaultClient"
            }
        }
    }
SESSION_ENGINE = "django.contrib.sessions.backends.cache"
SESSION_CACHE_ALIAS = "default"

CELERY_BROKER_URL = 'amqp://localhost' # RabbitMQ
