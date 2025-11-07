from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
  StudioViewSet, EventViewSet, ShowViewSet, PaymentViewSet,
  VideographyViewSet, EquipmentViewSet, EquipmentRentalViewSet,
  EquipmentEntryViewSet, PrivateBookingViewSet, PhotographyBookingViewSet,
  GoogleLogin, PasswordResetRequestView, PasswordResetConfirmView
)

router = DefaultRouter()
router.register(r"studios", StudioViewSet, basename="studios")
router.register(r"events", EventViewSet, basename="events")
router.register(r"shows", ShowViewSet, basename="shows")
router.register(r"payments", PaymentViewSet, basename="payments")
router.register(r"videography", VideographyViewSet, basename="videography")
router.register(r"private-bookings", PrivateBookingViewSet, basename="private-bookings")
router.register(r"auth/private-bookings", PrivateBookingViewSet, basename="auth-private-bookings")
router.register(r'photography', PhotographyBookingViewSet, basename='photography')


router.register(r"photography-bookings", PhotographyBookingViewSet, basename="photography-bookings")
router.register(r"equipment-master", EquipmentViewSet, basename="equipment-master")
router.register(r"equipment-rentals", EquipmentRentalViewSet, basename="equipment-rentals")
router.register(r"equipment", EquipmentEntryViewSet, basename="equipment")

urlpatterns = [
    path("", include(router.urls)),
    path("dj-rest-auth/", include("dj_rest_auth.urls")),
    path("dj-rest-auth/registration/", include("dj_rest_auth.registration.urls")),
    path("auth/google/", GoogleLogin.as_view(), name="google_login"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
]
