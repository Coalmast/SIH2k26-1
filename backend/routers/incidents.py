from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/incidents", tags=["Incidents"])

@router.get("/")
async def list_incidents():
    return []

@router.post("/")
async def report_incident():
    return {"status": "success"}

@router.get("/{id}")
async def get_incident(id: str):
    return {"id": id}
