"""Tests for Consent API and privacy gating (BE-002).

Covers consent recording, status checking, revocation, and the
require_active_consent dependency guard.
"""

import uuid
from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from fastapi import Depends
from httpx import ASGITransport, AsyncClient

from app.api.dependencies import get_current_user, get_db, require_active_consent
from app.core.config import settings
from app.db.models.consent import Consent
from app.db.models.user import User
from app.main import app


# Add a temporary test-only route to test require_active_consent guard
@app.get("/api/v1/test-protected-health-action", tags=["test"])
async def protected_health_action(
    consent: Consent = Depends(require_active_consent),
):
    return {"status": "success", "consent_id": str(consent.id)}


def test_default_medical_disclaimer_verbatim():
    """DEFAULT_MEDICAL_DISCLAIMER matches PRD FR-005 verbatim."""
    from app.schemas.consent import DEFAULT_MEDICAL_DISCLAIMER

    expected = (
        "HELIORA adalah alat bantu preventive health berbasis lifestyle dan AI. "
        "Hasil yang diberikan merupakan estimasi dan simulasi berdasarkan data dan "
        "model yang digunakan, bukan diagnosis medis dan bukan pengganti "
        "konsultasi tenaga kesehatan."
    )
    assert DEFAULT_MEDICAL_DISCLAIMER == expected


@pytest.fixture
def mock_user() -> User:
    return User(
        id=uuid.uuid4(),
        email="consent_tester@heliora.health",
        full_name="Consent Tester",
        password_hash=None,
    )


@pytest.mark.asyncio
async def test_consent_lifecycle(mock_user: User):
    """Lifecycle test: check initial status, grant consent, recheck, and revoke."""
    active_consent: Consent | None = None

    async def mock_get_active(session, user_id):
        return active_consent

    async def mock_create(session, *, user_id, consent_version="1.0"):
        nonlocal active_consent
        now = datetime.now(UTC)
        active_consent = Consent(
            id=uuid.uuid4(),
            user_id=user_id,
            consent_version=consent_version,
            accepted_at=now,
            revoked_at=None,
        )
        return active_consent

    async def mock_revoke(session, user_id):
        nonlocal active_consent
        if active_consent is None:
            return None
        revoked = Consent(
            id=active_consent.id,
            user_id=active_consent.user_id,
            consent_version=active_consent.consent_version,
            accepted_at=active_consent.accepted_at,
            revoked_at=datetime.now(UTC),
        )
        active_consent = None
        return revoked

    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: AsyncMock()

    try:
        with (
            patch(
                "app.services.consent_service.consent_repo.get_active_by_user_id",
                side_effect=mock_get_active,
            ),
            patch(
                "app.services.consent_service.consent_repo.create_or_renew",
                side_effect=mock_create,
            ),
            patch(
                "app.services.consent_service.consent_repo.revoke",
                side_effect=mock_revoke,
            ),
            patch(
                "app.api.dependencies.consent_repo.get_active_by_user_id",
                side_effect=mock_get_active,
            ),
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                headers = {"Authorization": "Bearer mock-token"}

                # 1. Initially, user has no active consent
                status_res = await client.get(
                    f"{settings.API_V1_PREFIX}/consent/status",
                    headers=headers,
                )
                assert status_res.status_code == 200
                status_data = status_res.json()
                assert status_data["has_active_consent"] is False
                assert status_data["active_consent"] is None
                assert (
                    "bukan diagnosis medis dan bukan pengganti konsultasi tenaga kesehatan"
                    in status_data["medical_disclaimer"]
                )

                # 2. Protected action should be blocked before consent (HTTP 403)
                blocked_res = await client.get(
                    f"{settings.API_V1_PREFIX}/test-protected-health-action",
                    headers=headers,
                )
                assert blocked_res.status_code == 403
                assert "Active consent" in blocked_res.json()["detail"]

                # 3. User grants consent
                grant_res = await client.post(
                    f"{settings.API_V1_PREFIX}/consent",
                    headers=headers,
                    json={"agreed": True, "consent_version": "1.0"},
                )
                assert grant_res.status_code == 201
                grant_data = grant_res.json()
                assert grant_data["is_active"] is True
                assert grant_data["consent_version"] == "1.0"
                assert grant_data["revoked_at"] is None

                # 4. Status now reports active consent
                active_status_res = await client.get(
                    f"{settings.API_V1_PREFIX}/consent/status",
                    headers=headers,
                )
                assert active_status_res.status_code == 200
                assert active_status_res.json()["has_active_consent"] is True

                # 5. Protected action is now permitted (HTTP 200)
                allowed_res = await client.get(
                    f"{settings.API_V1_PREFIX}/test-protected-health-action",
                    headers=headers,
                )
                assert allowed_res.status_code == 200
                assert allowed_res.json()["status"] == "success"

                # 6. User revokes consent
                revoke_res = await client.post(
                    f"{settings.API_V1_PREFIX}/consent/revoke",
                    headers=headers,
                )
                assert revoke_res.status_code == 200
                revoke_data = revoke_res.json()
                assert revoke_data["is_active"] is False
                assert revoke_data["revoked_at"] is not None

                # 7. Status now reports consent revoked
                post_revoke_status = await client.get(
                    f"{settings.API_V1_PREFIX}/consent/status",
                    headers=headers,
                )
                assert post_revoke_status.status_code == 200
                assert post_revoke_status.json()["has_active_consent"] is False

                # 8. Protected action is blocked again after revocation (HTTP 403)
                blocked_again_res = await client.get(
                    f"{settings.API_V1_PREFIX}/test-protected-health-action",
                    headers=headers,
                )
                assert blocked_again_res.status_code == 403
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_consent_disagreed_validation(mock_user: User):
    """POST /consent with agreed=False must return 400 Bad Request."""
    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: AsyncMock()
    try:
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            res = await client.post(
                f"{settings.API_V1_PREFIX}/consent",
                headers={"Authorization": "Bearer mock-token"},
                json={"agreed": False, "consent_version": "1.0"},
            )
            assert res.status_code == 400
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_consent_revoke_not_found(mock_user: User):
    """Revoking when no active consent exists returns 404."""
    app.dependency_overrides[get_current_user] = lambda: mock_user
    app.dependency_overrides[get_db] = lambda: AsyncMock()
    try:
        with patch(
            "app.services.consent_service.consent_repo.revoke",
            new_callable=AsyncMock,
            return_value=None,
        ):
            async with AsyncClient(
                transport=ASGITransport(app=app), base_url="http://testserver"
            ) as client:
                res = await client.post(
                    f"{settings.API_V1_PREFIX}/consent/revoke",
                    headers={"Authorization": "Bearer mock-token"},
                )
                assert res.status_code == 404
    finally:
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_consent_unauthorized(client: AsyncClient):
    """Accessing consent endpoints without auth returns 401."""
    res_status = await client.get(f"{settings.API_V1_PREFIX}/consent/status")
    assert res_status.status_code == 401

    res_post = await client.post(
        f"{settings.API_V1_PREFIX}/consent",
        json={"agreed": True},
    )
    assert res_post.status_code == 401
