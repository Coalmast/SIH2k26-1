from fastapi import APIRouter, Request, HTTPException
import logging

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)

@router.post("/resend")
async def resend_webhook(request: Request):
    """
    Handle webhooks from Resend for email delivery status.
    For example, log when a statutory PDF report bounces.
    """
    try:
        payload = await request.json()
        event_type = payload.get("type")
        data = payload.get("data", {})
        email_id = data.get("email_id")
        
        logger.info(f"[WEBHOOK:RESEND] Event: {event_type} | Email ID: {email_id}")
        
        if event_type == "email.bounced":
            to = data.get("to", [])
            logger.error(f"[WEBHOOK:RESEND] Email bounced to {to}")
            # Optionally: alert admin or update db status
            
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"[WEBHOOK:RESEND] Error processing webhook: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
