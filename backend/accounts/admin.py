import logging
from datetime import datetime

from django.contrib import admin
from django.db.models import Q
from django.utils.timezone import now

from .models import *

# Register your models here.

logger = logging.getLogger("custom_logger")


class CustomUserAdmin(admin.ModelAdmin):
    # list all fields except password
    list_display = [
        field.name
        for field in CustomUser._meta.get_fields()
        if isinstance(field, (models.Field))
        and not isinstance(field, (models.ManyToManyField, models.ForeignKey))
        and not field.name == "password"
    ]
    search_fields = ["name", "email", "phone_number"]

    # list all users to admin/ staff can not see admin and other staff
    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if request.user.is_staff and not request.user.is_superuser:
            queryset = queryset.exclude(
                Q(is_superuser=True) | (Q(is_staff=True) & ~Q(id=request.user.id))
            )
        return queryset

    model = CustomUser

    def get_model_perms(self, request):
        perms = super().get_model_perms(request)

        if request.user.is_superuser:
            self.model._meta.verbose_name = "Custom User"
            self.model._meta.verbose_name_plural = "Custom Users"

        else:
            self.model._meta.verbose_name = "User"
            self.model._meta.verbose_name_plural = "Users"

        return perms

    def save_model(self, request, obj, form, change):
        """
        Override save_model to assign permissions to staff users.
        """
        super().save_model(request, obj, form, change)  # Save the user instance first

        if (
            obj.is_staff and not obj.is_superuser
        ):  # Only assign permissions to staff users, not superusers
            permission_codenames = [
                "view_transaction",
                "view_productimage",
                "update_product_price",
                "view_orderitem",
                "view_order",
                "view_newsletter",
                "update_variant_price",
                "view_transcation",  # Correct spelling of "view_transaction"
                "view_customuser",
                "view_productvariant",
                "view_productvarient",  # Correct spelling of "view_productvariant"
                "view_review",
                "view_product",
            ]

            # Fetch permissions based on codenames
            permissions = Permission.objects.filter(codename__in=permission_codenames)

            # Assign permissions to the user
            obj.user_permissions.set(permissions)
            obj.save()  # Save the user instance after assigning permissions

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} User Deleted : ID={obj.id}, Username: {obj.username}, Phone Number : {obj.phone_number}'
        )
        return super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            user = request.user
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(
                f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} User Deleted : ID={obj.id}, Username: {obj.username}, Phone Number : {obj.phone_number}'
            )

        return super().delete_queryset(request, queryset)

    def changelist_view(self, request, extra_context=None):
        current_month = now().month
        current_year = now().year

        total_users = CustomUser.objects.count()

        monthly_logins = CustomUser.objects.filter(
            last_login__year=current_year, last_login__month=current_month
        ).count()

        monthly_registrations = CustomUser.objects.filter(
            date_joined__year=current_year, date_joined__month=current_month
        ).count()

        extra_context = extra_context or {}
        extra_context["total_users"] = total_users
        extra_context["monthly_logins"] = monthly_logins
        extra_context["monthly_registrations"] = monthly_registrations

        return super().changelist_view(request, extra_context=extra_context)

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

