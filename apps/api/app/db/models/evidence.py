"""HELIORA — Evidence model.

Stores evidence metadata supporting clinical recommendations and RAG
knowledge retrieval (Architecture §7.4, §12).
"""

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, CreatedAtMixin, UUIDPrimaryKeyMixin


class Evidence(Base, UUIDPrimaryKeyMixin, CreatedAtMixin):
    """Medical/clinical evidence source metadata."""

    __tablename__ = "evidence"

    recommendation_id: Mapped[str | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("recommendations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    publisher: Mapped[str] = mapped_column(
        String(255), nullable=False
    )  # e.g., "American Heart Association", "WHO", "ADA"
    source_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    evidence_level: Mapped[str | None] = mapped_column(
        String(50), nullable=True
    )  # e.g., "Level 1A", "Grade A", "Expert Consensus"
    summary: Mapped[str] = mapped_column(Text, nullable=False)

    # ── Relationships ────────────────────────────────────────────
    recommendation = relationship("Recommendation", back_populates="evidences")

    def __repr__(self) -> str:
        return (
            f"<Evidence id={self.id} publisher={self.publisher!r} "
            f"title={self.title[:30]!r}>"
        )
