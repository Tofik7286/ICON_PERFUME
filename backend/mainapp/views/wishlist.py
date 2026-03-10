import logging

from django.db.models import Q

from rest_framework import status
from rest_framework.decorators import api_view , APIView, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import *
from mainapp.serializers import *
from mainapp.models import *
from mainapp.responses import success_response, error_response

logger = logging.getLogger(__name__)



class UserWishlist(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # get the token 
        user = request.user
        try:
            # now from user get user's wishlist
            wishlists = Wishlist.objects.filter(user=user).select_related('variant__product__series').prefetch_related('variant__product__category', 'variant__images', 'variant__notes')
            # Check Wishlists is Empty or Not
            if not wishlists:
                return Response({'success':True, 'message': 'Wishlist is empty', "wishlists": []}, status=status.HTTP_200_OK)
            
            # if data found in wishlist then serializer it and send it 
            serializer = WishlistSerializer(wishlists, many = True)
            wishlist_serialized = serializer.data

            return Response({"success":True,"wishlists":wishlist_serialized},status=status.HTTP_200_OK)
        
        # if user does not exist
        except CustomUser.DoesNotExist:
            return error_response('User does not exist', status_code=status.HTTP_404_NOT_FOUND)
        
        # something went wrong then show internal server error
        except Exception as e:
            logger.exception("Error in UserWishlist.get")
            return Response({'success':False,'message':"Something went wrong. Please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self,request,id):
        # get the token
        user_id = request.user.id
        try:
            
            variant = ProductVariant.objects.get(id=id)
            # if product found then create user wishlist
            wishlist , created = Wishlist.objects.get_or_create(user_id=user_id,variant_id=id)
            
            # add product to  user wishlist and send success message to user
            # wishlist.products.add(product)
            serializer = WishlistSerializer(wishlist)
            wishlist_serialized = serializer.data

            return Response({'success': True,'message':'Product added to wishlist', 'wishlists': wishlist_serialized},status=status.HTTP_201_CREATED)
        except Product.DoesNotExist: # if product does not exist
            return error_response('Product does not exist', status_code=status.HTTP_404_NOT_FOUND)
        
        # if something went wrong send internal server error
        except Exception as e:
            logger.exception("Error in UserWishlist.post")
            return Response({'success':False,'message':"Something went wrong. Please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    def delete(self,request,id):
        user_id = request.user.id
        try:
            # now get the product that user want remove
            variant = ProductVariant.objects.get(id=id)
            # now get user wishlist from user id 
            wishlist = Wishlist.objects.get(Q(user=user_id) & Q(variant=variant))
        
            # if product found in wishlist then remove it 
            wishlist.delete()
            return Response({'success':True,'message':'Product Removed From Wishlist'},status=status.HTTP_200_OK)
            
        # if wishlist not found then show error
        except Wishlist.DoesNotExist:
            return error_response('Wishlist not found ', status_code=status.HTTP_404_NOT_FOUND)

        except Product.DoesNotExist: # if product not found show error
            return error_response('Product does not exist', status_code=status.HTTP_404_NOT_FOUND)
        
        # if something went wrong then show internal server error 
        except Exception as e:
            logger.exception("Error in UserWishlist.delete")
            return Response({'success':False,'message':"Something went wrong. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# DRY-04: Fixed — @api_view MUST be outermost decorator
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def getAllWishlists(request):
        try:
            user = request.user
            # now from user get user's wishlist
            wishlists = Wishlist.objects.filter(user=user).select_related('variant__product__series').prefetch_related('variant__product__category', 'variant__images', 'variant__notes')
            # Check Wishlists is Empty or Not
            if not wishlists:
                return Response({"success": False, 'message': 'Wishlist is empty'}, status=status.HTTP_200_OK)
            
            # if data found in wishlist then serializer it and send it 
            serializer = WishlistSerializer(wishlists, many = True)
            wishlist_serialized = serializer.data

            return Response({"success":True,"wishlists":wishlist_serialized},status=status.HTTP_200_OK)
        
        # if user does not exist
        except CustomUser.DoesNotExist:
            return error_response('User does not exist', status_code=status.HTTP_404_NOT_FOUND)
        
        # something went wrong then show internal server error
        except Exception as e:
            logger.exception("Error in getAllWishlists")
            return Response({'success':False,'message':"Something went wrong. Please try again later."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
