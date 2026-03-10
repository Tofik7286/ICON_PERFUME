# 🔍 Deep Code Audit Report — Icon Perfumes Backend

**Date:** 2025-05-01  
**Scope:** Django REST Framework Backend (`backend/`)  
**Severity Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | 🔵 Low

---

## 📋 Summary

| Category | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| 1. Logical Bugs & Edge Cases | 4 | 5 | 4 | 1 | 14 |
| 2. Security & Permissions | 3 | 4 | 3 | 1 | 11 |
| 3. Performance (Database N+1) | 0 | 4 | 3 | 1 | 8 |
| 4. DRY & Best Practices | 0 | 1 | 4 | 3 | 8 |
| **Total** | **7** | **14** | **14** | **6** | **41** |

---

## 1️⃣ Logical Bugs & Edge Cases

### BUG-01 🔴 Critical — Typo `DoesNotExis` crashes promo code flow

**File:** `mainapp/views/checkout.py` — Line 222  
**Problem:** `Promotion.DoesNotExis` is a typo (missing `t`). This `except` clause will **never catch** the exception. Instead Python will raise `AttributeError` on `Promotion.DoesNotExis`, which gets caught by the outer generic `except Exception`, leaking internal error details.

```python
# ❌ CURRENT (Line 222)
except (Promotion.DoesNotExis):
    return Response({'error': 'Error', 'message': 'Invalid promo code'}, status=status.HTTP_400_BAD_REQUEST)
```

**Fix:**
```python
# ✅ RECOMMENDED
except Promotion.DoesNotExist:
    return Response({'error': 'Error', 'message': 'Invalid promo code'}, status=status.HTTP_400_BAD_REQUEST)
```

---

### BUG-02 🔴 Critical — Typo `request.user.i` crashes getAllUsers

**File:** `accounts/views.py` — Line 1220  
**Problem:** `request.user.i` should be `request.user.id`. This will **always crash** with `AttributeError`, making the endpoint completely non-functional.

```python
# ❌ CURRENT (Line 1220)
user_id=request.user.i
```

**Fix:**
```python
# ✅ RECOMMENDED
user_id = request.user.id
```

---

### BUG-03 🔴 Critical — Off-by-one error in stock check (plus_cart)

**File:** `mainapp/views/cart.py` — Line 89  
**Problem:** The condition `(cart.quantity + 1) >= cart.variant.stock` rejects the request when the new quantity **equals** the stock. For example, if stock=5 and cart.quantity=4, the user cannot add 1 more even though 5 items are available.

```python
# ❌ CURRENT (Line 89)
if (cart.quantity + 1) >= cart.variant.stock:
    return Response({'success': False, 'message': f'Currently Only {cart.variant.stock} ...'})
```

**Fix:**
```python
# ✅ RECOMMENDED
if (cart.quantity + quantity) > cart.variant.stock:
    return Response(
        {'success': False, 'message': f'Currently Only {cart.variant.stock} Quantity is Available for {cart.variant.product.title[:12]}{"..." if len(cart.variant.product.title) > 12 else ""}'},
        status=status.HTTP_400_BAD_REQUEST
    )
```

---

### BUG-04 🔴 Critical — Race condition in stock management (no `select_for_update`)

**File:** `mainapp/views/checkout.py` — Lines 370-373 (`_create_cart_order`)  
**File:** `mainapp/views/cart.py` — Lines 81-94 (`plus_cart`)  
**Problem:** Multiple concurrent requests can pass the stock check simultaneously before any of them decrement stock. This leads to **overselling**.

```python
# ❌ CURRENT (checkout.py Line 370)
cart_items = Cart.objects.filter(user=user)
for item in cart_items:
    if not item.variant.stock or item.variant.stock < item.quantity:
        return None, f'{item.variant} is out of stock'
```

**Fix:**
```python
# ✅ RECOMMENDED — Use select_for_update inside a transaction
from django.db import transaction

with transaction.atomic():
    cart_items = Cart.objects.filter(user=user).select_for_update()
    for item in cart_items:
        variant = ProductVariant.objects.select_for_update().get(id=item.variant_id)
        if not variant.stock or variant.stock < item.quantity:
            return None, f'{variant} is out of stock'
        variant.stock -= item.quantity
        variant.save()
    # ... continue with order creation
```

---

### BUG-05 🟠 High — No rating validation (Review can have rating=0 or rating=999)

**File:** `mainapp/views/reviews.py` — Line 62  
**File:** `mainapp/models.py` — Line 392  
**Problem:** The `Review.rating` field is `PositiveIntegerField()` with no max validator. A user can submit `rating=0` or `rating=999`. The model comment says "1 to 5 stars" but there's no enforcement.

```python
# ❌ CURRENT (models.py Line 392)
rating = models.PositiveIntegerField()  # 1 to 5 stars
```

**Fix:**
```python
# ✅ RECOMMENDED (models.py)
from django.core.validators import MinValueValidator, MaxValueValidator

rating = models.PositiveIntegerField(
    validators=[MinValueValidator(1), MaxValueValidator(5)]
)
```

Also add validation in the view:
```python
# ✅ RECOMMENDED (reviews.py, before Review.objects.create)
rating = data.get('rating')
if not rating or not isinstance(rating, int) or rating < 1 or rating > 5:
    return Response({'error': 'Error', 'message': 'Rating must be between 1 and 5'}, status=status.HTTP_400_BAD_REQUEST)
```

---

### BUG-06 🟠 High — `cancel_order` checks wrong status value

**File:** `mainapp/views/orders.py` — Line 109  
**Problem:** The code checks `order.order_status == 'PENDING'` but the Order model defines choices as `('Pending', 'Pending')` (capitalized). This means the cancel will **never succeed** since the status is `'Pending'` not `'PENDING'`. Same issue with `'CANCELLED'` — should be `'Cancelled'`.

```python
# ❌ CURRENT (Line 109-111)
if order.order_status == 'PENDING':
    order.order_status = 'CANCELLED'
    order.save()
```

**Fix:**
```python
# ✅ RECOMMENDED
if order.order_status in ('Pending', 'Confirmed'):
    order.order_status = 'Cancelled'
    order.save()
    return Response({'success': True, 'message': 'Order Cancelled Successfully'}, status=status.HTTP_200_OK)
else:
    return Response({'success': False, 'message': 'Order cannot be cancelled at this stage'}, status=status.HTTP_400_BAD_REQUEST)
```

---

### BUG-07 🟠 High — `re_order` doesn't check for duplicate cart items or stock

**File:** `mainapp/views/orders.py` — Lines 95-101  
**Problem:** When re-ordering, items are blindly added to the cart without checking:
1. If the variant already exists in the cart (creates duplicates)
2. If the variant still has sufficient stock
3. If the variant is still available

```python
# ❌ CURRENT (Line 99-100)
for item in order_items:
    Cart.objects.create(user=user, variant=item.variant, quantity=item.quantity)
```

**Fix:**
```python
# ✅ RECOMMENDED
for item in order_items:
    if not item.variant or not item.variant.available or item.variant.stock < item.quantity:
        continue  # skip unavailable items
    cart_item, created = Cart.objects.get_or_create(
        user=user, variant=item.variant,
        defaults={'quantity': item.quantity}
    )
    if not created:
        cart_item.quantity += item.quantity
        cart_item.save()
```

---

### BUG-08 🟠 High — `getPromocodes` returns cache key string instead of data

**File:** `mainapp/views/utils.py` — Line 340  
**Problem:** The response returns `cache_key` (the string `"promotions"`) instead of `response_data`.

```python
# ❌ CURRENT (Line 340)
cache.set(cache_key, response_data, timeout=60 * 10)
return Response(cache_key, status=status.HTTP_200_OK)  # BUG: returns "promotions" string!
```

**Fix:**
```python
# ✅ RECOMMENDED
cache.set(cache_key, response_data, timeout=60 * 10)
return Response(response_data, status=status.HTTP_200_OK)
```

---

### BUG-09 🟠 High — Duplicate `save()` method in ProductVariant model

**File:** `mainapp/models.py` — Lines 140-158 and Lines 174-181  
**Problem:** `ProductVariant` has **two** `save()` methods. The second one (line 174) completely overrides the first one (line 140), meaning the slug generation logic in the first `save()` is **dead code** that never runs.

```python
# ❌ CURRENT — First save() at line 140 is overridden
def save(self, *args, **kwargs):
    if not self.slug:
        base_slug = slugify(self.product.title)
        # ... slug generation
    super().save(*args, **kwargs)

# ... other methods ...

# Second save() at line 174 — THIS is what actually runs
def save(self, *args, **kwargs):
    """Generate and validate the SKU before saving."""
    if not self.sku:
        if not self.pk:
            super(ProductVariant, self).save(*args, **kwargs)
        self.sku = f"{self.product.title[:2].upper()}-{self.pk:03}"
    super(ProductVariant, self).save(*args, **kwargs)
```

**Fix:** Merge both into a single `save()`:
```python
# ✅ RECOMMENDED — Single unified save()
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
```

---

### BUG-10 🟡 Medium — `verify_otp` cart merge always increments quantity (even for new items)

**File:** `accounts/views.py` — Lines 365-373  
**Problem:** For both `created=True` and `created=False`, the code does `user_cart.quantity += int(quantity)`. For a newly created cart item, this means quantity becomes `1 + quantity` (default=1 plus the increment).

```python
# ❌ CURRENT (Line 369-372)
user_cart, created = Cart.objects.get_or_create(user=user, variant=variant)
if not created:
    user_cart.quantity += int(quantity)
else:
    user_cart.quantity += int(quantity)  # BUG: same logic for both!
```

**Fix:**
```python
# ✅ RECOMMENDED
user_cart, created = Cart.objects.get_or_create(user=user, variant=variant)
if created:
    user_cart.quantity = int(quantity)
else:
    user_cart.quantity += int(quantity)
user_cart.save()
```

---

### BUG-11 🟡 Medium — `calculate_checkout_total` discount logic inconsistency

**File:** `mainapp/views/checkout.py` — Lines 206-209  
**Problem:** When `promotion_type == 'product'` and `source != 'cart'`, the code checks `discount_type == 'fixed'`, but the Promotion model's `DISCOUNT_CHOICES` only has `'percentage'` and `'amount'`, not `'fixed'`. This means the `else` branch (percentage) always runs regardless of discount type.

```python
# ❌ CURRENT (Line 208)
discount_amount = promotion.discount_value if promotion.discount_type == 'fixed' else original_price * (promotion.discount_value / 100)
```

**Fix:**
```python
# ✅ RECOMMENDED — Use the model's calculate_discount method
discount_amount = promotion.calculate_discount(original_price)
```

---

### BUG-12 🟡 Medium — Missing HTTP status code in multiple responses

**File:** `mainapp/views/cart.py` — Line 90  
**File:** `accounts/views.py` — Line 989  
**Problem:** Several `Response()` calls have no `status=` argument, defaulting to 200 OK even for error cases.

```python
# ❌ CURRENT (cart.py Line 90)
return Response({'success': False, 'message': f'Currently Only {cart.variant.stock}...'})
# Missing status code!
```

**Fix:**
```python
# ✅ RECOMMENDED
return Response({'success': False, 'message': f'Currently Only {cart.variant.stock}...'}, status=status.HTTP_400_BAD_REQUEST)
```

---

### BUG-13 🟡 Medium — `ProductVariant.save()` slug uses wrong model for uniqueness check

**File:** `mainapp/models.py` — Line 147  
**Problem:** The first `save()` method (dead code, see BUG-09) checks `Product.objects.filter(slug=slug)` instead of `ProductVariant.objects.filter(slug=slug)` for slug uniqueness.

```python
# ❌ CURRENT (Line 147)
while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
```

**Fix:**
```python
# ✅ RECOMMENDED
while ProductVariant.objects.filter(slug=slug).exclude(pk=self.pk).exists():
```

---

### BUG-14 🔵 Low — `reviews.py` GET pagination is incorrect

**File:** `mainapp/views/reviews.py` — Lines 28-29  
**Problem:** `offset = page * limit` should be `(page) * limit` for standard slice-based pagination. On page 1 with limit 2, it returns `[:2]` which is correct, but `total_reviews` returns `len(all_reviews)` (the capped list) instead of the total count.

```python
# ❌ CURRENT (Line 37)
total_pages = math.ceil(len(reviews) / limit)
all_reviews = serializer.data[:offset]
# 'total_reviews': len(all_reviews)  — this is the sliced count, not total
```

**Fix:**
```python
# ✅ RECOMMENDED
total_count = reviews.count()
total_pages = math.ceil(total_count / limit)
start = (page - 1) * limit
all_reviews = serializer.data[start:start + limit]
# ...
'total_reviews': total_count,
```

---

## 2️⃣ Security & Permissions

### SEC-01 🔴 Critical — `order_change` and `order_check` have NO authentication

**File:** `mainapp/views/orders.py` — Lines 126-143  
**Problem:** These are plain Django views (not DRF) with **zero authentication**. Any anonymous user can flip `order.is_new = False` for any order by ID. This is an **order status manipulation** vulnerability.

```python
# ❌ CURRENT (Lines 126-143)
def order_change(request):
    if request.method == "GET":
        id = request.GET["id"]
        order = Order.objects.get(id=id)
        if order.is_new == True:
            order.is_new = False
            order.save()
        return JsonResponse("success", safe=False)

def order_check(request):
    if request.method == "GET":
        id = request.GET["id"]
        order = Order.objects.get(id=id)
        # ...
```

**Fix:**
```python
# ✅ RECOMMENDED — Add staff-only authentication
from django.contrib.admin.views.decorators import staff_member_required

@staff_member_required
def order_change(request):
    if request.method == "GET":
        order_id = request.GET.get("id")
        if not order_id:
            return JsonResponse({"error": "ID required"}, status=400)
        try:
            order = Order.objects.get(id=order_id)
            if order.is_new:
                order.is_new = False
                order.save()
            return JsonResponse({"success": True})
        except Order.DoesNotExist:
            return JsonResponse({"error": "Order not found"}, status=404)
    return JsonResponse({"error": "Method not allowed"}, status=405)
```

---

### SEC-02 🔴 Critical — `calculate_checkout_total` is AllowAny — price manipulation risk

**File:** `mainapp/views/checkout.py` — Lines 97-98  
**Problem:** This endpoint calculates order totals including promo code discounts, but uses `AllowAny` permission. An unauthenticated user can:
1. Enumerate valid promo codes
2. Check `WELCOME10` validity for any user
3. The endpoint also accesses `request.user.id` (Line 235) to check for free shipping users — this will crash for anonymous users.

```python
# ❌ CURRENT (Line 97-98)
@permission_classes([AllowAny])
@api_view(['POST'])
def calculate_checkout_total(request):
    ...
    # Line 235: crashes for anonymous users
    if request.user.id in [6, 1, 14]:
        shipping_charge = 0
```

**Fix:**
```python
# ✅ RECOMMENDED
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def calculate_checkout_total(request):
    # ... rest of code
```

---

### SEC-03 🔴 Critical — `verify_profile_otp` allows arbitrary field update via `setattr`

**File:** `accounts/views.py` — Lines 981-996  
**Problem:** The code uses `setattr(user, key, value)` for any field in the request data. An attacker can set `is_staff=True`, `is_superuser=True`, or `is_active=False` for any user by including those keys in the request body.

```python
# ❌ CURRENT (Lines 988-996)
for key, value in updated_data.items():
    if key == "data" and isinstance(value, dict):
        for sub_key, sub_value in value.items():
            if hasattr(user, sub_key):
                setattr(user, sub_key, sub_value)  # DANGEROUS!
    elif hasattr(user, key):
        setattr(user, key, value)  # DANGEROUS!
```

**Fix:**
```python
# ✅ RECOMMENDED — Whitelist allowed fields
ALLOWED_UPDATE_FIELDS = {'name', 'username', 'email', 'phone_number'}

for key, value in updated_data.items():
    if key in ALLOWED_UPDATE_FIELDS:
        setattr(user, key, value)
    # Silently ignore disallowed fields

user.is_active = True
user.save(update_fields=list(ALLOWED_UPDATE_FIELDS & set(updated_data.keys())) + ['is_active'])
```

---

### SEC-04 🟠 High — IDOR in `getUserById` — any authenticated user can view any user's data

**File:** `accounts/views.py` — Lines 1206-1214  
**Problem:** Any authenticated user can pass any `id` query parameter to view another user's details (phone, email, staff status). There's no check that the requesting user is admin/staff.

```python
# ❌ CURRENT (Line 1207-1209)
def getUserById(request):
    id = request.GET.get("id")
    user = CustomUser.objects.get(id=id)
    # No permission check! Any logged-in user can query any user.
```

**Fix:**
```python
# ✅ RECOMMENDED — Restrict to staff users
def getUserById(request):
    if not request.user.is_staff:
        return Response({"error": "Forbidden", "message": "You are not authorized"}, status=status.HTTP_403_FORBIDDEN)
    id = request.GET.get("id")
    # ...
```

---

### SEC-05 🟠 High — Hardcoded user IDs for free shipping

**File:** `mainapp/views/checkout.py` — Line 235  
**Problem:** `if request.user.id in [6, 1, 14]:` — hardcoded user IDs bypass shipping charges. This is fragile, not maintainable, and leaks internal logic.

```python
# ❌ CURRENT (Line 235)
if request.user.id in [6, 1, 14]:
    shipping_charge = 0
    shiprocket_info['company_rate'] = 0
```

**Fix:**
```python
# ✅ RECOMMENDED — Use a model flag or staff check
if request.user.is_staff or request.user.is_superuser:
    shipping_charge = 0
    shiprocket_info['company_rate'] = 0
```

Or better — add a `free_shipping` BooleanField to `CustomUser` and check that.

---

### SEC-06 🟠 High — `reset_password` token is only 6 chars — brute-forceable

**File:** `accounts/views.py` — Line 644 + Line 830  
**Problem:** The `generate_token()` function creates a 6-character alphanumeric token (62^6 = ~56 billion possibilities). While not trivially brute-forceable, combined with no rate limiting or token expiry, this is risky. There is also **no expiry** on the reset token.

```python
# ❌ CURRENT (Line 644)
def generate_token():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=6))
```

**Fix:**
```python
# ✅ RECOMMENDED — Use longer tokens + add expiry
import secrets

def generate_token():
    return secrets.token_urlsafe(32)  # 256-bit entropy

# Also add to CustomUser model:
# reset_password_expiry = models.DateTimeField(null=True, blank=True)
# And check expiry in reset_password view:
# if user.reset_password_expiry and user.reset_password_expiry < timezone.now():
#     return Response({'error': 'Error', 'message': 'Token expired'}, ...)
```

---

### SEC-07 🟠 High — OTP brute-force: no rate limiting on `verify_otp`

**File:** `accounts/views.py` — Lines 326-349  
**Problem:** The `verify_otp` endpoint has no attempt counter. An attacker can try all 900,000 possible 6-digit OTPs (100,000-999,999) without any throttling. Combined with the fact that OTP validity is only checked by time (2 minutes), an attacker with a fast script could potentially brute-force it within the window.

**Fix:**
```python
# ✅ RECOMMENDED — Add attempt counter to OTP model and throttle
# In models.py, add to Otp:
# attempts = models.PositiveIntegerField(default=0)
# max_attempts = 5

# In verify_otp view, before checking:
if otpObj.attempts >= 5:
    otpObj.delete()
    return Response({'error': 'Error', 'message': 'Too many attempts. Please request a new OTP.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)
otpObj.attempts += 1
otpObj.save()
```

---

### SEC-08 🟡 Medium — `Addresses.get` has no ownership check

**File:** `accounts/views.py` — Lines 878-887  
**Problem:** The `Addresses.get` view accepts `address_id` but never checks if the address belongs to the requesting user. Any authenticated user can read any other user's address.

```python
# ❌ CURRENT (Line 883)
address = Address.objects.get(id=address_id)
# No check: address.user == request.user
```

**Fix:**
```python
# ✅ RECOMMENDED
address = Address.objects.get(id=address_id, user=request.user)
```

---

### SEC-09 🟡 Medium — `Addresses.put` has no ownership check

**File:** `accounts/views.py` — Lines 912-940  
**Problem:** Same IDOR as SEC-08. Any authenticated user can modify any user's address.

```python
# ❌ CURRENT (Line 921)
address = Address.objects.get(id=address_id)
```

**Fix:**
```python
# ✅ RECOMMENDED
address = Address.objects.get(id=address_id, user=request.user)
```

---

### SEC-10 🟡 Medium — Internal error messages leak stack traces

**File:** Multiple files  
**Problem:** Many `except` blocks return `str(e)` in API responses, which can expose internal details like file paths, database structure, and library names to external users.

```python
# ❌ CURRENT (in many views)
return Response({'message': f"Internal server error: {str(e)}"}, status=500)
```

**Fix:**
```python
# ✅ RECOMMENDED
import logging
logger = logging.getLogger(__name__)

# In except blocks:
logger.exception("Error in <view_name>")
return Response({'error': 'Error', 'message': 'Something went wrong. Please try again later.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

---

### SEC-11 🔵 Low — JWT cookie not set as `httponly`

**File:** `accounts/views.py` — Lines 230-237 and 478-485  
**Problem:** The `httponly` flag is commented out, meaning JavaScript on the client can access the token cookie, making it vulnerable to XSS-based token theft.

```python
# ❌ CURRENT (Line 232)
response.set_cookie(
    key="token",
    value=str(refresh.access_token),
    # httponly=True,   # <-- COMMENTED OUT!
    secure=False if is_localhost else True,
```

**Fix:**
```python
# ✅ RECOMMENDED
response.set_cookie(
    key="token",
    value=str(refresh.access_token),
    httponly=True,  # Prevent XSS token theft
    secure=not settings.DEBUG,
    samesite="Lax" if settings.DEBUG else "None",
    domain=None if settings.DEBUG else os.environ.get('DOMAIN'),
    expires=timezone.now() + timedelta(days=30)
)
```

---

## 3️⃣ Performance (Database N+1 Queries)

### PERF-01 🟠 High — N+1 in `ProductVariantSerializer` (product, images, notes, wishlist)

**File:** `mainapp/serializers.py` — Lines 63-84  
**Problem:** `ProductVariantSerializer` accesses `obj.product`, `obj.notes.all()`, `obj.images` (via nested serializer), and `Wishlist.objects.filter()` for **every single variant**. When listing 12 products, this generates 48+ queries.

```python
# ❌ CURRENT — No prefetch anywhere
variants = ProductVariant.objects.all().order_by('-updated_at')
```

**Fix:**
```python
# ✅ RECOMMENDED (products.py — GetallProducts)
variants = ProductVariant.objects.select_related(
    'product'
).prefetch_related(
    'images',
    'notes',
    'product__category',
    'product__series',
).order_by('-updated_at')
```

---

### PERF-02 🟠 High — N+1 in `CartSerializer` (nested ProductVariantSerializer)

**File:** `mainapp/views/cart.py` — Line 21  
**Problem:** `Cart.objects.filter(user=user)` fetches carts, then each `CartSerializer` triggers `ProductVariantSerializer` which itself triggers `ProductSerializer`, images, notes — per item.

```python
# ❌ CURRENT (cart.py Line 21)
cart_items = Cart.objects.filter(user=user)
```

**Fix:**
```python
# ✅ RECOMMENDED
cart_items = Cart.objects.filter(user=user).select_related(
    'variant__product'
).prefetch_related(
    'variant__images',
    'variant__notes',
    'variant__product__category',
)
```

---

### PERF-03 🟠 High — N+1 in `OrderSerializer` (nested items + variants)

**File:** `mainapp/views/orders.py` — Line 22  
**Problem:** `OrderSerializer` includes `items = OrderItemSerializer(many=True)` which nests `ProductVariantSerializer`. Listing user orders without prefetch creates a query explosion.

```python
# ❌ CURRENT (orders.py Line 22)
orders = Order.objects.filter(user=user)
```

**Fix:**
```python
# ✅ RECOMMENDED
orders = Order.objects.filter(user=user).prefetch_related(
    'items__variant__product',
    'items__variant__images',
    'items__variant__notes',
    'items__variant__product__category',
).order_by('-created_at')
```

---

### PERF-04 🟠 High — N+1 in `WishlistSerializer`

**File:** `mainapp/views/wishlist.py` — Line 23  
**Problem:** Same pattern — `Wishlist.objects.filter(user=user)` without any prefetch, then each entry hits the DB for variant, product, images, notes.

```python
# ❌ CURRENT (wishlist.py Line 23)
wishlists = Wishlist.objects.filter(user=user)
```

**Fix:**
```python
# ✅ RECOMMENDED
wishlists = Wishlist.objects.filter(user=user).select_related(
    'variant__product'
).prefetch_related(
    'variant__images',
    'variant__notes',
    'variant__product__category',
)
```

---

### PERF-05 🟡 Medium — `GetProduct` runs 4+ separate queries that could be joined

**File:** `mainapp/views/products.py` — Lines 171-210  
**Problem:** The view makes separate queries for `Product.objects.get()`, `ProductVariant.objects.filter()`, `Review.objects.filter()`, `Notes.objects.filter()`, then `ProductVariant.objects.filter(notes__in=...)` for related products — without any `select_related`/`prefetch_related`.

**Fix:**
```python
# ✅ RECOMMENDED
product = Product.objects.prefetch_related(
    'category', 'reviews', 'reviews__user'
).get(slug=slug)

variants = ProductVariant.objects.filter(product=product).select_related(
    'product'
).prefetch_related('images', 'notes', 'product__category')
```

---

### PERF-06 🟡 Medium — `GetallProducts` evaluates full queryset with `len()`

**File:** `mainapp/views/products.py` — Lines 102-103  
**Problem:** `len(variants)` forces evaluation of the **entire queryset** into memory just to get the count. With thousands of products, this is very wasteful.

```python
# ❌ CURRENT (Line 102)
"totalPages": (len(variants) // limit) + (1 if len(variants) % limit > 0 else 0),
"totalProducts": len(variants),
```

**Fix:**
```python
# ✅ RECOMMENDED — Use .count() for database-level counting
total = variants.count()
"totalPages": math.ceil(total / limit),
"totalProducts": total,
```

---

### PERF-07 🟡 Medium — Missing `db_index` on frequently queried fields

**File:** `mainapp/models.py`  
**Problem:** Several fields are used in lookups/filters but have no database index:

| Field | Used In |
|---|---|
| `Order.order_number` | `generate_invoice`, lookup by order number |
| `Order.transaction_id` | `VerifyPaymentAPIView` filter |
| `ProductVariant.slug` | `GetProduct` lookup |
| `Product.slug` | `GetProduct` lookup |
| `Transaction.transaction_id` | Payment verification |

**Fix:**
```python
# ✅ RECOMMENDED — Add db_index=True
order_number = models.CharField(max_length=200, null=True, blank=True, db_index=True)
transaction_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)
slug = models.SlugField(max_length=200, blank=True, null=True, db_index=True)  # For Product & ProductVariant
```

---

### PERF-08 🔵 Low — `reviews.py` GET loads all reviews into memory then slices

**File:** `mainapp/views/reviews.py` — Lines 24-38  
**Problem:** The view serializes ALL reviews into Python objects, then slices `serializer.data[:offset]`. This loads the entire review set into memory. It also computes average rating in Python instead of using the database.

```python
# ❌ CURRENT (Lines 33-34)
avg = round(sum([review.rating for review in reviews]) / reviews.count(), 1)
all_reviews = serializer.data[:offset]
```

**Fix:**
```python
# ✅ RECOMMENDED — Use DB aggregation and queryset slicing
from django.db.models import Avg

avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
avg_rating = round(avg_rating, 1)

# Paginate at DB level
paginated_reviews = reviews[(page - 1) * limit : page * limit]
serializer = ReviewSerializer(paginated_reviews, many=True)
```

---

## 4️⃣ DRY & Best Practices

### DRY-01 🟠 High — Massive HTML email template duplication (~700 lines repeated)

**File:** `accounts/views.py` — Lines 92-147, 243-296, 398-458, 524-570, 1100-1170  
**File:** `mainapp/views/utils.py` — Lines 370-460  
**Problem:** The same HTML email layout (header with logo, content, footer with copyright) is copy-pasted **6+ times** across the codebase. Any branding change requires editing every copy.

**Fix:**
```python
# ✅ RECOMMENDED — Create Django templates for emails
# templates/emails/base_email.html
"""
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; background-color: #f7f7f7;">
  <div style="max-width: 600px; margin: 40px auto; background: #fff; padding: 20px; border-radius: 10px;">
    <div style="background-color: #FFFBF3; text-align: center; padding: 20px;">
      <img src="https://www.iconperfumes.in/_next/image/?url=%2Ficon_images%2Flogo.png&w=256&q=75" alt="Logo"  style="height: 51px;">
    </div>
    {% block content %}{% endblock %}
    <div style="font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding: 10px;">
      &copy; {% now "Y" %} Icon Perfumes. All rights reserved.
    </div>
  </div>
</body>
</html>
"""

# templates/emails/otp_email.html
"""
{% extends "emails/base_email.html" %}
{% block content %}
  <div style="text-align: center; padding: 20px;">
    <h2>{{ header }}</h2>
    <p>{{ message }}</p>
    <div style="padding: 15px; background: #f1f1f1; border-radius: 8px; font-size: 28px; font-weight: bold;">
      {{ otp }}
    </div>
  </div>
{% endblock %}
"""

# Usage in views:
from django.template.loader import render_to_string

html = render_to_string('emails/otp_email.html', {
    'header': 'Email Verification Code',
    'message': 'Please enter this code to verify your email:',
    'otp': otp,
})
```

---

### DRY-02 🟡 Medium — `UserWishlist.get` and `getAllWishlists` are identical

**File:** `mainapp/views/wishlist.py` — Lines 20-34 and Lines 90-109  
**Problem:** Both functions do the exact same query: `Wishlist.objects.filter(user=user)` → serialize → respond. The `getAllWishlists` function is a duplicate with slightly different error responses.

**Fix:** Remove `getAllWishlists` and use `UserWishlist.get` everywhere, or make `getAllWishlists` redirect to the class endpoint.

---

### DRY-03 🟡 Medium — Inconsistent response format across endpoints

**Problem:** Some endpoints use `{'success': True/False, 'message': ...}`, others use `{'error': 'Error', 'message': ...}`. This makes frontend error handling unreliable.

Examples:
- `cart.py`: `{'error': 'Error', 'message': '...'}`
- `orders.py`: `{'success': False, 'message': '...'}`
- `products.py`: `{'success': False, 'message': '...', 'data': []}`

**Fix:** Create a standard response utility:
```python
# ✅ RECOMMENDED — utils/responses.py
def success_response(data=None, message="Success", status_code=200):
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    return Response(response, status=status_code)

def error_response(message="Something went wrong", status_code=400):
    return Response({"success": False, "message": message}, status=status_code)
```

---

### DRY-04 🟡 Medium — `@permission_classes` decorator order is wrong on function-based views

**File:** `mainapp/views/cart.py` — Lines 79-80, `mainapp/views/orders.py` — Lines 50-51, `accounts/views.py` — Lines 849, 1197  
**Problem:** The `@permission_classes` decorator is placed **before** `@api_view`. DRF requires `@api_view` to be the outermost decorator. When `@permission_classes` is on top, it decorates the raw function, and `@api_view` then wraps that — which means `permission_classes` is **silently ignored**.

```python
# ❌ CURRENT (cart.py Lines 79-80)
@permission_classes([IsAuthenticated])  # This is IGNORED!
@api_view(['POST'])
def plus_cart(request, id):
```

**Fix:**
```python
# ✅ RECOMMENDED — @api_view must be outermost
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def plus_cart(request, id):
```

**Affected endpoints (all have this bug):**
| File | View | Line |
|---|---|---|
| `cart.py` | `plus_cart` | 79 |
| `cart.py` | `minus_cart` | 101 |
| `orders.py` | `getOrder` | 50 |
| `orders.py` | `re_order` | 83 |
| `orders.py` | `cancel_order` | 103 |
| `orders.py` | `return_order` | 117 |
| `accounts/views.py` | `change_password` | 849 |
| `accounts/views.py` | `getUser` | 1197 |
| `accounts/views.py` | `getUserById` | 1206 |
| `accounts/views.py` | `getAllUsers` | 1216 |
| `accounts/views.py` | `logout_account` | 1229 |
| `accounts/views.py` | `verify_profile_otp` | 963 |
| `utils.py` | `subscribe_news_letter` | 345 |
| `utils.py` | `unsubscribe_newsletter` | 537 |
| `wishlist.py` | `getAllWishlists` | 87 |

> ⚠️ **This is actually a Security issue too** — all these endpoints are effectively unauthenticated because `IsAuthenticated` is silently ignored!

---

### DRY-05 🟡 Medium — Unused `razorpay` import in checkout.py

**File:** `mainapp/views/checkout.py` — Line 2  
**Problem:** `import razorpay` is imported but never used. The actual payment integration uses PayU. This adds an unnecessary dependency.

```python
# ❌ CURRENT (Line 2)
import razorpay
```

**Fix:** Remove the import and remove `razorpay` from `requirements.txt` if not used elsewhere.

---

### DRY-06 🔵 Low — Wildcard imports (`from models import *`)

**File:** All view files  
**Problem:** `from mainapp.models import *`, `from accounts.models import *` makes it unclear which models are actually used and risks name collisions.

**Fix:**
```python
# ✅ RECOMMENDED — Explicit imports
from mainapp.models import Product, ProductVariant, Cart, Order, OrderItem, ...
from accounts.models import CustomUser, Address, Otp
```

---

### DRY-07 🔵 Low — `json.loads(request.body)` used instead of `request.data`

**File:** `accounts/views.py` — Lines 57, 163, 330, 505, etc.  
**File:** `mainapp/views/checkout.py` — Line 100  
**Problem:** DRF views already parse the request body into `request.data`. Using `json.loads(request.body)` bypasses DRF's content negotiation and will fail with non-JSON content types.

```python
# ❌ CURRENT
data = json.loads(request.body)
```

**Fix:**
```python
# ✅ RECOMMENDED
data = request.data
```

---

### DRY-08 🔵 Low — Duplicate `config` import / `.env` loading pattern

**File:** `accounts/views.py` — Lines 29-34  
**File:** `mainapp/views/utils.py` — Lines 28-31  
**Problem:** Both files have identical try/except blocks for loading `.env` from a hardcoded production path. This should be in `settings.py` only.

```python
# ❌ CURRENT (repeated in multiple files)
try:
    config = Config(RepositoryEnv('/var/www/icon_perfumes/backend/.env'))
except:
    pass
```

**Fix:** Move all env config to `backend/settings.py` and access via `django.conf.settings` everywhere.

---

## 📊 Priority Fix Order (Recommended)

| Priority | Issue | Impact |
|---|---|---|
| 1 | **DRY-04** | `@permission_classes` order → ALL function-based views have NO auth! |
| 2 | **SEC-01** | `order_change` / `order_check` — no auth at all |
| 3 | **SEC-03** | `verify_profile_otp` — privilege escalation via setattr |
| 4 | **BUG-01** | `DoesNotExis` typo — crashes promo flow |
| 5 | **BUG-02** | `request.user.i` typo — crashes getAllUsers |
| 6 | **SEC-02** | `calculate_checkout_total` AllowAny — price manipulation |
| 7 | **BUG-04** | Race condition in stock — overselling |
| 8 | **BUG-03** | Off-by-one stock check |
| 9 | **BUG-08** | `getPromocodes` returns wrong data |
| 10 | **SEC-07** | OTP brute-force risk |

---

*End of Audit Report*
