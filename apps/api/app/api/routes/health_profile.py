"""HELIORA API — Health profile routes.

Endpoints for saving, retrieving, and updating user health profiles.
Implements Architecture §6.5, §8.3, §21.1, §22, PRD FR-006, FR-007, FR-008, and BE-003.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db, require_active_consent
from app.db.models.consent import Consent
from app.db.models.user import User
from app.schemas.health_profile import (
    HealthProfileCreateRequest,
    HealthProfileResponse,
    HealthProfileUpdateRequest,
)
from app.services.health_profile_service import health_profile_service

router = APIRouter()


@router.post(
    "",
    response_model=HealthProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create or save user health profile",
    description=(
        "Saves biometric, lifestyle, and clinical parameters for "
        "the authenticated user. Computes BMI and enforces consent requirement."
    ),
)
async def create_health_profile(
    payload: HealthProfileCreateRequest,
    current_user: User = Depends(get_current_user),
    _consent: Consent = Depends(require_active_consent),
    db: AsyncSession = Depends(get_db),
) -> HealthProfileResponse:
    """Create or update health profile for authenticated user."""
    return await health_profile_service.create_profile(db, current_user.id, payload)


@router.get(
    "",
    response_model=HealthProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user health profile",
    description="Retrieves the current active health profile of authenticated user.",
)
async def get_health_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HealthProfileResponse:
    """Retrieve health profile for authenticated user."""
    return await health_profile_service.get_profile(db, current_user.id)


@router.put(
    "",
    response_model=HealthProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Update existing health profile",
    description=(
        "Updates specified biometric or lifestyle fields of the authenticated user's "
        "health profile, recalculating BMI and enforcing active consent."
    ),
)
async def update_health_profile(
    payload: HealthProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    _consent: Consent = Depends(require_active_consent),
    db: AsyncSession = Depends(get_db),
) -> HealthProfileResponse:
    """Update health profile for authenticated user."""
    return await health_profile_service.update_profile(db, current_user.id, payload)
