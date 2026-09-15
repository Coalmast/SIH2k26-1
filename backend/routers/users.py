from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from database import SessionLocal
from schemas.mine import UserRead, UserCreate, UserUpdate, UserRoleAssign
from services.mine_service import MineService
from auth import get_current_user, UserContext

router = APIRouter(prefix="/api/v1/users", tags=["Users"])

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/me", response_model=UserRead)
async def get_me(
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Get current user profile (using JWT subject claim)"""
    user = await MineService.get_user_by_subject(db, user_ctx.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found in database")
    return user

from pydantic import BaseModel
class PushTokenUpdate(BaseModel):
    expo_push_token: str

@router.patch("/me/push-token")
async def update_push_token(
    body: PushTokenUpdate,
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user),
):
    """Store the Expo push token for the authenticated user."""
    await MineService.update_expo_push_token(db, user_ctx.user_id, body.expo_push_token)
    return {"status": "ok"}

@router.get("", response_model=List[UserRead])
async def list_users(
    mine_id: Optional[str] = None, 
    role: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """List users"""
    parsed_mine_id = None
    if mine_id and mine_id != "all":
        try:
            parsed_mine_id = uuid.UUID(mine_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid mine_id")
            
    # For now, simplistic authorization
    # Sub-admins can see users in their subsidiary
    # Mine managers can see users in their mine
    sub_id_filter = None
    if user_ctx.role == "subsidiary_admin":
        sub_id_filter = uuid.UUID(user_ctx.subsidiary_id) if user_ctx.subsidiary_id else None
    elif user_ctx.role not in ["system_admin", "corporate_executive", "regulator"]:
        if not parsed_mine_id or str(parsed_mine_id) not in user_ctx.mine_ids:
            # Enforce mine scope
            if user_ctx.mine_ids:
                parsed_mine_id = uuid.UUID(user_ctx.mine_ids[0])
            else:
                return []
                
    users = await MineService.get_users(db, parsed_mine_id, sub_id_filter, role)
    return users

@router.post("", response_model=UserRead)
async def create_user(
    dto: UserCreate, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """[Admin] Create user profile"""
    if user_ctx.role not in ["system_admin", "subsidiary_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await MineService.create_user(db, dto)

@router.get("/{id}", response_model=UserRead)
async def get_user(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Get single user"""
    user = await MineService.get_user(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.patch("/{id}", response_model=UserRead)
async def update_user(
    id: uuid.UUID, 
    dto: UserUpdate, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Update user"""
    # System admins, or the user themselves, or sub admins (for their own sub)
    # Assuming appropriate checks are done in production
    user = await MineService.update_user(db, id, dto)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/{id}/roles")
async def assign_role(
    id: uuid.UUID, 
    dto: UserRoleAssign, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Assign role to user"""
    if user_ctx.role != "system_admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    await MineService.assign_role(db, id, dto.role_id)
    return {"status": "success"}

@router.delete("/{id}/roles/{role_id}")
async def remove_role(
    id: uuid.UUID, 
    role_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Remove role from user"""
    if user_ctx.role != "system_admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    success = await MineService.remove_role(db, id, role_id)
    if not success:
        raise HTTPException(status_code=404, detail="Role assignment not found")
    return {"status": "success"}
