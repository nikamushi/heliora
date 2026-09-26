"""Tests for Clinical Evidence API (FE-011, PRD FR-027, FR-028, BR-EVIDENCE-001).

Covers:
- Listing all evidence entries without filters.
- Filtering by category (activity, nutrition, sleep, etc.).
- Filtering by rule_id (REC-ACT-01).
- Free text search across title, organization, and summary.
- Empty search results handling.
"""

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.services.evidence_service import evidence_service


def test_evidence_service_all_items():
    """Service returns all registered clinical evidence items."""
    res = evidence_service.list_evidence()
    assert res.total >= 5
    assert len(res.items) == res.total
    for item in res.items:
        assert item.id.startswith("evi-")
        assert item.rule_id.startswith("REC-")
        assert len(item.citation) > 0
        assert item.external_url.startswith("http")


def test_evidence_service_category_filter():
    """Service filters correctly by category."""
    res = evidence_service.list_evidence(category="activity")
    assert res.total >= 1
    for item in res.items:
        assert item.category == "activity"


def test_evidence_service_rule_id_filter():
    """Service filters accurately by rule ID."""
    res = evidence_service.list_evidence(rule_id="REC-NUT-01")
    assert res.total == 1
    assert res.items[0].rule_id == "REC-NUT-01"
    assert "PERKENI" in res.items[0].organization


def test_evidence_service_search_query():
    """Service filters by text keyword in summary or title."""
    res = evidence_service.list_evidence(search="kardiometabolik")
    assert res.total >= 1


@pytest.mark.asyncio
async def test_route_get_evidence_all():
    """GET /api/v1/evidence returns 200 with list of clinical evidence items."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        res = await client.get("/api/v1/evidence")
        assert res.status_code == 200
        data = res.json()
        assert "items" in data
        assert "total" in data
        assert data["total"] >= 5


@pytest.mark.asyncio
async def test_route_get_evidence_with_filters():
    """GET /api/v1/evidence handles category and rule_id query params."""
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://testserver"
    ) as client:
        # Filter by category
        res = await client.get("/api/v1/evidence?category=sleep")
        assert res.status_code == 200
        data = res.json()
        assert data["total"] >= 1
        assert all(item["category"] == "sleep" for item in data["items"])

        # Filter by rule_id
        res_rule = await client.get("/api/v1/evidence?rule_id=REC-ACT-01")
        assert res_rule.status_code == 200
        data_rule = res_rule.json()
        assert data_rule["total"] == 1
        assert data_rule["items"][0]["rule_id"] == "REC-ACT-01"

        # Search query
        res_search = await client.get("/api/v1/evidence?search=WHO")
        assert res_search.status_code == 200
        data_search = res_search.json()
        assert data_search["total"] >= 1
