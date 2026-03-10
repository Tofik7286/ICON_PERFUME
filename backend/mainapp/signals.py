import logging
import threading
import json

from asgiref.sync import sync_to_async, async_to_sync
from django.db.models.signals import post_save, pre_save, pre_delete, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from django.utils.timezone import now
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.utils.text import slugify
from .models import (
    Product, ProductVariant, ProductCategory, 
    ProductImage, ProductSeries, Notes, Promotion,
    Banner )


logger = logging.getLogger('custom_logger')
# Thread-local storage for user context
_thread_locals = threading.local()

def get_current_user():
    return getattr(_thread_locals, 'user', None)

def set_current_user(user):
    _thread_locals.user = user
from concurrent.futures import ThreadPoolExecutor

_executor = ThreadPoolExecutor(max_workers=1)

def get_instance(pk, sender):
    return sender.objects.get(pk=pk)

# @receiver(pre_save)
# def capture_previous_state(sender, instance, **kwargs):
#     if sender._meta.app_label in ['admin', 'sessions']:
#         return

#     try:
#         if instance.pk:
#             # Run blocking ORM call in a separate thread to avoid async context issues
#             future = _executor.submit(get_instance, instance.pk, sender)
#             instance._old_instance = future.result()
#         else:
#             instance._old_instance = None
#     except sender.DoesNotExist:
#         instance._old_instance = None


@receiver(post_save)
def log_changes(sender, instance, created, **kwargs):
    """Log changes made to an instance."""
    if sender._meta.app_label == 'admin' or sender._meta.app_label == 'sessions':
        return

    user = getattr(instance, '_saved_by_user', None)
    if not user or not user.is_staff:
        return

    if created:
        log_data = {
        k: v
        for k, v in instance.__dict__.items()
        if not k.startswith("_")  # Exclude private attributes (like _state)
        }
        logger.info(
        f"[{now().strftime('%d/%m/%Y, %H:%M:%S')}] {user.username} "
        f"{'(Admin)' if user.is_superuser else '(Staff)'} Created: {sender.__name__} (ID: {instance.pk}) "
        f"with data: {json.dumps(log_data, default=str)}"
        )
    else:
        old_instance = getattr(instance, '_old_instance', None)
        if old_instance:
            changes = []
            exclude = ["updated_at"]
            for field in instance._meta.fields:
                if field.name in exclude:
                    continue
                field_name = field.name
                old_value = getattr(old_instance, field_name)
                new_value = getattr(instance, field_name)
                if old_value != new_value:
                    changes.append(f"{field_name}: '{old_value}' -> '{new_value}'")

            if changes:
                changes_str = ", ".join(changes)
                logger.info(
                    f"[{now().strftime('%d/%m/%Y, %H:%M:%S')}] {user.username} {'(Admin)' if user.is_superuser else '(Staff)'}  Updated: {sender.__name__} (ID: {instance.pk})"
                    f"Changes: {changes_str}"
                )

@receiver(pre_delete)
def log_deletions(sender, instance, **kwargs):
    """Log deletions of an instance."""
    user = get_current_user()

    if sender._meta.app_label == 'admin' or sender._meta.app_label == 'sessions':
        return
    
    user = getattr(instance, '_deleted_by_user', None)
    if not user:
        # If not found in instance, fallback to thread-local storage
        user = get_current_user()

    if not user or not user.is_staff:
        return
    
    log_data = {
        k: v
        for k, v in instance.__dict__.items()
        if not k.startswith("_")  # Exclude private attributes (like _state)
        }
    logger.info(
    f"[{now().strftime('%d/%m/%Y, %H:%M:%S')}] {user.username} {'(Admin)' if user.is_superuser else '(Staff)'} "
    f"Deleted: {sender.__name__} (ID: {instance.pk}) with data: {json.dumps(log_data, default=str)}"
    )

@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    """Log login events for staff and superuser users."""
    if user.is_staff or user.is_superuser:
        log_data = {
            'username': user.username,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'ip_address': request.META.get('REMOTE_ADDR', ''),
        }
        logger.info(
            f"[{now().strftime('%d/%m/%Y, %H:%M:%S')}] {user.username} {'(Admin)' if user.is_superuser else '(Staff)'} Logged In: IP {log_data['ip_address']}, User Data: {json.dumps(log_data)}"
        )

# Log Logout Event
@receiver(user_logged_out)
def log_user_logout(sender, request, user, **kwargs):
    """Log logout events for staff and superuser users."""
    if user.is_staff or user.is_superuser:
        log_data = {
            'username': user.username,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
            'ip_address': request.META.get('REMOTE_ADDR', ''),
        }
        logger.info(
            f"[{now().strftime('%d/%m/%Y, %H:%M:%S')}] {user.username} {'(Admin)' if user.is_superuser else '(Staff)'} Logged Out: IP {log_data['ip_address']}, User Data: {json.dumps(log_data)}"
        )   
    
@receiver(pre_save, sender=Product)
def generate_slug(sender, instance, **kwargs):
    if not instance.slug:
        base_slug = slugify(instance.title[:200])
        slug = base_slug
        counter = 1

        while Product.objects.filter(slug=slug).exists():
            counter += 1
            slug = f"{base_slug[:200 - len(str(counter))]}-{counter}"

        instance.slug = slug

@receiver(post_save, sender=Product)
@receiver(post_save, sender=ProductVariant)
@receiver(post_save, sender=ProductCategory)
@receiver(post_save, sender=ProductSeries)
@receiver(post_save, sender=ProductImage)
@receiver(post_save, sender=Notes)
@receiver(post_delete, sender=Product)
@receiver(post_delete, sender=ProductVariant)
@receiver(post_delete, sender=ProductCategory)
@receiver(post_delete, sender=ProductSeries)
@receiver(post_delete, sender=ProductImage)
@receiver(post_delete, sender=Notes)
@receiver(post_save, sender=Banner)
@receiver(post_delete, sender=Banner)
@receiver(post_save, sender=Promotion)
@receiver(post_delete, sender=Promotion)
def clear_cache_on_changes(sender, instance, **kwargs):
    logger.debug("🔁 Related object changed, clearing product cache...")
    cache.delete_pattern("product_*")
    if sender == Banner:
        cache.delete("banners")
    if sender == Promotion:
        cache.delete("promotions")
        