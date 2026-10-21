"""HELIORA API — Application configuration.

Uses pydantic-settings to load configuration from environment variables.
Secrets and deployment-specific values MUST come from the environment,
never from source code (Architecture §22.3).
"""

from pydantic import field_validator, model_validator
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
    CORS_ORIGIN_REGEX: str | None = r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$"

    # ── LLM Provider (Gemini — ADR-009, Architecture §41) ────────────
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-3.5-flash-lite"
    LLM_TIMEOUT_SECONDS: int = 10

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

    @model_validator(mode="after")
    def populate_supabase_defaults(self) -> "Settings":
        """Auto-populate Supabase JWKS URL and issuer from SUPABASE_URL if not provided."""
        if self.SUPABASE_URL:
            base = self.SUPABASE_URL.rstrip("/")
            if not self.SUPABASE_JWKS_URL:
                self.SUPABASE_JWKS_URL = f"{base}/auth/v1/.well-known/jwks.json"
            if not self.SUPABASE_ISSUER:
                self.SUPABASE_ISSUER = f"{base}/auth/v1"
        return self

    @model_validator(mode="after")
    def validate_cors_security(self) -> "Settings":
        """Ensure CORS localhost regex is strictly disabled outside development/test environments."""
        if self.APP_ENV not in ("development", "test", "testing", "local"):
            self.CORS_ORIGIN_REGEX = None
        return self

    @property
    def database_url_sync(self) -> str:
        """Return a synchronous database URL for Alembic migrations."""
        return self.DATABASE_URL.replace("postgresql+asyncpg", "postgresql+psycopg2")


settings = Settings()
