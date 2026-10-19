"""HELIORA API — Strongly-typed attribute profile.

Lightweight container used wherever a HealthProfile-shaped object is needed
without an active database row (simulation overrides, evaluation samples, SHAP dummy
profiles). Exposes typed fields with sensible defaults, mirroring ORM
profile attribute access.
"""

from dataclasses import dataclass
from decimal import Decimal
from typing import Any


@dataclass(slots=True)
class AttributeProfile:
    """Strongly-typed attribute container mirroring health profile attributes."""

    age: int = 30
    gender: str = "male"
    height_cm: float | Decimal = 170.0
    weight_kg: float | Decimal = 70.0
    physical_activity_min_per_week: float | Decimal = 150.0
    sleep_duration_hours: float | Decimal = 7.5
    smoking_status: str = "never"
    family_history: bool = False
    family_history_details: str | None = None
    stress_level: int | float | None = None
    bmi: float | Decimal | None = None
    bmi_category: str | None = None
    waist_circumference_cm: float | Decimal | None = None
    blood_pressure: str | None = None
    blood_sugar_mg_dl: float | Decimal | None = None
    cholesterol_mg_dl: float | Decimal | None = None
    created_at: Any = None
    updated_at: Any = None
    id: Any = None
    user_id: Any = None

    def __post_init__(self) -> None:
        """Derive BMI automatically if height and weight are given but BMI is None."""
        if self.bmi is None:
            try:
                h_cm = float(self.height_cm)
                w_kg = float(self.weight_kg)
                if h_cm > 0:
                    h_m = h_cm / 100.0
                    self.bmi = round(w_kg / (h_m * h_m), 1)
            except (ValueError, TypeError, ZeroDivisionError):
                pass
