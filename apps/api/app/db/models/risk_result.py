"""HELIORA — Risk Result model.

Stores estimated risk scores and metrics produced by the Preventive
Lifestyle Risk Engine for a specific assessment (Architecture §7.4, §8.1).
"""

from sqlalchemy import CheckConstraint, ForeignKey, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin


class RiskResult(Base, UUIDPrimaryKeyMixin, CreatedAtMixin):
    """Estimated lifestyle risk outcomes for an assessment."""

    __tablename__ = "risk_results"

    assessment_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assessments.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )

    # ── Risk probabilities (0.0 to 1.0) ──────────────────────────
    diabetes_risk: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    hypertension_risk: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    cardiovascular_risk: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)

    # ── Composite scores (0.0 to 100.0) ──────────────────────────
    health_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    lifestyle_score: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)

    model_version: Mapped[str] = mapped_column(
        String(50), nullable=False, default="1.0.0"
    )

    # ── Relationships ────────────────────────────────────────────
    assessment = relationship("Assessment", back_populates="risk_result")
    xai_results = relationship(
        "XAIResult",
        back_populates="risk_result",
        cascade="all, delete-orphan",
        order_by="XAIResult.rank",
    )

    __table_args__ = (
        CheckConstraint(
            "diabetes_risk >= 0.0 AND diabetes_risk <= 1.0",
            name="ck_risk_diabetes_range",
        ),
        CheckConstraint(
            "hypertension_risk >= 0.0 AND hypertension_risk <= 1.0",
            name="ck_risk_hypertension_range",
        ),
        CheckConstraint(
            "cardiovascular_risk >= 0.0 AND cardiovascular_risk <= 1.0",
            name="ck_risk_cardiovascular_range",
        ),
        CheckConstraint(
            "health_score >= 0.0 AND health_score <= 100.0",
            name="ck_risk_health_score_range",
        ),
        CheckConstraint(
            "lifestyle_score >= 0.0 AND lifestyle_score <= 100.0",
            name="ck_risk_lifestyle_score_range",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<RiskResult id={self.id} assessment_id={self.assessment_id} "
            f"health_score={self.health_score}>"
        )
