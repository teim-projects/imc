# api/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from django.http import HttpResponse
from django.utils import timezone
import csv

from .models import (
    # Core
    CustomUser,
    # CRM / Ops
    Studio,
    Event,
    Show,
    Payment,
    Videography,
    # New registrations
    PrivateBooking,
    PhotographyBooking,
    Sound,  # ✅ use Sound (not SoundSetup)
)

# Try to import equipment-related models; they may or may not exist in this codebase
try:
    from .models import Equipment
except Exception:
    Equipment = None

try:
    from .models import EquipmentRental
except Exception:
    EquipmentRental = None

try:
    from .models import EquipmentEntry
except Exception:
    EquipmentEntry = None


# =========================
# ======= UTILITIES =======
# =========================

def export_as_csv_action(description="Export selected as CSV", fields=None, header=True):
    """
    Reusable admin action to export selected objects to CSV.
    `fields` may be a list of model field names or callables on the ModelAdmin.
    """
    def export_as_csv(modeladmin, request, queryset):
        opts = modeladmin.model._meta
        field_names = fields or [field.name for field in opts.fields]

        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            f"attachment; filename={opts.model_name}_export_"
            f"{timezone.now().strftime('%Y%m%d_%H%M%S')}.csv"
        )
        writer = csv.writer(response)

        if header:
            writer.writerow(field_names)

        for obj in queryset:
            row = []
            for field in field_names:
                # Allow ModelAdmin callables (e.g., equipment_name on EquipmentRentalAdmin)
                if hasattr(modeladmin, field) and callable(getattr(modeladmin, field)):
                    row.append(getattr(modeladmin, field)(obj))
                else:
                    row.append(getattr(obj, field, ""))
            writer.writerow(row)
        return response

    export_as_csv.short_description = description
    return export_as_csv


# ===============================
# ======== STUDIO ADMIN =========
# ===============================

@admin.register(Studio)
class StudioAdmin(admin.ModelAdmin):
    list_display = (
        "studio_name",
        "customer",
        "date",
        "time_slot",
        "duration",
        "payment_methods",
        "created_at",
    )
    search_fields = ("studio_name", "customer", "email", "contact_number", "address")
    list_filter = ("studio_name", "date")
    ordering = ("-date", "-time_slot")
    list_per_page = 25
    date_hierarchy = "date"
    readonly_fields = ("created_at", "updated_at")

    actions = [
        export_as_csv_action(fields=[
            "id", "studio_name", "customer", "email", "contact_number", "address",
            "date", "time_slot", "duration", "payment_methods", "created_at"
        ])
    ]


# ==============================
# ========= EVENT ADMIN ========
# ==============================

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("title", "location", "date", "ticket_price", "created_at")
    search_fields = ("title", "location")
    list_filter = ("date",)
    ordering = ("-date",)
    list_per_page = 25
    date_hierarchy = "date"
    readonly_fields = ("created_at", "updated_at")

    actions = [
        export_as_csv_action(fields=["id", "title", "location", "date", "ticket_price", "created_at"])
    ]


# ==============================
# ========= SHOW ADMIN =========
# ==============================

@admin.register(Show)
class ShowAdmin(admin.ModelAdmin):
    list_display = ("title", "location", "date", "ticket_price", "created_at")
    search_fields = ("title", "location")
    list_filter = ("date",)
    ordering = ("-date",)
    list_per_page = 25
    date_hierarchy = "date"
    readonly_fields = ("created_at", "updated_at")

    actions = [
        export_as_csv_action(fields=["id", "title", "location", "date", "ticket_price", "created_at"])
    ]


# =================================
# ========= PAYMENT ADMIN =========
# =================================

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("customer", "amount", "method", "date", "created_at")
    search_fields = ("customer", "method")
    list_filter = ("method", "date")
    ordering = ("-date",)
    list_per_page = 25
    date_hierarchy = "date"
    readonly_fields = ("created_at", "updated_at")

    actions = [
        export_as_csv_action(fields=["id", "customer", "amount", "method", "date", "created_at"])
    ]


# ======================================
# ========= VIDEOGRAPHY ADMIN ==========
# ======================================
@admin.register(Videography)
class VideographyAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "client_name",
        "project",
        "editor",
        "shoot_date",
        "start_time",
        "duration_display",
        "package_type",
        "payment_method",
        "created_at",
    )
    search_fields = (
        "client_name",
        "email",
        "mobile_no",
        "project",
        "editor",
        "location",
        "notes",
    )
    list_filter = ("shoot_date", "package_type", "payment_method", "editor")
    ordering = ("-shoot_date", "-created_at")
    list_per_page = 25
    date_hierarchy = "shoot_date"
    readonly_fields = ("created_at", "updated_at")

    actions = [
        export_as_csv_action(fields=[
            "id",
            "client_name", "email", "mobile_no",
            "project", "editor",
            "shoot_date", "start_time", "duration_hours",
            "location", "package_type", "payment_method",
            "notes",
            "created_at",
        ])
    ]

    def duration_display(self, obj):
        if obj.duration_hours is None:
            return "-"
        return f"{float(obj.duration_hours):g} hrs"
    duration_display.short_description = "Duration (hrs)"
    duration_display.admin_order_field = "duration_hours"


# ======================================
# ======== PRIVATE BOOKING ADMIN =======
# ======================================

@admin.register(PrivateBooking)
class PrivateBookingAdmin(admin.ModelAdmin):
    list_display = (
        "id", "customer", "event_type", "venue",
        "date", "time_slot", "duration", "guest_count", "created_at",
    )
    search_fields = ("customer", "event_type", "venue", "email", "contact_number", "address", "notes")
    list_filter = ("event_type", "date", "venue")
    ordering = ("-date", "-time_slot")
    list_per_page = 30
    date_hierarchy = "date"
    readonly_fields = ("created_at", "updated_at")

    actions = [
        export_as_csv_action(fields=[
            "id", "customer", "event_type", "venue",
            "date", "time_slot", "duration", "guest_count",
            "created_at"
        ])
    ]


# ==========================================
# ======== PHOTOGRAPHY BOOKING ADMIN =======
# ==========================================

@admin.register(PhotographyBooking)
class PhotographyBookingAdmin(admin.ModelAdmin):
    list_display = (
        "id", "client", "event_type", "package_type",
        "date", "start_time", "duration_hours",
        "location", "photographers_count", "videographers_count",
        "price", "discount", "tax_percent", "created_at",
    )
    search_fields = ("client", "email", "contact_number", "location", "notes", "event_type", "package_type")
    list_filter = ("event_type", "package_type", "date")
    ordering = ("-date", "-created_at")
    list_per_page = 30
    date_hierarchy = "date"
    readonly_fields = ("created_at", "updated_at")

    actions = [
        export_as_csv_action(fields=[
            "id", "client", "email", "contact_number",
            "event_type", "package_type",
            "date", "start_time", "duration_hours",
            "location", "photographers_count", "videographers_count",
            "price", "discount", "tax_percent",
            "payment_methods", "created_at"
        ])
    ]


# ======================================
# ========= SOUND ADMIN (NEW) ==========
# ======================================

@admin.register(Sound)
class SoundAdmin(admin.ModelAdmin):
    list_display = (
        "id", "client_name", "system_type", "event_date",
        "location", "payment_method", "price", "created_at",
    )
    search_fields = ("client_name", "email", "mobile_no", "system_type", "location", "mixer_model", "notes")
    list_filter = ("event_date", "payment_method", "system_type")
    ordering = ("-event_date", "-created_at")
    list_per_page = 30
    date_hierarchy = "event_date"
    readonly_fields = ("created_at",)

    actions = [
        export_as_csv_action(fields=[
            "id", "client_name", "email", "mobile_no",
            "system_type", "speakers_count", "microphones_count", "mixer_model",
            "event_date", "location", "price", "payment_method", "notes", "created_at"
        ])
    ]


# ======================================
# ========= EQUIPMENT / RENTALS =========
# ======================================

# ---------- Inline for rentals under Equipment master ----------
if EquipmentRental is not None:
    class EquipmentRentalInline(admin.TabularInline):
        model = EquipmentRental
        extra = 0
        fields = ("customer_name", "rental_date", "return_date", "quantity", "status", "total_price")
        readonly_fields = ("total_price",)
        show_change_link = True
else:
    EquipmentRentalInline = None


# ---------- Equipment master (optional) ----------
if Equipment is not None:
    class _EquipmentAdmin(admin.ModelAdmin):
        list_display = ("name", "sku", "quantity_in_stock", "rate_per_day", "is_active", "updated_at")
        search_fields = ("name", "sku", "description")
        list_filter = ("is_active",)
        ordering = ("name",)
        list_per_page = 25
        readonly_fields = ("created_at", "updated_at")
        actions = [
            export_as_csv_action(fields=[
                "id", "name", "sku", "quantity_in_stock", "rate_per_day",
                "is_active", "created_at", "updated_at"
            ])
        ]
        if EquipmentRentalInline is not None:
            inlines = [EquipmentRentalInline]

    admin.site.register(Equipment, _EquipmentAdmin)


# ---------- Equipment Rental (optional) ----------
if EquipmentRental is not None:
    class _EquipmentRentalAdmin(admin.ModelAdmin):
        list_display = (
            "id",
            "equipment_name",
            "quantity",
            "rental_date",
            "return_date",
            "customer_name",
            "status",
            "total_price",
            "created_at",
        )
        list_select_related = ("equipment", "created_by")
        search_fields = ("customer_name", "equipment__name", "status")
        list_filter = ("status", "rental_date", "equipment")
        date_hierarchy = "rental_date"
        ordering = ("-created_at",)
        list_per_page = 30

        readonly_fields = ("rate_per_day_snapshot", "total_price", "created_at", "updated_at")

        fieldsets = (
            (None, {"fields": ("equipment", "quantity", "status")}),
            (_("Dates"), {"fields": ("rental_date", "return_date")}),
            (_("Customer"), {"fields": ("customer_name", "customer_contact")}),
            (_("Pricing"), {"fields": ("rate_per_day_snapshot", "total_price")}),
            (_("Meta"), {"fields": ("created_by", "notes", "created_at", "updated_at")}),
        )

        def equipment_name(self, obj):
            return obj.equipment.name
        equipment_name.admin_order_field = "equipment__name"
        equipment_name.short_description = "Equipment"

        # ----- Actions -----
        def mark_returned(self, request, queryset):
            updated = queryset.update(status="returned")
            self.message_user(request, f"{updated} rental(s) marked as Returned.")
        mark_returned.short_description = "Mark selected as Returned"

        def mark_cancelled(self, request, queryset):
            updated = queryset.update(status="cancelled")
            self.message_user(request, f"{updated} rental(s) marked as Cancelled.")
        mark_cancelled.short_description = "Mark selected as Cancelled"

        actions = [
            mark_returned,
            mark_cancelled,
            export_as_csv_action(fields=[
                "id", "equipment_name", "quantity", "rental_date", "return_date",
                "customer_name", "status", "rate_per_day_snapshot", "total_price", "created_at"
            ])
        ]

    admin.site.register(EquipmentRental, _EquipmentRentalAdmin)


# ---------- Flat EquipmentEntry (drives your React UI) ----------
if EquipmentEntry is not None:
    class _EquipmentEntryAdmin(admin.ModelAdmin):
        list_display = (
            "id", "name", "category", "brand", "status",
            "price_per_day", "available_quantity", "created_at"
        )
        search_fields = ("name", "category", "brand", "rented_by")
        list_filter = ("status", "category", "brand")
        ordering = ("-created_at",)
        list_per_page = 30
        readonly_fields = ("created_at", "updated_at")

        actions = [
            export_as_csv_action(fields=[
                "id", "name", "category", "brand", "status",
                "price_per_day", "available_quantity",
                "rented_by", "rental_date", "return_date",
                "created_at", "updated_at"
            ])
        ]

    admin.site.register(EquipmentEntry, _EquipmentEntryAdmin)


# ==================================
# ========= CUSTOM USER ADMIN =======
# ==================================

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Admin for your AbstractBaseUser-based CustomUser.
    """
    # Columns in changelist
    list_display = ("id", "email", "mobile_no", "first_name", "last_name", "role", "is_active", "is_staff")
    list_filter = ("role", "is_active", "is_staff", "is_superuser", "groups")
    search_fields = ("email", "mobile_no", "first_name", "last_name")
    ordering = ("id",)
    list_per_page = 30
    save_on_top = True

    # Read-only
    readonly_fields = ("date_joined", "last_login")

    # Detail/edit form
    fieldsets = (
        (None, {"fields": ("email", "mobile_no", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "profile_photo", "role")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Important dates"), {"fields": ("date_joined", "last_login")}),
    )

    # Create form
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "mobile_no", "first_name", "last_name", "role", "password1", "password2"),
        }),
    )

    filter_horizontal = ("groups", "user_permissions")



