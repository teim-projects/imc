# User_Dashboard/serializers.py
from rest_framework import serializers
from api.models import StudioMaster
from .models import UserStudioBooking


class StudioPublicSerializer(serializers.ModelSerializer):
    """
    Read-only minimal view of StudioMaster for the user side.
    """
    full_location = serializers.ReadOnlyField()

    class Meta:
        model = StudioMaster
        fields = [
            "id",
            "name",
            "full_location",
            "hourly_rate",
            "capacity",
            "google_map_link",
            "is_active",
        ]
        read_only_fields = fields


class UserStudioBookingSerializer(serializers.ModelSerializer):
    studio_name = serializers.ReadOnlyField(source="studio.name")
    payment_methods = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
        help_text="Array of payment methods (Card, UPI, NetBanking, Cash).",
    )
    payment_methods_display = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserStudioBooking
        fields = [
            "id",
            "user",
            "studio",
            "studio_name",
            "customer_name",
            "contact_number",
            "email",
            "address",
            "date",
            "time_slot",
            "duration_hours",
            "payment_methods",          # input
            "payment_methods_display",  # output
            "agreed_price",
            "notes",
            "is_cancelled",
            "created_at",
            "updated_at",
        ]
        read_only_fields = (
            "id",
            "user",
            "studio_name",
            "payment_methods_display",
            "created_at",
            "updated_at",
        )

    def get_payment_methods_display(self, obj):
        return obj.payment_methods

    def validate_payment_methods(self, value):
        allowed = {c[0] for c in UserStudioBooking.PAYMENT_CHOICES}
        for v in value:
            if v not in allowed:
                raise serializers.ValidationError(
                    f"Invalid payment method '{v}'. Allowed: {', '.join(allowed)}"
                )
        return value

    def validate(self, attrs):
        date = attrs.get("date") or getattr(self.instance, "date", None)
        duration = attrs.get("duration_hours") or getattr(self.instance, "duration_hours", 0)
        if duration is None or float(duration) <= 0:
            raise serializers.ValidationError({"duration_hours": "Duration must be greater than 0."})
        if date is None:
            raise serializers.ValidationError({"date": "Date is required."})
        return attrs

    def create(self, validated_data):
        payment_methods = validated_data.pop("payment_methods", [])
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["user"] = request.user

        instance = super().create(validated_data)
        instance.payment_methods = payment_methods
        instance.save(update_fields=["payment_methods_csv"])
        return instance

    def update(self, instance, validated_data):
        payment_methods = validated_data.pop("payment_methods", None)
        instance = super().update(instance, validated_data)
        if payment_methods is not None:
            instance.payment_methods = payment_methods
            instance.save(update_fields=["payment_methods_csv"])
        return instance
