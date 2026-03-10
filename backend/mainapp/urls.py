from django.conf import settings
from django.urls import path , include, re_path
from django.conf.urls.static import static

from .views import * 


urlpatterns = [
    path('products/',GetallProducts.as_view(),name="products"),
    path('product/<slug:slug>/',GetProduct.as_view(),name="product"),
    path('banners/',getBanners,name="banners"),
    path('categories/',getCategories,name='categories'),
    path('buy-now/',create_buynow_session,name="buy-now"),
    path('buy-now-session/',get_buynow_session,name="buy-now-session"),
    path('review/<int:id>/',UserReview.as_view(),name="review"),
    path('get-reviews/<slug:product_slug>/',UserReview.as_view(),name="get-reviews"),
    path('cart/',UserCart.as_view(),name="cart"),
    path('add-to-cart/<int:id>/',UserCart.as_view(),name="add_cart"),
    path('remove-from-cart/<int:id>/',UserCart.as_view(),name="remove_from_cart"),
    path('plus-cart/<int:id>/',plus_cart,name="plus_cart"),
    path('minus-cart/<int:id>/',minus_cart,name="minus_cart"),
    path('getAllWishlists/',getAllWishlists,name="getAllWishlists"),
    path('add-wishlist/<int:id>/', UserWishlist.as_view(), name='wishlists'),  
    path('remove-wishlist/<int:id>/', UserWishlist.as_view(), name='remove_from_wishlist'),  
    path('checkout-total/', calculate_checkout_total, name='checkout-total'),  
    path('orders/',UserOrders.as_view(),name="orders"),
    path('order-details/',UserOrders.as_view(),name="orderdetails"),
    path('cancel-order/<int:id>/',UserOrders.as_view(), name='cancel_order'),
    path('download-invoice/<str:order_number>/', download_invoice, name='download_invoice'),
    # path('payment-view/',views.payment_view,name="payment_view"),
    # path('api/analytics/', analytics_api, name='analytics_api'),
    path('get-order/<int:order_id>/', getOrder, name='get-order'),
    path('order_change/', order_change, name='order_change'),
    path('calculate-total/',calculate_checkout_total,name='calculate_checkout_total'),
    path('order_check/', order_check, name='order_check'),
    path("create-razorpay-order/",PaymentOrderAPIView.as_view(),name='create_razorpay_order'),
    path("initiate-payment/",PaymentOrderAPIView.as_view(),name='initiate-payment'),
    path("verify-payment/",VerifyPaymentAPIView.as_view(),name="verify_payment"),
    path('subscribe-news-letter/', subscribe_news_letter, name='subscribe-news-letter'),
    path('unsubscribe-news-letter/', unsubscribe_newsletter, name='subscribe-news-letter'),
    path('contact/',contact_us,name='contact'),
    path('get-promos/',getPromocodes,name='promo'),
    # path("admin/logs/", show_logs, name="show_logs"),
    # path('create-checkout-session/',StripeCheckoutview.as_view(),name='create_checkout_session'),
    re_path(r'^invoices/(?P<path>.*)$',serve_invoices, name='invoices'),
    path('',include('accounts.urls')),
]  + static(settings.MEDIA_URL, document_root = settings.MEDIA_ROOT)