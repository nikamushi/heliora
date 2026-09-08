"""Tests for the API health check endpoint (SETUP-003)."""

import pytest
from httpx import AsyncClient

from app.core.config import settings


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    """GET /api/v1/health should return 200 OK with status and metadata."""
    response = await client.get(f"{settings.API_V1_PREFIX}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["project"] == "HELIORA"
    assert "environment" in data
    assert "version" in data
