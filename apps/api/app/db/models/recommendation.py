"""HELIORA — Recommendation model.

Stores clinical rule engine recommendations generated for an assessment
session (Architecture §7.4, §11).
"""

from sqlalchemy import CheckConstraint, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin


class Recommendation(Base, UUIDPrimaryKeyMixin, CreatedAtMixin):
    """Clinical lifestyle recommendation output for an assessment."""

    __tablename__ = "recommendations"

    assessment_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    rule_id: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    guideline_source: Mapped[str] = mapped_column(String(255), nullable=False)
    priority: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # "high", "medium", "low"

    # ── Relationships ────────────────────────────────────────────
    assessment = relationship("Assessment", back_populates="recommendations")
    evidences = relationship(
        "Evidence",
        back_populates="recommendation",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint(
            "priority IN ('high', 'medium', 'low', 'protective')",
            name="ck_rec_priority",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<Recommendation id={self.id} rule_id={self.rule_id!r} "
            f"priority={self.priority!r}>"
        )
