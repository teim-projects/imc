# serializers.py
from decimal import Decimal, InvalidOperation
import re
from datetime import date

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.core.mail import EmailMultiAlternatives
from django.db import IntegrityError, transaction

from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from dj_rest_auth.registration.serializers import RegisterSerializer
from dj_rest_auth.serializers import LoginSerializer, UserDetailsSerializer

from .models import (
    Studio, Event, Show, Payment, Videography, CustomUser,
    Equipment, EquipmentRental, EquipmentEntry
)

# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------
def to_decimal_or_zero(val):
    """
    Safely coerce strings/numbers like "999", "999.50", 999 -> Decimal("999.50").
    Returns Decimal("0") for None/"". Raises ValidationError if malformed.
    """
    if val in (None, ""):
        return Decimal("0")
    try:
        return Decimal(str(val))
    except (InvalidOperation, ValueError, TypeError):
        raise serializers.ValidationError("Enter a valid numeric amount.")

# ---------------------------------------------------------------------
# Studio
# ---------------------------------------------------------------------
class StudioSerializer(serializers.ModelSerializer):
    # Expose payment_methods as a list to the UI
    payment_methods = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True
    )

    class Meta:
        model = Studio
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")
        extra_kwargs = {
            "time_slot": {"required": False, "allow_null": True},
        }

    def to_internal_value(self, data):
        """
        Normalize incoming payload:
        - Accept CSV for payment_methods and turn into list
        - Convert empty-string time_slot "" -> None (so TimeField accepts it)
        """
        data = data.copy()

        # Normalize payment_methods: CSV -> list
        pm = data.get("payment_methods")
        if isinstance(pm, str):
            data["payment_methods"] = [s.strip() for s in pm.split(",") if s.strip()]

        # Normalize empty time string -> None
        if data.get("time_slot", None) == "":
            data["time_slot"] = None

        return super().to_internal_value(data)

    def validate_contact_number(self, value):
        if value in (None, ""):
            return value
        if not re.fullmatch(r"\+?\d{7,15}", value.strip()):
            raise serializers.ValidationError("Enter a valid phone number (7–15 digits, optional +).")
        return value

    def validate_duration(self, value):
        if value is None or float(value) <= 0:
            raise serializers.ValidationError("Duration must be greater than 0.")
        return value

    def create(self, validated_data):
        # store payment_methods as CSV in the DB
        pm = validated_data.pop("payment_methods", [])
        obj = Studio(**validated_data)
        obj.payment_methods = ", ".join(pm) if pm else ""
        obj.full_clean()
        obj.save()
        return obj

    def update(self, instance, validated_data):
        pm = validated_data.pop("payment_methods", None)
        for k, v in validated_data.items():
            setattr(instance, k, v)
        if pm is not None:
            instance.payment_methods = ", ".join(pm)
        instance.full_clean()
        instance.save()
        return instance

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["payment_methods"] = instance.payment_list  # always list for UI
        return rep

# ---------------------------------------------------------------------
# Event / Show
# ---------------------------------------------------------------------
class _BaseEventShowSerializer(serializers.ModelSerializer):
    """
    Shared validation/normalization for Event and Show.
    Assumes model has: title, location, date, ticket_price, description.
    """

    def to_internal_value(self, data):
        data = super().to_internal_value(data)
        # Ensure ticket_price always a Decimal
        data["ticket_price"] = to_decimal_or_zero(data.get("ticket_price"))
        return data

    def validate_ticket_price(self, value):
        if value is None:
            return Decimal("0")
        if Decimal(value) < 0:
            raise serializers.ValidationError("Ticket price cannot be negative.")
        return Decimal(value)

    def validate_date(self, value):
        # Uncomment if you want to forbid past dates:
        # if value < date.today():
        #     raise serializers.ValidationError("Date cannot be in the past.")
        return value

class EventSerializer(_BaseEventShowSerializer):
    class Meta:
        model = Event
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

class ShowSerializer(_BaseEventShowSerializer):
    class Meta:
        model = Show
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

# ---------------------------------------------------------------------
# Payment
# ---------------------------------------------------------------------
class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

    def to_internal_value(self, data):
        data = data.copy()
        if "amount" in data:
            try:
                data["amount"] = to_decimal_or_zero(data.get("amount"))
            except serializers.ValidationError as e:
                raise serializers.ValidationError({"amount": e.detail})
        return super().to_internal_value(data)

    def validate_amount(self, value):
        if value is None or Decimal(value) <= 0:
            raise serializers.ValidationError("Amount must be greater than 0.")
        return Decimal(value)

# ---------------------------------------------------------------------
# Videography
# ---------------------------------------------------------------------
class VideographySerializer(serializers.ModelSerializer):
    class Meta:
        model = Videography
        fields = "__all__"
        read_only_fields = ("created_at", "updated_at")

    def validate_duration(self, value):
        if value is None or float(value) <= 0:
            raise serializers.ValidationError("Duration must be greater than 0.")
        return value

# =====================================================================
# ===================== Authentication Serializers ====================
# =====================================================================
User = get_user_model()

# -------- Register --------
class CustomRegisterSerializer(RegisterSerializer):
    """
    Extends dj-rest-auth RegisterSerializer to support:
    - mobile_no (validated, unique)
    - profile_photo (optional) — also accepts `photo` key from client
    """
    username = None  # disable username completely

    mobile_no = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=15,
        validators=[UniqueValidator(queryset=User.objects.all(), message="This mobile number is already registered.")]
    )
    # accept image (nullable/optional)
    profile_photo = serializers.ImageField(required=False, allow_null=True)

    def validate_mobile_no(self, v: str):
        v = (v or "").strip()
        if v == "":
            return v
        if not re.fullmatch(r"\+?\d{7,15}", v):
            raise serializers.ValidationError("Enter a valid phone (7–15 digits, optional +).")
        return v

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data["mobile_no"] = self.validated_data.get("mobile_no", "")
        # map alternate client key 'photo' -> 'profile_photo' if present
        if "profile_photo" in self.validated_data:
            data["profile_photo"] = self.validated_data.get("profile_photo")
        elif self.context and (req := self.context.get("request")):
            # allow files['photo'] if frontend sent PHOTO_FIELD_NAME="photo"
            data["profile_photo"] = req.FILES.get("photo", None)
        return data

    @transaction.atomic
    def save(self, request):
        user = super().save(request)  # creates user with email/password
        user.mobile_no = self.validated_data.get("mobile_no", "")

        # Attach photo if provided
        photo = (
            self.validated_data.get("profile_photo")
            or (request.FILES.get("photo") if request and hasattr(request, "FILES") else None)
        )
        if photo:
            user.profile_photo = photo

        try:
            user.save()
        except IntegrityError:
            # convert DB unique error to a proper 400
            raise serializers.ValidationError({"mobile_no": ["This mobile number is already registered."]})
        return user

# -------- Login (email or mobile) --------
class CustomLoginSerializer(LoginSerializer):
    username = None
    email_or_mobile = serializers.CharField(required=True)
    password = serializers.CharField(style={'input_type': 'password'})

    def validate(self, attrs):
        email_or_mobile = attrs.get('email_or_mobile')
        password = attrs.get('password')

        if not email_or_mobile or not password:
            raise serializers.ValidationError("Both email/mobile and password are required.")

        # First, try built-in authenticate (may work if AUTHENTICATION_BACKENDS accept email)
        user = authenticate(username=email_or_mobile, password=password)

        # If that fails, resolve user by email/mobile manually
        if not user:
            try:
                if '@' in email_or_mobile:
                    user = User.objects.get(email=email_or_mobile)
                else:
                    user = User.objects.get(mobile_no=email_or_mobile)
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials.")

            if not user.check_password(password):
                raise serializers.ValidationError("Invalid credentials.")

        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")

        attrs['user'] = user
        return attrs

# -------- User Details (GET /api/auth/dj-rest-auth/user/) --------
class CustomUserDetailsSerializer(UserDetailsSerializer):
    # return a URL for the image so frontend can render directly
    profile_photo = serializers.ImageField(read_only=True, use_url=True, allow_null=True, required=False)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'mobile_no', 'first_name', 'last_name', 'role', 'profile_photo')
        read_only_fields = ('email',)

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['full_name'] = f"{(instance.first_name or '').strip()} {(instance.last_name or '').strip()}".strip()
        return rep

# -------- Password Reset (request) --------
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No account found with this email.")
        self.context['user'] = user
        return value

    def save(self):
        user = self.context['user']
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)

        # FRONTEND_URL should be something like: "http://localhost:5173/password-reset-confirm"
        frontend_url = getattr(settings, "FRONTEND_URL", "")
        if not frontend_url.endswith("/"):
            frontend_url = f"{frontend_url}/"
        reset_link = f"{frontend_url}{uid}/{token}/"

        subject = "Password Reset Request"
        context = {"user": user, "reset_link": reset_link}
        body = render_to_string("registration/custom_password_reset_email.html", context)

        email = EmailMultiAlternatives(subject, body, settings.DEFAULT_FROM_EMAIL, [user.email])
        email.send()

        return {"detail": "Password reset email sent successfully."}

# -------- Password Reset (confirm) --------
class PasswordResetConfirmSerializer(serializers.Serializer):
    uidb64 = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        uidb64 = attrs.get("uidb64")
        token = attrs.get("token")
        new_password = attrs.get("new_password")

        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"uidb64": "Invalid UID."})

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            raise serializers.ValidationError({"token": "Invalid or expired token."})

        user.set_password(new_password)
        user.save()

        return {"detail": "Password has been reset successfully."}

# ---------------------------------------------------------------------
# Equipment Entry (flat UI model used by your React form)
# ---------------------------------------------------------------------
class EquipmentEntrySerializer(serializers.ModelSerializer):
    # Expose alias that the UI sends/reads
    equipment_name = serializers.CharField(source="name", required=False, allow_blank=True)
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = EquipmentEntry
        fields = [
            "id",
            "equipment_name",   # alias of 'name' for the UI
            "name",             # keep original too (debugging)
            "category",
            "brand",
            "price_per_day",
            "available_quantity",
            "rented_by",
            "rental_date",
            "return_date",
            "status",
            "photo",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    # Accept either 'name' or 'equipment_name' from the UI
    def to_internal_value(self, data):
        data = data.copy()
        if not data.get("name") and data.get("equipment_name"):
            data["name"] = data["equipment_name"]
        return super().to_internal_value(data)

    # Return absolute photo URL and always include alias
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get("request")
        rep["equipment_name"] = instance.name
        if rep.get("photo") and request is not None:
            rep["photo"] = request.build_absolute_uri(rep["photo"])
        return rep

# ---------------------------------------------------------------------
# Equipment Master + Equipment Rental Serializers (used in views)
# ---------------------------------------------------------------------
class EquipmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Equipment master model.
    """
    class Meta:
        model = Equipment
        fields = [
            "id",
            "name",
            "sku",
            "description",
            "quantity_in_stock",
            "rate_per_day",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_quantity_in_stock(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

    def validate_rate_per_day(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError("Rate per day must be positive.")
        return value

class EquipmentRentalSerializer(serializers.ModelSerializer):
    """
    Serializer for EquipmentRental model (bookings).
    Includes nested Equipment name for readability.
    """
    equipment_name = serializers.CharField(source="equipment.name", read_only=True)

    class Meta:
        model = EquipmentRental
        fields = [
            "id",
            "equipment",
            "equipment_name",
            "customer_name",
            "customer_contact",
            "rental_date",
            "return_date",
            "quantity",
            "status",
            "rate_per_day_snapshot",
            "total_price",
            "notes",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["rate_per_day_snapshot", "total_price", "created_at", "updated_at"]

    def validate_quantity(self, value):
        if value is None or value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value

    def validate(self, attrs):
        # optional consistency check for rental/return dates
        rental_date = attrs.get("rental_date")
        return_date = attrs.get("return_date")
        if return_date and rental_date and return_date < rental_date:
            raise serializers.ValidationError("Return date cannot be before rental date.")
        return attrs
