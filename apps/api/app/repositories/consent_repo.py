"""HELIORA API — Consent repository.

Encapsulates database operations for the Consent entity.
"""

import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.consent import Consent


class ConsentRepository:
    """Data-access repository for user consent records."""

    async def get_active_by_user_id(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> Consent | None:
        """Fetch active (unrevoked) consent for a given user."""
        result = await session.execute(
            select(Consent)
            .where(Consent.user_id == user_id, Consent.revoked_at.is_(None))
            .order_by(Consent.created_at.desc())
        )
        return result.scalars().first()

    async def get_history_by_user_id(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> list[Consent]:
        """Fetch all consent records for a user ordered by creation timestamp."""
        result = await session.execute(
            select(Consent)
            .where(Consent.user_id == user_id)
            .order_by(Consent.created_at.desc())
        )
        return list(result.scalars().all())

    async def create_or_renew(
        self,
        session: AsyncSession,
        *,
        user_id: uuid.UUID,
        consent_version: str = "1.0",
    ) -> Consent:
        """Record a new active consent or return existing active consent."""
        existing = await self.get_active_by_user_id(session, user_id)
        if existing is not None and existing.consent_version == consent_version:
            return existing

        # If previous consent was revoked or for older version, create new record
        now = datetime.now(UTC)
        consent = Consent(
            user_id=user_id,
            consent_version=consent_version,
            accepted_at=now,
            revoked_at=None,
        )
        session.add(consent)
        await session.commit()
        await session.refresh(consent)
        return consent

    async def revoke(self, session: AsyncSession, user_id: uuid.UUID) -> Consent | None:
        """Revoke active consent for user if present."""
        active = await self.get_active_by_user_id(session, user_id)
        if active is None:
            return None

        active.revoked_at = datetime.now(UTC)
        await session.commit()
        await session.refresh(active)
        return active


consent_repo = ConsentRepository()
