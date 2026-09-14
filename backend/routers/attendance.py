from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/attendance", tags=["Attendance"])

@router.get("/")
async def list_attendance():
    return []

@router.post("/check-in")
async def check_in():
    return {"status": "success"}
