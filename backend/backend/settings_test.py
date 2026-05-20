from backend.settings import *  # noqa: F401, F403

SECRET_KEY = "test-secret-key-for-testing-only-do-not-use-in-prod"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": ":memory:",
    }
}

CACHES = {
    "default": {
        "BACKEND": "mainapp.tests.cache.TestCache",
        "LOCATION": "test",
    }
}

LOGGING = {}
