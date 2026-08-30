from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Float, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid
from database import Base

class ComplianceCategory(str, enum.Enum):
    Safety = "Safety"
    Environment = "Environment"
    Production = "Production"
    Labour = "Labour"

class MineTypeEnum(str, enum.Enum):
    opencast = "opencast"
    underground = "underground"
    mixed = "mixed"

class RequirementFrequency(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"
    fortnightly = "fortnightly"
    monthly = "monthly"
    quarterly = "quarterly"
    half_yearly = "half_yearly"
    annual = "annual"
    on_event = "on_event"
    one_time = "one_time"

class InstanceStatus(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    submitted = "submitted"
    revision_requested = "revision_requested"
    approved = "approved"
    breached = "breached"

class EvidenceUploadMethod(str, enum.Enum):
    web_upload = "web_upload"
    mobile_capture = "mobile_capture"
    ocr_scan = "ocr_scan"

class AuthorityEnum(str, enum.Enum):
    dgms = "dgms"
    moefcc = "moefcc"
    spcb = "spcb"
    cco = "cco"
    labour_dept = "labour_dept"
    district_magistrate = "district_magistrate"
    internal = "internal"

class ResponsibleRoleEnum(str, enum.Enum):
    mine_manager = "mine_manager"
    safety_officer = "safety_officer"
    environmental_officer = "environmental_officer"
    compliance_officer = "compliance_officer"



class Regulation(Base):
    __tablename__ = "regulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(100), nullable=False, unique=True)
    title = Column(String(255), nullable=False)
    statute = Column(String)
    section_reference = Column(String)
    category = Column(Enum(ComplianceCategory, name="compliance_category"), nullable=False)
    authority = Column(Enum(AuthorityEnum, name="authority_enum"))
    description = Column(String)
    consequence_of_non_compliance = Column(String)
    version = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    requirements = relationship("ComplianceRequirement", back_populates="regulation")

from sqlalchemy.dialects.postgresql import ARRAY

class ComplianceRequirement(Base):
    __tablename__ = "compliance_requirements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    regulation_id = Column(UUID(as_uuid=True), ForeignKey("regulations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    recurrence = Column(Enum(RequirementFrequency, name="recurrence_enum"), nullable=False)
    grace_period_days = Column(Integer, default=0)
    reminder_offsets_days = Column(ARRAY(Integer), default=[30, 7, 1])
    applicable_mine_types = Column(ARRAY(Enum(MineTypeEnum, name="mine_type_enum")), nullable=False)
    applicable_states = Column(ARRAY(String))
    documents_required = Column(ARRAY(String))
    responsible_role = Column(Enum(ResponsibleRoleEnum, name="responsible_role_enum"))
    regulation_version = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    regulation = relationship("Regulation", back_populates="requirements")
    instances = relationship("ComplianceInstance", back_populates="requirement")

class ComplianceInstance(Base):
    __tablename__ = "compliance_instances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requirement_id = Column(UUID(as_uuid=True), ForeignKey("compliance_requirements.id"), nullable=False)
    mine_id = Column(UUID(as_uuid=True), nullable=False)
    subsidiary_id = Column(UUID(as_uuid=True))
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    status = Column(Enum(InstanceStatus, name="instance_status"), default=InstanceStatus.pending)
    is_late_submission = Column(Boolean, default=False)
    assigned_to = Column(UUID(as_uuid=True)) 
    submitted_by = Column(UUID(as_uuid=True))
    submitted_at = Column(DateTime(timezone=True))
    verified_by = Column(UUID(as_uuid=True))
    verified_at = Column(DateTime(timezone=True))
    rejection_reason = Column(String)
    regulation_version = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    requirement = relationship("ComplianceRequirement", back_populates="instances")
    evidences = relationship("ComplianceEvidence", back_populates="instance")

class ComplianceEvidence(Base):
    __tablename__ = "compliance_evidences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    instance_id = Column(UUID(as_uuid=True), ForeignKey("compliance_instances.id", ondelete="CASCADE"), nullable=False)
    document_url = Column(String, nullable=False)
    file_name = Column(String)
    file_type = Column(String(50))
    file_size_bytes = Column(Integer)
    upload_method = Column(Enum(EvidenceUploadMethod, name="evidence_upload_method"), nullable=False)
    ocr_result_id = Column(UUID(as_uuid=True))
    is_verified = Column(Boolean, default=False)
    verified_by = Column(UUID(as_uuid=True))
    verified_at = Column(DateTime(timezone=True))
    uploaded_by = Column(UUID(as_uuid=True))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    instance = relationship("ComplianceInstance", back_populates="evidences")
