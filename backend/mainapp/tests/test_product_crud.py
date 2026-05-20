import pytest
from rest_framework.test import APIClient

from mainapp.models import Product, ProductVariant
from mainapp.tests.factories import (
    ProductCategoryFactory,
    ProductFactory,
    ProductVariantFactory,
)

LIST_URL = "/api/products/admin/"
CATEGORIES_URL = "/api/categories/tree/"


def detail_url(slug):
    return f"/api/products/admin/{slug}/"


def variant_url(slug, variant_id):
    return f"/api/products/admin/{slug}/variants/{variant_id}/"


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _data(response):
    """Unwrap success_response envelope → response.data["data"]."""
    return response.data["data"]


def _make_product_payload(title="Test Perfume"):
    return {
        "title": title,
        "description": "A test fragrance.",
    }


# ─── AUTH & PERMISSIONS ───────────────────────────────────────────────────────

@pytest.mark.django_db
def test_list_products_public(api_client):
    response = api_client.get(LIST_URL)
    assert response.status_code == 200


@pytest.mark.django_db
def test_create_product_unauthenticated(api_client):
    response = api_client.post(LIST_URL, _make_product_payload(), format="json")
    # JWT auth returns 401 for missing credentials; permission class returns 403
    # for authenticated-but-not-staff. Both indicate access denied correctly.
    assert response.status_code in (401, 403)


@pytest.mark.django_db
def test_create_product_non_admin(user_client):
    response = user_client.post(LIST_URL, _make_product_payload(), format="json")
    assert response.status_code == 403


@pytest.mark.django_db
def test_create_product_admin(admin_client):
    response = admin_client.post(LIST_URL, _make_product_payload(), format="json")
    assert response.status_code == 201
    assert Product.objects.filter(title="Test Perfume").exists()


@pytest.mark.django_db
def test_update_product_admin(admin_client):
    product = ProductFactory()
    response = admin_client.patch(
        detail_url(product.slug),
        {"title": "Updated Name"},
        format="json",
    )
    assert response.status_code == 200
    product.refresh_from_db()
    assert product.title == "Updated Name"


@pytest.mark.django_db
def test_delete_product_admin(admin_client):
    product = ProductFactory(with_variants=True)
    slug = product.slug

    response = admin_client.delete(detail_url(slug))
    assert response.status_code == 200

    # Product record is preserved (soft delete)
    assert Product.objects.filter(slug=slug).exists()
    # All variants are deactivated
    assert not ProductVariant.objects.filter(
        product__slug=slug, available=True
    ).exists()


# ─── LIST & FILTERING ─────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_list_returns_paginated_20(api_client):
    ProductFactory.create_batch(25)
    response = api_client.get(LIST_URL, {"page": 1})
    assert response.status_code == 200
    data = _data(response)
    assert data["count"] == 25
    assert len(data["results"]) == 20


@pytest.mark.django_db
def test_filter_by_category_includes_descendants(api_client):
    parent = ProductCategoryFactory(name="Fragrance")
    child = ProductCategoryFactory(name="Attar", parent=parent)
    product = ProductFactory(category=[child])

    response = api_client.get(LIST_URL, {"category": child.slug})
    assert response.status_code == 200
    slugs = [r["slug"] for r in _data(response)["results"]]
    assert product.slug in slugs


@pytest.mark.django_db
def test_search_by_name(api_client):
    target = ProductFactory(title="Oud Royale Supreme")
    ProductFactory(title="Rose Water Mist")

    response = api_client.get(LIST_URL, {"search": "royale"})
    assert response.status_code == 200
    slugs = [r["slug"] for r in _data(response)["results"]]
    assert target.slug in slugs


@pytest.mark.django_db
def test_active_filter_excludes_products_with_no_stock(api_client):
    inactive_product = ProductFactory()
    # Create a variant that is explicitly unavailable with no stock
    ProductVariantFactory(product=inactive_product, available=False, stock=0)

    active_product = ProductFactory()
    ProductVariantFactory(product=active_product, available=True, stock=5)

    response = api_client.get(LIST_URL, {"is_active": "true"})
    assert response.status_code == 200
    slugs = [r["slug"] for r in _data(response)["results"]]
    assert inactive_product.slug not in slugs
    assert active_product.slug in slugs


@pytest.mark.django_db
def test_list_response_shape(api_client):
    response = api_client.get(LIST_URL)
    assert response.status_code == 200
    data = _data(response)
    for key in ("results", "count", "total_pages", "current_page"):
        assert key in data, f"Missing key '{key}' in response data"


# ─── DETAIL & VARIANTS ────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_retrieve_product_by_slug(api_client):
    product = ProductFactory()
    response = api_client.get(detail_url(product.slug))
    assert response.status_code == 200
    assert _data(response)["slug"] == product.slug


@pytest.mark.django_db
def test_retrieve_nonexistent_slug(api_client):
    response = api_client.get(detail_url("this-slug-does-not-exist-xyz"))
    assert response.status_code == 404


@pytest.mark.django_db
def test_create_with_nested_variants(admin_client):
    payload = {
        "title": "Amber Noir",
        "variant_data": [
            {"price": "999.00", "discounted_price": "899.00", "stock": 5},
        ],
    }
    response = admin_client.post(LIST_URL, payload, format="json")
    assert response.status_code == 201

    product = Product.objects.get(title="Amber Noir")
    assert product.variants.count() == 1
    variant = product.variants.first()
    assert int(variant.stock) == 5


@pytest.mark.django_db
def test_update_replaces_variants(admin_client):
    product = ProductFactory(with_variants=True)
    old_variant_ids = list(product.variants.values_list("id", flat=True))
    assert len(old_variant_ids) == 2

    payload = {
        "variant_data": [
            {"price": "1500.00", "discounted_price": "1200.00", "stock": 8},
        ]
    }
    response = admin_client.patch(detail_url(product.slug), payload, format="json")
    assert response.status_code == 200

    # Old variants deleted
    assert not ProductVariant.objects.filter(id__in=old_variant_ids).exists()
    # New variant created
    assert product.variants.count() == 1
    assert product.variants.first().stock == 8


@pytest.mark.django_db
def test_patch_single_variant(admin_client):
    product = ProductFactory()
    v1 = ProductVariantFactory(product=product, stock=10)
    v2 = ProductVariantFactory(product=product, stock=20)

    response = admin_client.patch(
        variant_url(product.slug, v1.id),
        {"stock": 99},
        format="json",
    )
    assert response.status_code == 200

    v1.refresh_from_db()
    v2.refresh_from_db()
    assert v1.stock == 99
    assert v2.stock == 20  # unchanged


# ─── DATA INTEGRITY ───────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_slug_auto_generated(admin_client):
    payload = {"title": "Mystic Oud"}
    response = admin_client.post(LIST_URL, payload, format="json")
    assert response.status_code == 201
    slug = _data(response)["slug"]
    assert slug
    # Must be URL-safe (no spaces, no uppercase)
    assert slug == slug.lower()
    assert " " not in slug


@pytest.mark.django_db
def test_slug_uniqueness(admin_client):
    payload_1 = {"title": "Same Name"}
    payload_2 = {"title": "Same Name"}

    r1 = admin_client.post(LIST_URL, payload_1, format="json")
    r2 = admin_client.post(LIST_URL, payload_2, format="json")

    assert r1.status_code == 201
    assert r2.status_code == 201
    assert _data(r1)["slug"] != _data(r2)["slug"]


@pytest.mark.django_db
def test_soft_delete_preserves_record(admin_client):
    product = ProductFactory(with_variants=True)
    pk = product.pk
    slug = product.slug

    admin_client.delete(detail_url(slug))

    # DB record still exists
    assert Product.objects.filter(pk=pk).exists()
    # Product itself is marked inactive
    product.refresh_from_db()
    assert product.is_active is False
    # All variants set to unavailable
    variants = ProductVariant.objects.filter(product_id=pk)
    assert variants.exists()
    assert all(not v.available for v in variants)


@pytest.mark.django_db
def test_category_tree_endpoint(api_client):
    ProductCategoryFactory(name="Woody")
    ProductCategoryFactory(name="Floral")

    response = api_client.get(CATEGORIES_URL)
    assert response.status_code == 200
    data = _data(response)
    assert isinstance(data, list)
    assert len(data) >= 2


# ─── COVERAGE SUPPLEMENTAL TESTS ─────────────────────────────────────────────

@pytest.mark.django_db
def test_filter_inactive_products(api_client):
    """GET ?is_active=false returns products whose variants are unavailable."""
    active_product = ProductFactory()
    ProductVariantFactory(product=active_product, available=True, stock=5)

    inactive_product = ProductFactory()
    ProductVariantFactory(product=inactive_product, available=False, stock=0)

    response = api_client.get(LIST_URL, {"is_active": "false"})
    assert response.status_code == 200
    slugs = [r["slug"] for r in _data(response)["results"]]
    assert inactive_product.slug in slugs
    assert active_product.slug not in slugs


@pytest.mark.django_db
def test_create_product_invalid_data(admin_client):
    """POST with no title returns 400."""
    response = admin_client.post(
        LIST_URL,
        {"variant_data": [{"price": "not-a-number"}]},
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_put_product_full_update(admin_client):
    """PUT replaces a product via full update (partial=False path in _update)."""
    cat = ProductCategoryFactory()
    product = ProductFactory()
    payload = {
        "title": "PUT Replaced Title",
        "description": "Full replace via PUT.",
        "category_ids": [cat.id],
        "variant_data": [{"price": "250.00", "stock": 3, "available": True}],
    }
    response = admin_client.put(detail_url(product.slug), payload, format="json")
    assert response.status_code == 200
    product.refresh_from_db()
    assert product.title == "PUT Replaced Title"


@pytest.mark.django_db
def test_update_product_with_categories(admin_client):
    """PATCH including category_ids hits the category.set() branch in the serializer."""
    cat = ProductCategoryFactory()
    product = ProductFactory()
    response = admin_client.patch(
        detail_url(product.slug),
        {"category_ids": [cat.id]},
        format="json",
    )
    assert response.status_code == 200
    assert product.category.filter(id=cat.id).exists()


@pytest.mark.django_db
def test_update_product_invalid_variant_data(admin_client):
    """PATCH with an unparsable price returns 400 (serializer.errors path)."""
    product = ProductFactory()
    response = admin_client.patch(
        detail_url(product.slug),
        {"variant_data": [{"price": "not-a-number", "stock": 5}]},
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_update_nonexistent_slug(admin_client):
    """PATCH on a slug that doesn't exist returns 404 (DoesNotExist path)."""
    response = admin_client.patch(
        detail_url("does-not-exist-slug-xyz"),
        {"title": "Ghost"},
        format="json",
    )
    assert response.status_code == 404


@pytest.mark.django_db
def test_delete_nonexistent_slug(admin_client):
    """DELETE on a non-existent slug returns 404 (DoesNotExist path)."""
    response = admin_client.delete(detail_url("ghost-slug-xyz"))
    assert response.status_code == 404


@pytest.mark.django_db
def test_variant_slug_mismatch(admin_client):
    """PATCH variant via the wrong product slug returns 404."""
    product_a = ProductFactory()
    product_b = ProductFactory()
    variant = ProductVariantFactory(product=product_a)
    response = admin_client.patch(
        variant_url(product_b.slug, variant.id),
        {"stock": 50},
        format="json",
    )
    assert response.status_code == 404


@pytest.mark.django_db
def test_patch_nonexistent_variant(admin_client):
    """PATCH a variant_id that doesn't exist returns 404 (DoesNotExist path)."""
    product = ProductFactory()
    response = admin_client.patch(
        variant_url(product.slug, 99999),
        {"stock": 1},
        format="json",
    )
    assert response.status_code == 404


@pytest.mark.django_db
def test_patch_variant_invalid_data(admin_client):
    """PATCH variant with non-numeric price returns 400 (serializer.errors path)."""
    product = ProductFactory()
    variant = ProductVariantFactory(product=product)
    response = admin_client.patch(
        variant_url(product.slug, variant.id),
        {"price": "bad-price"},
        format="json",
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_variant_update_rejects_wrong_slug(admin_client):
    """PATCH variant via a slug belonging to a different product returns 404.

    get_object_or_404(ProductVariant, id=variant_id, product__slug=slug)
    rejects the request atomically — no separate slug comparison needed.
    """
    owner = ProductFactory()
    other = ProductFactory()
    variant = ProductVariantFactory(product=owner)
    response = admin_client.patch(
        variant_url(other.slug, variant.id),
        {"stock": 99},
        format="json",
    )
    assert response.status_code == 404


@pytest.mark.django_db
def test_list_bad_page_number(api_client):
    """GET ?page=abc triggers ValueError → caught by except Exception → 500 response."""
    response = api_client.get(LIST_URL, {"page": "abc"})
    assert response.status_code == 500


@pytest.mark.django_db
def test_inactive_product_hidden_from_public(api_client):
    """Soft-deleted products must not appear on public endpoints."""
    product = ProductFactory(is_active=False)
    ProductVariantFactory(product=product, available=False, stock=0)

    # Public list must not include it
    response = api_client.get('/api/products/')
    assert response.status_code == 200
    slugs = [v['product']['slug'] for v in response.data['variants']]
    assert product.slug not in slugs

    # Public detail must return 404
    response = api_client.get(f'/api/product/{product.slug}/')
    assert response.status_code == 404
