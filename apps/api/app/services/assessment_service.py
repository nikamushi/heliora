"""HELIORA API — Assessment service.

Orchestrates the health assessment pipeline: profile validation, risk calculation,
scoring, factor attribution, recommendations, and persistence (Architecture §6.6, §8, BE-004).
"""

import uuid
from typing import Literal

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.risk_engine import risk_engine
from app.db.models.assessment import Assessment
from app.repositories.assessment_repo import assessment_repo
from app.repositories.health_profile_repo import health_profile_repo
from app.schemas.assessment import (
    AssessmentSummaryResponse,
    ContributingFactor,
    RecommendationItem,
    RiskAssessmentItem,
)


class AssessmentService:
    """Service executing health assessment workflows and outcome formatting."""

    @staticmethod
    def _to_risk_level(prob: float) -> Literal["low", "moderate", "high"]:
        """Map risk probability to categorical clinical level."""
        if prob >= 0.50:
            return "high"
        if prob >= 0.25:
            return "moderate"
        return "low"

    @classmethod
    def _format_assessment_response(
        cls, assessment: Assessment, top_factors: list[ContributingFactor] | None = None
    ) -> AssessmentSummaryResponse:
        """Format an Assessment ORM entity and relations into AssessmentSummaryResponse."""
        rr = assessment.risk_result
        if rr is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Asesmen ditemukan tetapi hasil kalkulasi risiko tidak lengkap.",
            )

        risks = [
            RiskAssessmentItem(
                condition="diabetes",
                label="Diabetes Melitus",
                probability=float(rr.diabetes_risk),
                risk_level=cls._to_risk_level(float(rr.diabetes_risk)),
                trend="stable",
                description="Estimasi faktor risiko metabolik dan pola gaya hidup.",
            ),
            RiskAssessmentItem(
                condition="hypertension",
                label="Hipertensi",
                probability=float(rr.hypertension_risk),
                risk_level=cls._to_risk_level(float(rr.hypertension_risk)),
                trend="stable",
                description="Estimasi regulasi vaskular dan faktor stres/tidur.",
            ),
            RiskAssessmentItem(
                condition="cardiovascular",
                label="Penyakit Jantung",
                probability=float(rr.cardiovascular_risk),
                risk_level=cls._to_risk_level(float(rr.cardiovascular_risk)),
                trend="stable",
                description="Estimasi risiko kardiovaskular kumulatif.",
            ),
        ]

        def map_rec_category(
            rule_id: str,
        ) -> Literal["sleep", "activity", "nutrition", "stress"]:
            if "SLP" in rule_id:
                return "sleep"
            if "ACT" in rule_id:
                return "activity"
            if "NUT" in rule_id:
                return "nutrition"
            return "stress"

        recommendations: list[RecommendationItem] = []
        if assessment.recommendations:
            for rec in assessment.recommendations:
                recommendations.append(
                    RecommendationItem(
                        id=str(rec.id),
                        title=rec.title,
                        category=map_rec_category(rec.rule_id),
                        action=rec.description,
                        evidence_level="A",
                        source=rec.guideline_source,
                    )
                )

        # If top_factors not passed, generate baseline from health profile if available
        factors = top_factors or []
        if not factors and assessment.health_profile:
            factors = risk_engine.extract_top_factors(
                assessment.health_profile,
                {
                    "diabetes_risk": float(rr.diabetes_risk),
                    "hypertension_risk": float(rr.hypertension_risk),
                    "cardiovascular_risk": float(rr.cardiovascular_risk),
                },
            )

        return AssessmentSummaryResponse(
            id=str(assessment.id),
            user_id=str(assessment.user_id),
            health_score=float(rr.health_score),
            lifestyle_score=float(rr.lifestyle_score),
            risks=risks,
            top_factors=factors,
            recommendations=recommendations,
            assessed_at=(
                assessment.created_at.isoformat()
                if assessment.created_at
                else ""
            ),
            is_mock=False,
        )

    async def run_assessment(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> AssessmentSummaryResponse:
        """Run complete assessment for user using their current active health profile."""
        profile = await health_profile_repo.get_by_user_id(session, user_id)
        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Profil kesehatan belum ditemukan. Silakan lengkapi profil kesehatan sebelum melakukan asesmen risiko.",
            )

        # 1. Compute risks & composite scores
        risks = risk_engine.estimate_risks(profile)
        health_score = risk_engine.calculate_health_score(risks)
        lifestyle_score = risk_engine.calculate_lifestyle_score(profile)
        top_factors = risk_engine.extract_top_factors(profile, risks)
        recs_data = risk_engine.generate_recommendations(profile)

        # 2. Persist assessment session & associated outcomes
        assessment = await assessment_repo.create_assessment(
            session,
            user_id=user_id,
            health_profile_id=profile.id,
            status="completed",
        )

        risk_res = await assessment_repo.create_risk_result(
            session,
            assessment_id=assessment.id,
            diabetes_risk=risks["diabetes_risk"],
            hypertension_risk=risks["hypertension_risk"],
            cardiovascular_risk=risks["cardiovascular_risk"],
            health_score=health_score,
            lifestyle_score=lifestyle_score,
        )

        rec_records = await assessment_repo.create_recommendations(
            session,
            assessment_id=assessment.id,
            recommendations_data=recs_data,
        )

        await assessment_repo.commit_assessment_transaction(session, assessment)

        # Attach relations in memory for immediate formatting
        assessment.risk_result = risk_res
        assessment.recommendations = rec_records
        assessment.health_profile = profile

        return self._format_assessment_response(assessment, top_factors)

    async def get_latest_assessment(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> AssessmentSummaryResponse:
        """Retrieve the user's most recent assessment."""
        assessment = await assessment_repo.get_latest_by_user_id(session, user_id)
        if assessment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Belum ada data asesmen risiko. Silakan jalankan asesmen terlebih dahulu.",
            )
        return self._format_assessment_response(assessment)

    async def get_assessment_by_id(
        self, session: AsyncSession, assessment_id: uuid.UUID, user_id: uuid.UUID
    ) -> AssessmentSummaryResponse:
        """Retrieve a specific assessment by ID for the authenticated user."""
        assessment = await assessment_repo.get_by_id_and_user_id(
            session, assessment_id, user_id
        )
        if assessment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data asesmen risiko tidak ditemukan.",
            )
        return self._format_assessment_response(assessment)


assessment_service = AssessmentService()
