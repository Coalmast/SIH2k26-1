from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from database import SessionLocal
from schemas.mine import MineRead, MineCreate, MineUpdate, MineListItem, SubsidiaryRead
from services.mine_service import MineService
# We will wire auth in Part 5, for now we will just assume it's imported or mocked.
# We will use the standard pattern.
from auth import get_current_user, UserContext

router = APIRouter(prefix="/api/v1", tags=["Mines"])

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/mines", response_model=List[MineListItem])
async def list_mines(
    subsidiary_id: Optional[str] = None, 
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """List mines (optionally filtered)"""
    parsed_sub_id = None
    if subsidiary_id and subsidiary_id != "all":
        try:
            parsed_sub_id = uuid.UUID(subsidiary_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid subsidiary_id")
            
    mines = await MineService.get_mines(db, parsed_sub_id, status)
    
    # Enforce RBAC filtering for non-admins if needed here, 
    # but normally system_admin sees all, subsidiary_admin sees their sub's mines, 
    # others see their mine_ids.
    if user_ctx.role not in ["system_admin", "regulator"]:
        if user_ctx.role in ["subsidiary_admin", "corporate_executive"] and user_ctx.subsidiary_id:
            mines = [m for m in mines if str(m.subsidiary_id) == user_ctx.subsidiary_id]
        else:
            mines = [m for m in mines if str(m.id) in user_ctx.mine_ids]

    return mines

@router.post("/mines", response_model=MineRead)
async def create_mine(
    dto: MineCreate, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """[Admin] Create a new mine"""
    if user_ctx.role != "system_admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return await MineService.create_mine(db, dto)

@router.get("/mines/{id}", response_model=MineRead)
async def get_mine(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Get single mine detail"""
    mine = await MineService.get_mine(db, id)
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")
        
    # Check access
    if user_ctx.role not in ["system_admin", "regulator"]:
        if user_ctx.role in ["subsidiary_admin", "corporate_executive"]:
            if str(mine.subsidiary_id) != user_ctx.subsidiary_id:
                 raise HTTPException(status_code=403, detail="Not authorized")
        elif str(mine.id) not in user_ctx.mine_ids:
            raise HTTPException(status_code=403, detail="Not authorized")
            
    return mine

@router.patch("/mines/{id}", response_model=MineRead)
async def update_mine(
    id: uuid.UUID, 
    dto: MineUpdate, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Update mine details"""
    if user_ctx.role not in ["system_admin", "subsidiary_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if user_ctx.role == "subsidiary_admin":
        mine = await MineService.get_mine(db, id)
        if not mine or str(mine.subsidiary_id) != user_ctx.subsidiary_id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
    mine = await MineService.update_mine(db, id, dto)
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")
    return mine

@router.get("/subsidiaries", response_model=List[SubsidiaryRead])
async def list_subsidiaries(
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """List subsidiaries"""
    return await MineService.get_subsidiaries(db)

@router.get("/subsidiaries/{id}/mines", response_model=List[MineListItem])
async def get_subsidiary_mines(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """All mines under a subsidiary"""
    # Authorization checks
    if user_ctx.role not in ["system_admin", "regulator", "corporate_executive"]:
        if user_ctx.role == "subsidiary_admin" and user_ctx.subsidiary_id != str(id):
            raise HTTPException(status_code=403, detail="Not authorized")
        elif user_ctx.role != "subsidiary_admin":
            raise HTTPException(status_code=403, detail="Not authorized")
            
    return await MineService.get_mines_by_subsidiary(db, id)
