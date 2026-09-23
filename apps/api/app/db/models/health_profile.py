"""HELIORA — Health Profile model.

Stores user health and lifestyle data used as input for the
Preventive Lifestyle Risk Engine. Required and optional fields
follow Architecture §8.3 and PRD §2.8.
"""

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class HealthProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """User health and lifestyle profile — input for risk estimation.

    Required fields (Architecture §8.3):
        age, gender, height_cm, weight_kg, physical_activity_min_per_week,
        sleep_duration_hours, smoking_status, family_history

    Optional fields (for enhanced accuracy if available):
        stress_level, waist_circumference_cm, blood_pressure,
        blood_sugar_mg_dl, cholesterol_mg_dl
    """

    __tablename__ = "health_profiles"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # ── Required fields ──────────────────────────────────────────
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # male / female / other
    height_cm: Mapped[float] = mapped_column(Numeric(5, 1), nullable=False)
    weight_kg: Mapped[float] = mapped_column(Numeric(5, 1), nullable=False)
    physical_activity_min_per_week: Mapped[float] = mapped_column(
        Numeric(6, 1), nullable=False
    )
    sleep_duration_hours: Mapped[float] = mapped_column(Numeric(3, 1), nullable=False)
    smoking_status: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # never / former / current
    family_history: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    family_history_details: Mapped[str | None] = mapped_column(
        Text, nullable=True
    )

    # ── Optional fields ──────────────────────────────────────────
    stress_level: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )  # 1-10 scale
    waist_circumference_cm: Mapped[float | None] = mapped_column(
        Numeric(5, 1), nullable=True
    )
    blood_pressure: Mapped[str | None] = mapped_column(
        String(20), nullable=True
    )  # e.g. "120/80"
    blood_sugar_mg_dl: Mapped[float | None] = mapped_column(
        Numeric(6, 1), nullable=True
    )
    cholesterol_mg_dl: Mapped[float | None] = mapped_column(
        Numeric(6, 1), nullable=True
    )

    # ── Derived (computed on save) ───────────────────────────────
    bmi: Mapped[float | None] = mapped_column(Numeric(4, 1), nullable=True)

    # ── Relationships ────────────────────────────────────────────
    user = relationship("User", back_populates="health_profiles")
    assessments = relationship(
        "Assessment",
        back_populates="health_profile",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint("age >= 1 AND age <= 150", name="ck_hp_age_range"),
        CheckConstraint("height_cm > 0", name="ck_hp_height_positive"),
        CheckConstraint("weight_kg > 0", name="ck_hp_weight_positive"),
        CheckConstraint(
            "physical_activity_min_per_week >= 0",
            name="ck_hp_activity_non_negative",
        ),
        CheckConstraint(
            "sleep_duration_hours >= 0 AND sleep_duration_hours <= 24",
            name="ck_hp_sleep_range",
        ),
        CheckConstraint(
            "stress_level IS NULL OR (stress_level >= 1 AND stress_level <= 10)",
            name="ck_hp_stress_range",
        ),
        CheckConstraint(
            "bmi IS NULL OR bmi > 0",
            name="ck_hp_bmi_positive",
        ),
    )

    def __repr__(self) -> str:
        return f"<HealthProfile id={self.id} user={self.user_id} age={self.age}>"
