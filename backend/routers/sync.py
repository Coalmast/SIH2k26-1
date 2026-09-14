from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/sync", tags=["Sync"])

@router.post("/offline-data")
async def sync_offline_data():
    return {"status": "synced"}
