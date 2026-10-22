"""HELIORA API — Request dependencies.

Provides FastAPI dependency functions for database sessions,
authentication context, and privacy consent gating (Architecture §5.3, §20.3, §21.1).
"""

import logging
import uuid
from collections.abc import AsyncGenerator

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import verify_token
from app.db.models.consent import Consent
from app.db.models.user import User
from app.db.session import async_session_factory
from app.repositories.consent_repo import consent_repo
from app.repositories.user_repo import user_repo

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/token")


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async database session scoped to a single request.

    The session is automatically closed when the request finishes,
    regardless of success or failure.
    """
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Validate JWT bearer token (Supabase JWKS or legacy) and resolve User entity."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        try:
            raw_h = jwt.get_unverified_header(token)
            logger.warning(f"[AUTH DIAGNOSTIC] Incoming token header: {raw_h}")
        except Exception as h_err:
            logger.warning(f"[AUTH DIAGNOSTIC] Failed to read header: {h_err}")

        payload = verify_token(token)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            logger.warning("[AUTH 401] Token missing 'sub' claim")
            raise credentials_exception
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError) as exc:
        logger.warning(f"[AUTH 401] Token verification failed: {exc}")
        raise credentials_exception

    user = await user_repo.get_by_id(db, user_id)
    if user is None:
        logger.warning(f"[AUTH 401] User ID {user_id} not found in public.users")
        raise credentials_exception

    return user


async def require_active_consent(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Consent:
    """Ensure user has active consent prior to protected health actions.

    Enforces Architecture §21.1 and AC-CONSENT-01.
    """
    active_consent = await consent_repo.get_active_by_user_id(db, current_user.id)
    if active_consent is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Active consent and medical disclaimer agreement required "
                "before proceeding to health profile or assessment. "
                "Please accept terms at /onboarding/consent."
            ),
        )
    return active_consent
