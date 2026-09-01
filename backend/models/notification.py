"""
notification_model.py
======================
SQLAlchemy model for the alerts table + the Alert priority/status enums.
Mirrors the Supabase schema from the migration SQL.
"""

from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Enum, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import enum
import uuid
from database import Base


class AlertPriority(str, enum.Enum):
    critical = "critical"
    high     = "high"
    medium   = "medium"
    low      = "low"
    info     = "info"


class AlertStatus(str, enum.Enum):
    pending      = "pending"
    sent         = "sent"
    delivered    = "delivered"
    read         = "read"
    acknowledged = "acknowledged"
    failed       = "failed"


class Alert(Base):
    __tablename__ = "alerts"

    id                   = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    priority             = Column(Enum(AlertPriority, name="alert_priority"), nullable=False)
    type                 = Column(String, nullable=False)
    title                = Column(String, nullable=False)
    message              = Column(String, nullable=False)
    target_user_id       = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    target_role          = Column(String)
    mine_id              = Column(UUID(as_uuid=True), ForeignKey("mines.id", ondelete="SET NULL"))
    entity_type          = Column(String)
    entity_id            = Column(UUID(as_uuid=True))
    channels             = Column(ARRAY(String), nullable=False, default=[])
    sla_response_minutes = Column(Integer)
    status               = Column(Enum(AlertStatus, name="alert_status"), nullable=False, default=AlertStatus.pending)
    sent_at              = Column(DateTime(timezone=True))
    read_at              = Column(DateTime(timezone=True))
    created_at           = Column(DateTime(timezone=True), server_default=func.now())
