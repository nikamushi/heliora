"""Tests for core security utilities: bcrypt hashing and JWT tokens."""

from datetime import timedelta

import pytest
from jose import jwt

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)


def test_password_hashing():
    raw = "SuperSecret123!"
    hashed = hash_password(raw)
    assert hashed != raw
    assert verify_password(raw, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_token_lifecycle():
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    token = create_access_token(subject=user_id, expires_delta=timedelta(minutes=15))
    decoded = decode_access_token(token)
    assert decoded["sub"] == user_id
    assert "exp" in decoded


def test_jwt_token_expired():
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    token = create_access_token(subject=user_id, expires_delta=timedelta(seconds=-1))
    with pytest.raises(jwt.JWTError):
        decode_access_token(token)
