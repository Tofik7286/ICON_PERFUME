from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager,
                                        Permission, PermissionsMixin)
from django.db import models
from django.utils import timezone
from django.utils.timezone import timedelta

# admin number - 6354951878


class CustomUserManager(BaseUserManager):
    def create_user(self, phone_number, username, password=None, **kwargs):
        if not phone_number:  # First We Check phone number is provided or not
            raise ValueError("The Phone number is required")
        user = self.model(
            phone_number=phone_number, username=username, **kwargs
        )  # then set all the values to model
        user.set_password(
            password
        )  # set password here using set_password cause it make password to hash
        user.save(using=self._db)  # then save data to the database Using self
        return user

    def create_superuser(self, phone_number, username, password=None, **kwargs):
        kwargs.setdefault("is_staff", True)
        kwargs.setdefault("is_superuser", True)
        # We set is staff and superuser true if they are not true then rasie error
        if kwargs.get("is_staff") is not True:
            raise ValueError("is_staff must be True")
        if kwargs.get("is_superuser") is not True:
            raise ValueError("is_superuser must be True")

        # Send all the values to create user cause superuser is also a user
        return self.create_user(phone_number, username, password, **kwargs)

    def create_staffuser(self, phone_number, username, password=None, **kwargs):
        kwargs.setdefault("is_staff", True)
        kwargs.setdefault("is_superuser", False)

        if kwargs.get("is_staff") is not True:
            raise ValueError("is_staff must be True")

        if kwargs.get("is_superuser") is True:
            raise ValueError("Staff user cannot have is_superuser.")

        return self.create_user(phone_number, username, password, **kwargs)


GENDER_CHOICES = (
    ("MALE", "MALE"),
    ("FEMALE", "FEMALE"),
    ("OTHER", "OTHER"),
)


# # Create custom model for user
class CustomUser(AbstractBaseUser, PermissionsMixin):
    phone_number = models.CharField(max_length=15, unique=True, blank=True, null=True)
    username = models.CharField(max_length=120, blank=True, null=True)
    email = models.EmailField(max_length=100, blank=True, null=True)
    date_joined = models.DateField(auto_now_add=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_new = models.BooleanField(default=True)
    is_superuser = models.BooleanField(default=False)
    gender = models.CharField(
        choices=GENDER_CHOICES, max_length=100, blank=True, null=True
    )
    region = models.CharField(max_length=100, blank=True, null=True)
    name = models.CharField(max_length=40, blank=True, null=True)
    address = models.CharField(max_length=500, blank=True, null=True)
    city = models.CharField(max_length=60, blank=True, null=True)
    state = models.CharField(max_length=60, blank=True, null=True)
    pincode = models.CharField(max_length=6, blank=True, null=True)
    # All this fields can be change based on project requirements
    reset_password_token = models.CharField(
        max_length=255, blank=True, null=True
    )  # For Reset Password

    objects = CustomUserManager()
    USERNAME_FIELD = (
        "phone_number"  # Add related_name to avoid reverse accessor conflicts
    )
    REQUIRED_FIELDS = ["username"]

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self):
        return str(self.name)

    def save(self, *args, **kwargs):
        """
        save staff user password as hashed password
        """
        if (
            self.password
            and self.is_staff
            and not self.is_superuser
            and not self.is_password_hashed(self.password)
        ):
            self.password = make_password(self.password)

        super().save(*args, **kwargs)

    def is_password_hashed(self, password):
        """
        Check if the password is hashed.
        Returns True if the password is hashed, False if it's plain text.
        """
        return password.startswith(("pbkdf2_sha256$", "bcrypt", "sha1"))


# Create address model so user can save it's address and it will be multiple also
class Address(models.Model):
    user = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, related_name="user_address"
    )  # Check which user address is this
    address = models.CharField(max_length=500, null=True, blank=True)
    city = models.CharField(max_length=60)
    country = models.CharField(max_length=100)
    state = models.CharField(max_length=60)
    pincode = models.CharField(max_length=8)
    default = models.BooleanField(default=False)
    added_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    def __str__(self):
        return self.address


class Otp(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE)
    otp = models.CharField(max_length=255, default="")
    count = models.IntegerField(default=0)
    attempts = models.PositiveIntegerField(default=0)  # SEC-07: Track verification attempts
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{str(self.id)} - {str(self.user.username)}"

    @property
    def is_valid(self):
        diff = timezone.now() - self.updated_at
        if diff > timedelta(minutes=2):
            return False
        return True
