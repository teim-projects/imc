from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.contrib.auth import views as auth_views

from .views import (
    StudioViewSet,
    EventViewSet,
    ShowViewSet,
    PaymentViewSet,
    VideographyViewSet,
    EquipmentViewSet,
    EquipmentRentalViewSet,
    GoogleLogin,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    EquipmentEntryViewSet,
)

# ==========================================================
# 🚀 DRF ROUTER — All CRUD Endpoints
# ==========================================================
router = DefaultRouter()

# Existing Modules
router.register(r"studios", StudioViewSet, basename="studios")
router.register(r"events", EventViewSet, basename="events")
router.register(r"shows", ShowViewSet, basename="shows")
router.register(r"payments", PaymentViewSet, basename="payments")
router.register(r"videography", VideographyViewSet, basename="videography")


# Master + Rentals (keep only if serializers exist)
router.register(r"equipment-master", EquipmentViewSet, basename="equipment-master")
router.register(r"equipment-rentals", EquipmentRentalViewSet, basename="equipment-rentals")

# Flat UI endpoint used by your React EquipmentForm.jsx
router.register(r"equipment", EquipmentEntryViewSet, basename="equipment")
# 🌐 URL Patterns
# ==========================================================
urlpatterns = [
    # Main API routes (Model CRUD)
    path("", include(router.urls)),

    # dj-rest-auth (login, logout, password change, user detail)
    path("dj-rest-auth/", include("dj_rest_auth.urls")),

    # dj-rest-auth registration (signup)
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),

    # Google OAuth login
    path("auth/google/", GoogleLogin.as_view(), name="google_login"),

    # Password reset request
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),

    # Password reset confirmation
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]
