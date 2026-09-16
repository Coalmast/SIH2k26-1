import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport
from main import app

# Scoped headers with a dummy Supabase JWT Bearer token
AUTH_HEADERS = {"Authorization": "Bearer fake-jwt-token"}

@pytest.mark.asyncio
async def test_compute_mine_risk_score_endpoint():
    """Test POST /api/v1/ai/score/mine/{mine_id} with mocked Gemini agent response."""
    mock_score_data = {
        "mine_id": "00000000-0000-0000-0000-000000000123",
        "score": 78.5,
        "risk_level": "high",
        "trend": "worsening",
        "contributing_factors": [
            {"feature": "violation_count_90d", "weight": 0.4, "explanation": "High violation density"}
        ],
        "recommendations": ["Inspect Pit 3 East immediately"],
        "computed_at": "2026-09-15T18:00:00Z",
        "model_version": "RiskScoringAgent-v1/gemini-1.5-pro",
    }

    with patch("routers.ai.RiskScoringAgent.run", new_callable=AsyncMock) as mock_agent, \
         patch("routers.ai._require_entity", new_callable=AsyncMock):
        mock_agent.return_value = mock_score_data

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/ai/score/mine/00000000-0000-0000-0000-000000000123",
                headers=AUTH_HEADERS
            )

        assert response.status_code == 200
        data = response.json()
        assert data["score"] == 78.5
        assert data["risk_level"] == "high"


@pytest.mark.asyncio
async def test_contractor_trust_score_deterministic():
    """Test POST /api/v1/ai/contractor-trust/{contractor_id} deterministic calculation."""
    trust_score = {
        "score": 95.0,
        "breakdown": {
            "document_score": 40.0,
            "safety_score": 27.0,
            "capa_score": 18.0,
            "billing_score": 10.0,
        },
    }
    with patch("routers.ai.compute_trust_score", new_callable=AsyncMock, return_value=trust_score), \
         patch("routers.ai._require_entity", new_callable=AsyncMock), \
         patch("sqlalchemy.ext.asyncio.AsyncSession.execute", new_callable=AsyncMock), \
         patch("sqlalchemy.ext.asyncio.AsyncSession.commit", new_callable=AsyncMock):

        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            response = await ac.post(
                "/api/v1/ai/contractor-trust/00000000-0000-0000-0000-000000000567",
                headers=AUTH_HEADERS
            )

        assert response.status_code == 200
        # Formula: (40 * 1.0) + (30 * 0.9) + (20 * 0.9) + (10 * 1.0) = 40 + 27 + 18 + 10 = 95.0
        assert response.json()["score"] == 95.0