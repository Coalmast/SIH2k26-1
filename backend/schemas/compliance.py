from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime, date
import uuid
from models.compliance import ComplianceCategory, MineTypeEnum, RequirementFrequency, InstanceStatus, EvidenceOcrStatus

class RegulationBase(BaseModel):
    code: str
    title: str
    category: ComplianceCategory
    authority: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True

class RegulationCreate(RegulationBase):
    pass

class RegulationRead(RegulationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class RequirementBase(BaseModel):
    title: str
    mine_type: MineTypeEnum
    frequency: RequirementFrequency
    grace_period_days: int = 0
    applies_to_subsidiaries: Optional[list] = None
    auto_generate: bool = True

class RequirementCreate(RequirementBase):
    regulation_id: uuid.UUID

class RequirementRead(RequirementBase):
    id: uuid.UUID
    regulation_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ComplianceInstanceBase(BaseModel):
    mine_id: uuid.UUID
    status: InstanceStatus = InstanceStatus.PENDING
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    due_date: date
    assigned_to: Optional[uuid.UUID] = None
    escalation_tier: int = 0
    regulator_visible: bool = False

class ComplianceInstanceRead(ComplianceInstanceBase):
    id: uuid.UUID
    requirement_id: uuid.UUID
    escalated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    requirement: Optional[RequirementRead] = None

    class Config:
        from_attributes = True

class ComplianceInstanceUpdate(BaseModel):
    status: Optional[InstanceStatus] = None
    assigned_to: Optional[uuid.UUID] = None
    rejection_reason: Optional[str] = None

class EvidenceUploadResponse(BaseModel):
    id: uuid.UUID
    file_key: str
    file_name: str
    ocr_status: EvidenceOcrStatus

class SubmitEvidenceRequest(BaseModel):
    notes: Optional[str] = None

class ComplianceHealthScore(BaseModel):
    score: int
    total: int
    overdue: int
    pending: int
    mom_change: float

class CalendarDayItem(BaseModel):
    date: date
    instances: List[ComplianceInstanceRead]
