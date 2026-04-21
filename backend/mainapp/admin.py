import calendar
import csv
import time
import json
import logging
import os
from calendar import monthrange
from datetime import datetime
from uuid import uuid4
import gdown
import nested_admin
import requests
from accounts.admin import CustomUserAdmin
from accounts.models import CustomUser
from django import forms
from django.conf import settings
from django.contrib import admin
from django.core.files import File
from django.core.files.storage import default_storage
from django.core.mail import send_mail
from django.db import models
from django.db.models import Sum
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import path, reverse
from django.utils import timezone
from django.utils.html import format_html, mark_safe
from import_export import fields, resources
from import_export.admin import (ExportActionMixin, ExportMixin, ImportExportModelAdmin,
                                 ImportMixin)
from import_export.formats.base_formats import CSV, XLSX
from django_summernote.admin import SummernoteModelAdmin
import re
import openpyxl
from django.core.exceptions import ValidationError
import tempfile
from django.contrib import messages
import platform
import traceback
from import_export.fields import Field
from django.template.loader import render_to_string

from .models import *
from .views.shiprocket import *
from .serializers import ProductVariantSerializer

from django.contrib import messages

logger = logging.getLogger("custom_logger")


class ProductImageInline(admin.StackedInline):
    model = ProductImage
    extra = 1
    fields = ("image", "image_preview")
    readonly_fields = ("image_preview",)

    # def has_view_permission(self, request, obj=None):
    #     """Allow staff users to view products."""
    #     return request.user.is_staff or request.user.is_superuser
    def image_preview(self, obj):
        # Ensure that the image URL is correct and the image exists
        if obj.image:
            return mark_safe(f'<img src="{obj.image.url}" width="150" height="150" />')
        return "No Image"  # Fallback text if the image doesn't exist

    image_preview.short_description = "Image Preview"


class ProductImageForm(forms.ModelForm):
    """
    Custom form for handling ProductImage uploads in the inline.
    """

    new_image = forms.ImageField(label="Upload New Image", required=False)

    class Meta:
        model = ProductImage
        fields = ["image", "new_image"]

class ProductVariantForm(forms.ModelForm):
    class Meta:
        models = ProductVariant
        fields = ['keywords']
        help_texts = {
            'keywords': 'Enter comma-separated keywords, e.g., attar, perfume, fragrance.',
        }


class ProductVariantInline(admin.StackedInline):
    model = ProductVariant
    form = ProductVariantForm
    extra = 0
    fields = [
        "id",
        "sku",
        "product",
        'available',
        'notes',
        "discounted_price",
        "price",
        "stock",
        "meta_title",
        "meta_description",
        "keywords",
        "index",
        "follow",
        "image_previews",
        "new_image",
    ]
    readonly_fields = ("image_previews",)
    form = ProductImageForm

    def image_previews(self, obj):
        """
        Display all related images with checkboxes to mark for deletion.
        """
        if obj.pk:  # Ensure the object is saved
            images = obj.images.all()
            if images.exists():
                previews = []
                for image in images:
                    previews.append(
                        f"""
                        <div style="display: inline-block; text-align: center; margin-right: 10px;">
                            <img src="{image.image.url}" height="80px" width="80px" style="object-fit:contain;"/><br>
                            <label>
                                <input type="checkbox" name="delete_image_{image.id}"> Remove
                            </label>
                        </div>
                        """
                    )
                return mark_safe("".join(previews))
        return "No Images"

    image_previews.short_description = "Image Previews"

    def get_formset(self, request, obj=None, **kwargs):
        """
        Add a 'new_image' field for uploading new images in the inline form.
        """
        formset = super().get_formset(request, obj, **kwargs)

        class ProductVariantForm(forms.ModelForm):
            new_image = forms.ImageField(label="Add New Image", required=False)

            class Meta:
                model = ProductVariant
                fields = "__all__"

        formset.form = ProductVariantForm
        return formset

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def has_delete_permission(self, request, obj=None):
        # Allow delete for staff users
        if request.user.is_staff:
            return True
        # Default behavior for other users
        return super().has_delete_permission(request, obj)

    def has_change_permission(self, request, obj=None):
        """
        Allow staff users to change only 'price' and 'discounted_price'.
        """
        if obj and request.user.is_authenticated:
            if request.user.is_staff and not request.user.is_superuser:
                return True  # Staff can access but field-level permissions restrict editing
        return super().has_change_permission(request, obj)

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted Variant SKU: {obj.sku}, Product Variant: {obj.product.title}'
        )
        return super().delete_model(request, obj)


class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ["id", "product", "available"]
    readonly_fields = ("image_preview",)

    def image_preview(self, obj):
        # Ensure that the image URL is correct and the image exists
        if obj.images.exists():
            image_url = obj.images.first().image.url
            return mark_safe(
                f'<img src="{image_url}" height="100px" width="100px" style="object-fit:contain;"/>'
            )
        return "No Image"  # Fallback text if the image doesn't exist

    image_preview.short_description = "Image Preview"

    def get_readonly_fields(self, request, obj=None):
        """
        Restrict staff users to only edit 'price' and 'discounted_price'.
        Superusers can edit all fields.
        """
        if request.user.is_staff and not request.user.is_superuser:
            # Make all fields readonly except 'price' and 'discounted_price'
            allowed_fields = {"price", "discounted_price"}
            return [
                field.name
                for field in self.model._meta.fields
                if field.name not in allowed_fields
            ]
        return super().get_readonly_fields(request, obj)

    def has_change_permission(self, request, obj=None):
        """
        Allow staff users to change only 'price' and 'discounted_price'.
        """
        if obj and request.user.is_authenticated:
            if request.user.is_staff and not request.user.is_superuser:
                return True  # Staff can access but field-level permissions restrict editing
        return super().has_change_permission(request, obj)

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted Variant SKU: {obj.sku}, Product Variant: {obj.product.title}'
        )
        return super().delete_model(request, obj)

    def has_delete_permission(self, request, obj=None):
        # Allow delete for staff users
        if request.user.is_staff:
            return True
        # Default behavior for other users
        return super().has_delete_permission(request, obj)

    def has_add_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_add_permission(request)

    def has_change_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_change_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            user = request.user
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(
                f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted Variant SKU: {obj.sku}, Product Variant: {obj.product.title}'
            )
        return super().delete_queryset(request, queryset)


class ProductExportResource(resources.ModelResource):
    variant_skus = fields.Field(column_name="Variant SKUs")
    variant_prices = fields.Field(column_name="Variant Prices")
    variant_stocks = fields.Field(column_name="Variant Stocks")
    variant_images = fields.Field(column_name="Variant Images")

    def dehydrate_variant_skus(self, obj):
        return ", ".join([variant.sku for variant in obj.variants.all() if variant.sku])

    def dehydrate_variant_prices(self, obj):
        return ", ".join([str(variant.price) for variant in obj.variants.all() if variant.price])

    def dehydrate_variant_stocks(self, obj):
        return ", ".join([str(variant.stock) for variant in obj.variants.all()])
    def dehydrate_category(self, obj):
        return ", ".join([cat.name for cat in obj.category.all()])
       


    def dehydrate_variant_images(self, obj):
        """Fetch all images for all variants"""
        variant_images = []
        for variant in obj.variants.all():
            image_urls = [f"{settings.MEDIA_URL}{image.image}" for image in variant.images.all()]
            if image_urls:
                variant_images.append(f"{variant.sku}: " + ", ".join(image_urls))
        
        return " | ".join(variant_images)  # Separate variants by "|"

    class Meta:
        model = Product
        fields = (
            "title",
            "category",
            "description",
            "new_arrival",
            "exclusive",
            "highlight",
            "height",
            "breadth",
            "width",
            "length",
            "weight",
            "images",
            "price",
            "variant_skus",
            "variant_prices",
            "variant_stocks",
            "variant_images",
        )

def smart_title(text):
    return ' '.join(word.capitalize() for word in text.split(' '))


def format_description(description):
    if not isinstance(description, str):
        description = str(description)
    if not description.strip():
        return ""
    # Split by \n and process each line
    lines = description.split('\n')
    formatted_lines = []
    for line in lines:
        if line.strip():
            # Convert **text** to <b>text</b>
            formatted_line = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', line)
            # Wrap in <p> tags
            formatted_lines.append(f"<p>{formatted_line}</p>")
    # Join lines into a single string
    return mark_safe(''.join(formatted_lines))



class ProductImportResource(resources.ModelResource):

    class Meta:
        model = Product
        exclude = ("id",)
        import_id_fields = ("title",)
        fields = (
            "title",
            "category",
            "description",
            "new_arrival",
            "exclusive",
            "highlight",
            "height",
            "breadth",
            "width",
            "length",
            "weight",
            "images",  # Custom field for uploaded images
            "price",
            # "variant_skus", "variant_prices", "variant_stocks", "variant_images",

        )

        export_order = (
            "title",
            "category",
            "description",
            "price",
            "discounted_price",
            "quantity",
            "available",
            "exclusive",
            "height",
            "width",
            "length",
            "weight",
            "variants",  # Added variant export

        )
        
    def get_instance(self, instance_loader, row):
        """Find an existing product by title, otherwise return None to create a new one."""
        title = row.get("title", "").strip() if row.get("title","") else None
        
        if title:
            product = Product.objects.filter(title=title).first()  # ✅ Avoids MultipleObjectsReturned error
            return product  # Returns the first match or None
        
        return None  # Ensures a new product is created if no match is found
    


    def before_import_row(self, row, **kwargs):
        request = kwargs.get('request', None)

        try:
            # Handle Category
            category_names = row.get("category", "").strip().split(",") if isinstance(row.get("category"), str) else []
            category_instances = []

            for category_name in category_names:
                category, _ = ProductCategory.objects.get_or_create(name=category_name.strip(), defaults={"parent": None})
                category_instances.append(category)

            # Handle Product
            title_value = row.get("title", "")
            product_title = title_value.strip() if isinstance(title_value, str) else ""
            if not product_title:
                return  # Skip if the title is missing

            product = Product.objects.filter(title=smart_title(product_title)).first()
            product_series = row.get("series", "").strip() if isinstance(row.get("series"), str) else ""

            series = None
            if product_series:
                series = ProductSeries.objects.filter(name=product_series).first()
                if not series:
                    series = ProductSeries.objects.create(name=product_series)
                row["series"] = series.id

            description = row.get("description", "")
            formatted_description = format_description(description) if isinstance(description, str) else ""

            row["title"] = smart_title(product_title)
            row["description"] = formatted_description

            if not product:
                product = Product(
                    title=smart_title(product_title),
                    description=formatted_description,
                    series=series,
                    height=row.get("height", None),
                    breadth=row.get("breadth", None),
                    width=row.get("width", None),
                    length=row.get("length", None),
                    weight=row.get("weight", None),
                )
            else:
                product.title = smart_title(product_title)
                product.description = formatted_description
                product.series = series
                product.height = row.get("height", None)
                product.breadth = row.get("breadth", None)
                product.width = row.get("width", None)
                product.length = row.get("length", None)
                product.weight = row.get("weight", None)

            product.save()
            product.category.set(category_instances)

            # Handle SKU
            category_code = category_instances[0].name[:2].upper() if category_instances else "NO"
            row["category"] = ",".join([str(item.id) for item in category_instances])
            product_id = str(product.id).zfill(3)
            sku = f"{category_code}-{product_id}"

            # Handle ProductVariant
            product_variant = ProductVariant.objects.filter(product=product).first()
            if not product_variant:
                product_variant = ProductVariant(
                    product=product,
                    sku=sku,
                    available=bool(row.get("available", True)),
                    stock=int(row.get("stock", 1)),
                    price=row.get("price", 10),
                    discounted_price=row.get("discounted_price", 10),
                    meta_title=smart_title(row.get('meta_title')) if row.get('meta_title') else '',
                    meta_description=row.get('meta_description') if row.get('meta_description') else ''
                )
            else:
                product_variant.sku = sku
                product_variant.available = bool(row.get("available", True))
                product_variant.stock = int(row.get("stock", 1))
                product_variant.price = row.get("price", 10)
                product_variant.discounted_price = row.get("discounted_price", 10)
                product_variant.meta_title=smart_title(row.get('meta_title')) if row.get('meta_title') else ''
                product_variant.meta_description=row.get('meta_description') if row.get('meta_description') else ''

            product_variant.save()

            # Handle Notes
            all_notes_instances = []

            for note_type, note_key in [('TOP_NOTE', 'top_notes'), ('HEART_NOTE', 'heart_notes'), ('BASE_NOTE', 'base_notes')]:
                notes_list = row.get(note_key, '').split(',') if isinstance(row.get(note_key), str) else []
                notes_instances = []
                for note in map(str.strip, notes_list):
                    if note:
                        note_instance, _ = Notes.objects.get_or_create(title=note, type=note_type)
                        notes_instances.append(note_instance)
                        all_notes_instances.append(note_instance)
                row[note_key] = ",".join([str(note.id) for note in notes_instances])

            if all_notes_instances:
                product_variant.notes.set(all_notes_instances)

            # Handle Images
            if request:
                failed_images = []
                image_urls = row.get("images", "").split(",") if isinstance(row.get("images"), str) else []
                for image_url in map(str.strip, image_urls):
                    if image_url:
                        try:
                            self.save_uploaded_image(product_variant, image_url)
                        except ValidationError as e:
                            failed_images.append(
                                f"Error processing image for '{product_variant}': {str(e)}. URL = {image_url}"
                            )
                if failed_images:
                    messages.warning(request, "The following image(s) were not added:\n" + "\n".join(failed_images))

        except ValidationError as e:
            logger.exception("Unexpected error")
            raise e

        except Exception as e:
            logger.exception("Unexpected error")
            raise e


    def save_uploaded_image(self, variant, image_url):
        """
        Download an image from a given URL (including Google Drive) and associate it with a ProductVariant.
        Ensure the image size is 1MB or less and the file is valid.
        """
        try:
            MAX_SIZE = 800 * 1024  
            file_content = None
            temp_dir = tempfile.gettempdir()
            temp_file = os.path.join(temp_dir,f"{uuid4().hex}.tmp")  # Temporary file path
            # Determine if the URL is a Google Drive link
            if "drive.google.com" in image_url:
                # Extract the file ID from the Google Drive URL
                if "id=" in image_url:
                    file_id = image_url.split("id=")[-1]
                elif "/d/" in image_url:
                    file_id = image_url.split("/d/")[1].split("/")[0]
                else:
                    raise ValidationError("Invalid Google Drive URL format. Ensure the link is correct.")

                # Construct the download URL for Google Drive
                drive_url = f"https://drive.google.com/uc?id={file_id}"

                # Download the file using gdown
                gdown.download(drive_url, temp_file, quiet=False)
            else:
                response = requests.get(image_url, stream=True)
                if response.status_code == 200:
                    with open(temp_file, "wb") as file:
                        for chunk in response.iter_content(chunk_size=1024):
                            file.write(chunk)
                else:
                    raise ValidationError(
                    f"Failed to download image from URL: {image_url}. Status Code: {response.status_code}"
                    )
            with open(temp_file, "rb") as file:
                file_content = file.read()

            if file_content is None:
                raise ValidationError("Failed to retrieve image content from the URL.")

            file_size = len(file_content)
            if file_size > MAX_SIZE:
               raise ValidationError(
                f"Image size exceeds the allowed limit of 1024Kb. Uploaded image size: {file_size / (1024 * 1024):.2f}MB"
                )   
            ext = ".webp"
            image_name = f"{uuid4().hex}{ext}"
            image_storage_path = os.path.join("product_images", image_name)

            with default_storage.open(image_storage_path, "wb") as img_file:
                img_file.write(file_content)

            ProductImage.objects.create(variant=variant, image=image_storage_path)

        except ValidationError as e:
            raise e 
        except Exception as e:
           raise ValidationError(f"An unexpected error occurred while uploading the image. {str(e)}")
        

# Custom admin class for Product
class ProductAdminMixin(admin.ModelAdmin):
    list_display = ("title",)  # Display relevant columns in the list view
    list_filter = ("category", "exclusive")
    search_fields = ("title", "category__name")
    ordering = ("-id",)

from import_export import resources

class ProductAdmin(ProductAdminMixin, ImportExportModelAdmin, ImportMixin, ExportMixin, SummernoteModelAdmin):
    # resource_class = ProductResource
    list_display = ("title", "exclusive", "highlight")
    list_filter = ("category", "exclusive")
    search_fields = ("title", "category__name")
    summernote_fields = ('description',)
    ordering = ("-id",)
    inlines = [ProductVariantInline]
    
    def get_import_resource_class(self):
        """Use ProductImportResource for import."""
        return ProductImportResource

    def get_export_resource_class(self):
        """Use ProductExportResource for export."""
        return ProductExportResource

    def import_data(self, request, *args, **kwargs):
        """
        Override import_data method to pass request to the resource class.
        """
        # Pass the request to the resource class
        self.resource_class._meta.import_kwargs['request'] = request
        return super().import_data(request, *args, **kwargs)

    def save_related(self, request, form, formsets, change):
        """
        Process new images and delete images marked for removal.
        """
        super().save_related(request, form, formsets, change)

        for formset in formsets:
            for form_obj in formset.forms:
                # Process new images
                new_image = form_obj.cleaned_data.get("new_image")
                variant = form_obj.instance

                if new_image and variant.pk:
                    ProductImage.objects.create(variant=variant, image=new_image)

                # Process image deletions
                for key, value in request.POST.items():
                    if key.startswith("delete_image_") and value == "on":
                        image_id = key.split("_")[-1]
                        try:
                            image = ProductImage.objects.get(
                                id=image_id, variant=variant
                            )
                            image.delete()
                        except:
                            pass

    def get_formset(self, request, obj=None, **kwargs):
        """
        Add a new field 'new_image' to the inline form.
        """
        formset = super().get_formset(request, obj, **kwargs)

        class ProductVariantForm(forms.ModelForm):
            new_image = forms.ImageField(label="Add New Image", required=False)

            class Meta:
                model = ProductVariant
                fields = "__all__"

        formset.form = ProductVariantForm
        return formset

    def has_import_permission(self, request):
        """Allow import only for superusers."""
        # logger.debug("has_import_permission called")

        return True

    def get_import_formats(self):
        """Restrict to CSV format for imports."""
        logger.debug("get_import_formats called")

        return [CSV, XLSX]

    def get_export_formats(self):
        """Restrict to CSV format for exports."""
        return [CSV, XLSX]

    def has_view_permission(self, request, obj=None):
        # Allow the user from Australia to view the product
        if obj and request.user.is_authenticated:
            if request.user.is_staff:
                return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def has_add_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def has_change_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        # Allow delete for staff users
        if request.user.is_staff:
            return True
        # Default behavior for other users
        return super().has_delete_permission(request, obj)

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Product Deleted : ID={obj.id},  Title: {obj.title}'
        )
        return super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            user = request.user
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(
                f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Product Deleted : ID={obj.id},  Title: {obj.title}'
            )

        return super().delete_queryset(request, queryset)


def format_date(date):
    """Format the date into a human-readable string."""
    return date.strftime("%Y-%m-%d %H:%M:%S")  # Example format: '2024-12-02 15:30:45'


class TransactionInlineAdmin(admin.StackedInline):
    model = Transaction
    fields = [
        field.name
        for field in Transaction._meta.get_fields()
        if field.name not in ["timestamp","updated_at"]
    ]
    extra = 0

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)


class OrderItemInlineAdmin(admin.StackedInline):
    model = OrderItem
    fields = ["variant", "quantity"] + ["image_preview"]
    readonly_fields = ("image_preview",)
    extra = 0

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def image_preview(self, obj):
        """
        Show the first image of the variant inline, if it exists.
        """
        if obj.variant and obj.variant.images.exists():
            # Fetch the first image associated with the ProductVariant
            image_url = obj.variant.images.first().image.url
            return mark_safe(
                f'<img src="{image_url}" height="100px" width="100px" style="object-fit:contain;"/>'
            )
        return "No Image Available"

    image_preview.short_description = "Variant Image Preview"


class OrderResource(resources.ModelResource):
    class Meta:
        model = Order
        fields = (
            "id",
            "user__username",
            "name",
            "order_date",
            "order_number",
            "address",
            "country",
            "city",
            "state",
            "pincode",
            "sub_total",
            "gst",
            "shipping_charges",
            "final_price",
            "tracking_link",
            "order_status",
            "payment_status",
            "payment_method",
            "is_new",
            "awb_code",
            "pickup_status",
            "edd",
            "transaction_id",
            "manifest",
            "lable",
            "invoice",
            "created_at",
            "updated_at",
        )
        export_order = (
            "id",
            "user__username",
            "order_number",
            "final_price",
            "order_status",
            "payment_status",
            "created_at",
        )


class OrderAdmin(ExportMixin, admin.ModelAdmin):
    list_display = [
        field.name
        for field in Order._meta.get_fields()
        if isinstance(field, (models.Field))
        and not isinstance(field, models.ManyToManyField)
        and field.name != "user"
    ]  # list_filter = ['']
    list_filter = ["order_status", "order_date"]
    ordering = ("-created_at",)
    resource_class = OrderResource
    readonly_fields = ["invoice_link"]

    inlines = [OrderItemInlineAdmin, TransactionInlineAdmin]

    def invoice_link(self, obj):
        if obj.invoice:
            return mark_safe(f'<a href="{obj.invoice.url}" target="_blank">📄 Download Invoice</a>')
        return "Not generated yet"
    invoice_link.short_description = "Invoice"

    actions = ["generate_invoices"]

    @admin.action(description="Generate invoices for selected orders")
    def generate_invoices(self, request, queryset):
        from mainapp.views.utils import generate_invoice
        success_count = 0
        for order in queryset:
            result = generate_invoice(order.email, order.order_number)
            if result:
                success_count += 1
        self.message_user(request, f"Generated {success_count} invoice(s) out of {queryset.count()} selected.")

    def get_readonly_fields(self, request, obj=None):
        if request.user.is_staff and not request.user.is_superuser:  # For staff users
            return [
                field.name
                for field in self.model._meta.fields
                if field.name != "status"
            ]
        return super().get_readonly_fields(request, obj)

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def get_queryset(self, request):
        """
        Custom queryset with additional attributes for row styling and filtering for staff users.
        """
        # Start with the base queryset
        queryset = super().get_queryset(request)

        # Apply filtering for staff users (not superusers)
        # if request.user.is_staff and not request.user.is_superuser:
        #     queryset = queryset.filter(user__region=request.user.region).order_by("-id")

        return queryset

    def export_to_csv(self, request, queryset):
        """
        Export selected products to CSV
        """
        # create the response
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            f"attachment;  filename=orders_report_{timezone.now().month}_{timezone.now().date()}_{timezone.now().minute}.csv; charset=utf-8;"
        )
        writer = csv.writer(response)
        writer.writerow(
            [
                "Order ID",
                "User",
                "Order Date",
                "Order Number",
                "Total Price",
                "Final Price",
            ]
        )
        # write for each order for the csv
        for order in queryset:
            writer.writerow(
                [
                    order.id,
                    order.user.username,
                    format_date(order.order_date),
                    order.order_number,
                    order.sub_total,
                    order.final_price,
                ]
            )

        return response

    export_to_csv.short_description = "Export Selected Orders to CSV"

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted Order : ID={obj.id}, Username: {obj.username}, Phone Number : {user.phone_number}'
        )
        return super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            user = request.user
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(
                f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted User : ID={obj.id}, Username: {obj.user.username}, Phone Number : {user.phone_number}'
            )

        return super().delete_queryset(request, queryset)


class TransactionResource(resources.ModelResource):
    class Meta:
        model = Transaction
        fields = (
            "id",
            "user__username",
            "name",
            "order__id",
            "transaction_id",
            "amount",
            "phone_number",
            "description",
            "transaction_status",
            "timestamp",
        )
        export_order = (
            "id",
            "transaction_id",
            "username",
            "amount",
            "transaction_status",
            "timestamp",
        )


import razorpay
from .views.utils import *
class TransactionAdmin(ExportMixin, admin.ModelAdmin):
    list_display = [
                    field.name for field in Transaction._meta.get_fields()
                    if hasattr(field, 'editable') and field.editable
                    ]
    resource_class = TransactionResource
    readonly_fields = ['refund_by','refund_id','updated_at']
    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def has_view_permission(self, request, obj=None):
        if obj and request.user.is_authenticated:
            if request.user.is_staff:
                return True
        return super().has_view_permission(request, obj)
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:transaction_id>/refund/', self.admin_site.admin_view(self.refund_confirmation), name='transaction_refund'),
            path('<int:transaction_id>/refund/confirm/', self.admin_site.admin_view(self.process_refund), name='transaction_process_refund'),
        ]
        return custom_urls + urls

    # Confirmation page view
    def refund_confirmation(self, request, transaction_id):
        transaction = get_object_or_404(Transaction, id=transaction_id)
        context = {
            'transaction': transaction,
            'title': 'Confirm Refund',
            'opts': self.model._meta,
            'original': transaction,
            'refund_url': reverse('admin:transaction_process_refund',args=[transaction_id]),
        }
        return render(request, 'admin/transaction_refund_confirmation.html', context)

    def process_refund(self, request, transaction_id):
        transaction = get_object_or_404(Transaction, id=transaction_id)
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_SECRET_KEY))
        try:
            refund_data = {'amount': int(transaction.amount * 100)}
            refund = client.payment.refund(transaction.payment_id, refund_data)
            transaction.transaction_status = "Refunded"
            transaction.description = "This Transaction is Refunded to the Payer Due to some reasons"
            transaction.refund_id = refund['id']
            transaction.refund_by = request.user
            transaction.save()
            messages.success(request, f"Refund Successful: {refund['id']}")
        except razorpay.errors.BadRequestError as e:
            messages.error(request, f"Refund Failed: {str(e)}")
        except Exception as e:
            messages.error(request, f"Unexpected Error: {str(e)}")
        
        # Redirect back to transaction detail page
        return redirect('admin:mainapp_transaction_change', transaction_id)


    # Add Refund button to object-tools only on detail page
    def change_view(self, request, object_id, form_url='', extra_context=None):
        if extra_context is None:
            extra_context = {}
        # Get the transaction object
        transaction = get_object_or_404(Transaction, id=object_id)
        
        # Only show the refund button if the transaction is not already refunded
        if transaction.transaction_status != 'Refunded':
            extra_context['show_refund_button'] = True
            extra_context['refund_url'] = reverse('admin:transaction_refund', args=[object_id])
        else:
            extra_context['show_refund_button'] = False
        return super().change_view(request, object_id, form_url, extra_context=extra_context)


class CustomAdminSite(admin.AdminSite):
    def get_urls(self):
        # Get the default admin URLs and add our custom URL
        urls = super().get_urls()
        # custom_urls = [
        #     path('analytics/', self.analytics_view, name='analytics_page'),  # Add custom analytics URL
        # ]
        return urls

    def index(self, request, extra_context=None):
        # Replace `last_login` if incorrect and adjust field names
        current_month = datetime.now().month
        current_year = datetime.now().year
        today = datetime.today()
        BASE_DIR = settings.BASE_DIR

        log_file_path = os.path.join(BASE_DIR, 'logs/admin.log')
        logs = []

        with open(log_file_path, 'r') as log_file:
            log_lines = log_file.readlines()[-20:]  # Fetch the last 20 logs

        for line in log_lines:
            # Use regex to extract the timestamp and message parts
            match = re.match(r'\[(.*?)\] (.*)', line.strip())
            if match:
                timestamp_str, message = match.groups()
                
                # Parse the timestamp string into a datetime object
                try:
                    timestamp = datetime.strptime(timestamp_str, "%d/%m/%Y, %H:%M:%S")
                except ValueError:
                    timestamp = None
                
                # Append the parsed data to the logs list
                logs.append({"timestamp": timestamp, "message": message})
          # Sort the logs by timestamp, placing `None` timestamps at the end
        logs.sort(key=lambda x: (x["timestamp"] is None, x["timestamp"]), reverse=True)
    



        try:
            total_users = CustomUser.objects.count()
            monthly_users = CustomUser.objects.filter(
                last_login__year=current_year, last_login__month=current_month
            ).count()
            new_monthly_users = CustomUser.objects.filter(
                date_joined__year=current_year, date_joined__month=current_month
            ).count()   
        except Exception as e:
            total_users = 0
            monthly_users = 0
            new_monthly_users = 0

        try:
            total_orders = Order.objects.count()
            monthly_orders = Order.objects.filter(
                created_at__year=current_year, created_at__month=current_month
            ).count()
            total_revenue = (
                Order.objects.aggregate(Sum("final_price"))["final_price__sum"] or 0
            )

        except Exception as e:
            total_orders = 0
            monthly_orders = 0
            total_revenue = 0

        try:
            monthly_users = []
            labels = []

            for i in range(6):  # Adjust for the last 6 months
                month = (
                    today.month - i - 1
                ) % 12 + 1  # Ensure it wraps around correctly
                year = today.year if today.month - i > 0 else today.year - 1
                labels.append(f"{calendar.month_abbr[month]} {year}")
                count = CustomUser.objects.filter(
                    date_joined__year=year, date_joined__month=month
                ).count()
                monthly_users.append(count)

            user_data = {
                "labels": labels[::-1],  # Reverse to make it chronological
                "data": monthly_users[::-1],
            }

            order_monthly_data = []
            order_labels = []

            for i in range(6):  # Adjust for the last 6 months
                month = (
                    today.month - i - 1
                ) % 12 + 1  # Ensure it wraps around correctly
                year = today.year if today.month - i > 0 else today.year - 1
                order_labels.append(f"{calendar.month_abbr[month]} {year}")
                count = Order.objects.filter(
                    created_at__year=year, created_at__month=month
                ).count()
                order_monthly_data.append(count)

            order_data = {
                "labels": order_labels[::-1],  # Reverse to make it chronological
                "data": order_monthly_data[::-1],
            }

            user_data_json = json.dumps(user_data)
            order_data_json = json.dumps(order_data)
        except Exception as e:
            user_data = {"labels": [], "data": []}
            order_data = {"labels": [], "data": []}
            # Fetch recent admin log entries
            # log_entries = LogEntry.objects.all()[:10]

        # Add data to context
        context = {
            "total_users": total_users,
            "monthly_users": monthly_users,
            "new_monthly_users": new_monthly_users,
            "total_orders": total_orders,
            "monthly_orders": monthly_orders,
            "total_revenue": total_revenue,
            "user_data": user_data_json,
            "order_data": order_data_json,
            "logs":logs,
        }
        if extra_context:
            context.update(extra_context)

        return super().index(request, extra_context=context)

    def get_app_list(self, request, app_label=None):
        """
        Return a customized list of apps, renaming them dynamically for staff users.
        """
        app_list = super().get_app_list(request, app_label)

        # Check if the user is a staff user and not a superuser
        if request.user.is_staff and not request.user.is_superuser:
            for app in app_list:
                if app["name"] == "Mainapp":  # Original app name
                    app["name"] = "Staff Main Application"  # New name for staff users
        return app_list


class CustomDateFilter(admin.SimpleListFilter):
    title = "Custom Date Filter"
    parameter_name = "custom_date_filter"

    def lookups(self, request, model_admin):
        return [
            ("today", "Today"),
            ("yesterday", "Yesterday"),
            ("last_week", "Last Week"),
            ("this_month", "This Month"),
            ("last_month", "Last Month"),
        ]

    def queryset(self, request, queryset):
        if self.value() == "today":
            today = timezone.now().date()
            return queryset.filter(date=today)
        elif self.value() == "yesterday":
            yesterday = timezone.now().date() - timezone.timedelta(days=1)
            return queryset.filter(date=yesterday)
        elif self.value() == "last_week":
            last_week_start = timezone.now().date() - timezone.timedelta(
                days=timezone.now().weekday() + 7
            )
            last_week_end = last_week_start + timezone.timedelta(days=6)
            return queryset.filter(date__range=[last_week_start, last_week_end])
        elif self.value() == "this_month":
            this_month_start = timezone.now().date().replace(day=1)
            this_month_end = (
                timezone.now()
                .date()
                .replace(day=monthrange(timezone.now().year, timezone.now().month)[1])
            )
            return queryset.filter(date__range=[this_month_start, this_month_end])
        elif self.value() == "last_month":
            last_month_start = (
                timezone.now().date().replace(day=1) - timezone.timedelta(days=1)
            ).replace(day=1)
            last_month_end = (
                timezone.now().date().replace(day=1) - timezone.timedelta(days=1)
            ).replace(day=monthrange(timezone.now().year, timezone.now().month - 1)[1])
            return queryset.filter(date__range=[last_month_start, last_month_end])


class ReviewAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "product", "rating", "comment"]
    list_filter = ["rating"]

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted: ID={obj.id}, Comment : {obj.comment},  Reviewer: {obj.user.username}'
        )
        return super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            user = request.user
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(
                f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted: ID={obj.id}, Comment : {obj.comment},  Reviewer: {obj.user.username}'
            )
        return super().delete_queryset(request, queryset)


class CategoryAdmin(admin.ModelAdmin):
    list_display = ["id", "name"]

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted:Category ID={obj.id},Category Name: {obj.name}'
        )
        return super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            user = request.user
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(
                f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted: Category ID={obj.id},Category Name : {obj.name}'
            )
        return super().delete_queryset(request, queryset)


class SubCategoryAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "image_preview"]

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        return queryset.order_by("id")

    def image_preview(self, obj):
        if obj.category_image:  # Check if the image exists
            return format_html(
                '<img src="{}" style="width: 80px; height: auto;" />',
                obj.category_image.url,
            )
        return "No Image"

    image_preview.short_description = "Category Preview"

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted: SubCategory ID={obj.id}, SubCategory Name: {obj.name}'
        )
        return super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            user = request.user
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(
                f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted: SubCategory ID={obj.id}, SubCategory Name : {obj.name}'
            )
        return super().delete_queryset(request, queryset)


class AddressAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "address", "pincode"]

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted: User: {obj.user.username}, Address: {obj.address}'
        )
        return super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            user = request.user
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(
                f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted: User: {obj.user.username}, Address: {obj.address}'
            )
        return super().delete_queryset(request, queryset)


class WishlistAdmin(admin.ModelAdmin):
    list_display = ["id", "get_user_email", "variant", "added_at"]
    actions = ["send_email"]

    def get_actions(self, request):
        """
        Limit the email action to staff users only.
        """
        actions = super().get_actions(request)
        # if request.user.is_superuser:
        #     actions.pop("send_email", None)  # Remove action for superusers
        return actions

    def send_email(self, request, queryset):
        for obj in queryset:
            user_email = obj.user.email
            product_variant = obj.variant
            variant_price = round(obj.variant.price)
            price = obj.variant.discounted_price
            product_slug = obj.variant.get_slug
            product_image_url = (
                obj.variant.images.first().image.url
                if obj.variant.images.exists()
                else "https://via.placeholder.com/150"
            )
            html_message = render_to_string('emails/wishlist_price_drop_email.html', {
                'product_image_url': product_image_url,
                'product_variant': product_variant,
                'price': price,
                'variant_price': variant_price,
                'product_slug': product_slug,
                'current_year': datetime.now().year,
            })

            subject = f"Price Drop Alert {product_variant}"
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [user_email]

            # Send the email
            try:
                send_email_task(
                    subject,
                    '',
                    from_email,
                    recipient_list,
                    html_message=html_message,
                )
                self.message_user(
                    request,
                    f"Email sent successfully to {user_email}",
                    level=messages.SUCCESS,
                )
            except Exception as e:
                self.message_user(
                    request,
                    f"Failed to send email to {user_email}. Error: {e}",
                    level=messages.ERROR,
                )

    send_email.short_description = "Send price drop email to selected users"

    def get_model_perms(self, request):
        perms = super().get_model_perms(request)

        if request.user.is_superuser:
            self.model._meta.verbose_name = "Wishlist"
            self.model._meta.verbose_name_plural = "Wishlists"

        else:
            self.model._meta.verbose_name = "User Wishlist"
            self.model._meta.verbose_name_plural = "User's Wishlists"

        return perms

    def get_user_email(self, obj):
        return obj.user.email

    get_user_email.short_description = "User email"

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted Wishlist of User: {obj.user.username}, Product: {obj.variant}'
        )
        return super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            user = request.user
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(
                f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted Wishlist of User: {obj.user.username}, Product: {obj.variant}'
            )
        return super().delete_queryset(request, queryset)


class CartAdmin(admin.ModelAdmin):
    list_display = ["id", "get_user_email", "variant"]
    actions = ["send_email"]

    def get_actions(self, request):
        """
        Limit the email action to staff users only.
        """
        actions = super().get_actions(request)
        if request.user.is_superuser:
            actions.pop("send_email", None)  # Remove action for superusers
        return actions

    def send_email(self, request, queryset):
        for obj in queryset:
            user_email = obj.user.email
            product_variant = obj.variant
            variant_price = round(obj.variant.price)
            variant_discounted_price = obj.variant.discounted_price
            product_slug = obj.variant.get_slug
            product_image_url = (
                obj.variant.images.first().image.url
                if obj.variant.images.exists()
                else "https://via.placeholder.com/150"
            )
            html_message = render_to_string('emails/cart_price_drop_email.html', {
                'product_image_url': product_image_url,
                'product_variant': product_variant,
                'variant_discounted_price': variant_discounted_price,
                'variant_price': variant_price,
                'product_slug': product_slug,
                'current_year': datetime.now().year,
            })

            subject = f"Price Drop Alert {product_variant}"
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [user_email]

            # Send the email
            try:
                send_email_task(
                    subject,
                    '',
                    from_email,
                    recipient_list,
                    html_message=html_message,
                )
                self.message_user(
                    request,
                    f"Email sent successfully to {user_email}",
                    level=messages.SUCCESS,
                )
            except Exception as e:
                self.message_user(
                    request,
                    f"Failed to send email to {user_email}. Error: {e}",
                    level=messages.ERROR,
                )

    send_email.short_description = "Send price drop email to selected users"

    def get_model_perms(self, request):
        perms = super().get_model_perms(request)

        if request.user.is_superuser:
            self.model._meta.verbose_name = "Cart"
            self.model._meta.verbose_name_plural = "Carts"

        else:
            self.model._meta.verbose_name = "User Cart"
            self.model._meta.verbose_name_plural = "User's Carts"

        return perms

    def get_user_email(self, obj):
        return obj.user.email

    get_user_email.short_description = "User email"

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted Cart of User: {obj.user.username}, Product: {obj.variant}, Quantity: {obj.quantity}'
        )
        return super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            user = request.user
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(
                f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted Cart of User: {obj.user.username}, Product: {obj.variant}, Quantity: {obj.quantity}'
            )
        return super().delete_queryset(request, queryset)


class OrderItemAdmin(admin.ModelAdmin):
    list_display = ["id", "order", "variant", "quantity"]

    def delete_model(self, request, obj):
        user = request.user
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        logger.info(
            f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted Order: {obj.order}, Product: {obj.variant}, Quantity: {obj.quantity}'
        )
        return super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        for obj in queryset:
            user = request.user
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            logger.info(
                f'[{current_time}] {user.username} {"(Admin)" if user.is_superuser else "(Staff)"} Deleted Order : {obj.order}, Product: {obj.variant}, Quantity: {obj.quantity}'
            )
        return super().delete_queryset(request, queryset)


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = (
        "section",
        "image_preview",
        "get_banner_size",
        "mobile_image_preview",
        "get_mobile_banner_size",
        "is_active",
    )
    list_filter = ("is_active", "section")
    search_fields = ("section",)
    ordering = ("section",)

    def get_banner_size(self, request, obj=None):
        return format_html(
            '<p style="font-size:14px"> 1440px X 800px </p>',
        )

    get_banner_size.short_description = "Banner Size"

    def get_mobile_banner_size(self, request, obj=None):
        return format_html(
            '<p style="font-size:14px"> 1600px X 1800px </p>',
        )

    get_mobile_banner_size.short_description = "Mobile Banner Size"

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def has_delete_permission(self, request, obj=None):
        # Allow delete for staff users
        if request.user.is_staff:
            return True
        # Default behavior for other users
        return super().has_delete_permission(request, obj)

    def has_add_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def has_change_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_change_permission(request, obj)

    def image_preview(self, obj):
        if obj.image:  # Check if the image exists
            return format_html(
                '<img src="{}" style="width: 80px; height: auto;" />', obj.image.url
            )
        return "No Image"

    image_preview.short_description = "Banner Preview"

    def mobile_image_preview(self, obj):
        if obj.mobile_image:  # Check if the image exists
            return format_html(
                '<img src="{}" style="width: 80px; height: auto;" />',
                obj.mobile_image.url,
            )
        return "No Image"

    mobile_image_preview.short_description = "Mobile Banner Preview"


class PromotionAdmin(admin.ModelAdmin):
    list_display = ("coupon_code", "promotion_type")
    readonly_fields = ["usage_count"]

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

    def has_change_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_change_permission(request)


class NewsLetterResouce(resources.ModelResource):
    class Meta:
        model = NewsLetter
        fields = ("email", "subscribed_at")
        export_order = ("email", "subscribed_at")


class NewsLetterAdmin(ExportMixin, admin.ModelAdmin):
    list_display = ["email", "subscribed_at"]
    list_filter = ["subscribed_at"]
    search_fields = ["email"]
    resource_class = NewsLetterResouce

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)


class NotesResource(resources.ModelResource):
    class Meta:
        model = Notes
        fields = ("title", "type", "description")
        export_order = ("title", "type", "description")


class NotesAdmin(ExportActionMixin, admin.ModelAdmin):
    list_display = ["title", "type"]
    list_filter = ["type"]
    search_fields = ["title", "description"]
    resource_class = NotesResource

    def get_export_formats(self):
        return [CSV]

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)


class ContactAdmin(admin.ModelAdmin):
    list_display = ["id", "email", "subject",'submitted_at']
    list_filter = ["subject"]
    search_fields = ["subject", "email"]

    class Media:
        # Add inline CSS directly
        css = {
            'all': (
                """
                .field-help-text {
                    color: #FF5733 !important;  /* Change color */
                    font-size: 14px !important; /* Change font size */
                    font-weight: bold !important; /* Optional: make the text bold */
                }
                """
            ),
        }

    def get_model_perms(self, request):
        perms = super().get_model_perms(request)

        if request.user.is_superuser:
            self.model._meta.verbose_name = "Contact Us"
            self.model._meta.verbose_name_plural = "Contact Us"

        else:
            self.model._meta.verbose_name = "Contact Inquiry"
            self.model._meta.verbose_name_plural = "Contact Inquiries"

        return perms

    def has_view_permission(self, request, obj=None):
        if request.user.is_staff:
            return True
        return super().has_view_permission(request, obj)

    def has_module_permission(self, request):
        if request.user.is_staff:
            return True
        return super().has_module_permission(request)

# class BlogAdmin(admin.ModelAdmin):
#     list_display = ['id','title']

class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ['name','parent']


class ReturnExchangeAdmin(admin.ModelAdmin):
    list_display = ('id', 'order_item__order__user', 'order_item', 'request_type', 'status', 'created_at')
    list_filter = ('status', 'request_type')
    search_fields = ('order_item__order__user__email', 'order_item__product_variant__title')
    readonly_fields = ('created_at',)

    actions = ['approve_request', 'reject_request', 'mark_completed']

    def approve_request(self, request, queryset):
        updated = queryset.update(status='APPROVED', processed_at=timezone.now())
        self.message_user(request, f"{updated} request(s) approved.")
        for return_exchange in queryset:
            if return_exchange.request_type == "Return":
                create_return_order_shiprocket(request, return_exchange.order_item.order.id,return_exchange.order_item.id, return_exchange.id)
            else:
                create_exchange_order_shiprocket(request, return_exchange.id, return_exchange.order_item.id)
    approve_request.short_description = "Approve selected requests"

    def reject_request(self, request, queryset):
        updated = queryset.update(status='REJECTED', processed_at=timezone.now())
        self.message_user(request, f"{updated} request(s) rejected.")
    reject_request.short_description = "Reject selected requests"

    def mark_completed(self, request, queryset):
        updated = queryset.update(status='COMPLETED', processed_at=timezone.now())
        self.message_user(request, f"{updated} request(s) marked as completed.")
    mark_completed.short_description = "Mark selected as completed"

class ProductSeriesAdmin(admin.ModelAdmin):
    list_display = ['name']


# Register the custom admin site
admin_site = CustomAdminSite(name="custom_admin")
admin_site.register(Product, ProductAdmin)
admin_site.register(Order, OrderAdmin)
admin_site.register(ProductImage)
admin_site.register(Review, ReviewAdmin)
admin_site.register(Transaction, TransactionAdmin)
admin_site.register(Address, AddressAdmin)
admin_site.register(Wishlist, WishlistAdmin)
admin_site.register(OrderItem, OrderItemAdmin)
admin_site.register(Cart, CartAdmin)
admin_site.register(CustomUser, CustomUserAdmin)
admin_site.register(ProductVariant, ProductVariantAdmin)
admin_site.register(ContactUs, ContactAdmin)
admin_site.register(Promotion, PromotionAdmin)
admin_site.register(Banner, BannerAdmin)
admin_site.register(NewsLetter, NewsLetterAdmin)
admin_site.register(ProductCategory, ProductCategoryAdmin)
admin_site.register(ReturnExchange, ReturnExchangeAdmin)
admin_site.register(ProductSeries, ProductSeriesAdmin)
admin_site.register(Notes, NotesAdmin)


class CheckoutSessionAdmin(admin.ModelAdmin):
    list_display = ('session_token', 'variant', 'quantity', 'price_snapshot', 'user', 'created_at', 'expires_at', 'is_expired')
    list_filter = ('created_at', 'expires_at')
    readonly_fields = ('session_token', 'created_at')
    search_fields = ('session_token', 'variant__product__title', 'user__email')

    def is_expired(self, obj):
        return obj.is_expired()
    is_expired.boolean = True

admin_site.register(CheckoutSession, CheckoutSessionAdmin)