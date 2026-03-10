from django.urls import path
from . import views
from django.conf.urls.static import static
from .views import *
from django.conf import settings

urlpatterns = [ 
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout_account,name='logout'),
    path('login/',views.user_login,name='login'),
    path('verify-email/',views.verify_otp,name='verify_email'),
    path('profile/',UserProfile.as_view(),name='profile'),
    path('verify-profile-otp/',views.verify_profile_otp,name='verify_profile_otp'),
    path('send-otp/',views.send_otp,name='send_otp'),
    path('forgot-password/',views.forgot_password,name='forgot_password'),
    path('reset-password/<slug:token>/', views.reset_password, name='reset_password'),
    path('change-password/',views.change_password, name='change_password'),
    path('addresses/',Addresses.as_view(),name='addresses'),
    path('getAllAddresses/',GetallAddresses.as_view(),name='getalladdresses'),
    path('getUser/',views.getUser,name="getUser"),
    path('getUserById/',views.getUserById,name="getUserById"),
    path('getAllUsers/',views.getAllUsers,name="getAllUsers"),
] + static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)