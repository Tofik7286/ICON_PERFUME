from django.contrib import admin
from mainapp.admin import admin_site
from mainapp.views import *
from django.urls import path,include, re_path
from django.conf.urls.static import static
from django.conf import settings
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from nested_admin import urls as nested_admin_urls
from mainapp import views
from django.views.generic import RedirectView

urlpatterns = [
    re_path(r'^admin/(mainapp|accounts)/$',RedirectView.as_view(url="/admin/")),
    path('admin/', admin_site.urls),
    path('api/',include('mainapp.urls')),
    path('summernote/',include('django_summernote.urls')),
    re_path(r'^invoices/(?P<path>.*)$', views.serve_invoices, name='serve_invoices')

]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)