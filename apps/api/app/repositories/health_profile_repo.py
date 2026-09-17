"""HELIORA API — Health Profile repository.

Encapsulates database operations for the HealthProfile entity.
"""

import uuid
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.health_profile import HealthProfile
from app.schemas.health_profile import HealthProfileCreateRequest


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

    async def create_or_update(
        self,
        session: AsyncSession,
        *,
        user_id: uuid.UUID,
        payload: HealthProfileCreateRequest,
    ) -> HealthProfile:
        """Create a new health profile record or update an existing one."""
        existing = await self.get_by_user_id(session, user_id)

        # Compute BMI if not provided
        bmi_val = payload.bmi
        if bmi_val is None and payload.height_cm > 0 and payload.weight_kg > 0:
            h_m = float(payload.height_cm) / 100.0
            bmi_val = round(float(payload.weight_kg) / (h_m * h_m), 1)

        if existing is not None:
            existing.age = payload.age
            existing.gender = payload.gender
            existing.height_cm = Decimal(str(payload.height_cm))
            existing.weight_kg = Decimal(str(payload.weight_kg))
            existing.physical_activity_min_per_week = Decimal(
                str(payload.physical_activity_min_per_week)
            )
            existing.sleep_duration_hours = Decimal(str(payload.sleep_duration_hours))
            existing.smoking_status = payload.smoking_status
            existing.family_history = payload.family_history
            existing.stress_level = payload.stress_level
            existing.waist_circumference_cm = (
                Decimal(str(payload.waist_circumference_cm))
                if payload.waist_circumference_cm is not None
                else None
            )
            existing.blood_pressure = payload.blood_pressure
            existing.blood_sugar_mg_dl = (
                Decimal(str(payload.blood_sugar_mg_dl))
                if payload.blood_sugar_mg_dl is not None
                else None
            )
            existing.cholesterol_mg_dl = (
                Decimal(str(payload.cholesterol_mg_dl))
                if payload.cholesterol_mg_dl is not None
                else None
            )
            existing.bmi = Decimal(str(bmi_val)) if bmi_val is not None else None
            await session.flush()
            await session.refresh(existing)
            return existing

        profile = HealthProfile(
            user_id=user_id,
            age=payload.age,
            gender=payload.gender,
            height_cm=Decimal(str(payload.height_cm)),
            weight_kg=Decimal(str(payload.weight_kg)),
            physical_activity_min_per_week=Decimal(
                str(payload.physical_activity_min_per_week)
            ),
            sleep_duration_hours=Decimal(str(payload.sleep_duration_hours)),
            smoking_status=payload.smoking_status,
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
            bmi=Decimal(str(bmi_val)) if bmi_val is not None else None,
        )
        session.add(profile)
        await session.flush()
        await session.refresh(profile)
        return profile


health_profile_repo = HealthProfileRepository()
