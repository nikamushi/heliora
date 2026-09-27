"""HELIORA API — Application configuration.

Uses pydantic-settings to load configuration from environment variables.
Secrets and deployment-specific values MUST come from the environment,
never from source code (Architecture §22.3).
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ──────────────────────────────────────────────
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-me-to-a-random-secret-key"
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "HELIORA"

    # ── Database ─────────────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://heliora:heliora@localhost:5432/heliora"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        """Ensure standard postgresql:// scheme uses asyncpg driver."""
        if isinstance(v, str) and v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v

    # ── CORS ─────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

    # ── Auth (Legacy & FastAPI Native) ───────────────────────────
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    TOKEN_ALGORITHM: str = "HS256"

    # ── Supabase Auth / JWKS Verifier (ADR-011 / Issue #18) ──────
    SUPABASE_URL: str | None = None
    SUPABASE_JWKS_URL: str | None = None
    SUPABASE_ISSUER: str | None = None
    SUPABASE_AUDIENCE: str = "authenticated"
    SUPABASE_ALLOWED_ALGS: list[str] = ["ES256", "RS256"]
    SUPABASE_JWKS_CACHE_TTL_SECONDS: int = 3600

    @property
    def database_url_sync(self) -> str:
        """Return a synchronous database URL for Alembic migrations."""
        return self.DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")

    def supabase_config_problems(self) -> list[str]:
        """Report Supabase settings that are only partly configured.

        Supabase tokens carry a `kid`, and ``verify_token`` only routes them to
        the JWKS verifier when ``SUPABASE_JWKS_URL`` is set. A half-filled
        environment therefore looks healthy while sending every Google token
        down the legacy HS256 path, where it surfaces as a signature error with
        nothing pointing at the missing setting. Local development that never
        enables Supabase at all is left alone.
        """
        if not self.SUPABASE_JWKS_URL:
            partially_set = [
                name
                for name in ("SUPABASE_URL", "SUPABASE_ISSUER")
                if getattr(self, name)
            ]
            if not partially_set:
                return []
            return [
                f"{', '.join(partially_set)} is set but SUPABASE_JWKS_URL is not. "
                "Supabase tokens will be routed to the legacy HS256 verifier "
                "and rejected."
            ]

        if not self.SUPABASE_ISSUER:
            return [
                "SUPABASE_JWKS_URL is set but SUPABASE_ISSUER is not. Issuer "
                "validation is skipped, so a token minted by another project "
                "would be accepted."
            ]

        return []


settings = Settings()
