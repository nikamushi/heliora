"""HELIORA API — Assessment service.

Orchestrates the health assessment pipeline: profile validation,
risk calculation, SHAP-based explainable AI, scoring, factor attribution,
recommendations, and persistence (Architecture §6.6, §8, BE-004, XAI-001).
"""

import logging
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

logger = logging.getLogger(__name__)

try:
    from app.ai.shap_explainer import explain_health_profile as explain_shap_profile
except ImportError:
    explain_shap_profile = None  # type: ignore[assignment]


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
        """Format an Assessment ORM entity into AssessmentSummaryResponse."""
        rr = assessment.risk_result
        if rr is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Asesmen ditemukan tetapi hasil kalkulasi risiko tidak lengkap.",
            )

        def map_risk_item(
            condition: Literal["diabetes", "hypertension", "cardiovascular"],
            label: str,
            prob: float,
            description: str,
        ) -> RiskAssessmentItem:
            level = cls._to_risk_level(prob)
            label_map: dict[str, Literal["Lower", "Moderate", "Higher"]] = {
                "low": "Lower",
                "moderate": "Moderate",
                "high": "Higher",
            }
            return RiskAssessmentItem(
                condition=condition,
                label=label,
                probability=prob,
                estimated_risk_score=round(prob * 100.0, 1),
                risk_level=level,
                risk_label=label_map[level],
                trend="stable",
                description=description,
            )

        risks = [
            map_risk_item(
                "diabetes",
                "Diabetes Melitus",
                float(rr.diabetes_risk),
                "Estimasi faktor risiko metabolik dan pola gaya hidup.",
            ),
            map_risk_item(
                "hypertension",
                "Hipertensi",
                float(rr.hypertension_risk),
                "Estimasi regulasi vaskular dan faktor stres/tidur.",
            ),
            map_risk_item(
                "cardiovascular",
                "Penyakit Jantung",
                float(rr.cardiovascular_risk),
                "Estimasi risiko kardiovaskular kumulatif.",
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
                rec_priority: Literal["high", "medium", "low", "protective"] = (
                    rec.priority  # type: ignore[assignment]
                    if rec.priority in ("high", "medium", "low", "protective")
                    else "medium"
                )
                recommendations.append(
                    RecommendationItem(
                        id=str(rec.id),
                        rule_id=rec.rule_id,
                        title=rec.title,
                        category=map_rec_category(rec.rule_id),
                        priority=rec_priority,
                        action=rec.description,
                        evidence_level="A",
                        source=rec.guideline_source,
                    )
                )

        # 1. Prefer explicitly supplied in-memory factors (e.g. fresh SHAP run)
        factors: list[ContributingFactor] = []
        if top_factors:
            for f in top_factors:
                if isinstance(f, dict):
                    factors.append(
                        ContributingFactor(
                            feature=f["feature"],
                            label=f.get("label", f["feature"].replace("_", " ").title()),
                            impact=f.get("impact", "increase"),
                            weight_percentage=f.get("weight_percentage", 0.0),
                            description=f.get(
                                "description",
                                f"Kontribusi faktor {f['feature']} terhadap estimasi risiko.",
                            ),
                        )
                    )
                else:
                    factors.append(f)

        # 2. Reconstruct from persisted XAI results (historical immutability)
        if not factors and rr.xai_results:
            factors = [
                risk_engine.format_factor_from_xai(
                    xr.feature_name,
                    xr.direction,
                    float(xr.contribution),
                )
                for xr in rr.xai_results
            ]

        # 3. Fallback only for legacy records without persisted XAI results
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
                assessment.created_at.isoformat() if assessment.created_at else ""
            ),
            is_mock=False,
        )

    async def run_assessment(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> AssessmentSummaryResponse:
        """Run complete assessment for user using their active health profile."""
        profile = await health_profile_repo.get_by_user_id(session, user_id)
        if profile is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "Profil kesehatan belum ditemukan. Silakan lengkapi "
                    "profil kesehatan sebelum melakukan asesmen risiko."
                ),
            )

        # 1. Compute risks & composite scores
        risks = risk_engine.estimate_risks(profile)
        health_score = risk_engine.calculate_health_score(profile, risks)
        lifestyle_score = risk_engine.calculate_lifestyle_score(profile)

        # XAI-001: SHAP-based feature attribution
        try:
            if explain_shap_profile is not None:
                shap_factors = explain_shap_profile(profile)
                top_factors_data = shap_factors if shap_factors else risk_engine.extract_top_factors(profile, risks)
            else:
                logger.debug("SHAP not available, using rule-based factors")
                top_factors_data = risk_engine.extract_top_factors(profile, risks)
        except Exception as e:
            logger.warning("SHAP explanation failed, falling back to rule-based: %s", e)
            top_factors_data = risk_engine.extract_top_factors(profile, risks)

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

        xai_records = await assessment_repo.create_xai_results(
            session,
            risk_result_id=risk_res.id,
            factors_data=top_factors_data,
        )

        await assessment_repo.commit_assessment_transaction(session, assessment)

        # Attach relations in memory for immediate formatting
        risk_res.xai_results = xai_records
        assessment.risk_result = risk_res
        assessment.recommendations = rec_records
        assessment.health_profile = profile

        return self._format_assessment_response(assessment, top_factors_data)

    async def get_latest_assessment(
        self, session: AsyncSession, user_id: uuid.UUID
    ) -> AssessmentSummaryResponse:
        """Retrieve the user's most recent assessment."""
        assessment = await assessment_repo.get_latest_by_user_id(session, user_id)
        if assessment is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=(
                    "Belum ada data asesmen risiko. "
                    "Silakan jalankan asesmen terlebih dahulu."
                ),
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
