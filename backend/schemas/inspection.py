from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Any, Dict
from datetime import datetime, date
import uuid

from models.inspection import (
    InspectionTypeEnum, InspectionStatus, ObsStatusEnum,
    ObsSeverity, ViolationSeverity, ViolationStatus, CapaStatus, MediaTypeEnum,
    MineTypeEnum, SyncStatusEnum, ComplianceCategory, SourceTypeEnum
)

# Shared
class GeoStamp(BaseModel):
    lat: float
    lng: float
    accuracy: Optional[float] = None
    timestamp: Optional[datetime] = None

# Media
class MediaAttachmentRead(BaseModel):
    id: uuid.UUID
    parent_type: str
    parent_id: uuid.UUID
    file_url: str
    media_type: MediaTypeEnum
    captured_at: Optional[datetime] = None
    geo_stamp: Optional[GeoStamp] = None

    model_config = ConfigDict(from_attributes=True)

class MediaConfirmRequest(BaseModel):
    file_url: str
    parent_type: str
    parent_id: uuid.UUID
    media_type: MediaTypeEnum
    captured_at: Optional[datetime] = None
    geo_stamp: Optional[GeoStamp] = None

# Checklist Template
class ChecklistTemplateRead(BaseModel):
    id: uuid.UUID
    name: str
    inspection_type: InspectionTypeEnum
    applicable_mine_types: List[MineTypeEnum]
    regulation_reference: Optional[str]
    checklist_items: List[Dict[str, Any]]
    version: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Corrective Action (CAPA)
class CAPACreate(BaseModel):
    description: str = Field(..., min_length=10)
    assigned_to: uuid.UUID
    due_date: date
    # assigned_by will be injected by the service

class CAPAUpdate(BaseModel):
    status: Optional[CapaStatus] = None
    completion_notes: Optional[str] = None

class CAPARead(BaseModel):
    id: uuid.UUID
    source_type: SourceTypeEnum
    source_id: uuid.UUID
    mine_id: uuid.UUID
    subsidiary_id: Optional[uuid.UUID] = None
    description: str
    preventive_measures: Optional[str]
    assigned_to: uuid.UUID
    assigned_by: uuid.UUID
    due_date: date
    status: CapaStatus
    completion_notes: Optional[str]
    completed_at: Optional[datetime]
    verified_by: Optional[uuid.UUID] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Violation
class ViolationRead(BaseModel):
    id: uuid.UUID
    observation_id: uuid.UUID
    mine_id: uuid.UUID
    subsidiary_id: Optional[uuid.UUID] = None
    statute_reference: Optional[str]
    category: Optional[ComplianceCategory]
    severity: ViolationSeverity
    description: Optional[str]
    status: ViolationStatus
    corrective_action_id: Optional[uuid.UUID] = None
    is_regulator_visible: bool
    reported_by: uuid.UUID
    reported_at: datetime
    dismissed_reason: Optional[str] = None
    recurrence_count: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ViolationDetail(ViolationRead):
    capas: List[CAPARead] = []

# Observation
class ObservationCreate(BaseModel):
    checklist_item_id: str
    category: str
    description: str
    status: ObsStatusEnum
    severity: ObsSeverity
    geo_stamp: Optional[GeoStamp] = None

class ObservationRead(BaseModel):
    id: uuid.UUID
    inspection_id: uuid.UUID
    checklist_item_id: str
    category: str
    description: str
    severity: ObsSeverity
    status: Optional[ObsStatusEnum]
    geo_stamp: Optional[GeoStamp]
    voice_note_url: Optional[str]
    ai_category: Optional[str]
    violation_id: Optional[uuid.UUID] = None
    created_at: datetime

    violation: Optional[ViolationRead] = None

    model_config = ConfigDict(from_attributes=True)

ViolationDetail.model_rebuild()

# Inspection
class InspectionCreate(BaseModel):
    mine_id: uuid.UUID
    subsidiary_id: Optional[uuid.UUID] = None
    inspection_type: InspectionTypeEnum
    checklist_template_id: uuid.UUID
    scheduled_date: date
    zone: Optional[str] = None

class InspectionRead(BaseModel):
    id: uuid.UUID
    mine_id: uuid.UUID
    subsidiary_id: Optional[uuid.UUID]
    conducted_by: uuid.UUID
    inspection_type: InspectionTypeEnum
    checklist_template_id: Optional[uuid.UUID]
    zone: Optional[str]
    status: InspectionStatus
    geo_stamp: Optional[GeoStamp]
    sync_status: SyncStatusEnum
    started_at: datetime
    completed_at: Optional[datetime]
    submitted_at: Optional[datetime]
    observation_count: int
    violation_count: int
    overall_remarks: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class InspectionListItem(InspectionRead):
    pass # Counts are now built-in

class InspectionDetail(InspectionRead):
    observations: List[ObservationRead] = []

class InspectionSubmitRequest(BaseModel):
    geo_stamp: Optional[GeoStamp] = None
    overall_remarks: Optional[str] = None
