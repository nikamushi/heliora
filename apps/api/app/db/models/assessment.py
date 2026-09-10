"""HELIORA — Assessment model.

Represents a single health assessment session. An assessment links
a user's health profile snapshot to the risk estimation pipeline
output (Architecture §7.4, §36).
"""

from sqlalchemy import CheckConstraint, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin


class Assessment(Base, UUIDPrimaryKeyMixin, CreatedAtMixin):
    """A health assessment session tying profile input to risk output."""

    __tablename__ = "assessments"

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    health_profile_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("health_profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending"
    )  # pending / processing / completed / failed

    # ── Relationships ────────────────────────────────────────────
    user = relationship("User", back_populates="assessments")
    health_profile = relationship("HealthProfile", back_populates="assessments")
    risk_result = relationship(
        "RiskResult",
        back_populates="assessment",
        uselist=False,
        cascade="all, delete-orphan",
    )
    simulations = relationship(
        "Simulation",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )
    recommendations = relationship(
        "Recommendation",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        Index("ix_assessments_user_created", "user_id", "created_at"),
        CheckConstraint(
            "status IN ('pending', 'processing', 'completed', 'failed')",
            name="ck_assessment_status",
        ),
    )

    def __repr__(self) -> str:
        return f"<Assessment id={self.id} status={self.status!r}>"
