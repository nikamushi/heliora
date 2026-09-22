"""HELIORA API — Health Profile repository.

Encapsulates database operations for the HealthProfile entity.
Implements Architecture §8.3, §22, PRD FR-006, FR-007, FR-008, and BE-003.
"""

import uuid
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.health_profile import HealthProfile
from app.schemas.health_profile import (
    HealthProfileCreateRequest,
    HealthProfileUpdateRequest,
    calculate_bmi,
)


class HealthProfileRepository:
    """Data-access repository for user health profile records."""

    async def get_by_user_id(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> HealthProfile | None:
        """Fetch the latest health profile for a given user."""
        result = await session.execute(
            select(HealthProfile)
            .where(HealthProfile.user_id == user_id)
            .order_by(HealthProfile.created_at.desc())
        )
        return result.scalars().first()

    async def create(
        self,
        session: AsyncSession,
        *,
        user_id: uuid.UUID,
        payload: HealthProfileCreateRequest,
    ) -> HealthProfile:
        """Create and persist a new health profile record."""
        bmi_val = payload.bmi
        if bmi_val is None:
            bmi_val = calculate_bmi(payload.height_cm, payload.weight_kg)

        gender_str = (
            payload.gender.value
            if hasattr(payload.gender, "value")
            else str(payload.gender)
        )
        smoking_str = (
            payload.smoking_status.value
            if hasattr(payload.smoking_status, "value")
            else str(payload.smoking_status)
        )

        profile = HealthProfile(
            user_id=user_id,
            age=payload.age,
            gender=gender_str,
            height_cm=Decimal(str(payload.height_cm)),
            weight_kg=Decimal(str(payload.weight_kg)),
            physical_activity_min_per_week=Decimal(
                str(payload.physical_activity_min_per_week)
            ),
            sleep_duration_hours=Decimal(str(payload.sleep_duration_hours)),
            smoking_status=smoking_str,
            family_history=payload.family_history,
            stress_level=payload.stress_level,
            waist_circumference_cm=(
                Decimal(str(payload.waist_circumference_cm))
                if payload.waist_circumference_cm is not None
                else None
            ),
            blood_pressure=payload.blood_pressure,
            blood_sugar_mg_dl=(
                Decimal(str(payload.blood_sugar_mg_dl))
                if payload.blood_sugar_mg_dl is not None
                else None
            ),
            cholesterol_mg_dl=(
                Decimal(str(payload.cholesterol_mg_dl))
                if payload.cholesterol_mg_dl is not None
                else None
            ),
            bmi=Decimal(str(bmi_val)) if bmi_val and bmi_val > 0 else None,
        )
        session.add(profile)
        await session.commit()
        await session.refresh(profile)
        return profile

    async def update(
        self,
        session: AsyncSession,
        profile: HealthProfile,
        payload: HealthProfileUpdateRequest,
    ) -> HealthProfile:
        """Update an existing health profile record."""
        if payload.age is not None:
            profile.age = payload.age
        if payload.gender is not None:
            profile.gender = (
                payload.gender.value
                if hasattr(payload.gender, "value")
                else str(payload.gender)
            )
        if payload.height_cm is not None:
            profile.height_cm = Decimal(str(payload.height_cm))
        if payload.weight_kg is not None:
            profile.weight_kg = Decimal(str(payload.weight_kg))
        if payload.physical_activity_min_per_week is not None:
            profile.physical_activity_min_per_week = Decimal(
                str(payload.physical_activity_min_per_week)
            )
        if payload.sleep_duration_hours is not None:
            profile.sleep_duration_hours = Decimal(str(payload.sleep_duration_hours))
        if payload.smoking_status is not None:
            profile.smoking_status = (
                payload.smoking_status.value
                if hasattr(payload.smoking_status, "value")
                else str(payload.smoking_status)
            )
        if payload.family_history is not None:
            profile.family_history = payload.family_history
        if payload.stress_level is not None:
            profile.stress_level = payload.stress_level
        if payload.waist_circumference_cm is not None:
            profile.waist_circumference_cm = Decimal(str(payload.waist_circumference_cm))
        if payload.blood_pressure is not None:
            profile.blood_pressure = payload.blood_pressure
        if payload.blood_sugar_mg_dl is not None:
            profile.blood_sugar_mg_dl = Decimal(str(payload.blood_sugar_mg_dl))
        if payload.cholesterol_mg_dl is not None:
            profile.cholesterol_mg_dl = Decimal(str(payload.cholesterol_mg_dl))

        # Recalculate BMI if height or weight changed or if bmi explicitly provided
        if payload.bmi is not None:
            profile.bmi = Decimal(str(payload.bmi))
        elif payload.height_cm is not None or payload.weight_kg is not None:
            new_h = float(profile.height_cm)
            new_w = float(profile.weight_kg)
            calc = calculate_bmi(new_h, new_w)
            profile.bmi = Decimal(str(calc)) if calc > 0 else None

        await session.commit()
        await session.refresh(profile)
        return profile

    async def create_or_update(
        self,
        session: AsyncSession,
        *,
        user_id: uuid.UUID,
        payload: HealthProfileCreateRequest,
    ) -> HealthProfile:
        """Create a new health profile or update existing one."""
        existing = await self.get_by_user_id(session, user_id)
        if existing is not None:
            update_data = HealthProfileUpdateRequest(**payload.model_dump())
            return await self.update(session, existing, update_data)
        return await self.create(session, user_id=user_id, payload=payload)


health_profile_repo = HealthProfileRepository()
