import hashlib
import json

from django.contrib.postgres.search import TrigramSimilarity
from django.db.models import Q,Count
from django.db.models.functions import Lower
from django.core.cache import cache
from rest_framework.decorators import api_view , APIView
from rest_framework.response import Response
from rest_framework import status
# from elasticsearch_dsl.query import MultiMatch
# from ..documents import ProductVariantDocument

from accounts.utils import append_log
from accounts.models import *
from mainapp.serializers import *
from mainapp.models import *
from mainapp.views.shiprocket import *
import logging
logger = logging.getLogger(__name__)


class GetallProducts(APIView):
    def get(self,request):
        try:
            
            # For Search : query
            # For Pagination : page (current page), limit (number   of products per page)
            # For categories : categories[] (list of categories)
            # For New Arrival : new_arrival=true
            # For best_seller : best_seller=true
            # For Recommended : recommended=true
            # For not pagination : is_page=false
            # for filter : filters{ "price":{ "min": 10 , "max":10 } }

            page = int(request.GET.get('page',1))
            limit = int(request.GET.get('limit',12))
            new_arrival = bool(request.GET.get("new_arrival", False))
            exclusive = bool(request.GET.get('exclusive',False))
            best_seller = bool(request.GET.get('best_seller',False))
            recommended = bool(request.GET.get('recommended',False))
            is_combo = bool(request.GET.get('is_combo',False))
            filters = request.GET.get('filters','{}')
            is_page = request.GET.get('isPage',True)
            category = request.GET.get('category','')
            sub_category = request.GET.get('sub-category','')
            sort_by = request.GET.get('sort_by','')
            
            try:
                filters = json.loads(filters)
            except json.JSONDecodeError:
                filters = []
            query = request.GET.get('query','')

            variants = ProductVariant.objects.select_related('product__series').prefetch_related('product__category', 'images', 'notes').all().order_by('-updated_at')
            offset = (page - 1) * limit
            max_price = 0
            min_price = 0

            # Handl Categories
            if category:
                parent_category = ProductCategory.objects.annotate(
                    name_lower=Lower('name')
                    ).filter(
                        name_lower=category.lower().replace('-',' '),
                        parent=None
                    ).first()
                if parent_category:
                    variants = variants.annotate(
                        category_name_lower=Lower('product__category__name')
                    ).filter(category_name_lower=category.lower().replace('-',' '))

                    if sub_category:
                        sub_category_obj = ProductCategory.objects.annotate(
                            name_lower=Lower('name')
                        ).filter(
                            name_lower=sub_category.lower().replace('-',' ')
                        ).first()
                        if sub_category_obj:
                            if category:
                                subcategory_ids = parent_category.get_descendants().values_list('id',flat=True)
                                if sub_category_obj.id in subcategory_ids:
                                    variants = variants.filter(product__category__name__icontains=sub_category.replace('-',' '))
                                else:
                                    raise ProductCategory.DoesNotExist('Category and Sub Category are not Matching')
                            else:
                                variants = variants.filter(product__category__name__icontains=sub_category.replace('-',' '))
                        else:
                            raise ProductCategory.DoesNotExist('Category and Sub Category are not Matching')
                else:
                    raise ProductCategory.DoesNotExist('Category and Sub Category are not Matching')


            # Handle Filteres
            if filters:
                price = filters.get('price')
                if price:
                    variants = variants.filter(Q(discounted_price__gte=price.get('min')) & Q(discounted_price__lte=price.get('max')))

            # Handle Special products
            if new_arrival is True:
                variants = variants.filter(Q(product__new_arrival=True) & Q(stock__gte=1) & Q(available=True))
            elif best_seller is True:
                variants = variants.filter(Q(product__best_seller=True) & Q(stock__gte=1) & Q(available=True))
            elif exclusive is True:
                variants = variants.filter(Q(product__exclusive=True) & Q(stock__gte=1) & Q(available=True))
            elif recommended is True:
                variants = variants.filter(Q(product__recommended=True) & Q(stock__gte=1) & Q(available=True))
            elif is_combo is True:
                variants = variants.filter(Q(product__is_combo=True) & Q(stock__gte=1) & Q(available=True))

            if query:
                variants = variants.filter(
                    Q(product__title__icontains=query) |
                    Q(product__description__icontains=query) |
                    Q(keywords__icontains=query)
                )
                
            # Handle Sort By
            if sort_by == "price_low_to_high":
                variants = variants.order_by('discounted_price')
            elif sort_by == "price_high_to_low":
                variants = variants.order_by('-discounted_price')
            elif sort_by == "name_a_to_z":
                variants = variants.order_by('product__title')
            elif sort_by == "name_z_to_a":
                variants = variants.order_by('-product__title')
            elif sort_by == "date_old_to_new":
                variants = variants.order_by('created_at')
            elif sort_by == "date_new_to_old":
                variants = variants.order_by('-created_at')

            if is_page:
                filtered_variants = variants[offset:offset + limit]
            else:
                filtered_variants = variants


            if not variants:
                response_data = {
                    'success':True,"variants":[],"max_price":max_price,
                    "min_price":min_price,'message':'No Products Found'
                }
                return Response(response_data,status=status.HTTP_200_OK)

            
            context = {
                "success": True, 
            }

            if is_page is True:
                total_count = variants.count()
                filtered_serializer = ProductVariantSerializer(filtered_variants,many=True,context={'request':request})
                if filtered_variants:
                    max_price = max(filtered_variant.discounted_price or 0 for filtered_variant in filtered_variants)
                    min_price = min(filtered_variant.discounted_price or 0 for filtered_variant in filtered_variants)

                context["pagination"] = {
                        "page": page,
                        "limit": limit,
                        "totalPages": (total_count // limit) + (1 if total_count % limit > 0 else 0),
                        "totalProducts":total_count,
                }
            else:
                if variants:
                    max_price = max(variant.discounted_price or 0 for variant in variants)
                    min_price = min(variant.discounted_price or 0 for variant in variants)
                
                filtered_serializer = ProductVariantSerializer(variants,many=True,context={'request':request})

            context["variants"] = filtered_serializer.data
            context["max_price"] = max_price
            context["min_price"] = min_price

            return Response(context, status=status.HTTP_200_OK)
        
        # if something went wrong then show internal server error
        except ProductCategory.DoesNotExist as e:
            return Response({"success":False,"message":f"{str(e)}", "data":[]},status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unexpected error")
            return Response({"success":False,"message":f"{str(e)}", "data":[]},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class GetProduct(APIView):
    def get(self,request,slug,*args, **kwargs):
        try:

            if not slug:
                raise ValueError("Slug Parameter is missing")
            
            # Get single product id and get it from database
            product = Product.objects.select_related('series').prefetch_related('category').get(slug=slug)
            variants = ProductVariant.objects.filter(product=product).select_related('product__series').prefetch_related('product__category', 'images', 'notes')
            variant_serializer = ProductVariantSerializer(variants,many=True,context={'request':request})
            
            # Get the related reviews
            reviews = Review.objects.select_related('user').filter(product=product)
            review_serializer = ReviewSerializer(reviews, many=True)
            variants_serialized = variant_serializer.data
            
            notes = Notes.objects.filter(note__product=product).distinct()
            if notes.exists():
                if notes.count() >= 2:
                    related_product_variants = (
                        ProductVariant.objects
                        .filter(notes__in=notes)
                        .exclude(product=product)
                        .select_related('product__series')
                        .prefetch_related('product__category', 'images', 'notes')
                        .annotate(shared_notes_count=Count('notes', filter=Q(notes__in=notes),distinct=True))
                        .filter(shared_notes_count__gte=2)
                        .distinct()
                     )
                else:
                    related_product_variants =  (
                        ProductVariant.objects
                        .filter(notes__in=notes)
                        .exclude(product=product)
                        .select_related('product__series')
                        .prefetch_related('product__category', 'images', 'notes')
                        .distinct()
                        )
            else:
                related_product_variants = ProductVariant.objects.none()

            related_variants_serializer =ProductVariantSerializer(related_product_variants, many=True ,context={'request':request})

            response_data = {
                "success": True,
                "variants":variants_serialized,
                "reviews": review_serializer.data,  # Add reviews to the response
                "related_products": related_variants_serializer.data,   # Add related products to the response
            }
            return Response(response_data, status=status.HTTP_200_OK)
        
        except Product.DoesNotExist:
            return Response({"success":False,"message":f"Product Not Found"},status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({"success":False,"message":f"Internal Server Error: {str(e)}"},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])  
def getCategories(request):
    try:
        parent = request.GET.get('category')
        child = request.GET.get('sub-category')
        product_slug = request.GET.get('product')

        merged = f"{parent}_{child}_{product_slug}"
        cache_key = f"product_categories_{hashlib.md5(merged.encode()).hexdigest()}"
        # cached_data = cache.get(cache_key)
        if cache.get(cache_key):
           cache.delete(cache_key)
           
        # if cached_data:
        #     return Response(cached_data, status=status.HTTP_200_OK)
        
        categories = ProductCategory.objects.all()
        if not categories.exists():  # if products not found show error
                return Response({"success": False, "message": "There is No Category found", "data":[]}, status=status.HTTP_404_NOT_FOUND)

        if parent and parent is not None:
            parent_category = ProductCategory.objects.annotate(
                name_lower=Lower('name')
                ).filter(
                    name_lower=parent.lower().replace('-',' '),
                    parent=None
                ).first()
            if parent_category:
                if child and child is not None:
                    child_category = ProductCategory.objects.annotate(
                        name_lower=Lower('name')
                    ).filter(
                        name_lower=child.lower().replace('-',' ')
                    ).first()

                    if child_category:
                        node_ids = parent_category.get_descendants().values_list('id',flat=True)
                        if child_category.id in node_ids:
                            if product_slug:
                                product = Product.objects.filter(slug=product_slug).first()
                                if child_category.id in product.category.all().filter(parent__isnull=False).values_list('id',flat=True):
                                    serializer = ProductCategorySerializer(child_category)
                                    response_data = {'success': True, 'categories': serializer.data}
                                    cache.set(cache_key, response_data, timeout=60 * 10)
                                    return Response(response_data, status=status.HTTP_200_OK)
                                else:
                                    return Response({'success':False},status=status.HTTP_200_OK)
                            serializer = ProductCategorySerializer(child_category)
                            response_data = {'success': True, 'categories': serializer.data}
                            cache.set(cache_key, response_data, timeout=60 * 10)
                            return Response(response_data, status=status.HTTP_200_OK)
                        else:
                            raise ProductCategory.DoesNotExist("Product Category & Sub Category Not Matching")
                    else:
                        raise ProductCategory.DoesNotExist("Product Sub Category Not Found")
                else:
                    if product_slug:
                        product = Product.objects.filter(slug=product_slug).first()
                        if product and parent_category.id in product.category.all().filter(parent=None).values_list('id',flat=True):
                            serializer = ProductCategorySerializer(parent_category)
                            response_data = {'success': True, 'categories': serializer.data}
                            cache.set(cache_key, response_data, timeout=60 * 10)
                            return Response(response_data, status=status.HTTP_200_OK)
                        else:
                            return Response({'success':False}, status=status.HTTP_404_NOT_FOUND)
                    serializer = ProductCategorySerializer(parent_category)
                    response_data = {'success': True, 'categories': serializer.data}
                    return Response(response_data, status=status.HTTP_200_OK)
            else:
                raise ProductCategory.DoesNotExist("Product Category Not Found")

        serializer = ProductCategorySerializer(categories,many = True)
        response_data = {'success': True, 'categories': serializer.data}
        cache.set(cache_key, response_data, timeout=60 * 10)
        return Response(response_data,status=status.HTTP_200_OK)

    except ProductCategory.DoesNotExist as e:
        return Response({"success":False,"message":f"{str(e)}","data":[]},status=status.HTTP_200_OK)
    
    except Product.DoesNotExist:
        return Response({"success":False,"message":f"Product Not Found", "data":[]},status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"success":False,"message":f"Internal Server Error:{str(e)}"},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
