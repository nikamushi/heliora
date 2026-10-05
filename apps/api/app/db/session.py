"""HELIORA API — Async database session management.

Creates the async engine and session factory used throughout the
application. The engine is configured from ``DATABASE_URL`` in the
environment (Architecture §28.1).
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.APP_ENV == "development"),
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
    connect_args={
        "statement_cache_size": 0,
        "prepared_statement_cache_size": 0,
    },
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
