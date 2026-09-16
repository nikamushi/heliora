"""HELIORA API — Health profile routes.

Endpoints for saving and retrieving user health profiles.
Implements Architecture §8.3, §22 and BE-003.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db
from app.db.models.user import User
from app.schemas.health_profile import (
    HealthProfileCreateRequest,
    HealthProfileResponse,
)
from app.services.health_profile_service import health_profile_service

router = APIRouter()


@router.post(
    "",
    response_model=HealthProfileResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Save user health profile",
    description=(
        "Saves biometric, lifestyle, and clinical parameters for "
        "the authenticated user. Overwrites or updates existing profile."
    ),
)
async def save_health_profile(
    payload: HealthProfileCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> HealthProfileResponse:
    """Save or update health profile for authenticated user."""
    return await health_profile_service.save_profile(db, current_user.id, payload)


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
