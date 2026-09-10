"""HELIORA — Database models package.

Re-exports all SQLAlchemy models for clean imports and Alembic autogenerate discovery.
Architecture §7.4, DB-001.
"""

from app.db.base import Base
from app.db.models.assessment import Assessment
from app.db.models.consent import Consent
from app.db.models.evidence import Evidence
from app.db.models.health_profile import HealthProfile
from app.db.models.recommendation import Recommendation
from app.db.models.risk_result import RiskResult
from app.db.models.simulation import Simulation
from app.db.models.user import User
from app.db.models.xai_result import XAIResult

__all__ = [
    "Base",
    "User",
    "Consent",
    "HealthProfile",
    "Assessment",
    "RiskResult",
    "XAIResult",
    "Simulation",
    "Recommendation",
    "Evidence",
]
