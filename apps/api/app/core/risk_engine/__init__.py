"""HELIORA API — Preventive Lifestyle Risk Engine (facade).

Computes estimated lifestyle risk probabilities (Diabetes, Hypertension, Cardiovascular),
composite Health & Lifestyle Scores, SHAP-compatible feature contributions, and
deterministic guideline-backed recommendations (Architecture §8, §9, §10, §14).

The engine composes focused mixins:
- ``estimation`` — chronic disease risk probabilities (log-odds model)
- ``scoring`` — hybrid Health Score and weighted Lifestyle Score
- ``factors`` — contributing factors, XAI formatting, recommendations
- ``simulation`` — future trajectory and what-if projection
"""

from app.core.risk_engine.estimation import RiskEstimationMixin
from app.core.risk_engine.factors import FactorExtractionMixin
from app.core.risk_engine.scoring import ScoreCalculationMixin
from app.core.risk_engine.simulation import SimulationMixin

__all__ = [
    "PreventiveLifestyleRiskEngine",
    "risk_engine",
]


class PreventiveLifestyleRiskEngine(
    RiskEstimationMixin,
    ScoreCalculationMixin,
    FactorExtractionMixin,
    SimulationMixin,
):
    """Core deterministic risk estimation and scoring engine for HELIORA."""


risk_engine = PreventiveLifestyleRiskEngine()
