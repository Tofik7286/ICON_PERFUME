from django.test import TestCase

# Create your tests here.
from rest_framework.test import APITestCase
from .models import Promotion, Cart, Product, CustomUser

class PromotionTests(APITestCase):
    def test_apply_valid_promotion(self):
        user = CustomUser.objects.create_user(username='testuser', password='password')
        product = Product.objects.create(name="Test Product", price=100)
        Cart.objects.create(user=user, product=product, quantity=2)
        
        promotion = Promotion.objects.create(
            code="DISCOUNT20",
            promotion_type="cart",
            discount_type="percentage",
            discount_value=20,
            start_date="2024-11-01T00:00:00Z",
            end_date="2024-12-01T00:00:00Z",
            is_active=True
        )
        
        response = self.client.post('/apply-promo/', {'promo_code': 'DISCOUNT20'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('Promotion applied!', response.data['success'])

    def test_apply_invalid_promotion(self):
        response = self.client.post('/apply-promo/', {'promo_code': 'INVALIDCODE'})
        self.assertEqual(response.status_code, 400)
        self.assertIn('Invalid promotion code', response.data['error'])
