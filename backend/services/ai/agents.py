from __future__ import annotations

import base64
import json
import logging
import os
import traceback
from collections import Counter
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

import httpx
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from .gateway import GeminiGateway, gemini
from .schemas import (
    AnomalyResult, AudioGrievanceResult, IncidentClassification, ReportDraft, RiskScore,
    ViolationCluster,
)
from .tools import (
    get_all_violations_18m, get_capa_metrics, get_contractor_compliance, get_contractor_register,
    get_env_breaches, get_env_readings, get_grievance_backlog, get_incident_details,
    get_incident_history, get_incident_register, get_production_pressure, get_violations,
    get_compliance_instances, create_grievance_from_audio, get_regulation_text,
)
from .tools import FunctionTool

logger = logging.getLogger(__name__)
FAST_GEMINI_MODEL = os.getenv("GEMINI_FAST_MODEL", "gemini-3.6-flash")
SPEC_FAST_GEMINI_MODEL = "gemini-2.0-flash"


RISK_SCORING_TOOLS = [
    get_violations, get_capa_metrics, get_env_breaches, get_production_pressure,
    get_contractor_compliance, get_incident_history, get_grievance_backlog,
    get_regulation_text,
]
REPORT_DRAFTING_TOOLS = [
    get_incident_details, get_compliance_instances, get_env_readings,
    get_regulation_text, get_contractor_register,
]
RISK_SCORING_ADK_TOOLS = [FunctionTool(tool) for tool in RISK_SCORING_TOOLS]
REPORT_DRAFTING_ADK_TOOLS = [FunctionTool(tool) for tool in REPORT_DRAFTING_TOOLS]


async def _save(db: AsyncSession, query: str, params: dict[str, Any]) -> None:
    await db.execute(text(query), params)
    await db.commit()


class RiskScoringAgent:
    model = "gemini-1.5-pro"

    async def run(self, db: AsyncSession, mine_id: UUID, gateway: GeminiGateway = gemini) -> RiskScore:
        data = {"violations": await get_violations(db, str(mine_id)), "capa": await get_capa_metrics(db, str(mine_id)),
                "environment": await get_env_breaches(db, str(mine_id)), "production": await get_production_pressure(db, str(mine_id)),
                "contractors": await get_contractor_compliance(db, str(mine_id)), "incidents": await get_incident_history(db, str(mine_id), 12),
                "grievances": await get_grievance_backlog(db, str(mine_id))}
        prompt = """You are COMET RiskScoringAgent. Analyze this mine data and return JSON only with score 0-100, risk_level low|medium|high|critical, trend improving|stable|worsening, contributing_factors [{feature,weight,explanation}], recommendations [string]. Data:\n""" + json.dumps(data, default=str)
        result = await gateway.generate_json(self.model, prompt)
        score = RiskScore.model_validate({**result, "mine_id": mine_id, "computed_at": datetime.now(timezone.utc), "model_version": f"RiskScoringAgent-v1/{self.model}"})
        previous = (await db.execute(text("SELECT score FROM mine_risk_scores WHERE mine_id=:mine_id ORDER BY computed_at DESC LIMIT 1"), {"mine_id": mine_id})).scalar_one_or_none()
        await _save(db, """INSERT INTO mine_risk_scores (mine_id, score, risk_level, trend, contributing_factors, gemini_agent_version, previous_score) VALUES (:mine_id,:score,:risk_level,:trend,CAST(:factors AS jsonb),:version,:previous)""", {"mine_id": mine_id, "score": score.score, "risk_level": score.risk_level, "trend": score.trend, "factors": json.dumps([f.model_dump() for f in score.contributing_factors]), "version": score.model_version, "previous": previous})
        return score


class AnomalyDetectionAgent:
    spec_model = SPEC_FAST_GEMINI_MODEL
    model = FAST_GEMINI_MODEL

    async def run(self, db: AsyncSession, mine_id: UUID, gateway: GeminiGateway = gemini) -> AnomalyResult:
        rows = await get_all_violations_18m(db, str(mine_id))
        counts = Counter((row.get("zone") or "unspecified", row.get("statute_reference") or "unspecified") for row in rows)
        clusters = [ViolationCluster(zone=zone, statute_reference=statute, occurrence_count=count, is_systemic=count >= 5, explanation=f"{count} occurrences in the last 18 months") for (zone, statute), count in counts.items() if count >= 3]
        try:
            await gateway.generate_json(
                self.model,
                "Analyze these 18-month mine violations for recurring zone/statute patterns. "
                "Return JSON only with clusters; do not invent records. "
                + json.dumps(rows, default=str),
            )
        except Exception:
            logger.warning("Anomaly model enrichment failed; using deterministic clusters", exc_info=True)
        result = AnomalyResult(mine_id=mine_id, clusters=clusters, detected_at=datetime.now(timezone.utc), model_version=f"AnomalyDetectionAgent-v1/{self.model}")
        for cluster in result.clusters:
            await _save(db, """INSERT INTO anomaly_flags (mine_id, anomaly_type, data_source, severity, description, confidence, contributing_data_points, gemini_agent_version) VALUES (:mine_id,'production_anomaly','violations',:severity,:description,:confidence,CAST(:points AS jsonb),:version)""", {"mine_id": mine_id, "severity": "critical" if cluster.is_systemic else "high", "description": cluster.explanation, "confidence": 1.0, "points": json.dumps(cluster.model_dump(mode="json")), "version": result.model_version})
        return result


class IncidentClassificationAgent:
    spec_model = SPEC_FAST_GEMINI_MODEL
    model = os.getenv("GEMINI_INCIDENT_MODEL", FAST_GEMINI_MODEL)

    async def run(self, description: str, incident_type: str, gateway: GeminiGateway = gemini) -> IncidentClassification:
        try:
            result = await gateway.generate_json(
                self.model,
                "Classify this mine incident. Return only this JSON schema: "
                '{"suggested_category":"roof_fall|gas_explosion|equipment_failure|fire|'
                'electrical|surface_subsidence|other",'
                '"suggested_severity":"minor|moderate|major|fatal",'
                '"statutory_form_required":"4-A|4-B|4-C|none",'
                '"immediate_actions":["string"]}. '
                f"Type: {incident_type}. Description: {description}",
            )
            return IncidentClassification.model_validate(result)
        except Exception as exc:
            logger.error("Gemini Incident Classification Error: %s", exc)
            logger.error(traceback.format_exc())
            raise


class GrievanceAudioAgent:
    spec_model = SPEC_FAST_GEMINI_MODEL
    model = FAST_GEMINI_MODEL

    async def run(self, audio_url: str, worker_id: UUID, mine_id: UUID, language_hint: str | None = None, db: AsyncSession | None = None, gateway: GeminiGateway = gemini) -> AudioGrievanceResult:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(audio_url)
            response.raise_for_status()
        encoded = base64.b64encode(response.content).decode()
        contents = [{"inline_data": {"mime_type": response.headers.get("content-type", "audio/wav"), "data": encoded}}, "Transcribe and classify this Indian coal mine worker grievance. Return the exact requested JSON schema. Languages: hi, bn, or, mr, en. Hint: " + str(language_hint)]
        result = AudioGrievanceResult.model_validate(await gateway.generate_json(self.model, "", contents))
        grievance_id = await create_grievance_from_audio(
            db, str(worker_id), str(mine_id), result.model_dump()
        ) if db is not None else None
        return result.model_copy(update={"grievance_id": grievance_id})


class ReportDraftingAgent:
    model = "gemini-1.5-pro"

    async def run(self, db: AsyncSession, report_type: str, mine_id: UUID, period_start: datetime, period_end: datetime, gateway: GeminiGateway = gemini) -> ReportDraft:
        start, end = period_start.isoformat(), period_end.isoformat()
        data = {
            "incidents": await get_incident_register(db, str(mine_id), start, end),
            "compliance": await get_compliance_instances(db, str(mine_id), start, end),
            "environment": await get_env_readings(db, str(mine_id), start, end),
            "contractors": await get_contractor_register(db, str(mine_id)),
        }
        prompt = f"Draft formal statutory narrative for {report_type}, mine {mine_id}, from {start} to {end}. Use this data: {json.dumps(data, default=str)}. Include exact CMR 2017 or EC citations. Return JSON with narrative_sections, statutory_citations, data_summary."
        return ReportDraft.model_validate(await gateway.generate_json(self.model, prompt))


class WorkerChatbotAgent:
    spec_model = SPEC_FAST_GEMINI_MODEL
    model = FAST_GEMINI_MODEL

    def __init__(self) -> None:
        self._history: dict[str, list[dict[str, str]]] = {}

    async def get_chat_history(self, session_id: str) -> list[dict[str, str]]:
        return list(self._history.get(session_id, []))

    async def save_chat_history(self, session_id: str, message: str, response: str) -> None:
        self._history.setdefault(session_id, []).extend([
            {"role": "user", "content": message},
            {"role": "assistant", "content": response},
        ])

    async def run(self, message: str, worker_id: UUID, mine_id: UUID, language: str | None = None, session_id: str = "default", gateway: GeminiGateway = gemini) -> str:
        history = await self.get_chat_history(session_id)
        prompt = f"You are COMET WorkerChatbotAgent. Reply concisely in {language or 'the worker preferred language'}. Never reveal other workers' data. Worker {worker_id}, mine {mine_id}. History: {json.dumps(history)}. Message: {message}"
        result = await gateway.generate_json(self.model, prompt)
        response = str(result.get("response") or result.get("message") or result)
        await self.save_chat_history(session_id, message, response)
        return response
