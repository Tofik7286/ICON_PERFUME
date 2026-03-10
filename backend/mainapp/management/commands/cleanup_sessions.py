from django.core.management.base import BaseCommand
from django.utils import timezone

from mainapp.models import CheckoutSession


class Command(BaseCommand):
    help = 'Delete expired CheckoutSession records'

    def handle(self, *args, **options):
        deleted_count, _ = CheckoutSession.objects.filter(
            expires_at__lt=timezone.now()
        ).delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {deleted_count} expired checkout session(s)'))
