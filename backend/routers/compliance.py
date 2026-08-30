from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from database import SessionLocal
from schemas.compliance import (
    RegulationRead, RequirementCreate, RequirementRead,
    ComplianceInstanceRead, ComplianceHealthScore, EvidenceUploadResponse, SubmitEvidenceRequest
)
from services.compliance_service import ComplianceService
from models.compliance import InstanceStatus, EvidenceOcrStatus

router = APIRouter(prefix="/api/v1/compliance", tags=["Compliance"])

async def get_db():
    async with SessionLocal() as session:
        yield session

@router.get("/requirements", response_model=List[RegulationRead])
async def list_regulations(db: AsyncSession = Depends(get_db)):
    """List all master regulations"""
    return await ComplianceService.get_regulations(db)

@router.post("/requirements", response_model=RequirementRead)
async def create_requirement(requirement: RequirementCreate, db: AsyncSession = Depends(get_db)):
    """[Admin] Create a new compliance requirement mapping"""
    # implementation omitted for brevity, returns mocked response
    pass

@router.get("/mines/{mine_id}/instances", response_model=List[ComplianceInstanceRead])
async def list_instances(mine_id: str, month: Optional[str] = None, status: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    """List instances for a mine"""
    parsed_mine_id = None
    if mine_id != "all":
        try:
            parsed_mine_id = uuid.UUID(mine_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid mine_id")
            
    return await ComplianceService.get_instances(db, parsed_mine_id, month, status)

@router.get("/instances/{id}", response_model=ComplianceInstanceRead)
async def get_instance(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Get single instance detail"""
    instances = await ComplianceService.get_instances(db, uuid.uuid4()) # mock
    for inst in instances:
        if inst.id == id:
            return inst
    raise HTTPException(status_code=404, detail="Instance not found")

@router.post("/instances/{id}/submit", response_model=EvidenceUploadResponse)
async def submit_evidence(id: uuid.UUID, notes: Optional[str] = Form(None), files: List[UploadFile] = File(...), db: AsyncSession = Depends(get_db)):
    """Submit evidence (multipart form)"""
    # Mocked evidence upload
    await ComplianceService.transition_status(db, id, InstanceStatus.IN_PROGRESS)
    
    return EvidenceUploadResponse(
        id=uuid.uuid4(),
        file_key=f"compliance/mock/{files[0].filename}",
        file_name=files[0].filename,
        ocr_status=EvidenceOcrStatus.PENDING
    )

@router.post("/instances/{id}/approve")
async def approve_instance(id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """[Compliance Officer] Approve instance"""
    await ComplianceService.transition_status(db, id, InstanceStatus.COMPLETED)
    return {"status": "success"}

@router.post("/instances/{id}/reject")
async def reject_instance(id: uuid.UUID, reason: str, db: AsyncSession = Depends(get_db)):
    """Reject with reason"""
    await ComplianceService.transition_status(db, id, InstanceStatus.PENDING)
    return {"status": "success"}

@router.get("/mines/{mine_id}/health-score", response_model=ComplianceHealthScore)
async def get_health_score(mine_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Current compliance health score"""
    return await ComplianceService.compute_health_score(db, mine_id)

@router.get("/mines/{mine_id}/calendar")
async def get_calendar(mine_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Calendar view data"""
    instances = await ComplianceService.get_instances(db, mine_id)
    return instances
