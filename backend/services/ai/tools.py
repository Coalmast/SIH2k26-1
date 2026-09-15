from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)

try:
    from google.adk.tools import FunctionTool  # type: ignore
except ImportError:  # google-adk is optional in the lightweight API image
    class FunctionTool:  # type: ignore[no-redef]
        def __init__(self, func: Any):
            self.func = func

        async def __call__(self, *args: Any, **kwargs: Any) -> Any:
            return await self.func(*args, **kwargs)


def _rows(result: Any) -> list[dict[str, Any]]:
    return [dict(row) for row in result.mappings().all()]


async def _fetch(db: AsyncSession, query: str, params: dict[str, Any], *, optional: bool = False) -> list[dict[str, Any]]:
    try:
        return _rows(await db.execute(text(query), params))
    except SQLAlchemyError:
        if optional:
            logger.warning("Optional AI data source is unavailable", exc_info=True)
            return []
        raise


async def get_violations(db: AsyncSession, mine_id: str, days: int = 90) -> dict[str, Any]:
    since = datetime.now(timezone.utc) - timedelta(days=max(1, days))
    rows = await _fetch(db, """
        SELECT severity::text AS severity, status::text AS status, COUNT(*)::int AS count
        FROM violations WHERE mine_id = :mine_id AND reported_at >= :since
        GROUP BY severity, status
    """, {"mine_id": mine_id, "since": since})
    return {"mine_id": mine_id, "days": days, "breakdown": rows, "total": sum(r["count"] for r in rows)}


async def get_capa_metrics(db: AsyncSession, mine_id: str) -> dict[str, Any]:
    rows = await _fetch(db, """
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE status IN ('overdue', 'escalated'))::int AS overdue,
               COUNT(*) FILTER (WHERE status IN ('verified_closed', 'completed'))::int AS closed,
               COALESCE(AVG(CASE WHEN completed_at IS NOT NULL
                    THEN EXTRACT(EPOCH FROM (completed_at - created_at)) / 86400 END), 0) AS avg_closure_days
        FROM corrective_actions WHERE mine_id = :mine_id
    """, {"mine_id": mine_id})
    return rows[0] if rows else {"total": 0, "overdue": 0, "closed": 0, "avg_closure_days": 0}


async def get_env_breaches(db: AsyncSession, mine_id: str, days: int = 90) -> dict[str, Any]:
    since = datetime.now(timezone.utc) - timedelta(days=max(1, days))
    rows = await _fetch(db, """
        SELECT parameter::text AS parameter, COUNT(*)::int AS count,
               MAX(recorded_at) AS last_seen
        FROM environment_readings
        WHERE mine_id = :mine_id AND threshold_breached IS TRUE AND recorded_at >= :since
        GROUP BY parameter
    """, {"mine_id": mine_id, "since": since})
    return {"mine_id": mine_id, "days": days, "breaches": rows, "total": sum(r["count"] for r in rows)}


async def get_production_pressure(db: AsyncSession, mine_id: str) -> dict[str, Any]:
    rows = await _fetch(db, """
        SELECT COUNT(*)::int AS readings,
               COALESCE(SUM(quantity_tonnes), 0) AS actual_tonnes,
               COUNT(*) FILTER (WHERE anomaly_flagged IS TRUE)::int AS anomaly_count
        FROM production_readings WHERE mine_id = :mine_id
          AND reporting_date >= CURRENT_DATE - INTERVAL '90 days'
    """, {"mine_id": mine_id})
    return rows[0] if rows else {"readings": 0, "actual_tonnes": 0, "anomaly_count": 0}


async def get_contractor_compliance(db: AsyncSession, mine_id: str) -> dict[str, Any]:
    rows = await _fetch(db, """
        SELECT COUNT(DISTINCT ca.contractor_id)::int AS contractors,
               COUNT(DISTINCT ca.contractor_id) FILTER (WHERE cd.status = 'valid')::int AS compliant
        FROM contractor_assignments ca
        LEFT JOIN contractor_documents cd ON cd.contractor_id = ca.contractor_id
        WHERE ca.mine_id = :mine_id AND ca.status = 'active'
    """, {"mine_id": mine_id})
    result = rows[0] if rows else {"contractors": 0, "compliant": 0}
    result["validity_ratio"] = (result["compliant"] / result["contractors"]) if result["contractors"] else 1.0
    return result


async def get_incident_history(db: AsyncSession, mine_id: str, months: int = 12) -> dict[str, Any]:
    rows = await _fetch(db, """
        SELECT severity::text AS severity, COUNT(*)::int AS count
        FROM incident_reports
        WHERE mine_id = :mine_id AND reported_at >= CURRENT_TIMESTAMP - (:months * INTERVAL '1 month')
        GROUP BY severity
    """, {"mine_id": mine_id, "months": max(1, months)})
    return {"mine_id": mine_id, "months": months, "breakdown": rows, "total": sum(r["count"] for r in rows)}


async def get_grievance_backlog(db: AsyncSession, mine_id: str) -> dict[str, Any]:
    rows = await _fetch(db, """
        SELECT COUNT(*)::int AS unresolved,
               COUNT(*) FILTER (WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days')::int AS older_than_7_days
        FROM grievances WHERE mine_id = :mine_id AND status NOT IN ('resolved', 'closed')
    """, {"mine_id": mine_id}, optional=True)
    return rows[0] if rows else {"unresolved": 0, "older_than_7_days": 0}


async def get_regulation_text(db: AsyncSession, regulation_ref: str) -> str:
    rows = await _fetch(db, """
        SELECT code, title, statute, section_reference, description
        FROM regulations WHERE code = :reference OR section_reference ILIKE :pattern
        ORDER BY is_active DESC LIMIT 1
    """, {"reference": regulation_ref, "pattern": f"%{regulation_ref}%"})
    return "\n".join(f"{key}: {value}" for key, value in rows[0].items()) if rows else ""


async def get_all_violations_18m(db: AsyncSession, mine_id: str) -> list[dict[str, Any]]:
    return await _fetch(db, """
        SELECT v.statute_reference, v.severity::text AS severity, v.reported_at,
               COALESCE(i.zone, 'unspecified') AS zone
        FROM violations v
        LEFT JOIN observations o ON o.id = v.observation_id
        LEFT JOIN inspections i ON i.id = o.inspection_id
        WHERE v.mine_id = :mine_id AND v.reported_at >= CURRENT_TIMESTAMP - INTERVAL '18 months'
        ORDER BY v.reported_at
    """, {"mine_id": mine_id})


async def get_incident_details(db: AsyncSession, incident_id: str) -> dict[str, Any]:
    rows = await _fetch(db, """
        SELECT id, mine_id, incident_type::text AS incident_type, description,
               severity::text AS severity, zone, persons_involved,
               immediate_actions_taken, reported_at
        FROM incident_reports WHERE id = :incident_id
    """, {"incident_id": incident_id})
    return rows[0] if rows else {}


async def get_incident_register(db: AsyncSession, mine_id: str, start: str, end: str) -> list[dict[str, Any]]:
    return await _fetch(db, """
        SELECT id, incident_type::text AS incident_type, description,
               severity::text AS severity, zone, persons_involved, reported_at
        FROM incident_reports
        WHERE mine_id = :mine_id AND reported_at >= :start AND reported_at <= :end
        ORDER BY reported_at
    """, {"mine_id": mine_id, "start": start, "end": end})


async def get_compliance_instances(db: AsyncSession, mine_id: str, start: str, end: str) -> list[dict[str, Any]]:
    return await _fetch(db, """
        SELECT id, status::text AS status, due_date, period_start, period_end,
               requirement_id, notes
        FROM compliance_instances
        WHERE mine_id = :mine_id AND period_start >= :start AND period_end <= :end
        ORDER BY due_date
    """, {"mine_id": mine_id, "start": start, "end": end})


async def get_env_readings(db: AsyncSession, mine_id: str, start: str, end: str) -> list[dict[str, Any]]:
    return await _fetch(db, """
        SELECT parameter::text AS parameter, value, unit, recorded_at,
               threshold_breached, ec_condition_ref
        FROM environment_readings
        WHERE mine_id = :mine_id AND recorded_at >= :start AND recorded_at <= :end
        ORDER BY recorded_at
    """, {"mine_id": mine_id, "start": start, "end": end})


async def get_contractor_register(db: AsyncSession, mine_id: str) -> list[dict[str, Any]]:
    return await _fetch(db, """
        SELECT c.id, c.name, c.registration_number, c.status::text AS status,
               c.trust_score, ca.work_order_number, ca.work_zone
        FROM contractors c
        JOIN contractor_assignments ca ON ca.contractor_id = c.id
        WHERE ca.mine_id = :mine_id
        ORDER BY c.name
    """, {"mine_id": mine_id})


async def get_grievance_status(db: AsyncSession, worker_id: str) -> list[dict[str, Any]]:
    return await _fetch(db, """
        SELECT id, status, category, priority, summary, created_at
        FROM grievances WHERE worker_id = :worker_id ORDER BY created_at DESC LIMIT 20
    """, {"worker_id": worker_id}, optional=True)


async def file_grievance(db: AsyncSession, text_value: str, mine_id: str, worker_id: str) -> dict[str, Any]:
    rows = await _fetch(db, """
        INSERT INTO grievances (mine_id, worker_id, description, status)
        VALUES (:mine_id, :worker_id, :description, 'open')
        RETURNING id, status, created_at
    """, {"mine_id": mine_id, "worker_id": worker_id, "description": text_value}, optional=True)
    if rows:
        await db.commit()
    return rows[0] if rows else {"status": "queued", "description": text_value}


async def get_attendance(db: AsyncSession, worker_id: str, date_range: str = "30d") -> dict[str, Any]:
    rows = await _fetch(db, """
        SELECT COUNT(*)::int AS records,
               COUNT(*) FILTER (WHERE status = 'present')::int AS present
        FROM attendance_records WHERE worker_id = :worker_id
    """, {"worker_id": worker_id}, optional=True)
    return rows[0] if rows else {"records": 0, "present": 0}


async def create_grievance_from_audio(
    db: AsyncSession,
    worker_id: str,
    mine_id: str,
    result: dict[str, Any],
) -> str | None:
    rows = await _fetch(db, """
        INSERT INTO grievances (
            mine_id, worker_id, description, category, priority, status,
            transcription_original, transcription_english, summary
        ) VALUES (
            :mine_id, :worker_id, :description, :category, :priority, 'open',
            :transcription_original, :transcription_english, :summary
        ) RETURNING id
    """, {
        "mine_id": mine_id,
        "worker_id": worker_id,
        "description": result["transcription_english"],
        "category": result["category"],
        "priority": result["priority"],
        "transcription_original": result["transcription_original"],
        "transcription_english": result["transcription_english"],
        "summary": result["summary"],
    }, optional=True)
    if not rows:
        return None
    await db.commit()
    return str(rows[0]["id"])


ADK_TOOLS = [
    FunctionTool(get_violations), FunctionTool(get_capa_metrics), FunctionTool(get_env_breaches),
    FunctionTool(get_production_pressure), FunctionTool(get_contractor_compliance),
    FunctionTool(get_incident_history), FunctionTool(get_grievance_backlog),
    FunctionTool(get_regulation_text), FunctionTool(get_all_violations_18m),
    FunctionTool(get_incident_details), FunctionTool(get_incident_register),
    FunctionTool(get_compliance_instances),
    FunctionTool(get_env_readings), FunctionTool(get_contractor_register),
    FunctionTool(get_grievance_status),
    FunctionTool(file_grievance), FunctionTool(get_attendance),
    FunctionTool(create_grievance_from_audio),
]
