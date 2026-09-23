"""HELIORA API — Assessment request and response schemas.

Implements Architecture §8.7 and PRD FR-042.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict


class RiskAssessmentItem(BaseModel):
    condition: Literal["diabetes", "hypertension", "cardiovascular"]
    label: str
    probability: float
    estimated_risk_score: float
    risk_level: Literal["low", "moderate", "high"]
    risk_label: Literal["Lower", "Moderate", "Higher"] = "Lower"
    trend: Literal["stable", "increasing", "decreasing"] = "stable"
    description: str


class ContributingFactor(BaseModel):
    feature: str
    label: str
    impact: Literal["increase", "decrease"]
    weight_percentage: float
    description: str


class RecommendationItem(BaseModel):
    id: str
    rule_id: str | None = None
    title: str
    category: Literal["sleep", "activity", "nutrition", "stress"]
    priority: Literal["high", "medium", "low", "protective"] = "medium"
    action: str
    evidence_level: Literal["A", "B", "C"] = "A"
    source: str


class AssessmentSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str | None = None
    health_score: float
    lifestyle_score: float
    risks: list[RiskAssessmentItem]
    top_factors: list[ContributingFactor]
    recommendations: list[RecommendationItem]
    assessed_at: str
    is_mock: bool = False
