# User_Dashboard/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    PublicStudioViewSet,
    UserStudioBookingViewSet,
    UserPhotographyBookingViewSet,
    PublicEventViewSet,
    UserEventBookingViewSet,
)

router = DefaultRouter()

# existing
router.register(r"studios", PublicStudioViewSet, basename="user-studios")
router.register(r"studio-bookings", UserStudioBookingViewSet, basename="user-studio-bookings")
router.register(r"photography-bookings", UserPhotographyBookingViewSet, basename="user-photography-bookings")

# ⭐ new
router.register(r"events", PublicEventViewSet, basename="user-events")
router.register(r"event-bookings", UserEventBookingViewSet, basename="user-event-bookings")

urlpatterns = [
    path("", include(router.urls)),
]
