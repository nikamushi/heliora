"""HELIORA — Consent model.

Records user consent for data usage and medical disclaimer
acknowledgement. Consent must be given before any assessment can
proceed (Architecture §21.1, FR-004, AC-CONSENT-01).
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin


class Consent(Base, UUIDPrimaryKeyMixin, CreatedAtMixin):
    """User consent record for data usage and medical disclaimer."""

    __tablename__ = "consents"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    consent_version: Mapped[str] = mapped_column(
        String(20), nullable=False, default="1.0"
    )
    accepted_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )

    # ── Relationships ────────────────────────────────────────────
    user = relationship("User", back_populates="consents")

    @property
    def is_active(self) -> bool:
        """Return True if this consent has not been revoked."""
        return self.revoked_at is None

    def __repr__(self) -> str:
        status = "active" if self.is_active else "revoked"
        return f"<Consent id={self.id} user={self.user_id} {status}>"
