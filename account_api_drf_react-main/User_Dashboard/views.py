# User_Dashboard/views.py
from rest_framework import viewsets, permissions, filters
from rest_framework.response import Response
from rest_framework.decorators import action

from api.models import StudioMaster
from .models import UserStudioBooking
from .serializers import StudioPublicSerializer, UserStudioBookingSerializer


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Users may see their own bookings; staff can see all.
    """

    def has_object_permission(self, request, view, obj):
        # safe methods always allowed
        if request.method in permissions.SAFE_METHODS:
            if request.user.is_staff or request.user.is_superuser:
                return True
            return obj.user == request.user
        # write operations:
        if request.user.is_staff or request.user.is_superuser:
            return True
        return obj.user == request.user


class PublicStudioViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only list of active studios for the user side.
    """
    queryset = StudioMaster.objects.filter(is_active=True).order_by("name")
    serializer_class = StudioPublicSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "location", "city", "area", "state"]
    ordering_fields = ["name", "hourly_rate", "capacity"]
    ordering = ["name"]


class UserStudioBookingViewSet(viewsets.ModelViewSet):
    """
    User / customer bookings.
    - Authenticated user: sees only their bookings (unless staff).
    - Anonymous: can create bookings, but cannot list (for safety).
    """

    serializer_class = UserStudioBookingSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["customer_name", "email", "contact_number", "studio__name"]
    ordering_fields = ["date", "time_slot", "created_at"]
    ordering = ["-date", "-time_slot"]

    def get_queryset(self):
        qs = UserStudioBooking.objects.select_related("studio")
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return qs
        if user.is_authenticated:
            return qs.filter(user=user)
        # anonymous – no listing, only create allowed
        return qs.none()

    def perform_create(self, serializer):
        serializer.save()
        # user assignment is already done in serializer.create()

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my(self, request, *args, **kwargs):
        """
        GET /user/studio-bookings/my/ => current user's bookings.
        """
        qs = self.get_queryset()
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)
