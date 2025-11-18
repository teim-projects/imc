# api/models.py
from decimal import Decimal
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone

# ============================================================
# ===============  UTIL / LEGACY MIGRATION HOOK  =============
# ============================================================

def upload_image_to(instance, filename):
    """
    Legacy helper retained so older migrations that reference
    api.models.upload_image_to continue to work.
    """
    return f"uploads/{filename}"

def user_profile_path(instance, filename):
    # e.g. media/profiles/42/avatar.png
    uid = instance.pk or "tmp"
    return f"profiles/{uid}/{filename}"


# ============================================================
# ===============  CUSTOM USER MODEL SECTION  ================
# ============================================================

class CustomUserManager(BaseUserManager):
    def create_user(self, email=None, mobile_no=None, password=None, **extra_fields):
        if not email and not mobile_no:
            raise ValueError("User must have either an email or mobile number")

        if email:
            email = self.normalize_email(email)
            extra_fields["email"] = email

        user = self.model(mobile_no=mobile_no, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, mobile_no, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", "admin")
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, mobile_no, password, **extra_fields)


class CustomUser(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("staff", "Staff"),
        ("customer", "Customer"),
    )

    username = None
    email = models.EmailField(unique=True, blank=True, null=True)
    mobile_no = models.CharField(max_length=15, unique=True, blank=True, null=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default="customer")

    # Use a deterministic folder per user
    profile_photo = models.ImageField(upload_to=user_profile_path, blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["mobile_no"]

    def __str__(self):
        return self.email if self.email else str(self.mobile_no)


# ============================================================
# ===================== STUDIO MASTER ========================
# ============================================================
# api/models.py
# api/models.py
from decimal import Decimal
from django.db import models

def studio_image_path(instance, filename):
    sid = getattr(instance.studio, "id", "tmp")
    return f"uploads/studios/{sid}/{filename}"

class StudioMaster(models.Model):
    name = models.CharField(max_length=120, unique=True)
    location = models.CharField(max_length=160, blank=True)
    area = models.CharField(max_length=160, blank=True, help_text="Area / locality (e.g., Andheri East)")
    city = models.CharField(max_length=120, blank=True, help_text="City (e.g., Mumbai)")
    state = models.CharField(max_length=120, blank=True, help_text="State (e.g., Maharashtra)")
    google_map_link = models.URLField(max_length=500, blank=True, help_text="Optional Google Maps URL")
    capacity = models.PositiveIntegerField(blank=True, null=True, help_text="Number of people the studio can hold")
    size_sq_ft = models.CharField(max_length=40, blank=True, help_text="Studio size in square feet (e.g., 1200). Stored as text")
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["city"]),
        ]

    def __str__(self):
        return self.name

    @property
    def full_location(self):
        parts = []
        if self.area:
            parts.append(self.area)
        if self.city:
            parts.append(self.city)
        if self.state:
            parts.append(self.state)
        if parts:
            return ", ".join(parts)
        return self.location or ""


class StudioImage(models.Model):
    studio = models.ForeignKey(StudioMaster, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to=studio_image_path)
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_primary", "-uploaded_at"]
        indexes = [
            models.Index(fields=["studio"]),
            models.Index(fields=["is_primary"]),
        ]

    def __str__(self):
        return f"Image {self.pk} for studio {getattr(self.studio, 'id', '?')}"


# ============================================================
# ===================== STUDIO BOOKING =======================
# ============================================================

class Studio(models.Model):
    # Customer Info
    customer = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # Studio Rental (kept as a plain name to preserve old data)
    studio_name = models.CharField(max_length=100)
    date = models.DateField()
    time_slot = models.TimeField(blank=True, null=True)  # "HH:MM" accepted
    duration = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        validators=[MinValueValidator(Decimal("0.5"))],
        help_text="Duration in hours",
    )

    # Payment Options (CSV; API can expose list)
    payment_methods = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Comma-separated: Card, UPI, NetBanking",
    )

    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Studio Booking"
        verbose_name_plural = "Studio Bookings"
        ordering = ["-date", "-time_slot"]
        constraints = [
            models.UniqueConstraint(
                fields=["studio_name", "date", "time_slot"],
                name="uniq_studio_date_timeslot",
            ),
        ]
        indexes = [
            models.Index(fields=["date", "time_slot"]),
            models.Index(fields=["studio_name"]),
        ]

    def __str__(self):
        return f"{self.studio_name} | {self.customer} | {self.date}"

    @property
    def payment_list(self):
        if not self.payment_methods:
            return []
        s = (self.payment_methods or "").strip()
        if not s:
            return []
        if "," not in s:
            return [s]
        return [x.strip() for x in s.split(",") if x.strip()]




# ============================================================
# ===================== STUDIO BOOKING =======================
# ============================================================

class Studio(models.Model):
    # Customer Info
    customer = models.CharField(max_length=100)
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # Studio Rental (kept as a plain name to preserve old data)
    studio_name = models.CharField(max_length=100)
    date = models.DateField()
    time_slot = models.TimeField(blank=True, null=True)  # "HH:MM" accepted
    duration = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        validators=[MinValueValidator(Decimal("0.5"))],
        help_text="Duration in hours",
    )

    # Payment Options (CSV; API can expose list)
    payment_methods = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Comma-separated: Card, UPI, NetBanking",
    )

    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Studio Booking"
        verbose_name_plural = "Studio Bookings"
        ordering = ["-date", "-time_slot"]
        constraints = [
            models.UniqueConstraint(
                fields=["studio_name", "date", "time_slot"],
                name="uniq_studio_date_timeslot",
            ),
        ]
        indexes = [
            models.Index(fields=["date", "time_slot"]),
            models.Index(fields=["studio_name"]),
        ]

    def __str__(self):
        return f"{self.studio_name} | {self.customer} | {self.date}"

    @property
    def payment_list(self):
        if not self.payment_methods:
            return []
        s = (self.payment_methods or "").strip()
        if not s:
            return []
        if "," not in s:
            return [s]
        return [x.strip() for x in s.split(",") if x.strip()]


# ============================================================
# ================== PRIVATE BOOKING MODEL ===================
# ============================================================

class PrivateBooking(models.Model):
    # Customer info
    customer = models.CharField(max_length=120)
    contact_number = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)

    # Event details
    event_type = models.CharField(max_length=120)   # Birthday / Wedding / Corporate / Party
    venue = models.CharField(max_length=160)

    # Schedule
    date = models.DateField()
    time_slot = models.TimeField(blank=True, null=True)
    duration = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(Decimal("0.1"))])

    # Extras
    guest_count = models.PositiveIntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    # Store checkbox array as JSON (works perfectly with React list)
    payment_methods = models.JSONField(default=list, blank=True)

    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-time_slot"]
        indexes = [
            models.Index(fields=["date", "time_slot"]),
            models.Index(fields=["event_type"]),
            models.Index(fields=["venue"]),
        ]

    def __str__(self):
        return f"{self.customer} • {self.event_type} • {self.date}"


# ============================================================
# ===================== PHOTOGRAPHY (OLD NAMES) ==============
# ============================================================

class PhotographyBooking(models.Model):
    client = models.CharField(max_length=160)
    email = models.EmailField(blank=True, null=True)
    contact_number = models.CharField(max_length=30, blank=True, null=True)

    event_type = models.CharField(max_length=80, default="Wedding")
    package_type = models.CharField(max_length=80, default="Standard")

    date = models.DateField()
    start_time = models.TimeField()
    duration_hours = models.PositiveIntegerField(default=2, validators=[MinValueValidator(1)])

    location = models.CharField(max_length=200)
    photographers_count = models.PositiveIntegerField(default=1)
    videographers_count = models.PositiveIntegerField(default=0)
    drone_needed = models.BooleanField(default=False)

    equipment_needed = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)

    price = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    tax_percent = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0"))

    # stored as CSV (UI sends a list)
    payment_methods = models.CharField(max_length=120, blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.client} • {self.event_type} • {self.date}"


# ============================================================
# ===================== EVENT MODEL ==========================
# ============================================================

class Event(models.Model):
    title = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    date = models.DateField()
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]
        verbose_name = "Event"
        verbose_name_plural = "Events"
        indexes = [
            models.Index(fields=["date"]),
            models.Index(fields=["location"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.date})"


# ============================================================
# ===================== SHOW MODEL ===========================
# ============================================================

class Show(models.Model):
    title = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    date = models.DateField()
    ticket_price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]
        verbose_name = "Show"
        verbose_name_plural = "Shows"
        indexes = [
            models.Index(fields=["date"]),
            models.Index(fields=["location"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.date})"


# ============================================================
# ===================== PAYMENT MODEL ========================
# ============================================================

class Payment(models.Model):
    PAYMENT_METHODS = [
        ("Card", "Credit/Debit Card"),
        ("UPI", "UPI"),
        ("NetBanking", "Net Banking"),
        ("Cash", "Cash"),
    ]
    customer = models.CharField(max_length=100)
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    method = models.CharField(max_length=50, choices=PAYMENT_METHODS)
    date = models.DateField(auto_now_add=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date"]
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        indexes = [
            models.Index(fields=["date"]),
            models.Index(fields=["method"]),
        ]

    def __str__(self):
        return f"{self.customer} - ₹{self.amount} via {self.method}"


# ============================================================
# ===================== VIDEOGRAPHY MODEL ====================
# ============================================================

class Videography(models.Model):
    PAYMENT_CHOICES = [
        ("Cash", "Cash"),
        ("Card", "Card"),
        ("UPI", "UPI"),
    ]
    PACKAGE_CHOICES = [
        ("Standard", "Standard"),
        ("Premium", "Premium"),
        ("Custom", "Custom"),
    ]

    # Basic client info
    client_name   = models.CharField(max_length=120, blank=True)
    email         = models.EmailField(blank=True)
    mobile_no     = models.CharField(max_length=20, blank=True)

    # Core job fields
    project       = models.CharField(max_length=150)
    editor        = models.CharField(max_length=120)
    shoot_date    = models.DateField()
    start_time    = models.TimeField(null=True, blank=True)

    # HOURS (non-null with default)
    duration_hours = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("1.00"))

    # Extra
    location      = models.CharField(max_length=150, blank=True)
    package_type  = models.CharField(max_length=20, choices=PACKAGE_CHOICES, default="Standard")
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default="Cash")
    notes         = models.TextField(blank=True)

    # Meta
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-shoot_date", "-created_at")

    def __str__(self):
        return f"{self.project} — {self.editor} ({self.shoot_date})"


# ===============================================
# ============  EQUIPMENT (MASTER)  =============
# ===============================================

class Equipment(models.Model):
    """
    Master catalog of rentable equipment (with inventory tracking).
    Use along with EquipmentRental for stock-aware bookings.
    """
    name = models.CharField(max_length=150, unique=True)
    sku = models.CharField(max_length=100, blank=True, null=True, unique=True)
    description = models.TextField(blank=True, null=True)
    quantity_in_stock = models.PositiveIntegerField(default=0)
    rate_per_day = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))]
    )

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.quantity_in_stock} in stock)"


class EquipmentRental(models.Model):
    """
    A single rental booking for an equipment item.
    Basic availability: sum of quantities rented for a given equipment+date
    must not exceed Equipment.quantity_in_stock.
    """
    STATUS_CHOICES = [
        ("booked", "Booked"),
        ("picked", "Picked Up"),
        ("returned", "Returned"),
        ("cancelled", "Cancelled"),
    ]

    equipment = models.ForeignKey(Equipment, on_delete=models.PROTECT, related_name="rentals")
    customer_name = models.CharField(max_length=150)
    customer_contact = models.CharField(max_length=20, blank=True, null=True)
    rental_date = models.DateField()
    return_date = models.DateField(blank=True, null=True)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])  # at least 1
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="booked")

    # Optional links
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="created_equipment_rentals"
    )

    # Pricing snapshot (helps reporting)
    rate_per_day_snapshot = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))]
    )
    total_price = models.DecimalField(
        max_digits=12, decimal_places=2, default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))]
    )

    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["rental_date"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return f"{self.equipment.name} x{self.quantity} for {self.customer_name} on {self.rental_date}"

    def clean(self):
        if self.quantity < 1:
            raise ValidationError("Quantity must be at least 1.")

        qs = EquipmentRental.objects.filter(
            equipment=self.equipment,
            rental_date=self.rental_date
        ).exclude(status__in=["cancelled", "returned"])

        if self.pk:
            qs = qs.exclude(pk=self.pk)

        already_booked = qs.aggregate(total=models.Sum("quantity"))["total"] or 0
        available = (self.equipment.quantity_in_stock or 0) - already_booked
        if self.quantity > max(0, available):
            raise ValidationError(
                f"Not enough stock on {self.rental_date}. Available: {available}, requested: {self.quantity}."
            )

    def save(self, *args, **kwargs):
        # snapshot and price calc
        if self.equipment and (self.rate_per_day_snapshot is None or self.rate_per_day_snapshot == 0):
            self.rate_per_day_snapshot = self.equipment.rate_per_day or Decimal("0.00")
        days = 1
        if self.return_date and self.return_date >= self.rental_date:
            days = (self.return_date - self.rental_date).days or 1
        self.total_price = (self.rate_per_day_snapshot or Decimal("0.00")) * self.quantity * days
        super().save(*args, **kwargs)


# ===============================================
# ========  SIMPLE EQUIPMENT ENTRY (UI)  ========
# ===============================================

class EquipmentEntry(models.Model):
    """
    Flat model the React UI expects (endpoint: /api/auth/equipment/).
    One row == one equipment item with optional rental metadata.
    'name' is stored; the API exposes alias 'equipment_name'.
    """
    STATUS_CHOICES = [
        ("Available", "Available"),
        ("Rented", "Rented"),
        ("Under Maintenance", "Under Maintenance"),
    ]

    # Core
    name = models.CharField(max_length=150)  # UI alias: equipment_name
    category = models.CharField(max_length=120, blank=True)
    brand = models.CharField(max_length=120, blank=True)

    price_per_day = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    available_quantity = models.PositiveIntegerField(null=True, blank=True)

    # Rental metadata (optional)
    rented_by = models.CharField(max_length=150, blank=True)
    rental_date = models.DateField(null=True, blank=True)
    return_date = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=32, choices=STATUS_CHOICES, default="Available")

    # Media
    photo = models.ImageField(upload_to="equipment/", null=True, blank=True)

    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["category"]),
            models.Index(fields=["brand"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self):
        return self.name


# ===============================================
# ============  SOUND SYSTEM (SERVICE)  =========
# ===============================================

class Sound(models.Model):
    PAYMENT_CHOICES = [
        ("Cash", "Cash"),
        ("Card", "Card"),
        ("UPI", "UPI"),
    ]
    client_name = models.CharField(max_length=120)
    email = models.EmailField(blank=True, null=True)
    mobile_no = models.CharField(max_length=20, blank=True, null=True)
    event_date = models.DateField(blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)

    system_type = models.CharField(max_length=120, blank=True, null=True)   # e.g., PA, DJ, Live
    speakers_count = models.PositiveIntegerField(default=0)
    microphones_count = models.PositiveIntegerField(default=0)
    mixer_model = models.CharField(max_length=120, blank=True, null=True)

    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default="Cash")
    notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.client_name} - {self.system_type or 'Sound'}"

# Temporary alias for legacy imports
SoundSetup = Sound





# ===============================================
# ============  Singer (SERVICE)  =========
# ===============================================

# api/models.py
import os
import uuid
from django.db import models
from django.utils.deconstruct import deconstructible

def singer_upload_to(instance, filename):
    """Primary upload function — places files under media/singers/<uuid>.<ext>."""
    ext = filename.split('.')[-1] if '.' in filename else 'jpg'
    filename = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join("singers", filename)

# keep backward-compatible name used by older migrations
def singer_photo_upload_to(instance, filename):
    return singer_upload_to(instance, filename)


class Singer(models.Model):
    GENDER_CHOICES = (
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    )

    name = models.CharField(max_length=255)
    genre = models.CharField(max_length=120, blank=True, null=True)
    experience = models.PositiveIntegerField(default=0)
    area = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=120, blank=True, null=True)
    state = models.CharField(max_length=120, blank=True, null=True)
    rate = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    mobile = models.CharField(max_length=32, blank=True, null=True)
    active = models.BooleanField(default=True)
    photo = models.ImageField(upload_to=singer_photo_upload_to, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-id',)
        verbose_name = "Singer"
        verbose_name_plural = "Singers"

    def __str__(self):
        return self.name or f"Singer {self.pk}"






# # api/models.py
# api/models.py
from django.db import models


class Singer(models.Model):
    name = models.CharField(max_length=255)
    birth_date = models.DateField(null=True, blank=True)
    mobile = models.CharField(max_length=20, blank=True, default="")
    profession = models.CharField(max_length=200, blank=True, default="")
    education = models.CharField(max_length=300, blank=True, default="")
    achievement = models.TextField(blank=True, default="")
    favourite_singer = models.CharField(max_length=200, blank=True, default="")
    reference_by = models.CharField(max_length=200, blank=True, default="")
    genre = models.CharField(max_length=100, blank=True, default="")
    experience = models.PositiveIntegerField(null=True, blank=True)
    
    area = models.CharField(max_length=200, blank=True, default="")
    city = models.CharField(max_length=100, blank=True, default="")
    state = models.CharField(max_length=100, blank=True, default="")
    
    rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    gender = models.CharField(
        max_length=10,
        choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')],
        blank=True,
        default=""
    )
    active = models.BooleanField(default=True)
    photo = models.ImageField(upload_to='singers/', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = "Singers"

    def __str__(self):
        return self.name