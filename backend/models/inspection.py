from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Enum, Date, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid
from database import Base

class InspectionTypeEnum(str, enum.Enum):
    dgms_annual_general = "dgms_annual_general"
    dgms_surprise = "dgms_surprise"
    dgms_inquiry = "dgms_inquiry"
    internal_safety_committee = "internal_safety_committee"
    environmental_pcb = "environmental_pcb"
    medical_fitness = "medical_fitness"
    electrical = "electrical"
    explosives = "explosives"

class MineTypeEnum(str, enum.Enum):
    opencast = "opencast"
    underground = "underground"
    mixed = "mixed"

class InspectionStatus(str, enum.Enum):
    draft = "draft"
    in_progress = "in_progress"
    submitted = "submitted"
    reviewed = "reviewed"

class SyncStatusEnum(str, enum.Enum):
    pending_sync = "pending_sync"
    synced = "synced"
    sync_conflict = "sync_conflict"

class ObsSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"

class ObsStatusEnum(str, enum.Enum):
    ok = "ok"
    non_compliant = "non_compliant"
    observation_only = "observation_only"

class ViolationSeverity(str, enum.Enum):
    minor = "minor"
    moderate = "moderate"
    major = "major"
    critical = "critical"

class ViolationStatus(str, enum.Enum):
    reported = "reported"
    under_review = "under_review"
    capa_assigned = "capa_assigned"
    in_progress = "in_progress"
    pending_verification = "pending_verification"
    closed = "closed"
    dismissed = "dismissed"
    systemic_risk = "systemic_risk"

class ComplianceCategory(str, enum.Enum):
    safety = "safety"
    environment = "environment"
    production = "production"
    labour = "labour"

class SourceTypeEnum(str, enum.Enum):
    violation = "violation"
    compliance_breach = "compliance_breach"
    incident = "incident"

class CapaStatus(str, enum.Enum):
    assigned = "assigned"
    in_progress = "in_progress"
    completed = "completed"
    pending_verification = "pending_verification"
    verified_closed = "verified_closed"
    overdue = "overdue"
    escalated = "escalated"

class MediaTypeEnum(str, enum.Enum):
    photo = "photo"
    video = "video"
    audio = "audio"

class MediaParentType(str, enum.Enum):
    observation = "observation"
    corrective_action = "corrective_action"
    incident_report = "incident_report"
    safety_observation = "safety_observation"
    contractor_document = "contractor_document"

class ChecklistTemplate(Base):
    __tablename__ = "inspection_checklist_templates"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    inspection_type = Column(Enum(InspectionTypeEnum, name="inspection_type_enum"), nullable=False)
    applicable_mine_types = Column(ARRAY(Enum(MineTypeEnum, name="mine_type_enum")), nullable=False)
    regulation_reference = Column(String)
    checklist_items = Column(JSONB, nullable=False, server_default='[]')
    version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mine_id = Column(UUID(as_uuid=True), nullable=False)
    subsidiary_id = Column(UUID(as_uuid=True))
    conducted_by = Column(UUID(as_uuid=True), nullable=False)
    inspection_type = Column(Enum(InspectionTypeEnum, name="inspection_type_enum"), nullable=False)
    checklist_template_id = Column(UUID(as_uuid=True), ForeignKey("inspection_checklist_templates.id"))
    zone = Column(String)
    geo_stamp = Column(JSONB)
    started_at = Column(DateTime(timezone=True), nullable=False)
    completed_at = Column(DateTime(timezone=True))
    submitted_at = Column(DateTime(timezone=True))
    status = Column(Enum(InspectionStatus, name="inspection_status"), nullable=False, default=InspectionStatus.draft)
    sync_status = Column(Enum(SyncStatusEnum, name="sync_status_enum"), default=SyncStatusEnum.pending_sync)
    observation_count = Column(Integer, default=0)
    violation_count = Column(Integer, default=0)
    overall_remarks = Column(String)
    inspection_memo_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    observations = relationship("Observation", back_populates="inspection", cascade="all, delete-orphan")

class Observation(Base):
    __tablename__ = "observations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    inspection_id = Column(UUID(as_uuid=True), ForeignKey("inspections.id", ondelete="CASCADE"), nullable=False)
    checklist_item_id = Column(String)
    category = Column(String, nullable=False)
    description = Column(String, nullable=False)
    severity = Column(Enum(ObsSeverity, name="obs_severity"), nullable=False)
    status = Column(Enum(ObsStatusEnum, name="obs_status_enum"))
    geo_stamp = Column(JSONB)
    voice_note_url = Column(String)
    voice_transcription = Column(String)
    ai_category = Column(String)
    ai_confidence_score = Column(Numeric(5, 4))
    ai_auto_applied = Column(Boolean, default=False)
    ai_status = Column(String(20))
    violation_id = Column(UUID(as_uuid=True), ForeignKey("violations.id", ondelete="SET NULL"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    inspection = relationship("Inspection", back_populates="observations")
    violation = relationship("Violation", back_populates="observation", uselist=False, primaryjoin="Observation.id == Violation.observation_id")

class Violation(Base):
    __tablename__ = "violations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    observation_id = Column(UUID(as_uuid=True), ForeignKey("observations.id"), nullable=False)
    mine_id = Column(UUID(as_uuid=True), nullable=False)
    subsidiary_id = Column(UUID(as_uuid=True))
    statute_reference = Column(String)
    category = Column(Enum(ComplianceCategory, name="compliance_category"))
    severity = Column(Enum(ViolationSeverity, name="violation_severity"), nullable=False)
    description = Column(String)
    status = Column(Enum(ViolationStatus, name="violation_status"), nullable=False, default=ViolationStatus.reported)
    corrective_action_id = Column(UUID(as_uuid=True), ForeignKey("corrective_actions.id", ondelete="SET NULL"))
    reported_by = Column(UUID(as_uuid=True), nullable=False)
    reported_at = Column(DateTime(timezone=True), server_default=func.now())
    dismissed_reason = Column(String)
    is_regulator_visible = Column(Boolean, default=False)
    recurrence_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    observation = relationship("Observation", back_populates="violation", primaryjoin="Observation.id == Violation.observation_id")
    capas = relationship("CorrectiveAction", back_populates="violation", primaryjoin="and_(CorrectiveAction.source_type == 'violation', CorrectiveAction.source_id == Violation.id)", foreign_keys="[CorrectiveAction.source_id]")

class CorrectiveAction(Base):
    __tablename__ = "corrective_actions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_type = Column(Enum(SourceTypeEnum, name="source_type_enum"), nullable=False)
    source_id = Column(UUID(as_uuid=True), nullable=False)
    mine_id = Column(UUID(as_uuid=True), nullable=False)
    subsidiary_id = Column(UUID(as_uuid=True))
    description = Column(String, nullable=False)
    preventive_measures = Column(String)
    root_cause = Column(String)
    assigned_to = Column(UUID(as_uuid=True), nullable=False)
    assigned_by = Column(UUID(as_uuid=True), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(Enum(CapaStatus, name="capa_status"), nullable=False, default=CapaStatus.assigned)
    completion_notes = Column(String)
    completed_at = Column(DateTime(timezone=True))
    verified_by = Column(UUID(as_uuid=True))
    verified_at = Column(DateTime(timezone=True))
    escalation_workflow_id = Column(UUID(as_uuid=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    violation = relationship("Violation", back_populates="capas", primaryjoin="and_(CorrectiveAction.source_type == 'violation', CorrectiveAction.source_id == Violation.id)", foreign_keys=[source_id])

class MediaAttachment(Base):
    __tablename__ = "media_attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    parent_type = Column(Enum(MediaParentType, name="media_parent_type"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), nullable=False)
    media_type = Column(Enum(MediaTypeEnum, name="media_type_enum"), nullable=False)
    file_url = Column(String, nullable=False)
    thumbnail_url = Column(String)
    file_size_bytes = Column(Integer)
    mime_type = Column(String)
    geo_stamp = Column(JSONB)
    sync_status = Column(String, default='pending_upload')
    captured_by = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ModelFeedback(Base):
    __tablename__ = "model_feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    observation_id = Column(UUID(as_uuid=True), ForeignKey("observations.id", ondelete="CASCADE"), nullable=False)
    original_ai_category = Column(String)
    original_ai_confidence = Column(Numeric(5, 4))
    corrected_category = Column(String)
    corrected_by = Column(UUID(as_uuid=True))
    corrected_at = Column(DateTime(timezone=True), server_default=func.now())
    used_in_training = Column(Boolean, default=False)
