from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/contractors", tags=["Contractors"])

@router.get("/")
async def list_contractors():
    return [{"id": "1", "name": "Balaji Mining", "status": "active"}]

@router.post("/")
async def create_contractor():
    return {"status": "success"}

@router.get("/{id}")
async def get_contractor(id: str):
    return {"id": id, "name": "Contractor"}
