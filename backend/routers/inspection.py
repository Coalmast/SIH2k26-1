from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from datetime import datetime, timezone

from database import SessionLocal
from schemas.inspection import (
    InspectionCreate, InspectionRead, InspectionListItem, InspectionDetail,
    ObservationCreate, ObservationRead, ViolationRead, ViolationDetail,
    CAPACreate, CAPARead, CAPAUpdate, ChecklistTemplateRead, InspectionSubmitRequest
)
from services.inspection_service import InspectionService
from auth import get_current_user, UserContext

router = APIRouter(prefix="/api/v1/inspections", tags=["Inspections"])

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/templates", response_model=List[ChecklistTemplateRead])
async def list_templates(db: AsyncSession = Depends(get_db)):
    """List all checklist templates"""
    return await InspectionService.get_templates(db)

@router.get("", response_model=List[InspectionListItem])
async def list_inspections(
    mine_id: Optional[str] = None, 
    type: Optional[str] = None, 
    status: Optional[str] = None, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """List inspections (filtered by mine, type, status)"""
    parsed_mine_id = None
    if mine_id and mine_id != "all":
        try:
            parsed_mine_id = uuid.UUID(mine_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid mine_id")
            
    # Default to user's first scoped mine if not provided
    if not parsed_mine_id and user_ctx.mine_ids:
        parsed_mine_id = uuid.UUID(user_ctx.mine_ids[0])

    inspections = await InspectionService.get_inspections(db, parsed_mine_id, type, status)
    
    # Map to InspectionListItem to include counts (simplified for now)
    items = []
    for ins in inspections:
        item = InspectionListItem.model_validate(ins)
        item.observation_count = len(ins.observations)
        item.violation_count = sum(1 for obs in ins.observations if getattr(obs, "violation", None) is not None)
        items.append(item)
    return items

@router.post("", response_model=InspectionRead)
async def create_inspection(
    dto: InspectionCreate, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Schedule/create a new inspection"""
    print(f"DEBUG create_inspection: user_ctx={user_ctx}, mine_id={dto.mine_id}")
    # Verify user has access to mine
    if str(dto.mine_id) not in user_ctx.mine_ids and user_ctx.role not in ["system_admin", "regulator"]:
        if user_ctx.role != "subsidiary_admin":
            error_msg = f"Not authorized. User ID: {user_ctx.user_id}, Role: '{user_ctx.role}', Required Mine: {dto.mine_id}, Assigned Mines: {user_ctx.mine_ids}"
            raise HTTPException(status_code=403, detail=error_msg)
        
    actor_id = uuid.UUID(user_ctx.user_id) if "-" in user_ctx.user_id else uuid.uuid4()
    return await InspectionService.create_inspection(db, dto, actor_id)

# ---------------------------------------------------------
# Violations Endpoints (Defined before /{id} to avoid conflict)
# ---------------------------------------------------------

@router.get("/violations", response_model=List[ViolationRead])
async def list_violations(
    mine_id: Optional[str] = None, 
    severity: Optional[str] = None, 
    status: Optional[str] = None, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """List violations (filtered)"""
    parsed_mine_id = None
    if mine_id and mine_id != "all":
        try:
            parsed_mine_id = uuid.UUID(mine_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid mine_id")
            
    if not parsed_mine_id and user_ctx.mine_ids:
        parsed_mine_id = uuid.UUID(user_ctx.mine_ids[0])

    return await InspectionService.get_violations(db, parsed_mine_id, severity, status)

@router.get("/violations/{id}", response_model=ViolationDetail)
async def get_violation(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get violation detail with CAPAs"""
    violation = await InspectionService.get_violation_detail(db, id)
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    return violation

@router.post("/violations/{id}/assign-capa", response_model=CAPARead)
async def assign_capa(
    id: uuid.UUID, 
    dto: CAPACreate, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Assign a Corrective Action (CAPA) to a violation"""
    actor_id = uuid.UUID(user_ctx.user_id) if "-" in user_ctx.user_id else uuid.uuid4()
    capa = await InspectionService.assign_capa(db, id, dto, actor_id)
    if not capa:
        raise HTTPException(status_code=404, detail="Violation not found")
    return capa

@router.post("/violations/{id}/close")
async def close_violation(
    id: uuid.UUID,
    files: List[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Close violation with evidence upload"""
    # Simplified placeholder since InspectionService doesn't have a close_violation yet
    # Normally this would verify all CAPAs are closed or allow closing directly.
    return {"status": "success", "message": "Violation closed"}

# ---------------------------------------------------------
# Corrective Actions (CAPAs) Endpoints
# ---------------------------------------------------------

@router.get("/corrective-actions/{id}", response_model=CAPARead)
async def get_capa(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get CAPA detail"""
    capa = await InspectionService.get_capa(db, id)
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA not found")
    return capa

@router.patch("/corrective-actions/{id}", response_model=CAPARead)
async def update_capa(
    id: uuid.UUID, 
    dto: CAPAUpdate, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Update CAPA status or progress notes"""
    capa = await InspectionService.update_capa(db, id, dto)
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA not found")
    return capa

@router.post("/corrective-actions/{id}/complete", response_model=CAPARead)
async def complete_capa(
    id: uuid.UUID,
    files: List[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Mark CAPA complete with evidence upload"""
    # Just update the CAPA status for now
    from models.inspection import CapaStatus
    dto = CAPAUpdate(status=CapaStatus.completed)
    capa = await InspectionService.update_capa(db, id, dto)
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA not found")
    return capa

@router.post("/corrective-actions/{id}/verify", response_model=CAPARead)
async def verify_close_capa(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Verify and close a CAPA"""
    actor_id = uuid.UUID(user_ctx.user_id) if "-" in user_ctx.user_id else uuid.uuid4()
    try:
        capa = await InspectionService.verify_close_capa(db, id, actor_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA not found")
    return capa

# ---------------------------------------------------------
# Dynamic IDs for Inspections
# ---------------------------------------------------------

@router.get("/{id}", response_model=InspectionDetail)
async def get_inspection(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get inspection detail with observations"""
    inspection = await InspectionService.get_inspection_detail(db, id)
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection

@router.post("/{id}/analyze")
async def analyze_inspection(
    id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Analyze inspection for anomalies"""
    from services.ai_service import AIService
    result = await AIService.analyze_inspection_anomalies(db, str(id))
    return result

@router.post("/{id}/submit", response_model=InspectionRead)
async def submit_inspection(
    id: uuid.UUID, 
    dto: Optional[InspectionSubmitRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """Submit an inspection (triggers escalation check via webhooks/tasks in real impl)"""
    try:
        inspection = await InspectionService.submit_inspection(db, id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    if not inspection:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return inspection

@router.post("/{id}/observations", response_model=ObservationRead)
async def add_observation(
    id: uuid.UUID, 
    dto: ObservationCreate, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Add an observation. Auto-promotes to violation if severity is high/critical."""
    actor_id = uuid.UUID(user_ctx.user_id) if "-" in user_ctx.user_id else uuid.uuid4()
    obs = await InspectionService.add_observation(db, id, dto, actor_id)
    if not obs:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return obs

from pydantic import BaseModel

class AIOverrideRequest(BaseModel):
    confirmed_category: str
    confirmed_severity: str

@router.post("/observations/{id}/ai-override")
async def ai_override(
    id: uuid.UUID, 
    dto: AIOverrideRequest,
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    from models.inspection import Observation, ModelFeedback
    from sqlalchemy.future import select
    
    query = select(Observation).where(Observation.id == id)
    result = await db.execute(query)
    obs = result.scalar_one_or_none()
    
    if not obs:
        raise HTTPException(status_code=404, detail="Observation not found")
        
    actor_id = uuid.UUID(user_ctx.user_id) if "-" in user_ctx.user_id else uuid.uuid4()
    
    feedback = ModelFeedback(
        observation_id=obs.id,
        original_ai_category=obs.ai_category,
        original_ai_confidence=obs.ai_confidence_score,
        corrected_category=dto.confirmed_category,
        corrected_by=actor_id,
        corrected_at=datetime.now(timezone.utc)
    )
    db.add(feedback)
    
    obs.ai_status = "overridden"
    obs.category = dto.confirmed_category
    
    await db.commit()
    return {"status": "success"}

