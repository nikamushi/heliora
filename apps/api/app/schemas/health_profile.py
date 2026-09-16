"""HELIORA API — Health profile request and response schemas.

Implements Architecture §8.3, §22 and BE-003.
"""

import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class HealthProfileCreateRequest(BaseModel):
    """Payload for creating or updating a user's health profile."""

    age: int = Field(..., ge=1, le=120, description="Age in years")
    gender: str = Field(..., description="Gender (male, female, other)")
    height_cm: float = Field(..., gt=0, le=300, description="Height in cm")
    weight_kg: float = Field(..., gt=0, le=500, description="Weight in kg")
    physical_activity_min_per_week: float = Field(
        ..., ge=0, description="Minutes of physical activity per week"
    )
    sleep_duration_hours: float = Field(
        ..., ge=0, le=24, description="Average daily sleep hours"
    )
    smoking_status: str = Field(..., description="Smoking status (never, former, current)")
    family_history: bool = Field(default=False, description="Family history of chronic disease")
    family_history_details: str | None = Field(
        default=None, description="Granular family history details if applicable"
    )
    stress_level: int | None = Field(default=None, ge=1, le=10, description="Self-reported stress scale (1-10)")
    bmi: float | None = Field(default=None, description="Computed or provided BMI")
    waist_circumference_cm: float | None = Field(default=None, description="Waist circumference in cm")
    blood_pressure: str | None = Field(default=None, description="Blood pressure reading")
    blood_sugar_mg_dl: float | None = Field(default=None, description="Fasting blood sugar in mg/dL")
    cholesterol_mg_dl: float | None = Field(default=None, description="Total cholesterol in mg/dL")


class HealthProfileResponse(BaseModel):
    """Representation of a health profile record."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    bmi: float | None = None
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
    created_at: datetime
    updated_at: datetime | None = None
