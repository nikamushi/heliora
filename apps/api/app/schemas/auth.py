"""HELIORA API — Authentication request and response schemas.

Implements Architecture §20 and BE-001.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRegisterRequest(BaseModel):
    """Payload for registering a new user."""

    email: EmailStr = Field(
        ...,
        description="User email address (must be valid format).",
        examples=["aksal@heliora.health"],
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="User password (minimum 8 characters).",
        examples=["SecurePass123!"],
    )
    full_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="User full name.",
        examples=["Aksal Pratama"],
    )


class UserLoginRequest(BaseModel):
    """Payload for authenticating an existing user via JSON."""

    email: EmailStr = Field(
        ...,
        description="User registered email address.",
        examples=["aksal@heliora.health"],
    )
    password: str = Field(
        ...,
        description="User account password.",
        examples=["SecurePass123!"],
    )


class UserResponse(BaseModel):
    """User profile response representation."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str
    created_at: datetime


class TokenResponse(BaseModel):
    """Response returned upon successful authentication."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
