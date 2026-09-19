from __future__ import annotations

from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl, field_validator

RiskLevel = Literal["low", "medium", "high", "critical"]
RiskTrend = Literal["improving", "stable", "worsening"]


class ContributingFactor(BaseModel):
    feature: str
    weight: float = Field(ge=0, le=1)
    explanation: str


class RiskScore(BaseModel):
    mine_id: UUID
    score: float = Field(ge=0, le=100)
    risk_level: RiskLevel
    trend: RiskTrend
    contributing_factors: list[ContributingFactor] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    computed_at: datetime
    model_version: str


class ViolationCluster(BaseModel):
    zone: str
    statute_reference: str
    occurrence_count: int = Field(ge=3)
    is_systemic: bool
    first_seen: datetime | None = None
    last_seen: datetime | None = None
    explanation: str


class AnomalyResult(BaseModel):
    mine_id: UUID
    clusters: list[ViolationCluster] = Field(default_factory=list)
    detected_at: datetime
    model_version: str


class IncidentClassificationRequest(BaseModel):
    description: str = Field(min_length=1, max_length=20_000)
    incident_type: str = Field(min_length=1, max_length=100)


class IncidentClassification(BaseModel):
    suggested_category: Literal[
        "roof_fall", "gas_explosion", "equipment_failure", "fire",
        "electrical", "surface_subsidence", "other"
    ]
    suggested_severity: Literal["minor", "moderate", "major", "fatal"]
    statutory_form_required: Literal["4-A", "4-B", "4-C", "none"]
    immediate_actions: list[str] = Field(default_factory=list)


class AudioGrievanceRequest(BaseModel):
    audio_url: HttpUrl
    worker_id: UUID
    mine_id: UUID
    language_hint: Literal["hi", "bn", "or", "mr", "en"] | None = None


class AudioGrievanceResult(BaseModel):
    transcription_original: str
    transcription_english: str
    category: Literal["safety", "wages", "harassment", "environment", "facilities", "other"]
    priority: Literal["critical", "high", "medium", "low"]
    summary: str
    language_detected: Literal["hi", "bn", "or", "mr", "en"]
    grievance_id: UUID | None = None


class ReportDraftRequest(BaseModel):
    report_type: str
    mine_id: UUID
    period_start: datetime
    period_end: datetime


class ReportDraft(BaseModel):
    narrative_sections: dict[str, str]
    statutory_citations: list[str] = Field(default_factory=list)
    data_summary: dict[str, Any] = Field(default_factory=dict)


class ContractorTrustScore(BaseModel):
    contractor_id: UUID
    score: float = Field(ge=0, le=100)
    breakdown: dict[str, float]


class WorkerMessage(BaseModel):
    worker_id: UUID
    mine_id: UUID
    message: str = Field(min_length=1, max_length=4000)
    language: str | None = None


class LatestRiskScore(RiskScore):
    pass


class ErrorResponse(BaseModel):
    detail: str
