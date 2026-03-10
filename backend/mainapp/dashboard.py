# admin_dashboard/dashboard.py
from django.db.models import Count, Sum
from django.contrib.auth.models import User
from mainapp.models import Order  # Import your model

from jazzmin.dashboard import Dashboard
import logging
logger = logging.getLogger(__name__)

class CustomAdminDashboard(Dashboard):
    """
    Custom Admin Dashboard to display analytics like sales, users, etc.
    """
    logger.debug("Hello in custom admin dashboard")
    def init_with_context(self, context):
        """
        Add custom widgets to the dashboard
        """
        # Add simple widgets like total users, total orders, etc.
        self.children.append(
            {
                'type': 'simple',
                'title': 'Total Orders',
                'content': Order.objects.count(),
                'url': '/admin/app/order/',  # Redirect to the Order model admin page
            }
        )

        self.children.append(
            {
                'type': 'simple',
                'title': 'Total Users',
                'content': User.objects.count(),
                'url': '/admin/auth/user/',  # Redirect to the User model admin page
            }
        )

        # Add a widget for total revenue
        total_revenue = Order.objects.aggregate(total_price=Sum('total_price'))['total_price']
        self.children.append(
            {
                'type': 'simple',
                'title': 'Total Revenue',
                'content': total_revenue or 0,
                'url': '/admin/app/order/',  # Redirect to the Order model admin page
            }
        )

        # You can also add a chart widget or custom view here
        # For example, you can use Chart.js to display sales trends

        # Add a sales chart widget (using a placeholder for now)
        self.children.append(
            {
                'type': 'chart',
                'title': 'Sales by Month',
                'content': 'chart-placeholder',  # You would later replace this with a chart
            }
        )
