"""HELIORA API — Authentication service.

Business logic for user registration and credential authentication.
Implements Architecture §20 and BE-001.
"""

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.repositories.user_repo import user_repo
from app.schemas.auth import (
    TokenResponse,
    UserRegisterRequest,
    UserResponse,
)


class AuthService:
    """Service handling user authentication and registration workflows."""

    async def register_user(
        self, session: AsyncSession, payload: UserRegisterRequest
    ) -> TokenResponse:
        """Register a new user, hash password, and issue initial JWT token."""
        normalized_email = payload.email.lower().strip()

        existing_user = await user_repo.get_by_email(session, normalized_email)
        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered.",
            )

        hashed_pw = hash_password(payload.password)
        new_user = await user_repo.create(
            session,
            email=normalized_email,
            password_hash=hashed_pw,
            full_name=payload.full_name,
        )

        access_token = create_access_token(subject=str(new_user.id))
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(new_user),
        )

    async def authenticate_user(
        self, session: AsyncSession, email: str, plain_password: str
    ) -> TokenResponse:
        """Validate user credentials and return a signed JWT token."""
        normalized_email = email.lower().strip()

        user = await user_repo.get_by_email(session, normalized_email)
        if user is None or not verify_password(plain_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        access_token = create_access_token(subject=str(user.id))
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )


auth_service = AuthService()
