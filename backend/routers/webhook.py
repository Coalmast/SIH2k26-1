from fastapi import APIRouter

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks"])

@router.post("/iot")
async def receive_iot_webhook():
    return {"status": "success"}
