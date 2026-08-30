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
    OCP = "OCP"
    UG = "UG"
    Mixed = "Mixed"

class RequirementFrequency(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    quarterly = "quarterly"
    half_yearly = "half_yearly"
    annual = "annual"

class InstanceStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    OVERDUE = "OVERDUE"
    ESCALATED = "ESCALATED"

class EvidenceOcrStatus(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    FAILED = "FAILED"

class Regulation(Base):
    __tablename__ = "regulations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(Enum(ComplianceCategory), nullable=False)
    authority = Column(String(100))
    description = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    requirements = relationship("ComplianceRequirement", back_populates="regulation")

class ComplianceRequirement(Base):
    __tablename__ = "compliance_requirements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    regulation_id = Column(UUID(as_uuid=True), ForeignKey("regulations.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    mine_type = Column(Enum(MineTypeEnum), nullable=False)
    frequency = Column(Enum(RequirementFrequency), nullable=False)
    grace_period_days = Column(Integer, default=0)
    applies_to_subsidiaries = Column(JSONB)
    auto_generate = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    regulation = relationship("Regulation", back_populates="requirements")
    instances = relationship("ComplianceInstance", back_populates="requirement")

class ComplianceInstance(Base):
    __tablename__ = "compliance_instances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mine_id = Column(UUID(as_uuid=True), nullable=False) # References mocked/external mines table
    requirement_id = Column(UUID(as_uuid=True), ForeignKey("compliance_requirements.id"), nullable=False)
    status = Column(Enum(InstanceStatus), default=InstanceStatus.PENDING)
    period_start = Column(DateTime)
    period_end = Column(DateTime)
    due_date = Column(DateTime, nullable=False)
    assigned_to = Column(UUID(as_uuid=True)) # References users table
    escalation_tier = Column(Integer, default=0)
    escalated_at = Column(DateTime(timezone=True))
    regulator_visible = Column(Boolean, default=False)
    completed_at = Column(DateTime(timezone=True))
    rejection_reason = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    requirement = relationship("ComplianceRequirement", back_populates="instances")
    evidences = relationship("ComplianceEvidence", back_populates="instance")

class ComplianceEvidence(Base):
    __tablename__ = "compliance_evidences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    instance_id = Column(UUID(as_uuid=True), ForeignKey("compliance_instances.id", ondelete="CASCADE"), nullable=False)
    file_key = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50))
    file_size_bytes = Column(Integer)
    ocr_status = Column(Enum(EvidenceOcrStatus), default=EvidenceOcrStatus.PENDING)
    ocr_confidence = Column(Float)
    blockchain_hash = Column(String)
    uploaded_by = Column(UUID(as_uuid=True))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    instance = relationship("ComplianceInstance", back_populates="evidences")
