"""Schema parity and fixes for Supabase auth and health profiles.

Includes:
- Allow nullable password_hash on users (Supabase OAuth & managed auth support)
- Add family_history_details column on health_profiles table

Revision ID: 002_schema_parity_and_fixes
Revises: 001_initial_schema
Create Date: 2026-09-23
"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002_schema_parity_and_fixes"
down_revision: str | None = "001_initial_schema"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Allow nullable password_hash on users table
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(length=128),
        nullable=True,
    )

    # 2. Add family_history_details column to health_profiles
    op.add_column(
        "health_profiles",
        sa.Column("family_history_details", sa.Text(), nullable=True),
    )


def downgrade() -> None:
    # 1. Drop family_history_details column
    op.drop_column("health_profiles", "family_history_details")

    # 2. Revert password_hash to NOT NULL
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.String(length=128),
        nullable=False,
    )
