from rest_framework import serializers

from ..models import Notes, Product, ProductCategory, ProductVariant


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notes
        fields = ['id', 'title', 'type']


class ProductCategorySerializer(serializers.ModelSerializer):
    parent = serializers.PrimaryKeyRelatedField(
        queryset=ProductCategory.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'slug', 'parent']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'price', 'discounted_price', 'stock', 'available', 'sku']
        read_only_fields = ['id', 'sku']


class ProductListSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(many=True, read_only=True)
    variant_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'title', 'slug', 'is_active', 'category', 'created_at', 'variant_count']
        read_only_fields = ['id', 'title', 'slug', 'category', 'created_at', 'variant_count']

    def get_variant_count(self, obj):
        return obj.variants.count()


class ProductDetailSerializer(serializers.ModelSerializer):
    category = ProductCategorySerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    # Write-only: accepts a list of category PKs, maps to the M2M 'category' field
    category_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=ProductCategory.objects.all(),
        source='category',
        required=False,
    )
    # Write-only: accepts variant payloads for nested create/update
    variant_data = ProductVariantSerializer(
        many=True,
        write_only=True,
        required=False,
    )

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'slug', 'description', 'series',
            'new_arrival', 'exclusive', 'highlight', 'best_seller',
            'recommended', 'is_combo', 'is_active',
            'height', 'breadth', 'width', 'length', 'weight',
            'created_at', 'updated_at',
            'category', 'variants',
            'category_ids', 'variant_data',
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def create(self, validated_data):
        variant_data = validated_data.pop('variant_data', [])
        categories = validated_data.pop('category', [])
        product = Product.objects.create(**validated_data)
        product.category.set(categories)
        # Use .create() so the model's save() runs (auto-generates slug + sku)
        for variant in variant_data:
            ProductVariant.objects.create(product=product, **variant)
        return product

    def update(self, instance, validated_data):
        variant_data = validated_data.pop('variant_data', None)
        categories = validated_data.pop('category', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if categories is not None:
            instance.category.set(categories)
        if variant_data is not None:
            instance.variants.all().delete()
            for variant in variant_data:
                ProductVariant.objects.create(product=instance, **variant)
        return instance
