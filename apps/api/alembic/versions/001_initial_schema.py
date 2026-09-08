"""Initial database schema for HELIORA.

Creates the 9 core entities:
- users
- consents
- health_profiles
- assessments
- risk_results
- xai_results
- simulations
- recommendations
- evidence

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-09-08
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001_initial_schema"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # ── 1. users ──────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=128), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # ── 2. consents ───────────────────────────────────────────────
    op.create_table(
        "consents",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "consent_version",
            sa.String(length=20),
            nullable=False,
            server_default="1.0",
        ),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_consents_user_id", "consents", ["user_id"])

    # ── 3. health_profiles ─────────────────────────────────────────
    op.create_table(
        "health_profiles",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("age", sa.Integer(), nullable=False),
        sa.Column("gender", sa.String(length=20), nullable=False),
        sa.Column("height_cm", sa.Numeric(precision=5, scale=1), nullable=False),
        sa.Column("weight_kg", sa.Numeric(precision=5, scale=1), nullable=False),
        sa.Column(
            "physical_activity_min_per_week",
            sa.Numeric(precision=6, scale=1),
            nullable=False,
        ),
        sa.Column(
            "sleep_duration_hours",
            sa.Numeric(precision=3, scale=1),
            nullable=False,
        ),
        sa.Column("smoking_status", sa.String(length=30), nullable=False),
        sa.Column(
            "family_history",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
        sa.Column("stress_level", sa.Integer(), nullable=True),
        sa.Column(
            "waist_circumference_cm",
            sa.Numeric(precision=5, scale=1),
            nullable=True,
        ),
        sa.Column("blood_pressure", sa.String(length=20), nullable=True),
        sa.Column(
            "blood_sugar_mg_dl",
            sa.Numeric(precision=6, scale=1),
            nullable=True,
        ),
        sa.Column(
            "cholesterol_mg_dl",
            sa.Numeric(precision=6, scale=1),
            nullable=True,
        ),
        sa.Column("bmi", sa.Numeric(precision=4, scale=1), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint("age >= 1 AND age <= 150", name="ck_hp_age_range"),
        sa.CheckConstraint("height_cm > 0", name="ck_hp_height_positive"),
        sa.CheckConstraint("weight_kg > 0", name="ck_hp_weight_positive"),
        sa.CheckConstraint(
            "physical_activity_min_per_week >= 0",
            name="ck_hp_activity_non_negative",
        ),
        sa.CheckConstraint(
            "sleep_duration_hours >= 0 AND sleep_duration_hours <= 24",
            name="ck_hp_sleep_range",
        ),
        sa.CheckConstraint(
            "stress_level IS NULL OR (stress_level >= 1 AND stress_level <= 10)",
            name="ck_hp_stress_range",
        ),
        sa.CheckConstraint("bmi IS NULL OR bmi > 0", name="ck_hp_bmi_positive"),
    )
    op.create_index("ix_health_profiles_user_id", "health_profiles", ["user_id"])

    # ── 4. assessments ────────────────────────────────────────────
    op.create_table(
        "assessments",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "health_profile_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("health_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "status", sa.String(length=20), nullable=False, server_default="pending"
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "status IN ('pending', 'processing', 'completed', 'failed')",
            name="ck_assessment_status",
        ),
    )
    op.create_index("ix_assessments_user_id", "assessments", ["user_id"])
    op.create_index(
        "ix_assessments_user_created", "assessments", ["user_id", "created_at"]
    )

    # ── 5. risk_results ───────────────────────────────────────────
    op.create_table(
        "risk_results",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "assessment_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("assessments.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("diabetes_risk", sa.Numeric(precision=5, scale=4), nullable=False),
        sa.Column(
            "hypertension_risk", sa.Numeric(precision=5, scale=4), nullable=False
        ),
        sa.Column(
            "cardiovascular_risk", sa.Numeric(precision=5, scale=4), nullable=False
        ),
        sa.Column("health_score", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("lifestyle_score", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column(
            "model_version",
            sa.String(length=50),
            nullable=False,
            server_default="1.0.0",
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "diabetes_risk >= 0.0 AND diabetes_risk <= 1.0",
            name="ck_risk_diabetes_range",
        ),
        sa.CheckConstraint(
            "hypertension_risk >= 0.0 AND hypertension_risk <= 1.0",
            name="ck_risk_hypertension_range",
        ),
        sa.CheckConstraint(
            "cardiovascular_risk >= 0.0 AND cardiovascular_risk <= 1.0",
            name="ck_risk_cardiovascular_range",
        ),
        sa.CheckConstraint(
            "health_score >= 0.0 AND health_score <= 100.0",
            name="ck_risk_health_score_range",
        ),
        sa.CheckConstraint(
            "lifestyle_score >= 0.0 AND lifestyle_score <= 100.0",
            name="ck_risk_lifestyle_score_range",
        ),
    )
    op.create_index(
        "ix_risk_results_assessment_id",
        "risk_results",
        ["assessment_id"],
        unique=True,
    )

    # ── 6. xai_results ────────────────────────────────────────────
    op.create_table(
        "xai_results",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "risk_result_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("risk_results.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("feature_name", sa.String(length=100), nullable=False),
        sa.Column("contribution", sa.Numeric(precision=8, scale=4), nullable=False),
        sa.Column("direction", sa.String(length=20), nullable=False),
        sa.Column("rank", sa.Integer(), nullable=False),
        sa.CheckConstraint("rank >= 1", name="ck_xai_rank_positive"),
        sa.CheckConstraint(
            "direction IN ('positive', 'negative')",
            name="ck_xai_direction",
        ),
    )
    op.create_index("ix_xai_results_risk_result_id", "xai_results", ["risk_result_id"])
    op.create_index(
        "ix_xai_results_risk_rank", "xai_results", ["risk_result_id", "rank"]
    )

    # ── 7. simulations ────────────────────────────────────────────
    op.create_table(
        "simulations",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "assessment_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("assessments.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("simulation_type", sa.String(length=30), nullable=False),
        sa.Column("horizon_days", sa.Integer(), nullable=True),
        sa.Column("input_snapshot", sa.JSON(), nullable=False),
        sa.Column("output_snapshot", sa.JSON(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "simulation_type IN ('future', 'what_if')",
            name="ck_sim_type",
        ),
        sa.CheckConstraint(
            "horizon_days IS NULL OR horizon_days > 0",
            name="ck_sim_horizon_positive",
        ),
    )
    op.create_index("ix_simulations_assessment_id", "simulations", ["assessment_id"])

    # ── 8. recommendations ────────────────────────────────────────
    op.create_table(
        "recommendations",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "assessment_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("assessments.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("rule_id", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("guideline_source", sa.String(length=255), nullable=False),
        sa.Column("priority", sa.String(length=20), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.CheckConstraint(
            "priority IN ('high', 'medium', 'low')",
            name="ck_rec_priority",
        ),
    )
    op.create_index(
        "ix_recommendations_assessment_id",
        "recommendations",
        ["assessment_id"],
    )

    # ── 9. evidence ───────────────────────────────────────────────
    op.create_table(
        "evidence",
        sa.Column(
            "id", postgresql.UUID(as_uuid=True), primary_key=True, nullable=False
        ),
        sa.Column(
            "recommendation_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("recommendations.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("publisher", sa.String(length=255), nullable=False),
        sa.Column("source_url", sa.String(length=1024), nullable=False),
        sa.Column("evidence_level", sa.String(length=50), nullable=True),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
    )
    op.create_index("ix_evidence_recommendation_id", "evidence", ["recommendation_id"])


def downgrade() -> None:
    # Drop tables in reverse dependency order
    op.drop_table("evidence")
    op.drop_table("recommendations")
    op.drop_table("simulations")
    op.drop_table("xai_results")
    op.drop_table("risk_results")
    op.drop_table("assessments")
    op.drop_table("health_profiles")
    op.drop_table("consents")
    op.drop_table("users")
