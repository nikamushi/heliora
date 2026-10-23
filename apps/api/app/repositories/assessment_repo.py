"""HELIORA API — Assessment repository.

Encapsulates database operations for Assessment, RiskResult, and Recommendation entities.
Implements Architecture §6.6, §7.4, §8, and BE-004.
"""

import uuid
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.db.models.assessment import Assessment
from app.db.models.recommendation import Recommendation
from app.db.models.risk_result import RiskResult
from app.db.models.xai_result import XAIResult


class AssessmentRepository:
    """Data-access repository for health assessments and associated analytics."""

    async def count_completed_by_user_id(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> int:
        """Count total completed assessments for a user to determine baseline status."""
        try:
            stmt = (
                select(Assessment.id)
                .where(Assessment.user_id == user_id)
                .where(Assessment.status == "completed")
                .order_by(Assessment.created_at.desc())
                .limit(2)
            )
            result = await session.execute(stmt)
            return len(result.scalars().all())
        except Exception:
            return 1

    async def get_latest_by_user_id(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> Assessment | None:
        """Fetch the most recent assessment for a user with related risk and recommendations."""
        stmt = (
            select(Assessment)
            .where(Assessment.user_id == user_id)
            .options(
                joinedload(Assessment.risk_result).selectinload(RiskResult.xai_results),
                selectinload(Assessment.recommendations),
                joinedload(Assessment.health_profile),
            )
            .order_by(Assessment.created_at.desc())
            .limit(1)
        )
        result = await session.execute(stmt)
        return result.scalars().first()

    async def get_by_id_and_user_id(
        self, session: AsyncSession, assessment_id: uuid.UUID, user_id: uuid.UUID
    ) -> Assessment | None:
        """Fetch a specific assessment by ID belonging to the authenticated user."""
        stmt = (
            select(Assessment)
            .where(Assessment.id == assessment_id, Assessment.user_id == user_id)
            .options(
                joinedload(Assessment.risk_result).selectinload(RiskResult.xai_results),
                selectinload(Assessment.recommendations),
                joinedload(Assessment.health_profile),
            )
        )
        result = await session.execute(stmt)
        return result.scalars().first()

    async def create_assessment(
        self,
        session: AsyncSession,
        *,
        user_id: uuid.UUID,
        health_profile_id: uuid.UUID,
        status: str = "completed",
    ) -> Assessment:
        """Create and persist a new Assessment session."""
        assessment = Assessment(
            user_id=user_id,
            health_profile_id=health_profile_id,
            status=status,
        )
        session.add(assessment)
        await session.flush()
        return assessment

    async def create_risk_result(
        self,
        session: AsyncSession,
        *,
        assessment_id: uuid.UUID,
        diabetes_risk: float,
        hypertension_risk: float,
        cardiovascular_risk: float,
        health_score: float,
        lifestyle_score: float,
        model_version: str = "1.0.0",
    ) -> RiskResult:
        """Create and persist the RiskResult output for an assessment."""
        risk_result = RiskResult(
            assessment_id=assessment_id,
            diabetes_risk=Decimal(str(round(diabetes_risk, 4))),
            hypertension_risk=Decimal(str(round(hypertension_risk, 4))),
            cardiovascular_risk=Decimal(str(round(cardiovascular_risk, 4))),
            health_score=Decimal(str(round(health_score, 2))),
            lifestyle_score=Decimal(str(round(lifestyle_score, 2))),
            model_version=model_version,
        )
        session.add(risk_result)
        await session.flush()
        return risk_result

    async def create_recommendations(
        self,
        session: AsyncSession,
        *,
        assessment_id: uuid.UUID,
        recommendations_data: list[dict[str, Any]],
    ) -> list[Recommendation]:
        """Create and persist generated clinical lifestyle recommendations."""
        records: list[Recommendation] = []
        for item in recommendations_data:
            rec = Recommendation(
                assessment_id=assessment_id,
                rule_id=item["rule_id"],
                title=item["title"],
                description=item["action"],
                guideline_source=item["source"],
                priority=item.get("priority", "medium"),
            )
            session.add(rec)
            records.append(rec)
        await session.flush()
        return records

    async def create_xai_results(
        self,
        session: AsyncSession,
        *,
        risk_result_id: uuid.UUID,
        factors_data: list[Any],
    ) -> list[XAIResult]:
        """Create and persist XAI contributing factor attributions."""
        records: list[XAIResult] = []
        for rank, factor in enumerate(factors_data, start=1):
            if isinstance(factor, dict):
                feature_name = factor["feature"]
                direction = (
                    "positive" if factor.get("impact") == "increase" else "negative"
                )
                raw_weight = float(factor.get("weight_percentage", 0.0))
            else:
                feature_name = factor.feature
                direction = "positive" if factor.impact == "increase" else "negative"
                raw_weight = float(factor.weight_percentage)

            xai = XAIResult(
                risk_result_id=risk_result_id,
                feature_name=feature_name,
                contribution=Decimal(str(round(raw_weight, 4))),
                direction=direction,
                rank=rank,
            )
            session.add(xai)
            records.append(xai)
        await session.flush()
        return records

    async def commit_assessment_transaction(
        self, session: AsyncSession, assessment: Assessment
    ) -> Assessment:
        """Commit full transaction and reload assessment with eager relations."""
        await session.commit()
        stmt = (
            select(Assessment)
            .where(Assessment.id == assessment.id)
            .options(
                selectinload(Assessment.risk_result).selectinload(
                    RiskResult.xai_results
                ),
                selectinload(Assessment.recommendations),
                selectinload(Assessment.health_profile),
            )
        )
        result = await session.execute(stmt)
        loaded = result.scalars().first()
        return loaded if isinstance(loaded, Assessment) else assessment


assessment_repo = AssessmentRepository()
