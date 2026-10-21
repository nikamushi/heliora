"""HELIORA API — Health profile service.

Business logic for managing user health profiles.
Implements Architecture §8.3, §22, PRD FR-006, FR-007, FR-008, and BE-003.
"""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.health_profile import HealthProfile
from app.repositories.health_profile_repo import health_profile_repo
from app.schemas.health_profile import (
    HealthProfileCreateRequest,
    HealthProfileResponse,
    HealthProfileUpdateRequest,
    ensure_bmi_storable,
    get_bmi_category,
)


class HealthProfileService:
    """Service handling health profile creation, update, and retrieval."""

    def _to_response(
        self, profile: HealthProfile, family_history_details: str | None = None
    ) -> HealthProfileResponse:
        """Convert ORM model to response schema with enriched BMI category."""
        resp = HealthProfileResponse.model_validate(profile)
        if profile.bmi is not None:
            resp.bmi = float(profile.bmi)
            resp.bmi_category = get_bmi_category(resp.bmi)
        if family_history_details is not None:
            resp.family_history_details = family_history_details
        return resp

    async def create_profile(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        payload: HealthProfileCreateRequest,
    ) -> HealthProfileResponse:
        """Create or update health profile for authenticated user."""
        profile = await health_profile_repo.create_or_update(
            session,
            user_id=user_id,
            payload=payload,
        )
        return self._to_response(profile, payload.family_history_details)

    async def update_profile(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        payload: HealthProfileUpdateRequest,
    ) -> HealthProfileResponse:
        """Update existing health profile for authenticated user."""
        existing = await health_profile_repo.get_by_user_id(session, user_id)
        if existing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profil kesehatan tidak ditemukan. Buat profil terlebih dahulu.",
            )

        # Partial update: validate against the merged height/weight, since the
        # stored value for the field that was not sent also determines the BMI.
        if payload.bmi is None and (
            payload.height_cm is not None or payload.weight_kg is not None
        ):
            try:
                ensure_bmi_storable(
                    payload.height_cm
                    if payload.height_cm is not None
                    else float(existing.height_cm),
                    payload.weight_kg
                    if payload.weight_kg is not None
                    else float(existing.weight_kg),
                )
            except ValueError as exc:
                raise HTTPException(
                    status_code=422,
                    detail=str(exc),
                ) from exc

        updated = await health_profile_repo.update(session, existing, payload)
        return self._to_response(updated, payload.family_history_details)

    async def get_profile(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> HealthProfileResponse:
        """Get latest health profile for authenticated user."""
        profile = await health_profile_repo.get_by_user_id(session, user_id)
        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Profil kesehatan belum ditemukan. "
                    "Silakan lengkapi profil terlebih dahulu."
                ),
            )
        return self._to_response(profile)

    async def save_profile(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        payload: HealthProfileCreateRequest,
    ) -> HealthProfileResponse:
        """Alias for create_profile."""
        return await self.create_profile(session, user_id, payload)


health_profile_service = HealthProfileService()
