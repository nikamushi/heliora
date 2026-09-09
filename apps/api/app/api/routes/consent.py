"""HELIORA API — Consent and privacy routes.

Endpoints for recording user consent, medical disclaimer agreement,
querying active consent status, and revoking consent.
Implements Architecture §21 and BE-002.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db
from app.db.models.user import User
from app.schemas.consent import (
    ConsentCreateRequest,
    ConsentResponse,
    ConsentStatusResponse,
)
from app.services.consent_service import consent_service

router = APIRouter()


@router.post(
    "",
    response_model=ConsentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record user consent",
    description=(
        "Records user affirmative agreement to privacy terms, "
        "data processing, and medical disclaimer."
    ),
)
async def record_consent(
    payload: ConsentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConsentResponse:
    """Record consent agreement for authenticated user."""
    return await consent_service.record_consent(db, current_user.id, payload)


@router.get(
    "/status",
    response_model=ConsentStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get user consent status",
    description=(
        "Retrieves active consent state for authenticated user "
        "along with current medical disclaimer text."
    ),
)
async def get_consent_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConsentStatusResponse:
    """Get consent status and medical disclaimer text."""
    return await consent_service.get_consent_status(db, current_user.id)


@router.post(
    "/revoke",
    response_model=ConsentResponse,
    status_code=status.HTTP_200_OK,
    summary="Revoke user consent",
    description=(
        "Revokes active consent record for authenticated user in compliance "
        "with privacy regulations (UU PDP / GDPR)."
    ),
)
async def revoke_consent(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ConsentResponse:
    """Revoke active consent for authenticated user."""
    return await consent_service.revoke_consent(db, current_user.id)
