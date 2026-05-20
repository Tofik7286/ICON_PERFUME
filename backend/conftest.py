import pytest
from rest_framework.test import APIClient
from accounts.models import CustomUser


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    return CustomUser.objects.create_user(
        phone_number="9000000001",
        username="admin_test",
        password="testpass123",
        is_staff=True,
    )


@pytest.fixture
def regular_user(db):
    return CustomUser.objects.create_user(
        phone_number="9000000002",
        username="regular_test",
        password="testpass123",
        is_staff=False,
    )


@pytest.fixture
def admin_client(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client


@pytest.fixture
def user_client(regular_user):
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client
