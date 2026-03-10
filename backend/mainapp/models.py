import re
import uuid
from django.utils.text import slugify
from decimal import Decimal
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.utils import timezone
from django.db import models
from django.utils import timezone
from django.utils.timezone import now
from mptt.models import MPTTModel, TreeForeignKey


from accounts.models import *

class Notes(models.Model):
    NOTES_TYPE = (
        ('TOP_NOTE','TOP_NOTE'),
        ('HEART_NOTE','HEART_NOTE'),
        ('BASE_NOTE','BASE_NOTE'),
    )
    title=models.CharField(max_length=100)
    type = models.CharField(max_length=100,choices=NOTES_TYPE,default='TOP_NOTE')
    description=models.TextField(null=True,blank=True)

    class Meta:
        verbose_name_plural = "Notes"
        
    def __str__(self):
        return f"{self.title} - {self.type.title()}"


class ProductCategory(MPTTModel):
    name = models.CharField(max_length=200)
    parent = TreeForeignKey(
        "self", on_delete=models.CASCADE, blank=True, null=True, related_name="children"
    )  # TreeForeignKey helps with hierarchy t
    category_image = models.ImageField(upload_to='category_images', blank=True,null=True)
    category_icon = models.ImageField(upload_to='category_icons', blank=True,null=True)
    meta_title = models.CharField(max_length=500,null=True,blank=True)
    meta_description = models.CharField(max_length=1500,null=True,blank=True)
    keywords = models.TextField(blank=True,null=True,help_text="Enter comma-separated keywords like attar, perfume, fragrance.")
    index = models.BooleanField(default=False)
    follow = models.BooleanField(default=False)
    slug = models.SlugField(max_length=255, blank=True, null=True)

    class MPTTMeta:
        order_insertion_by = ['name']

    def save(self, *args, **kwargs):
        # Auto-generate slug if missing
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while ProductCategory.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.name
    
class ProductSeries(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
    class Meta:
        verbose_name_plural = 'Product Series'

# Model to store the details of each Product product.
class Product(models.Model):
    title = models.CharField(max_length=100)
    category = models.ManyToManyField(ProductCategory,related_name="products",blank=True)
    series = models.ForeignKey(ProductSeries,on_delete=models.SET_NULL,null=True,blank=True)
    description = models.TextField(null=True,blank=True)
    new_arrival = models.BooleanField(default=False)
    exclusive = models.BooleanField(default=False)
    highlight = models.BooleanField(default=False)
    best_seller = models.BooleanField(default=False)
    recommended = models.BooleanField(default=False)
    is_combo = models.BooleanField(default=False)
    height = models.DecimalField(max_digits=10,null=True,blank=True,decimal_places=2)
    breadth = models.DecimalField(max_digits=10,null=True,blank=True,decimal_places=2)
    width = models.DecimalField(max_digits=10,null=True,blank=True,decimal_places=2)
    length = models.DecimalField(max_digits=10,null=True,blank=True,decimal_places=2)
    weight = models.DecimalField(max_digits=10,null=True,blank=True,decimal_places=2)
    slug = models.SlugField(max_length=200,blank=True,null=True)    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def save(self,*args,**kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        
        # Call the super save method
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProductVariant(models.Model):
    sku = models.CharField(max_length=255,unique=True,null=True,blank=True)
    product = models.ForeignKey(Product,on_delete=models.CASCADE,related_name='variants')
    notes = models.ManyToManyField(Notes,related_name='note',blank=True)
    available = models.BooleanField(default=True)
    stock = models.PositiveIntegerField(default=10)
    price = models.DecimalField(max_digits=10,decimal_places=2,null=True,blank=True)
    hsn_code = models.CharField(max_length=100,null=True,blank=True)
    discounted_price = models.DecimalField(max_digits=10,decimal_places=2,null=True,blank=True)
    meta_title = models.CharField(max_length=500,null=True,blank=True)
    meta_description = models.CharField(max_length=1500,null=True,blank=True)
    keywords = models.TextField(blank=True,null=True,help_text="Enter comma-separated keywords like attar, perfume, fragrance.")
    slug = models.SlugField(max_length=200,blank=True,null=True)
    index = models.BooleanField(default=False)
    follow = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.product.title}"
    
    def clean(self):
        # Ensure that sku_no follows the required pattern : 
        sku_pattern = r'^[a-zA-Z]{2}-\d{3}' # Updated regex: 2 letters - 3 digits
        # Validate the SKU number patterns
        if self.sku and not re.match(sku_pattern, self.sku):
            raise ValidationError("SKU format is incorrect. It should be 'category_code-number e.g. AT-002'.")
        
    @property
    def product_title(self):
        return self.product.title if self.product else ""
    
    @property
    def product_description(self):
        return self.product.description if self.product else ""
        
    def save(self, *args, **kwargs):
        # Generate slug if missing
        if not self.slug:
            base_slug = slugify(self.product.title)
            slug = base_slug
            counter = 1
            while ProductVariant.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        # Generate SKU if missing
        if not self.sku:
            if not self.pk:
                super().save(*args, **kwargs)
            self.sku = f"{self.product.title[:2].upper()}-{self.pk:03}"

        super().save(*args, **kwargs)

    @property
    def get_slug(self):
        categories = self.product.category.all()
        if not categories.exists():
            return self.product.slug
        parent = [cat for cat in categories if cat.level == 0]
        child = [cat for cat in categories if cat.level == 1]

        if parent and child:
            return f"/{parent[0].name.replace(' ','-').lower()}/{child[0].name.replace(' ','-').lower()}/{self.product.slug}"
        elif parent:
            return f"/{parent[0].name.replace(' ','-').lower()}/{self.product.slug}"
        else:
            return f"/{self.product.slug}"


class ProductImage(models.Model):
    image = models.ImageField(upload_to='product_images',blank=True,null=True)  
    variant = models.ForeignKey(ProductVariant,on_delete=models.CASCADE,related_name="images",null=True,blank=True)
    alt_tag = models.CharField(max_length=255,null=True,blank=True)
    
    def __str__(self):
        return str(self.image)

class Cart(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant,on_delete=models.CASCADE,blank=True,null=True)
    quantity = models.PositiveIntegerField(default=1)
    price_after_discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # New field
    created_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True,null=True, blank=True)
    
    def __str__(self):
        return f"Cart for {self.user.username}"
    
class Promotion(models.Model):
    PROMOTION_CHOICES = [
        ('product',('Product-based')),
        ('cart',('Cart-wide')),
    ]
    DISCOUNT_CHOICES = [
        ('percentage',('Percentage')),
        ('amount',('Amount')),
    ]   
    coupon_code  =  models.CharField(max_length=50 , unique=True)
    promotion_type = models.CharField(max_length=50,choices=PROMOTION_CHOICES)
    usage_count = models.PositiveIntegerField(default=0)  # Track the number of times used
    max_usage = models.PositiveIntegerField(default=1, help_text="Max times the coupon can be used (optional for multiple-use).")
    discount_type = models.CharField(max_length=50,choices=DISCOUNT_CHOICES)
    discount_value = models.DecimalField(max_digits=10 , decimal_places=2)
    product_variant = models.ForeignKey(ProductVariant,on_delete=models.CASCADE,null=True,blank=True)
    tag_line = models.CharField(max_length=400,null=True,blank=True)
    start_date = models.DateTimeField(default=now)
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.coupon_code} is ({self.get_discount_type_display()})"
    
    def clean(self):
        if self.promotion_type == 'product' and not self.product_variant:
            # Add error but don't raise ValidationError
            raise ValidationError("Product-based promotions require a product variant.")
            
    def save(self,*args,**kwargs):
        self.clean()        

        super().save(*args, **kwargs)
    
    def is_valid(self):
        """ Check if promotion is valid or not"""

        if not self.is_active:
            return False
        
    # Check if the current date is outside the valid date range
        if self.start_date and now() < self.start_date:
            return False

        if self.end_date and now() > self.end_date:
            return False

        # Check for multiple usage with a max limit
        if self.max_usage and self.usage_count >= self.max_usage:
            return False

        # Optional: Add user-based logic here for checking individual usage
        return True
    
    def increment_usage(self):
        """
        Increments the usage count when the coupon is applied.
        """
        self.usage_count += 1
        self.save()
    
    def calculate_discount(self ,original_price):
        """ Caculate the discount based price of the product or cart"""
        # Ensure original_price is a Decimal
        original_price = Decimal(original_price)
        
        if self.discount_type == 'percentage':
            return (original_price * self.discount_value) / 100
        elif self.discount_type == 'amount':
            if self.discount_value >= original_price:
                return original_price
            return self.discount_value
        return 0


# Model to represent an order placed by a user.
class Order(models.Model):
    ORDER_STATUS = (
        ('Pending','Pending'),
        ('Confirmed','Confirmed'),
        ('Shipped','Shipped'),
        ('Out For Delivery','Out For Delivery'),
        ('Delivered','Delivered'),
        ('Cancelled','Cancelled'),
        ('Returned', 'Returned'),
    )
    PAYMENT_STATUS = (
        ('Pending','Pending'),
        ('Processing','Processing'),
        ('Paid','Paid'),
        ('Failed','Failed'),
        ('other','other'),
    )
    PAYMENT_METHOD = (
        ('COD','COD'),
        ('ONLINE','ONLINE'),
    )

    address = models.CharField(max_length=255,null=True,blank=True)
    awb_code = models.CharField(max_length=50, blank=True, null=True) 
    city = models.CharField(max_length=100,null=True,blank=True)
    country=models.CharField(max_length=100,null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    discount = models.DecimalField(max_digits=10, decimal_places=2,null=True,blank=True)
    email = models.EmailField(max_length=100,null=True,blank=True)
    edd = models.CharField(max_length=60, blank=True, null=True) 
    final_price=models.DecimalField(max_digits=10, decimal_places=2,null=True)
    gst=models.DecimalField(max_digits=10, decimal_places=2,null=True)
    invoice = models.FileField(upload_to='invoices', null=True, blank=True)
    is_new = models.BooleanField(default=True)
    label = models.FileField(upload_to='labels', null=True, blank=True)
    manifest = models.FileField(upload_to='manifests', null=True, blank=True)
    name = models.CharField(max_length=255, blank=True,null=True)
    order_date = models.DateTimeField(auto_now_add=True,null=True,blank=True)
    order_number = models.CharField(max_length=200,null=True,blank=True)
    order_status = models.CharField(max_length=30,choices=ORDER_STATUS,default="Confirmed")
    phone_number = models.CharField(max_length=15,null=True,blank=True)
    pincode = models.CharField(max_length=10,null=True,blank=True)
    pickup_schedule_date = models.CharField(max_length=50, blank=True, null=True)
    pickup_token_number = models.CharField(max_length=50, blank=True, null=True)
    payment_status = models.CharField(choices=PAYMENT_STATUS,max_length=40,default='Pending')
    payment_method = models.CharField(choices=PAYMENT_METHOD,max_length=20, default="COD")
    pickup_status = models.CharField(max_length=50, blank=True, null=True) 
    state = models.CharField(max_length=100,null=True,blank=True)
    sub_total = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_charges = models.DecimalField(max_digits=10, decimal_places=2,null=True)
    courier_company_id = models.CharField(max_length=255, null=True, blank=True)
    courier_company = models.CharField(max_length=255, null=True, blank=True)
    shiprocket_order_id = models.CharField(max_length=50, blank=True, null=True)
    shiprocket_invoice = models.FileField(upload_to='shiprocket_invoice', null=True, blank=True)
    shipment_id = models.CharField(max_length=50, blank=True, null=True)
    tracking_link = models.URLField(blank=True, null=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    updated_at=models.DateTimeField(auto_now=True)
    

    def __str__(self):
        return f"Order {self.id} Of {self.user.name}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1)
    discount = models.DecimalField(max_digits=10,decimal_places=2,default=0.00)
    price = models.DecimalField(max_digits=10, decimal_places=2,default=0.00)
    final_price = models.DecimalField(max_digits=10,decimal_places=2,default=0.00)
    promotion = models.ForeignKey(Promotion, on_delete=models.SET_NULL,null=True,blank=True)

    def __str__(self):
        return f"{self.variant} x {self.quantity}"


class Transaction(models.Model):
    TRANSACTION_STATUS = (
        ('PENDING','PENDING'),
        ('Paid','Paid'),
        ('Failed','Failed'),
        ('Refunded','Refunded'),
    )
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True,null=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transactions', blank=True,null=True)
    transaction_id = models.CharField(max_length=50)
    token = models.CharField(max_length=500,null=True,blank=True)
    payment_id = models.CharField(max_length=255,null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=15)
    currency = models.CharField(max_length=15,default="INR")
    description = models.TextField(null=True, blank=True)
    transaction_status = models.CharField(max_length=30,default="PENDING",choices=TRANSACTION_STATUS)
    refund_id = models.CharField(max_length=100,null=True,blank=True)
    refund_by = models.ForeignKey(CustomUser,on_delete=models.SET_NULL,null=True,blank=True,related_name='refund_by')
    timestamp = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    

    def __str__(self):
        return (self.transaction_id)


# Model to represent a user's wishlist.
class Wishlist(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE,null=True,blank=True)
    added_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True,null=True, blank=True)

    def __str__(self):
        return f"{self.user.email}'s Wishlist"

class Review(models.Model):
    product = models.ForeignKey(Product, related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )  # 1 to 5 stars
    comment = models.TextField(null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.username} on {self.product.title}"
    
class Banner(models.Model):
    HEROS_SECTION_CHOICES = [
        ('hero_1', 'Banner 1'),
        ('hero_2', 'Banner 2'),
        ('hero_3', 'Banner 3'),
        ('hero_4', 'Banner 4'),
        ('hero_5', 'Banner 5'),
    ]

    section = models.CharField(
        max_length=50,
        choices=HEROS_SECTION_CHOICES,
        unique=True,  # Ensure each section can have only one active banner
        help_text="Select the hero section this banner belongs to."
    )
    image = models.ImageField(upload_to='Banners',help_text="Image size must be less than 2000Kb")
    mobile_image = models.ImageField(upload_to='Mobile_Banners',help_text="Image size must be less than 2000Kb",)
    is_active = models.BooleanField(default=True)  

    class Meta:
        ordering = ['section']  

    def __str__(self):
        return f"{self.section} - {'Active' if self.is_active else 'Inactive'}"
    
    def clean(self):
        # Validate image size
        if self.image and self.image.size > 2000 * 1024:  # 1 MB limit
            raise ValidationError("The image size must not exceed 2 MB")
    
    
    def save(self,*args, **kwargs):
        if not self.image or not self.mobile_image:
            raise ValidationError("Both 'Image' and 'Mobile Image' Must be Provided")
        
        self.clean()
        
        super().save(*args, **kwargs)
            
class NewsLetter(models.Model):
    email = models.EmailField(max_length=100)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return str(self.email)

class ContactUs(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    phone = models.CharField(max_length=15,null=True,blank=True)
    subject = models.CharField(max_length=100,null=True,blank=True)
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True,null=True, blank=True)

    def __str__(self):
        return f" {self.name} - {self.subject}"

class ShiprocketToken(models.Model):
    token = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        """Check if token is still valid (within 9 days)"""
        now = timezone.now()
        return (now - self.created_at).days < 9  # Valid for 9 days
    

class ReturnExchange(models.Model):
    REQUEST_TYPE_CHIOCE = [
        ('Return','Return'),
        ('Exchange','Exchange'),
    ]
    STATUS_CHOICES = [
        ('APPROVED','APPROVED'),
        ('REJECTED','REJECTED'),
        ('PENDING','PENDING'),
        ('COMPLETED','COMPLETED'),
    ]
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE)
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHIOCE)
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES,default='PENDING')
    processed_at = models.DateTimeField(null=True,blank=True)
    admin_note = models.TextField(blank=True)
    awb_code = models.CharField(max_length=50, blank=True, null=True) 
    shiprocket_order_id = models.CharField(max_length=50, blank=True, null=True)
    shipment_id = models.CharField(max_length=50, blank=True, null=True)
    pickup_status = models.CharField(max_length=50, blank=True, null=True) 
    pickup_schedule_date = models.CharField(max_length=50, blank=True, null=True)
    pickup_token_number = models.CharField(max_length=50, blank=True, null=True)
    manifest = models.FileField(upload_to='manifests', null=True, blank=True)
    label = models.FileField(upload_to='labels', null=True, blank=True)
    shiprocket_invoice = models.FileField(upload_to='shiprocket_invoice', null=True, blank=True)
    tracking_link = models.URLField(null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.request_type.title()} request for {self.order_item.variant.product.title}"
    
    class Meta:
        verbose_name = "Return/Exchange Request"
        verbose_name_plural = "Return/Exchange Requests"


class CheckoutSession(models.Model):
    session_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False, db_index=True)
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(minutes=30)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Session {self.session_token} - {self.variant.product.title} x{self.quantity}"

    class Meta:
        verbose_name = "Checkout Session"
        verbose_name_plural = "Checkout Sessions"