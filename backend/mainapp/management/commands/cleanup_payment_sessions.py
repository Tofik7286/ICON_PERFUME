from django.core.management.base import BaseCommand
from django.db import transaction as db_transaction
from django.utils import timezone

from mainapp.models import PaymentSession


class Command(BaseCommand):
    help = 'Expire stale PaymentSessions and cancel their orphan ONLINE pending orders'

    def handle(self, *args, **options):
        now = timezone.now()
        stale = PaymentSession.objects.filter(
            status__in=PaymentSession.REUSABLE_STATUSES,
            expires_at__lt=now,
        )

        expired_count = 0
        cancelled_orders = 0

        for ps in stale.iterator():
            with db_transaction.atomic():
                ps.status = 'ABANDONED' if ps.retry_count == 0 else 'EXPIRED'
                ps.save(update_fields=['status', 'updated_at'])
                expired_count += 1

                order = ps.order
                # ONLINE no longer decrements stock at init, so there is no
                # stock to restore — just close out the orphan order.
                if order and order.payment_status == 'Pending':
                    order.payment_status = 'Failed'
                    order.order_status = 'Cancelled'
                    order.save(update_fields=['payment_status', 'order_status', 'updated_at'])
                    cancelled_orders += 1

        self.stdout.write(self.style.SUCCESS(
            f'Expired {expired_count} payment session(s); '
            f'cancelled {cancelled_orders} orphan order(s)'
        ))
