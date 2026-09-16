from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/production", tags=["Production"])

@router.get("/")
async def list_production_logs():
    return []

@router.post("/")
async def add_production_log():
    return {"status": "success"}
