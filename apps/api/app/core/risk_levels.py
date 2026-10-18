"""HELIORA API — Shared risk level and label mapping.

Single source of truth for risk probability bands and standardized labels
(Design.md §2.4: low < 0.25, moderate 0.25–0.50, high >= 0.50).
"""

from typing import Literal

RiskLevel = Literal["low", "moderate", "high"]
RiskLabel = Literal["Lower", "Moderate", "Higher"]

RISK_LEVEL_MODERATE_THRESHOLD = 0.25
RISK_LEVEL_HIGH_THRESHOLD = 0.50

RISK_LABELS: dict[str, RiskLabel] = {
    "low": "Lower",
    "moderate": "Moderate",
    "high": "Higher",
}


def to_risk_level(prob: float) -> RiskLevel:
    """Map a risk probability to its categorical level."""
    if prob >= RISK_LEVEL_HIGH_THRESHOLD:
        return "high"
    if prob >= RISK_LEVEL_MODERATE_THRESHOLD:
        return "moderate"
    return "low"


def to_risk_label(level: str) -> RiskLabel:
    """Map a risk level to its standardized display label."""
    return RISK_LABELS.get(level, "Lower")
