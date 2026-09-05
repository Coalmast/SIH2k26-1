from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import uuid
from typing import List, Dict, Any

from services.report_service import ReportService
from database import SessionLocal

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

async def get_db():
    async with SessionLocal() as session:
        yield session

class GenerateReportRequest(BaseModel):
    type: str
    mine_id: uuid.UUID
    period_start: str
    period_end: str

@router.post("/generate")
async def generate_report(request: GenerateReportRequest):
    """Trigger statutory report generation job (Celery async)"""
    job_id = ReportService.trigger_report_generation(
        request.type, request.mine_id, request.period_start, request.period_end
    )
    return {"job_id": job_id, "message": "Report generation started."}

@router.get("/inspection/{id}/summary")
async def get_inspection_summary(id: uuid.UUID, db=Depends(get_db)):
    """Generate AI summary for an inspection"""
    result = await ReportService.generate_inspection_summary(db, str(id))
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Poll job status"""
    from main import celery
    res = celery.AsyncResult(job_id)
    if res.ready():
        return {"status": "completed", "result": res.result}
    return {"status": "pending"}

@router.get("/{id}/download")
async def download_report(id: uuid.UUID):
    """Download generated PDF/Excel"""
    # Mock download URL return
    return {"url": f"https://mock-storage.com/reports/{id}.pdf"}

@router.get("/history")
async def report_history(mine_id: uuid.UUID, db=Depends(get_db)):
    """List generated reports for a mine"""
    return [
        {
            "id": uuid.uuid4(),
            "type": "Annual Return (Form 3)",
            "period": "2026-2027",
            "status": "SUBMITTED",
            "generated_at": "2027-02-01T10:00:00Z"
        }
    ]
