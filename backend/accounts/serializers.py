from .models import *
from rest_framework import serializers

class AddressSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    class Meta:
        fields = "__all__"
        model = Address
    def get_user(self, obj):
        # Return the username if the user exists; otherwise, return None
        return obj.user.username if obj.user else None

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        # fields = "__all__"
        model = CustomUser
        fields = ['id', 'username', 'email', 'phone_number']  # Make sure 'phone_number' exists in your model

