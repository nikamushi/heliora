"""HELIORA — Simulation model.

Stores Future and What-if simulation snapshots associated with an
assessment session (Architecture §7.4, §10).
"""

from sqlalchemy import JSON, CheckConstraint, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin


class Simulation(Base, UUIDPrimaryKeyMixin, CreatedAtMixin):
    """Simulation record storing input/output state projections."""

    __tablename__ = "simulations"

    assessment_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assessments.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    simulation_type: Mapped[str] = mapped_column(
        String(30), nullable=False
    )  # "future" or "what_if"
    horizon_days: Mapped[int | None] = mapped_column(
        Integer, nullable=True
    )  # e.g. 30, 90, 180
    input_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)
    output_snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)

    # ── Relationships ────────────────────────────────────────────
    assessment = relationship("Assessment", back_populates="simulations")

    __table_args__ = (
        CheckConstraint(
            "simulation_type IN ('future', 'what_if')",
            name="ck_sim_type",
        ),
        CheckConstraint(
            "horizon_days IS NULL OR horizon_days > 0",
            name="ck_sim_horizon_positive",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<Simulation id={self.id} type={self.simulation_type!r} "
            f"horizon={self.horizon_days}>"
        )
