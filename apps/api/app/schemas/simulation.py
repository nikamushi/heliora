"""HELIORA API — Simulation schemas.

Request and response schemas for Future Health Simulation and What-if analysis.
Implements Architecture §8, §14, PRD BR-SIM-001–008, AC-SIM-01/02, SIM-001, SIM-002.
"""

from typing import Literal

from pydantic import BaseModel, Field

SimulationHorizon = Literal[30, 90, 180]
RiskLevel = Literal["low", "moderate", "high"]
StandardizedRiskLabel = Literal["Lower", "Moderate", "Higher"]

# PRD FR-005 & §20.21 — Mandated verbatim medical disclaimer
MANDATORY_MEDICAL_DISCLAIMER: str = (
    "HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. "
    "Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan model "
    "yang digunakan, bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan."
)


class FutureSimulationRequest(BaseModel):
    """Payload to request model-based risk trajectory projections."""

    horizon_days: SimulationHorizon = Field(
        default=90,
        description="Projection horizon period in days (30, 90, or 180 days).",
    )


class RiskTrajectoryItem(BaseModel):
    """Estimated risk trajectory outcome for a specific chronic condition."""

    condition: Literal["diabetes", "hypertension", "cardiovascular"] = Field(
        ..., description="Standard condition identifier."
    )
    label: str = Field(..., description="Human-readable condition title.")
    baseline_probability: float = Field(
        ..., ge=0.0, le=1.0, description="Current baseline risk probability."
    )
    projected_probability: float = Field(
        ..., ge=0.0, le=1.0, description="Model-projected risk probability at horizon."
    )
    baseline_score: float = Field(
        ..., ge=0.0, le=100.0, description="Current baseline score percentage (0-100)."
    )
    projected_score: float = Field(
        ..., ge=0.0, le=100.0, description="Projected score percentage (0-100)."
    )
    delta_percentage: float = Field(
        ..., description="Net change in risk score (projected - baseline)."
    )
    risk_level: RiskLevel = Field(
        ..., description="Clinical risk category level at projected horizon."
    )
    risk_label: StandardizedRiskLabel = Field(
        ..., description="Standardized editorial label: Lower, Moderate, or Higher."
    )
    trend: Literal["stable", "increasing", "decreasing"] = Field(
        ..., description="Trajectory direction over horizon."
    )
    description: str = Field(
        ..., description="Clinical explanation of projected lifestyle trajectory."
    )


class DailyTrajectoryPoint(BaseModel):
    """Discrete trajectory point evaluated directly by the physiological risk model."""

    day: int = Field(..., ge=0, description="Day offset in simulation horizon.")
    health_score: float = Field(
        ..., ge=0.0, le=100.0, description="Model-evaluated health score."
    )
    lifestyle_score: float = Field(
        ..., ge=0.0, le=100.0, description="Model-evaluated lifestyle score."
    )


class FutureSimulationResponse(BaseModel):
    """Response containing future health projection scenario results."""

    horizon_days: SimulationHorizon = Field(
        ..., description="Simulated horizon in days (30, 90, 180)."
    )
    assumptions: list[str] = Field(
        ..., description="Explicit modeling assumptions under this scenario."
    )
    baseline_health_score: float = Field(
        ..., ge=0.0, le=100.0, description="Current overall health score."
    )
    projected_health_score: float = Field(
        ..., ge=0.0, le=100.0, description="Projected overall health score at horizon."
    )
    baseline_lifestyle_score: float = Field(
        ..., ge=0.0, le=100.0, description="Current lifestyle score."
    )
    projected_lifestyle_score: float = Field(
        ..., ge=0.0, le=100.0, description="Projected lifestyle score at horizon."
    )
    risk_trajectories: list[RiskTrajectoryItem] = Field(
        ..., description="Per-condition trajectory comparison items."
    )
    daily_trajectories: list[DailyTrajectoryPoint] = Field(
        default_factory=list,
        description="Discrete trajectory points evaluated directly by the risk engine model.",
    )
    is_model_estimated: bool = Field(
        default=True,
        description="Mandatory flag indicating model-based simulation (PRD BR-SIM-004).",
    )
    disclaimer: str = Field(
        default=MANDATORY_MEDICAL_DISCLAIMER,
        description="Mandatory verbatim disclaimer distinguishing simulation from clinical forecast (PRD FR-005).",
    )


class WhatIfSimulationRequest(BaseModel):
    """Payload to simulate adjustments on modifiable lifestyle parameters."""

    sleep_duration_hours: float | None = Field(
        default=None,
        ge=3.0,
        le=14.0,
        description="Overridden daily sleep duration in hours (3.0 - 14.0).",
    )
    physical_activity_min_per_week: float | None = Field(
        default=None,
        ge=0.0,
        le=1000.0,
        description="Overridden weekly physical activity minutes (0 - 1000).",
    )
    weight_kg: float | None = Field(
        default=None,
        ge=30.0,
        le=300.0,
        description="Overridden weight in kilograms (30.0 - 300.0).",
    )
    smoking_status: Literal["never", "former", "current"] | None = Field(
        default=None,
        description="Overridden smoking habit status ('never', 'former', 'current').",
    )


class WhatIfConditionComparison(BaseModel):
    """Comparative outcome between baseline and simulated scenario for a chronic disease."""

    condition: Literal["diabetes", "hypertension", "cardiovascular"] = Field(
        ..., description="Condition identifier."
    )
    label: str = Field(..., description="Condition human-readable title.")
    baseline_probability: float = Field(
        ..., ge=0.0, le=1.0, description="Baseline risk probability."
    )
    simulated_probability: float = Field(
        ..., ge=0.0, le=1.0, description="Simulated scenario risk probability."
    )
    baseline_score: float = Field(
        ..., ge=0.0, le=100.0, description="Baseline risk percentage score."
    )
    simulated_score: float = Field(
        ..., ge=0.0, le=100.0, description="Simulated risk percentage score."
    )
    delta_percentage: float = Field(
        ..., description="Score change in percentage points (simulated - baseline)."
    )
    risk_level: RiskLevel = Field(
        ..., description="Clinical risk level under simulated scenario."
    )
    risk_label: StandardizedRiskLabel = Field(
        ..., description="Standardized editorial label: Lower, Moderate, or Higher."
    )
    trend: Literal["stable", "increasing", "decreasing"] = Field(
        ..., description="Direction of risk movement compared to baseline."
    )
    impact_summary: str = Field(
        ..., description="Concise explanation of parameter modification impacts."
    )


class WhatIfSimulationResponse(BaseModel):
    """Response containing What-If simulation comparative results."""

    applied_parameters: dict[str, str | float] = Field(
        ..., description="Dictionary of active lifestyle parameters used in this scenario."
    )
    derived_bmi: float = Field(
        ..., ge=10.0, le=80.0, description="Recalculated BMI based on simulated weight."
    )
    baseline_health_score: float = Field(
        ..., ge=0.0, le=100.0, description="Current baseline overall health score."
    )
    simulated_health_score: float = Field(
        ..., ge=0.0, le=100.0, description="Overall health score under simulated scenario."
    )
    health_score_delta: float = Field(
        ..., description="Change in health score (simulated - baseline)."
    )
    baseline_lifestyle_score: float = Field(
        ..., ge=0.0, le=100.0, description="Current baseline lifestyle habits score."
    )
    simulated_lifestyle_score: float = Field(
        ..., ge=0.0, le=100.0, description="Lifestyle habits score under simulated scenario."
    )
    lifestyle_score_delta: float = Field(
        ..., description="Change in lifestyle score (simulated - baseline)."
    )
    condition_comparisons: list[WhatIfConditionComparison] = Field(
        ..., description="Detailed per-condition comparative risk breakdown."
    )
    is_model_estimated: bool = Field(
        default=True,
        description="Mandatory flag indicating model-based simulation (PRD BR-SIM-004).",
    )
    disclaimer: str = Field(
        default=MANDATORY_MEDICAL_DISCLAIMER,
        description="Mandatory verbatim disclaimer distinguishing simulation from clinical forecast (PRD FR-005).",
    )

