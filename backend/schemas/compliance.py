from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime, date
import uuid
from models.compliance import ComplianceCategory, InstanceStatus, AuthorityEnum, RequirementFrequency, EvidenceUploadMethod
from models.mine import MineTypeEnum, RoleNameEnum

class RegulationBase(BaseModel):
    code: str
    title: str
    category: ComplianceCategory
    authority: Optional[AuthorityEnum] = None
    description: Optional[str] = None
    statute: Optional[str] = None
    section_reference: Optional[str] = None
    consequence_of_non_compliance: Optional[str] = None
    version: int = 1
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
    recurrence: RequirementFrequency
    applicable_mine_types: List[MineTypeEnum]
    grace_period_days: int = 0
    reminder_offsets_days: List[int] = [30, 7, 1]
    applicable_states: Optional[List[str]] = None
    documents_required: Optional[List[str]] = None
    responsible_role: Optional[RoleNameEnum] = None
    regulation_version: Optional[int] = None

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
    subsidiary_id: Optional[uuid.UUID] = None
    status: InstanceStatus = InstanceStatus.pending
    period_start: date
    period_end: date
    due_date: date
    assigned_to: Optional[uuid.UUID] = None
    is_late_submission: bool = False
    regulation_version: Optional[int] = None

class ComplianceInstanceRead(ComplianceInstanceBase):
    id: uuid.UUID
    requirement_id: uuid.UUID
    submitted_by: Optional[uuid.UUID] = None
    submitted_at: Optional[datetime] = None
    verified_by: Optional[uuid.UUID] = None
    verified_at: Optional[datetime] = None
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
    document_url: str
    file_name: Optional[str] = None
    upload_method: EvidenceUploadMethod
    is_verified: bool = False

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
