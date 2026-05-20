from django.core.cache.backends.dummy import DummyCache


class TestCache(DummyCache):
    """DummyCache extended with django-redis-style methods used in signals."""

    def delete_pattern(self, pattern, *args, **kwargs):
        pass
