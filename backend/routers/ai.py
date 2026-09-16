from __future__ import annotations

import logging
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from services.ai.agents import AnomalyDetectionAgent, GrievanceAudioAgent, IncidentClassificationAgent, RiskScoringAgent
from services.ai.gateway import GeminiNotConfigured
from services.ai.schemas import AnomalyResult, AudioGrievanceRequest, AudioGrievanceResult, ContractorTrustScore, IncidentClassification, IncidentClassificationRequest, LatestRiskScore
from services.ai.utilities import compute_trust_score

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/ai", tags=["AI Analytics"])


async def _require_entity(db: AsyncSession, table: str, entity_id: UUID, label: str) -> None:
    row = (await db.execute(text(f"SELECT 1 FROM {table} WHERE id = :entity_id LIMIT 1"), {"entity_id": entity_id})).scalar_one_or_none()
    if row is None:
        raise HTTPException(status_code=404, detail=f"{label} not found")


@router.post("/score/mine/{mine_id}", response_model=LatestRiskScore)
async def trigger_risk_score(mine_id: UUID, db: AsyncSession = Depends(get_db)) -> LatestRiskScore:
    try:
        await _require_entity(db, "mines", mine_id, "Mine")
        return await RiskScoringAgent().run(db, mine_id)
    except HTTPException:
        raise
    except GeminiNotConfigured as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Risk score failed for mine %s", mine_id)
        raise HTTPException(status_code=500, detail="Unable to compute mine risk score") from exc


@router.get("/score/mine/{mine_id}/latest", response_model=LatestRiskScore)
async def get_latest_risk_score(mine_id: UUID, db: AsyncSession = Depends(get_db)) -> LatestRiskScore:
    await _require_entity(db, "mines", mine_id, "Mine")
    row = (await db.execute(text("""
        SELECT mine_id, score, risk_level::text AS risk_level, trend::text AS trend,
               contributing_factors, gemini_agent_version, computed_at
        FROM mine_risk_scores WHERE mine_id = :mine_id ORDER BY computed_at DESC LIMIT 1
    """), {"mine_id": mine_id})).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="No risk score exists for this mine")
    return LatestRiskScore(mine_id=row["mine_id"], score=row["score"], risk_level=row["risk_level"], trend=row["trend"], contributing_factors=row["contributing_factors"] or [], recommendations=[], computed_at=row["computed_at"], model_version=row["gemini_agent_version"])


@router.get("/anomalies/{mine_id}")
async def list_anomalies(mine_id: UUID, db: AsyncSession = Depends(get_db)) -> list[dict]:
    await _require_entity(db, "mines", mine_id, "Mine")
    result = await db.execute(text("""
        SELECT id, mine_id, anomaly_type::text AS anomaly_type, severity::text AS severity,
               description, confidence, is_acknowledged, detected_at
        FROM anomaly_flags WHERE mine_id = :mine_id ORDER BY detected_at DESC
    """), {"mine_id": mine_id})
    return [dict(row) for row in result.mappings().all()]


@router.post("/classify-incident", response_model=IncidentClassification)
async def classify_incident(payload: IncidentClassificationRequest) -> IncidentClassification:
    try:
        return await IncidentClassificationAgent().run(payload.description, payload.incident_type)
    except GeminiNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Incident classification failed")
        raise HTTPException(status_code=502, detail=f"Incident classification failed: {exc}") from exc


@router.post("/contractor-trust/{contractor_id}", response_model=ContractorTrustScore)
async def contractor_trust(contractor_id: UUID, db: AsyncSession = Depends(get_db)) -> ContractorTrustScore:
    await _require_entity(db, "contractors", contractor_id, "Contractor")
    result = await compute_trust_score(db, contractor_id)
    await db.execute(text("UPDATE contractors SET trust_score = :score WHERE id = :id"), {"score": result["score"], "id": contractor_id})
    await db.commit()
    return ContractorTrustScore(contractor_id=contractor_id, **result)


@router.post("/grievance/process-audio", response_model=AudioGrievanceResult)
async def process_grievance_audio(payload: AudioGrievanceRequest, db: AsyncSession = Depends(get_db)) -> AudioGrievanceResult:
    try:
        await _require_entity(db, "mines", payload.mine_id, "Mine")
        return await GrievanceAudioAgent().run(str(payload.audio_url), payload.worker_id, payload.mine_id, payload.language_hint, db=db)
    except HTTPException:
        raise
    except GeminiNotConfigured as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:
        logger.exception("Audio grievance processing failed")
        raise HTTPException(status_code=502, detail="Audio grievance processing failed") from exc
