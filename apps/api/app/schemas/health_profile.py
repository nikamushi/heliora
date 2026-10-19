"""HELIORA API — Health profile request and response schemas.

Implements Architecture §8.3, §22, PRD FR-006, FR-007, FR-008, and BE-003.
"""

import uuid
from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, ConfigDict, Field, model_validator

# health_profiles.bmi is NUMERIC(4,1): the largest storable value is 999.9.
MAX_STORABLE_BMI: float = 999.9


class GenderEnum(StrEnum):
    """Supported gender options for health biometric profiling."""

    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class SmokingStatusEnum(StrEnum):
    """Categorized smoking habits for lifestyle risk factors."""

    NEVER = "never"
    FORMER = "former"
    CURRENT = "current"


def calculate_bmi(height_cm: float, weight_kg: float) -> float:
    """Calculate Body Mass Index (BMI) rounded to 1 decimal place.

    BMI = weight (kg) / (height (m) ^ 2)
    """
    if height_cm <= 0 or weight_kg <= 0:
        return 0.0
    h_m = height_cm / 100.0
    return round(weight_kg / (h_m * h_m), 1)


def ensure_bmi_storable(height_cm: float, weight_kg: float) -> None:
    """Raise ValueError if the derived BMI exceeds what the database can store.

    Height/weight are individually valid (height > 0, weight <= 500), but an
    extreme combination (e.g. 1 cm and 500 kg) yields a BMI that overflows
    NUMERIC(4,1) and would otherwise surface as an HTTP 500 on save.
    """
    bmi = calculate_bmi(height_cm, weight_kg)
    if bmi > MAX_STORABLE_BMI:
        raise ValueError(
            f"Kombinasi tinggi ({height_cm:g} cm) dan berat ({weight_kg:g} kg) "
            f"menghasilkan BMI {bmi:g}, di luar batas yang dapat disimpan "
            f"({MAX_STORABLE_BMI:g}). Periksa kembali tinggi dan berat badan."
        )


def get_bmi_category(bmi: float | None) -> str | None:
    """Classify BMI based on WHO and Indonesian Kemenkes guidelines.

    - Underweight: < 18.5
    - Normal: 18.5 - 24.9
    - Overweight: 25.0 - 29.9
    - Obesity: >= 30.0
    """
    if bmi is None or bmi <= 0:
        return None
    if bmi < 18.5:
        return "Underweight"
    if bmi < 25.0:
        return "Normal"
    if bmi < 30.0:
        return "Overweight"
    return "Obesity"


class HealthProfileCreateRequest(BaseModel):
    """Payload for creating a user's health profile (PRD FR-006/FR-007)."""

    age: int = Field(..., ge=1, le=120, description="Age in years (1-120)")
    gender: GenderEnum = Field(..., description="Gender (male, female, other)")
    height_cm: float = Field(..., gt=0, le=300, description="Height in cm")
    weight_kg: float = Field(..., gt=0, le=500, description="Weight in kg")
    physical_activity_min_per_week: float = Field(
        ...,
        ge=0,
        le=10080,
        description="Physical activity duration in minutes per week",
    )
    sleep_duration_hours: float = Field(
        ..., ge=0, le=24, description="Average daily sleep duration in hours"
    )
    smoking_status: SmokingStatusEnum = Field(
        ..., description="Smoking status (never, former, current)"
    )
    family_history: bool = Field(
        default=False,
        description="Family history of chronic disease (diabetes, CVD, hypertension)",
    )
    family_history_details: str | None = Field(
        default=None, description="Granular family history details if available"
    )
    stress_level: int | None = Field(
        default=None, ge=1, le=10, description="Self-reported stress level (1-10 scale)"
    )
    bmi: float | None = Field(
        default=None,
        gt=0,
        le=100,
        description="Optional precomputed BMI (auto-calculated if omitted)",
    )
    waist_circumference_cm: float | None = Field(
        default=None, gt=0, le=300, description="Waist circumference in cm"
    )
    blood_pressure: str | None = Field(
        default=None, description="Blood pressure reading (e.g. '120/80')"
    )
    blood_sugar_mg_dl: float | None = Field(
        default=None, gt=0, le=1000, description="Fasting blood sugar in mg/dL"
    )
    cholesterol_mg_dl: float | None = Field(
        default=None, gt=0, le=1000, description="Total cholesterol in mg/dL"
    )

    @model_validator(mode="after")
    def _check_bmi_is_storable(self) -> "HealthProfileCreateRequest":
        """Reject height/weight combos whose auto-calculated BMI overflows storage."""
        if self.bmi is None:
            ensure_bmi_storable(self.height_cm, self.weight_kg)
        return self


class HealthProfileUpdateRequest(BaseModel):
    """Payload for updating an existing health profile."""

    age: int | None = Field(default=None, ge=1, le=120)
    gender: GenderEnum | None = Field(default=None)
    height_cm: float | None = Field(default=None, gt=0, le=300)
    weight_kg: float | None = Field(default=None, gt=0, le=500)
    physical_activity_min_per_week: float | None = Field(default=None, ge=0, le=10080)
    sleep_duration_hours: float | None = Field(default=None, ge=0, le=24)
    smoking_status: SmokingStatusEnum | None = Field(default=None)
    family_history: bool | None = Field(default=None)
    family_history_details: str | None = Field(default=None)
    stress_level: int | None = Field(default=None, ge=1, le=10)
    bmi: float | None = Field(default=None, gt=0, le=100)
    waist_circumference_cm: float | None = Field(default=None, gt=0, le=300)
    blood_pressure: str | None = Field(default=None)
    blood_sugar_mg_dl: float | None = Field(default=None, gt=0, le=1000)
    cholesterol_mg_dl: float | None = Field(default=None, gt=0, le=1000)


class HealthProfileResponse(BaseModel):
    """Public representation of a user's health profile."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    bmi: float | None = None
    bmi_category: str | None = None
    physical_activity_min_per_week: float
    sleep_duration_hours: float
    smoking_status: str
    family_history: bool
    family_history_details: str | None = None
    stress_level: int | None = None
    waist_circumference_cm: float | None = None
    blood_pressure: str | None = None
    blood_sugar_mg_dl: float | None = None
    cholesterol_mg_dl: float | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
