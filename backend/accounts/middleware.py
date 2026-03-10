class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        EXCLUDED_PATHS = [
            '/api/login/',
            '/api/signup/',
            '/api/verify-email/',
            # '/api/verify-profile-otp/',
            '/api/send-otp/',
            '/api/forgot-password/',
            '/api/reset-password/',  # token-based, so match prefix
            # '/api/change-password/',

            '/api/products/',
            '/api/product/',  # detail view with slug/sku, so match prefix
            '/api/banners/',
            '/api/categories/',
            '/api/contact/',
            '/api/subscribe-news-letter/',
            '/api/unsubscribe-news-letter/',
            '/api/get-promos/',
            '/api/buy-now/',
            '/api/buy-now-session/',
            '/api/admin/logs/',
        ]
        excluded_prefixes = ['/admin/', '/static/', '/logs/','/api/product/']

        if (
            request.path
            and request.path not in EXCLUDED_PATHS
            and not any(request.path.startswith(prefix) for prefix in excluded_prefixes)
        ):
            token = request.COOKIES.get("token")
            if token:
                request.META["HTTP_AUTHORIZATION"] = f"Bearer {token}"

        return self.get_response(request)
