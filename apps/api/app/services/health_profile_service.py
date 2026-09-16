"""HELIORA API — Health profile service.

Business logic for managing user health profiles.
Implements Architecture §8.3, §22 and BE-003.
"""

import uuid
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.health_profile_repo import health_profile_repo
from app.schemas.health_profile import (
    HealthProfileCreateRequest,
    HealthProfileResponse,
)


class HealthProfileService:
    """Service handling health profile creation, update, and retrieval."""

    async def save_profile(
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
        response = HealthProfileResponse.model_validate(profile)
        # Populate granular family history details if provided
        if payload.family_history_details:
            response.family_history_details = payload.family_history_details
        return response

    async def get_profile(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> HealthProfileResponse:
        """Get latest health profile for authenticated user."""
        profile = await health_profile_repo.get_by_user_id(session, user_id)
        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Profil kesehatan belum ditemukan. Silakan lengkapi profil terlebih dahulu.",
            )
        return HealthProfileResponse.model_validate(profile)


health_profile_service = HealthProfileService()
