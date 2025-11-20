# User_Dashboard/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import PublicStudioViewSet, UserStudioBookingViewSet

router = DefaultRouter()
# /user/studios/
router.register(r"studios", PublicStudioViewSet, basename="user-studios")
# /user/studio-bookings/
router.register(r"studio-bookings", UserStudioBookingViewSet, basename="user-studio-bookings")

urlpatterns = [
    path("", include(router.urls)),
]
