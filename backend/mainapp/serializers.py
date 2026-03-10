import base64

from decimal import Decimal
from django.db.models import Avg
from markdownify import markdownify as md
from rest_framework import serializers
from markdown import markdown

from accounts.serializers import CustomUserSerializer
from .models import *

class NotesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notes
        fields ='__all__'
class BannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = '__all__'

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image']

    def get_image(self, obj):
        return obj.image.url

class ProductSeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSeries
        fields = '__all__'    

class ProductSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(many=True)
    product_images = ProductImageSerializer(many=True, read_only=True)
    series = ProductSeriesSerializer(read_only=True)
    description = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'

    # def get_description(self, obj):
    #     if obj.description:
    #         return markdown(obj.description)  # converts Markdown (including \n, **bold**, etc.) to HTML
    #     return ""
        
    # def get_sub_category(self, obj):
    #     return obj.sub_category.name if obj.sub_category else None
    def get_category(self,obj):
        return [category.name for category in obj.category.all()]
    
    def get_description(self,obj):
        html_content = obj.description
        return md(html_content, heading_style="ATX")
    
class ProductVariantSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True,required=False)
    product = ProductSerializer(read_only=True)
    encoded_sku = serializers.SerializerMethodField()
    is_wishlist = serializers.SerializerMethodField()
    notes = serializers.SerializerMethodField()
    price = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        # fields = '__all__'
        fields = ['id','product','stock','available','price','discounted_price','images','notes','sku','encoded_sku','is_wishlist', 'slug','meta_title','meta_description','index','follow']

    def get_encoded_sku(self, obj):
        if obj and hasattr(obj, 'sku') and obj.sku:
            return base64.b64encode(obj.sku.encode()).decode()
        return None

    def get_is_wishlist(self, obj):
        from .views.utils import get_user_from_jwt
        request = self.context.get('request')
        user = getattr(request, 'user',None)

        if not user or not user.is_authenticated:
            user = get_user_from_jwt(request)
        if user and user.is_authenticated:
            return Wishlist.objects.filter(user=user,variant=obj).exists()
        return False
    
    def get_price(self, obj):
        return int(obj.price)
    
    def get_notes(self, obj):
        notes_order = {'TOP_NOTE': 0, 'HEART_NOTE': 1, 'BASE_NOTE': 2}
        notes = obj.notes.all()
        sorted_notes = sorted(notes, key=lambda n: notes_order.get(n.type, 99))
        return NotesSerializer(sorted_notes, many=True).data
    
class CartSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    variant = ProductVariantSerializer()

    class Meta:
        model = Cart
        fields = '__all__'

    def get_user(self,obj):
        return obj.user.username if obj.user else None

class OrderItemSerializer(serializers.ModelSerializer):
    variant = ProductVariantSerializer()
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True,read_only=True)

    class Meta:
        model = Order
        fields = '__all__'
    
    def get_user(self, obj):
        # Return the username if the user exists; otherwise, return None
        return obj.user.username if obj.user else None
    
class WishlistSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    variant = ProductVariantSerializer()
    class Meta:
        model = Wishlist
        fields = '__all__'
    def get_user(self, obj):
        # Return the username if the user exists; otherwise, return None
        return obj.user.username if obj.user else None
        
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    product = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = '__all__'
    def get_user(self, obj):
        # Return the username if the user exists; otherwise, return None
        return obj.user.name if obj.user else None
    
    def get_product(self,obj):
        return obj.product.title if obj.product else None

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'


class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = '__all__'

    def validate(self, attrs):
        """Ensure that the promotion dates are valid."""
        if attrs['start_date'] > attrs['end_date']:
            raise serializers.ValidationError("End date must be after start date.")
        return attrs