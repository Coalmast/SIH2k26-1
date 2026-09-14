from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/environment", tags=["Environment"])

@router.get("/stations")
async def list_env_stations():
    return []

@router.get("/readings")
async def get_env_readings():
    return []

@router.post("/readings")
async def add_env_reading():
    return {"status": "success"}
