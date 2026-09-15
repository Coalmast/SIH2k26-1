from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
import uuid
from database import Base

class OrgTypeEnum(str, enum.Enum):
    ministry = "ministry"
    psu = "psu"

class MineTypeEnum(str, enum.Enum):
    opencast = "opencast"
    underground = "underground"
    mixed = "mixed"

class MineStatusEnum(str, enum.Enum):
    active = "active"
    temporarily_closed = "temporarily_closed"
    abandoned = "abandoned"

class RoleNameEnum(str, enum.Enum):
    field_officer = "field_officer"
    mine_manager = "mine_manager"
    safety_officer = "safety_officer"
    environmental_officer = "environmental_officer"
    compliance_officer = "compliance_officer"
    contractor_manager = "contractor_manager"
    subsidiary_admin = "subsidiary_admin"
    corporate_executive = "corporate_executive"
    regulator = "regulator"
    system_admin = "system_admin"

class ScopeLevelEnum(str, enum.Enum):
    mine = "mine"
    subsidiary = "subsidiary"
    organization = "organization"
    jurisdiction = "jurisdiction"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type = Column(Enum(OrgTypeEnum, name="org_type"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    subsidiaries = relationship("Subsidiary", back_populates="organization", cascade="all, delete-orphan")

class Subsidiary(Base):
    __tablename__ = "subsidiaries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String(10), nullable=False, unique=True)
    state = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    organization = relationship("Organization", back_populates="subsidiaries")
    mines = relationship("Mine", back_populates="subsidiary", cascade="all, delete-orphan")

class Mine(Base):
    __tablename__ = "mines"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subsidiary_id = Column(UUID(as_uuid=True), ForeignKey("subsidiaries.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    mine_type = Column(Enum(MineTypeEnum, name="mine_type_enum"), nullable=False)
    status = Column(Enum(MineStatusEnum, name="mine_status_enum"), nullable=False, default=MineStatusEnum.active)
    boundary_geojson = Column(JSONB)
    district = Column(String)
    state = Column(String)
    dgms_region = Column(String)
    ec_number = Column(String)
    coal_grade = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    subsidiary = relationship("Subsidiary", back_populates="mines")

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    keycloak_subject = Column(String, unique=True)
    full_name = Column(String, nullable=False)
    designation = Column(String)
    email = Column(String)
    mine_id = Column(UUID(as_uuid=True), ForeignKey("mines.id", ondelete="SET NULL"))
    subsidiary_id = Column(UUID(as_uuid=True), ForeignKey("subsidiaries.id", ondelete="SET NULL"))
    preferred_language = Column(String, default="en")
    is_active = Column(Boolean, default=True)
    expo_push_token = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    roles = relationship("Role", secondary="user_roles", back_populates="users")

class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(Enum(RoleNameEnum, name="role_name_enum"), nullable=False, unique=True)
    scope_level = Column(Enum(ScopeLevelEnum, name="scope_level_enum"), nullable=False)
    permissions = Column(JSONB, nullable=False, server_default='[]')

    users = relationship("User", secondary="user_roles", back_populates="roles")

class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True)
