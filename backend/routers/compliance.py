from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
import os

from database import SessionLocal
from schemas.compliance import (
    RegulationRead, RequirementCreate, RequirementRead,
    ComplianceInstanceRead, ComplianceHealthScore, EvidenceUploadResponse, SubmitEvidenceRequest
)
from services.compliance_service import ComplianceService
from models.compliance import InstanceStatus, EvidenceUploadMethod
from auth import get_current_user, UserContext

router = APIRouter(prefix="/api/v1/compliance", tags=["Compliance"])

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/requirements", response_model=List[RegulationRead])
async def list_regulations(db: AsyncSession = Depends(get_db)):
    """List all master regulations"""
    return await ComplianceService.get_regulations(db)

@router.post("/requirements", response_model=RequirementRead)
async def create_requirement(
    requirement: RequirementCreate, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """[Admin] Create a new compliance requirement mapping"""
    if user_ctx.role not in ["system_admin", "compliance_officer"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return await ComplianceService.create_requirement(db, requirement)

@router.get("/mines/{mine_id}/instances", response_model=List[ComplianceInstanceRead])
async def list_instances(
    mine_id: str, 
    month: Optional[str] = None, 
    status: Optional[str] = None, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """List instances for a mine"""
    parsed_mine_id = None
    if mine_id != "all":
        try:
            parsed_mine_id = uuid.UUID(mine_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid mine_id")
            
    # Check mine scope
    if parsed_mine_id and user_ctx.role not in ["system_admin", "regulator", "corporate_executive"]:
        if str(parsed_mine_id) not in user_ctx.mine_ids:
            if user_ctx.role != "subsidiary_admin": # Ideally we'd check if the mine belongs to the subsidiary
                raise HTTPException(status_code=403, detail="Not authorized to access this mine")
            
    return await ComplianceService.get_instances(db, parsed_mine_id, month, status)

@router.get("/instances/{id}", response_model=ComplianceInstanceRead)
async def get_instance(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Get single instance detail"""
    instance = await ComplianceService.get_instance_by_id(db, id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
        
    return instance

@router.post("/instances/{id}/submit", response_model=EvidenceUploadResponse)
async def submit_evidence(
    id: uuid.UUID, 
    notes: Optional[str] = Form(None), 
    files: List[UploadFile] = File(...), 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Submit evidence (multipart form)"""
    # Check if instance exists and user has rights
    instance = await ComplianceService.get_instance_by_id(db, id)
    if not instance:
        raise HTTPException(status_code=404, detail="Instance not found")
        
    # Real implementation would upload to Supabase Storage here and get the URL
    # For now, we simulate the storage path
    file = files[0]
    simulated_url = f"compliance-evidence/{instance.mine_id}/{id}/{uuid.uuid4()}_{file.filename}"
    
    evidence = await ComplianceService.submit_evidence(
        db, 
        instance_id=id, 
        file_url=simulated_url,
        file_name=file.filename,
        file_type=file.content_type,
        file_size_bytes=file.size or 0,
        upload_method=EvidenceUploadMethod.web_upload,
        user_id=uuid.UUID(user_ctx.user_id) if "-" in user_ctx.user_id else uuid.uuid4() # Mocking fallback for mock_ users
    )
    
    return evidence

@router.post("/instances/{id}/approve", response_model=ComplianceInstanceRead)
async def approve_instance(
    id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """[Compliance Officer] Approve instance"""
    if user_ctx.role not in ["system_admin", "compliance_officer", "mine_manager", "subsidiary_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to approve")
        
    actor_id = uuid.UUID(user_ctx.user_id) if "-" in user_ctx.user_id else None
    instance = await ComplianceService.approve_instance(db, id, actor_id)
    return instance

@router.post("/instances/{id}/reject", response_model=ComplianceInstanceRead)
async def reject_instance(
    id: uuid.UUID, 
    reason: str = Body(..., embed=True), 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Reject with reason"""
    if user_ctx.role not in ["system_admin", "compliance_officer", "mine_manager", "subsidiary_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to reject")
        
    actor_id = uuid.UUID(user_ctx.user_id) if "-" in user_ctx.user_id else uuid.uuid4()
    instance = await ComplianceService.reject_instance(db, id, reason, actor_id)
    return instance

@router.post("/mines/{mine_id}/generate-instances", response_model=List[ComplianceInstanceRead])
async def generate_instances(
    mine_id: uuid.UUID,
    year: int = Body(...),
    month: int = Body(...),
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Trigger instance generation for a mine and period (usually run via cron)"""
    instances = await ComplianceService.generate_instances_for_period(db, mine_id, year, month)
    return instances

@router.get("/mines/{mine_id}/health-score", response_model=ComplianceHealthScore)
async def get_health_score(
    mine_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Current compliance health score"""
    return await ComplianceService.compute_health_score(db, mine_id)

@router.get("/mines/{mine_id}/calendar", response_model=List[ComplianceInstanceRead])
async def get_calendar(
    mine_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    user_ctx: UserContext = Depends(get_current_user)
):
    """Calendar view data"""
    instances = await ComplianceService.get_instances(db, mine_id)
    return instances
