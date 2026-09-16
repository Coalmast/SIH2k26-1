from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def _scalar(db: AsyncSession, query: str, params: dict[str, Any], default: float = 0) -> float:
    value = (await db.execute(text(query), params)).scalar_one_or_none()
    return float(value or default)


async def compute_trust_score(db: AsyncSession, contractor_id: UUID | str) -> dict[str, Any]:
    """Compute the Section 9.7 score without model inference."""
    doc_ratio = await _scalar(db, """
        SELECT COALESCE(AVG(CASE WHEN status = 'valid' THEN 1.0 ELSE 0.0 END), 0)
        FROM contractor_documents WHERE contractor_id = :contractor_id
    """, {"contractor_id": contractor_id})
    violation_penalty = await _scalar(db, """
        SELECT LEAST(COUNT(*)::numeric / 10, 1)
        FROM violations v JOIN contractor_assignments ca ON ca.mine_id = v.mine_id
        WHERE ca.contractor_id = :contractor_id AND v.status NOT IN ('closed', 'dismissed')
    """, {"contractor_id": contractor_id})
    capa_rate = await _scalar(db, """
        SELECT COALESCE(AVG(CASE WHEN status IN ('completed', 'verified_closed') THEN 1.0 ELSE 0.0 END), 0)
        FROM corrective_actions ca JOIN contractor_assignments a ON a.mine_id = ca.mine_id
        WHERE a.contractor_id = :contractor_id
    """, {"contractor_id": contractor_id})
    billing_anomaly = await _scalar(db, """
        SELECT CASE WHEN EXISTS (
          SELECT 1 FROM anomaly_flags WHERE anomaly_type = 'billing_anomaly'
            AND data_source = :contractor_id
        ) THEN 1 ELSE 0 END
    """, {"contractor_id": str(contractor_id)})
    breakdown = {
        "document_score": 40 * doc_ratio,
        "safety_score": 30 * (1 - violation_penalty),
        "capa_score": 20 * capa_rate,
        "billing_score": 10 * (1 - billing_anomaly),
    }
    return {"score": round(sum(breakdown.values()), 2), "breakdown": breakdown}
