# api/views.py

from datetime import timedelta
import os

from django.contrib.auth import get_user_model
from django.db.models import Sum, Q
from django.utils.timezone import now

from rest_framework import viewsets, filters, status, permissions, parsers
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

# Google social login (optional)
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from google.oauth2 import id_token  # type: ignore
from google.auth.transport import requests  # type: ignore

# ---------- Models ----------
from .models import (
    Studio, Event, Show, Payment, Videography,
    Equipment, EquipmentRental, EquipmentEntry,
)

# ---------- Serializers ----------
from .serializers import (
    StudioSerializer,
    EventSerializer,
    ShowSerializer,
    PaymentSerializer,
    VideographySerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    # Equipment (master + rental + flat UI)
    EquipmentSerializer,
    EquipmentRentalSerializer,
    EquipmentEntrySerializer,
)

from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


# ============================================================================
#                              Pagination
# ============================================================================
class DefaultPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


# ============================================================================
#                        Google OAuth2 Login (JWT)
# ============================================================================
class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = os.getenv("GOOGLE_CALLBACK_URL")

    def post(self, request, *args, **kwargs):
        """
        Verify Google token → get/create user → issue JWT tokens.
        Expected payload: { "access_token": "<google_id_token>" }
        """
        token = request.data.get("access_token")
        if not token:
            return Response({"error": "Missing access_token"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                os.getenv("GOOGLE_CLIENT_ID"),
            )

            email = idinfo.get("email")
            name = idinfo.get("name", "")
            picture = idinfo.get("picture", "")

            if not email:
                return Response({"error": "Google token missing email"}, status=status.HTTP_400_BAD_REQUEST)

            user, created = User.objects.get_or_create(email=email)
            if created:
                user.is_active = True
                if hasattr(user, "first_name") and hasattr(user, "last_name") and name:
                    parts = name.split()
                    user.first_name = parts[0]
                    user.last_name = " ".join(parts[1:]) if len(parts) > 1 else ""
                # If you want to store picture → custom handling needed for ImageField
                user.save()

            refresh = RefreshToken.for_user(user)
            data = {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "email": user.email,
                "name": name,
                "message": "Google login successful",
            }
            return Response(data, status=status.HTTP_200_OK)

        except ValueError as ve:
            return Response({"error": "Invalid Google token", "details": str(ve)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================================================
#                     Password Reset (Request & Confirm)
# ============================================================================
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
        # serializer returns {"detail": "..."} on success
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


# ============================================================================
#                                Studios
# ============================================================================
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
        """GET /api/studios/upcoming/?days=7"""
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
        """GET /api/studios/by_date/?date=YYYY-MM-DD"""
        target = request.query_params.get("date")
        if not target:
            return Response({"error": "Missing 'date' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(date=target).order_by("time_slot")
        return Response(self.get_serializer(qs, many=True).data)


# ============================================================================
#                                Events
# ============================================================================
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
        """GET /api/events/upcoming/?days=30"""
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
        """GET /api/events/by_location/?q=Mumbai"""
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"error": "Missing 'q' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(location__icontains=q).order_by("-date")
        return Response(self.get_serializer(qs, many=True).data)


# ============================================================================
#                                 Shows
# ============================================================================
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
        """GET /api/shows/upcoming/?days=30"""
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
        """GET /api/shows/by_location/?q=Pune"""
        q = request.query_params.get("q", "").strip()
        if not q:
            return Response({"error": "Missing 'q' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(location__icontains=q).order_by("-date")
        return Response(self.get_serializer(qs, many=True).data)


# ============================================================================
#                                Payments
# ============================================================================
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
        """GET /api/payments/total/  -> {"total_collected": 12345.67}"""
        agg = self.get_queryset().aggregate(total=Sum("amount"))
        total_amount = agg["total"] or 0
        return Response({"total_collected": total_amount})


# ============================================================================
#                             Videography
# ============================================================================
class VideographyViewSet(viewsets.ModelViewSet):
    queryset = Videography.objects.all()
    serializer_class = VideographySerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["project", "editor", "remarks"]
    ordering_fields = ["duration", "delivery_date", "created_at"]
    ordering = ["-created_at"]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """
        GET /api/videography/stats/
        -> {"total_projects": N, "total_duration_hours": X, "average_duration_hours": Y}
        """
        projects = self.get_queryset()
        count = projects.count()
        total_duration = sum(float(p.duration or 0) for p in projects)
        avg_duration = round(total_duration / count, 2) if count else 0
        return Response(
            {"total_projects": count, "total_duration_hours": total_duration, "average_duration_hours": avg_duration}
        )


# ============================================================================
#                            Equipment (Master)
# ============================================================================
class EquipmentViewSet(viewsets.ModelViewSet):
    """
    CRUD for rentable equipment (inventory master).
    """
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "sku", "description"]
    ordering_fields = ["name", "quantity_in_stock", "rate_per_day", "updated_at"]
    ordering = ["name"]

    @action(detail=False, methods=["get"])
    def low_stock(self, request):
        """
        GET /api/equipment/low_stock/?threshold=3
        """
        try:
            threshold = int(request.query_params.get("threshold", 3))
        except ValueError:
            threshold = 3
        qs = self.get_queryset().filter(quantity_in_stock__lte=threshold)
        data = self.get_serializer(qs, many=True).data
        return Response({"threshold": threshold, "results": data})

    @action(detail=False, methods=["get"])
    def available(self, request):
        """
        GET /api/equipment/available/?date=YYYY-MM-DD[&equipment=<id>]
        """
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


# ============================================================================
#                           Equipment Rentals
# ============================================================================
class EquipmentRentalViewSet(viewsets.ModelViewSet):
    """
    Rental bookings that decrease available quantity on a date.
    """
    queryset = EquipmentRental.objects.select_related("equipment", "created_by").all()
    serializer_class = EquipmentRentalSerializer
    pagination_class = DefaultPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["customer_name", "equipment__name", "status"]
    ordering_fields = ["rental_date", "return_date", "created_at", "total_price"]
    ordering = ["-created_at"]

    @action(detail=False, methods=["get"])
    def by_equipment(self, request):
        """GET /api/equipment-rentals/by_equipment/?id=<equipment_id>"""
        eq_id = request.query_params.get("id")
        if not eq_id:
            return Response({"error": "Missing 'id' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(equipment_id=eq_id)
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=["get"])
    def on_date(self, request):
        """GET /api/equipment-rentals/on_date/?date=YYYY-MM-DD"""
        target = request.query_params.get("date")
        if not target:
            return Response({"error": "Missing 'date' parameter."}, status=status.HTTP_400_BAD_REQUEST)
        qs = self.get_queryset().filter(rental_date=target).exclude(status__in=["returned", "cancelled"])
        return Response(self.get_serializer(qs, many=True).data)


# ============================================================================
#                    Flat UI Endpoint (your React form)
# ============================================================================
class EquipmentEntryViewSet(viewsets.ModelViewSet):
    """
    Simplified, flat equipment endpoint that your React UI calls:
    GET/POST: /api/auth/equipment/
    """
    queryset = EquipmentEntry.objects.all().order_by("-created_at")
    serializer_class = EquipmentEntrySerializer
    pagination_class = DefaultPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = [parsers.JSONParser, parsers.FormParser, parsers.MultiPartParser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "category", "brand", "status", "rented_by"]
    ordering_fields = ["created_at", "price_per_day", "name"]
    ordering = ["-created_at"]
