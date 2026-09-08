"""HELIORA — XAI Result model.

Stores SHAP feature contributions explaining the risk estimation results
for each individual assessment (Architecture §7.4, §8.6).
"""

from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDPrimaryKeyMixin


class XAIResult(Base, UUIDPrimaryKeyMixin):
    """SHAP feature attribution explaining a risk result."""

    __tablename__ = "xai_results"

    risk_result_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("risk_results.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    feature_name: Mapped[str] = mapped_column(String(100), nullable=False)
    contribution: Mapped[float] = mapped_column(Numeric(8, 4), nullable=False)
    direction: Mapped[str] = mapped_column(
        String(20), nullable=False
    )  # positive (increases risk) / negative (decreases risk)
    rank: Mapped[int] = mapped_column(
        Integer, nullable=False
    )  # 1-based rank of importance

    # ── Relationships ────────────────────────────────────────────
    risk_result = relationship("RiskResult", back_populates="xai_results")

    __table_args__ = (
        Index("ix_xai_results_risk_rank", "risk_result_id", "rank"),
        CheckConstraint("rank >= 1", name="ck_xai_rank_positive"),
        CheckConstraint(
            "direction IN ('positive', 'negative')",
            name="ck_xai_direction",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<XAIResult id={self.id} feature={self.feature_name!r} "
            f"rank={self.rank} direction={self.direction!r}>"
        )
