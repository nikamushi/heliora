"""HELIORA — User model.

Stores user account and authentication data.
Architecture §7.4 — ``users`` table.
"""

from sqlalchemy import Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """Registered HELIORA user."""

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(320), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str | None] = mapped_column(String(128), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)

    # ── Relationships ────────────────────────────────────────────
    consents = relationship(
        "Consent", back_populates="user", cascade="all, delete-orphan"
    )
    health_profiles = relationship(
        "HealthProfile", back_populates="user", cascade="all, delete-orphan"
    )
    assessments = relationship(
        "Assessment", back_populates="user", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_users_email", "email", unique=True),)

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"
