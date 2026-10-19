import math
from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class RiskEngineProtocol(Protocol):
    """Structural typing protocol declaring sibling methods required across engine mixins."""

    def estimate_risks(self, profile: Any) -> dict[str, float]: ...

    @staticmethod
    def calculate_health_score(profile: Any, risks: dict[str, float]) -> float: ...

    @staticmethod
    def calculate_lifestyle_score(profile: Any) -> float: ...

    @staticmethod
    def extract_top_factors(profile: Any, risks: dict[str, float]) -> list[Any]: ...


def _sigmoid(x: float) -> float:
    """Logistic sigmoid function."""
    try:
        return 1.0 / (1.0 + math.exp(-x))
    except OverflowError:
        return 0.0 if x < 0 else 1.0


# Bobot resmi Lifestyle Score (docs/Lifestyle-Score.md §5, AI-005). Jumlah = 1.00.
LIFESTYLE_WEIGHT_BMI = 0.30
LIFESTYLE_WEIGHT_ACTIVITY = 0.25
LIFESTYLE_WEIGHT_SLEEP = 0.20
LIFESTYLE_WEIGHT_SMOKING = 0.15
LIFESTYLE_WEIGHT_OTHER = 0.10

# Bobot resmi Health Score hybrid (docs/Health-Score.md §4, AI-004 rework,
# PRD §11.5.3). Jumlah = 1.00.
HEALTH_WEIGHT_LIFESTYLE = 0.50
HEALTH_WEIGHT_RISK = 0.35
HEALTH_WEIGHT_IMPROVEMENT = 0.15

# Bobot deduksi komponen risiko Health Score (diwarisi AI-004). Jumlah = 1.00.
HEALTH_RISK_WEIGHT_DIABETES = 0.35
HEALTH_RISK_WEIGHT_HYPERTENSION = 0.35
HEALTH_RISK_WEIGHT_CARDIOVASCULAR = 0.30

# Skor protektif komponen Improvement Health Score (konteks riwayat keluarga,
# faktor ke-5 BR-SCORE-003 yang tidak tercakup komponen Lifestyle).
HEALTH_IMPROVEMENT_NO_HISTORY = 100.0
HEALTH_IMPROVEMENT_WITH_HISTORY = 40.0
