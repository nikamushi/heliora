"""HELIORA API — Consent service.

Business logic for managing user consent, medical disclaimer acknowledgement,
and consent status verification.
Implements Architecture §21 and BE-002.
"""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.consent_repo import consent_repo
from app.schemas.consent import (
    ConsentCreateRequest,
    ConsentResponse,
    ConsentStatusResponse,
)


class ConsentService:
    """Service handling consent recording, revocation, and status checking."""

    async def record_consent(
        self,
        session: AsyncSession,
        user_id: uuid.UUID,
        payload: ConsentCreateRequest,
    ) -> ConsentResponse:
        """Record affirmative user agreement to terms and disclaimer."""
        if not payload.agreed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You must explicitly agree to terms and the medical disclaimer.",
            )

        consent = await consent_repo.create_or_renew(
            session,
            user_id=user_id,
            consent_version=payload.consent_version,
        )
        return ConsentResponse.model_validate(consent)

    async def get_consent_status(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> ConsentStatusResponse:
        """Check active consent status and return current disclaimer text."""
        active = await consent_repo.get_active_by_user_id(session, user_id)
        if active is not None:
            return ConsentStatusResponse(
                has_active_consent=True,
                active_consent=ConsentResponse.model_validate(active),
                terms_version=active.consent_version,
            )

        return ConsentStatusResponse(
            has_active_consent=False,
            active_consent=None,
        )

    async def revoke_consent(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> ConsentResponse:
        """Revoke active consent for user."""
        revoked = await consent_repo.revoke(session, user_id)
        if revoked is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active consent record found to revoke.",
            )

        return ConsentResponse.model_validate(revoked)


consent_service = ConsentService()
