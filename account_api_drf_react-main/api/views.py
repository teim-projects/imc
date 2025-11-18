# api/views.py
from datetime import timedelta
import os

from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.utils.timezone import now

from rest_framework import viewsets, filters, status, permissions, parsers
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

# Optional Google login imports
try:
    from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
    from allauth.socialaccount.providers.oauth2.client import OAuth2Client
    from dj_rest_auth.registration.views import SocialLoginView
    _GOOGLE_OK = True
except Exception:
    GoogleOAuth2Adapter = None
    OAuth2Client = None
    SocialLoginView = APIView
    _GOOGLE_OK = False

try:
    from google.oauth2 import id_token   # type: ignore
    from google.auth.transport import requests  # type: ignore
    _GOOGLE_VERIFY_OK = True
except Exception:
    id_token = None
    requests = None
    _GOOGLE_VERIFY_OK = False

from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    # Studio
    StudioMaster, Studio,
    # CRM modules
    PrivateBooking, Event, Show, Payment, Videography,
    # Equipment
    Equipment, EquipmentRental, EquipmentEntry,
    # Photography (old schema)
    PhotographyBooking,
    # Sound service
    Sound,
)

from .serializers import (
    # Studio
    StudioMasterSerializer, StudioSerializer,
    # CRM modules
    PrivateBookingSerializer, EventSerializer, ShowSerializer, PaymentSerializer, VideographySerializer,
    # Auth helpers
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    # Equipment
    EquipmentSerializer, EquipmentRentalSerializer, EquipmentEntrySerializer,
    # Photography (old schema)
    PhotographyBookingSerializer,
    # Sound service
    SoundSerializer,
)

User = get_user_model()


# ====================================================================
# Pagination
# ====================================================================
class DefaultPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


# ====================================================================
# Google OAuth2 Login → JWT (safe stub)
# ====================================================================
class GoogleLogin(SocialLoginView):
    if _GOOGLE_OK:
        adapter_class = GoogleOAuth2Adapter  # type: ignore
        client_class = OAuth2Client          # type: ignore
    callback_url = os.getenv("GOOGLE_CALLBACK_URL")

    def post(self, request, *args, **kwargs):
        if not (_GOOGLE_OK and _GOOGLE_VERIFY_OK):
            return Response({"error": "Google login not configured on this server."},
                            status=status.HTTP_501_NOT_IMPLEMENTED)

        token = request.data.get("access_token")
        if not token:
            return Response({"error": "Missing access_token"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = id_token.verify_oauth2_token(  # type: ignore
                token,
                requests.Request(),  # type: ignore
                os.getenv("GOOGLE_CLIENT_ID"),
            )
            email = idinfo.get("email")
            name = idinfo.get("name", "")

            if not email:
                return Response({"error": "Google token missing email"}, status=status.HTTP_400_BAD_REQUEST)

            user, created = User.objects.get_or_create(email=email)
            if created:
                user.is_active = True
                parts = (name or "").split()
                if hasattr(user, "first_name"):
                    user.first_name = parts[0] if parts else ""
                if hasattr(user, "last_name"):
                    user.last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
                user.save()

            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "email": user.email,
                    "name": name,
                    "message": "Google login successful",
                },
                status=status.HTTP_200_OK,
            )

        except ValueError as ve:
            return Response({"error": "Invalid Google token", "details": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ====================================================================
# Password Reset
# ====================================================================
class PasswordResetRequestView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password reset email sent."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


# ====================================================================
# Studio Master (catalog)
# ====================================================================
# api/views.py
# api/views.py
from django.db import transaction
from rest_framework import viewsets, filters, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser

from .models import StudioMaster, StudioImage
from .serializers import StudioMasterSerializer, StudioImageSerializer
from .permissions import IsStaffOrRoleAdmin

class DefaultPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 200

class StudioMasterViewSet(viewsets.ModelViewSet):
    # Prefetch images so serializer returns them in list endpoints
    queryset = StudioMaster.objects.all().order_by("name").prefetch_related("images")
    serializer_class = StudioMasterSerializer

    # Choose permission:
    # - For dev/user-created studios: IsAuthenticatedOrReadOnly
    # - For admin-only writes use IsStaffOrRoleAdmin
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "location", "area", "city", "state"]
    ordering_fields = ["name", "capacity", "hourly_rate", "updated_at", "created_at"]
    ordering = ["name"]

    def get_queryset(self):
        qs = super().get_queryset()
        is_active = self.request.query_params.get("is_active")
        city = self.request.query_params.get("city")
        if is_active is not None:
            if is_active.lower() in ("1", "true", "yes"):
                qs = qs.filter(is_active=True)
            elif is_active.lower() in ("0", "false", "no"):
                qs = qs.filter(is_active=False)
        if city:
            qs = qs.filter(city__iexact=city)
        return qs

    @transaction.atomic
    def perform_create(self, serializer):
        name = (serializer.validated_data.get("name") or "").strip()
        location = serializer.validated_data.get("location", "") or ""
        serializer.save(name=name, location=location)

    @transaction.atomic
    def perform_update(self, serializer):
        name = (serializer.validated_data.get("name") or "").strip()
        location = serializer.validated_data.get("location", "") or ""
        serializer.save(name=name, location=location)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def toggle_active(self, request, pk=None):
        instance = self.get_object()
        instance.is_active = not instance.is_active
        instance.save(update_fields=["is_active", "updated_at"])
        return Response({"id": instance.id, "is_active": instance.is_active}, status=status.HTTP_200_OK)


class StudioImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, studio_pk, *args, **kwargs):
        try:
            studio = StudioMaster.objects.get(pk=studio_pk)
        except StudioMaster.DoesNotExist:
            return Response({"detail": "Studio not found."}, status=status.HTTP_404_NOT_FOUND)

        files = request.FILES.getlist("images")
        if not files:
            return Response({"detail": "No files uploaded. Use field 'images'."}, status=status.HTTP_400_BAD_REQUEST)

        created_objs = []
        for f in files:
            si = StudioImage.objects.create(studio=studio, image=f)
            created_objs.append(si)

        serializer = StudioImageSerializer(created_objs, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, studio_pk, image_pk=None, *args, **kwargs):
        if image_pk is None:
            return Response({"detail": "Image id required in URL."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            img = StudioImage.objects.get(pk=image_pk, studio_id=studio_pk)
        except StudioImage.DoesNotExist:
            return Response({"detail": "Image not found."}, status=status.HTTP_404_NOT_FOUND)
        img.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class WhoAmI(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        u = request.user
        return Response({
            "id": getattr(u, "id", None),
            "email": getattr(u, "email", None),
            "mobile_no": getattr(u, "mobile_no", None),
            "is_staff": getattr(u, "is_staff", False),
            "is_superuser": getattr(u, "is_superuser", False),
            "role": getattr(u, "role", None),
        })


# ====================================================================
# Studios (bookings)
# ====================================================================
class StudioViewSet(viewsets.ModelViewSet):
    queryset = Studio.objects.all()
    serializer_class = StudioSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["studio_name", "customer", "email", "contact_number", "address", "payment_methods"]
    ordering_fields = ["date", "time_slot", "duration", "created_at"]
    ordering = ["-date", "-time_slot"]

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        try:
            days = int(request.query_params.get("days", 7))
        except ValueError:
            days = 7
        today = now().date()
        qs = (
            self.get_queryset()
            .filter(date__gte=today, date__lte=today + timedelta(days=days))
            .order_by("date", "time_slot")
        )
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def by_date(self, request):
        target = request.query_params.get("date")
        if not target:
            return Response({"error": "Missing 'date' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(date=target).order_by("time_slot")
        return Response(self.get_serializer(qs, many=True).data)


# ====================================================================
# Private Bookings
# ====================================================================
class PrivateBookingViewSet(viewsets.ModelViewSet):
    queryset = PrivateBooking.objects.all().order_by("-id")
    serializer_class = PrivateBookingSerializer
    pagination_class = DefaultPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["customer", "event_type", "venue", "email", "contact_number", "address", "notes"]
    ordering_fields = ["date", "time_slot", "duration", "guest_count", "created_at"]
    ordering = ["-date", "-time_slot"]

    @action(detail=False, methods=["get"])
    def by_date(self, request):
        target = request.query_params.get("date")
        if not target:
            return Response({"error": "Missing 'date' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(date=target).order_by("time_slot")
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        qs = self.get_queryset()
        total = qs.count()
        total_duration = sum(float(x.duration or 0) for x in qs)
        avg_duration = round(total_duration / total, 2) if total else 0.0
        total_guests = sum(int(x.guest_count or 0) for x in qs)
        return Response({"total_bookings": total, "avg_duration": avg_duration, "total_guests": total_guests})


# ====================================================================
# Events
# ====================================================================
class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "location", "description"]
    ordering_fields = ["date", "ticket_price", "created_at"]
    ordering = ["-date"]

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        try:
            days = int(request.query_params.get("days", 30))
        except ValueError:
            days = 30
        today = now().date()
        qs = (
            self.get_queryset()
            .filter(date__gte=today, date__lte=today + timedelta(days=days))
            .order_by("date")
        )
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def by_location(self, request):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"error": "Missing 'q' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(location__icontains=q).order_by("-date")
        return Response(self.get_serializer(qs, many=True).data)


# ====================================================================
# Shows
# ====================================================================
class ShowViewSet(viewsets.ModelViewSet):
    queryset = Show.objects.all()
    serializer_class = ShowSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "location", "description"]
    ordering_fields = ["date", "ticket_price", "created_at"]
    ordering = ["-date"]

    @action(detail=False, methods=["get"])
    def upcoming(self, request):
        try:
            days = int(request.query_params.get("days", 30))
        except ValueError:
            days = 30
        today = now().date()
        qs = (
            self.get_queryset()
            .filter(date__gte=today, date__lte=today + timedelta(days=days))
            .order_by("date")
        )
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def by_location(self, request):
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"error": "Missing 'q' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(location__icontains=q).order_by("-date")
        return Response(self.get_serializer(qs, many=True).data)


# ====================================================================
# Photography (OLD NAMES)
# ====================================================================
class PhotographyBookingViewSet(viewsets.ModelViewSet):
    queryset = PhotographyBooking.objects.all().order_by("-date", "-created_at")
    serializer_class = PhotographyBookingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.JSONParser, parsers.FormParser]  # no uploads
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["client", "email", "contact_number", "event_type", "package_type", "location", "notes"]
    ordering_fields = ["date", "created_at", "price", "photographers_count", "videographers_count"]
    ordering = ["-date", "-created_at"]

    @action(detail=False, methods=["get"])
    def today(self, request):
        qs = self.get_queryset().filter(date=now().date())
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(qs, many=True).data)


# ====================================================================
# Payments
# ====================================================================
class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["customer", "method"]
    ordering_fields = ["amount", "date", "created_at"]
    ordering = ["-date"]

    @action(detail=False, methods=["get"])
    def total(self, request):
        agg = self.get_queryset().aggregate(total=Sum("amount"))
        total_amount = agg["total"] or 0
        return Response({"total_collected": total_amount})


# ====================================================================
# Videography
# ====================================================================
class VideographyViewSet(viewsets.ModelViewSet):
    """
    /api/auth/videography/
    """
    queryset = Videography.objects.all().order_by("-created_at")
    serializer_class = VideographySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # search + ordering
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]

    # search across common text fields
    search_fields = [
        "client_name",
        "project",
        "editor",
        "email",
        "mobile_no",
        "location",
        "package_type",
        "payment_method",
        "notes",
    ]

    # allow UI to sort by these columns
    ordering_fields = [
        "created_at",
        "updated_at",
        "shoot_date",
        "start_time",
        "duration_hours",
        "project",
        "editor",
        "package_type",
        "payment_method",
    ]

    # default table order
    ordering = ["-created_at"]


# ====================================================================
# Equipment (master)
# ====================================================================
class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "sku", "description"]
    ordering_fields = ["name", "quantity_in_stock", "rate_per_day", "updated_at"]
    ordering = ["name"]

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        try:
            threshold = int(request.query_params.get("threshold", 3))
        except ValueError:
            threshold = 3
        qs = self.get_queryset().filter(quantity_in_stock__lte=threshold)
        data = self.get_serializer(qs, many=True).data
        return Response({"threshold": threshold, "results": data})

    @action(detail=False, methods=["get"])
    def available(self, request):
        target = request.query_params.get("date")
        if not target:
            return Response({"error": "Missing 'date' parameter."}, status=status.HTTP_400_BAD_REQUEST)

        eq_id = request.query_params.get("equipment")
        base_qs = self.get_queryset()
        if eq_id:
            base_qs = base_qs.filter(id=eq_id)

        rented = (
            EquipmentRental.objects.filter(rental_date=target)
            .exclude(status__in=["returned", "cancelled"])
            .values("equipment")
            .annotate(qty=Sum("quantity"))
        )
        rented_map = {r["equipment"]: r["qty"] or 0 for r in rented}

        results = []
        for e in base_qs:
            booked = rented_map.get(e.id, 0)
            available = max(0, (e.quantity_in_stock or 0) - booked)
            results.append({
                "id": e.id,
                "name": e.name,
                "quantity_in_stock": e.quantity_in_stock,
                "booked_on_date": booked,
                "available_on_date": available,
            })
        return Response({"date": target, "results": results})


# ====================================================================
# Equipment Rentals
# ====================================================================
class EquipmentRentalViewSet(viewsets.ModelViewSet):
    queryset = EquipmentRental.objects.select_related("equipment", "created_by").all()
    serializer_class = EquipmentRentalSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["customer_name", "equipment__name", "status"]
    ordering_fields = ["rental_date", "return_date", "created_at", "total_price"]
    ordering = ["-created_at"]

    @action(detail=False, methods=["get"])
    def by_equipment(self, request):
        eq_id = request.query_params.get("id")
        if not eq_id:
            return Response({"error": "Missing 'id' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(equipment_id=eq_id)
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def on_date(self, request):
        target = request.query_params.get("date")
        if not target:
            return Response({"error": "Missing 'date' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(rental_date=target).exclude(status__in=["returned", "cancelled"])
        return Response(self.get_serializer(qs, many=True).data)


# ====================================================================
# Flat Equipment Entry (UI)
# ====================================================================
class EquipmentEntryViewSet(viewsets.ModelViewSet):
    queryset = EquipmentEntry.objects.all().order_by("-created_at")
    serializer_class = EquipmentEntrySerializer
    pagination_class = DefaultPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.JSONParser, parsers.FormParser, parsers.MultiPartParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "category", "brand", "status", "rented_by"]
    ordering_fields = ["created_at", "price_per_day", "name"]
    ordering = ["-created_at"]


# ====================================================================
# Sound System (Service)
# ====================================================================
class SoundViewSet(viewsets.ModelViewSet):
    """
    /api/auth/sound/
    """
    queryset = Sound.objects.all().order_by("-event_date", "-created_at")
    serializer_class = SoundSerializer
    pagination_class = DefaultPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.JSONParser, parsers.FormParser, parsers.MultiPartParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "client_name", "email", "mobile_no",
        "system_type", "location", "mixer_model", "notes"
    ]
    ordering_fields = [
        "event_date", "created_at", "price",
        "speakers_count", "microphones_count", "system_type"
    ]
    ordering = ["-event_date", "-created_at"]

    @action(detail=False, methods=["get"])
    def today(self, request):
        """Quick filter for today's sound jobs."""
        qs = self.get_queryset().filter(event_date=now().date())
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(qs, many=True).data)






# ====================================================================
# Singer Master (Service)
# ====================================================================

from rest_framework import viewsets, permissions
from .models import Singer
from .serializers import SingerSerializer
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class SingerViewSet(viewsets.ModelViewSet):
    queryset = Singer.objects.all()
    serializer_class = SingerSerializer
    permission_classes = [permissions.IsAuthenticated]  # adjust as needed
    parser_classes = [MultiPartParser, FormParser, JSONParser]




