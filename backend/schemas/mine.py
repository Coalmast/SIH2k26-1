from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any, Dict
from datetime import datetime
import uuid
from models.mine import MineTypeEnum, MineStatusEnum, RoleNameEnum, ScopeLevelEnum

class SubsidiaryRead(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    name: str
    code: str
    state: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MineBase(BaseModel):
    name: str
    mine_type: MineTypeEnum
    status: MineStatusEnum = MineStatusEnum.active
    district: Optional[str] = None
    state: Optional[str] = None
    dgms_region: Optional[str] = None
    ec_number: Optional[str] = None
    coal_grade: Optional[str] = None
    boundary_geojson: Optional[Dict[str, Any]] = None

class MineCreate(MineBase):
    subsidiary_id: uuid.UUID

class MineUpdate(BaseModel):
    name: Optional[str] = None
    mine_type: Optional[MineTypeEnum] = None
    status: Optional[MineStatusEnum] = None
    district: Optional[str] = None
    state: Optional[str] = None
    dgms_region: Optional[str] = None
    ec_number: Optional[str] = None
    coal_grade: Optional[str] = None
    boundary_geojson: Optional[Dict[str, Any]] = None

class MineRead(MineBase):
    id: uuid.UUID
    subsidiary_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MineListItem(MineRead):
    pass

class RoleRead(BaseModel):
    id: uuid.UUID
    name: RoleNameEnum
    scope_level: ScopeLevelEnum
    permissions: List[str]

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    full_name: str
    designation: Optional[str] = None
    email: Optional[str] = None
    preferred_language: str = "en"
    is_active: bool = True

class UserCreate(UserBase):
    keycloak_subject: Optional[str] = None
    mine_id: Optional[uuid.UUID] = None
    subsidiary_id: Optional[uuid.UUID] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    designation: Optional[str] = None
    email: Optional[str] = None
    preferred_language: Optional[str] = None
    is_active: Optional[bool] = None
    mine_id: Optional[uuid.UUID] = None
    subsidiary_id: Optional[uuid.UUID] = None

class UserRead(UserBase):
    id: uuid.UUID
    keycloak_subject: Optional[str]
    mine_id: Optional[uuid.UUID]
    subsidiary_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime
    roles: List[RoleRead] = []

    model_config = ConfigDict(from_attributes=True)

class UserRoleAssign(BaseModel):
    role_id: uuid.UUID
