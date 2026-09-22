"""HELIORA API — Authentication routes.

Endpoints for user registration, authentication, token issuance,
and authenticated session retrieval.
Implements Architecture §20 and BE-001.
"""

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, get_db
from app.db.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services.auth_service import auth_service

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    deprecated=True,
    summary="Register a new user (Deprecated)",
    description=(
        "[DEPRECATED per ADR-011: Use Supabase Auth for user registration.] "
        "Registers a new user account with validated credentials "
        "and returns a legacy JWT access token."
    ),
)
async def register(
    payload: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Register a new user account."""
    return await auth_service.register_user(db, payload)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    deprecated=True,
    summary="User login via JSON (Deprecated)",
    description=(
        "[DEPRECATED per ADR-011: Use Supabase Auth for user authentication.] "
        "Authenticates user credentials provided via JSON body "
        "and returns a legacy JWT bearer token."
    ),
)
async def login(
    payload: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """Log in an existing user via JSON payload."""
    return await auth_service.authenticate_user(
        db, email=payload.email, plain_password=payload.password
    )


@router.post(
    "/token",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    deprecated=True,
    summary="OAuth2 Password token endpoint (Deprecated)",
    description=(
        "[DEPRECATED per ADR-011: Kept for OpenAPI Swagger UI and legacy local dev.] "
        "OAuth2-compatible form login endpoint for Swagger UI authorization."
    ),
)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    """OAuth2 password form login (used by OpenAPI Swagger UI)."""
    return await auth_service.authenticate_user(
        db, email=form_data.username, plain_password=form_data.password
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
    description="Returns the profile data of the currently authenticated user.",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Retrieve currently authenticated user profile."""
    return UserResponse.model_validate(current_user)
