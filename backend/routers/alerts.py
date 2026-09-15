from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
import uuid
import logging
from datetime import datetime, timezone

from database import get_db
from models.notification import Alert, AlertStatus

router = APIRouter(prefix="/api/v1/alerts", tags=["alerts"])
logger = logging.getLogger(__name__)

@router.patch("/{alert_id}/acknowledge")
async def acknowledge_alert(
    alert_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Mark an alert as read/acknowledged."""
    try:
        await db.execute(
            update(Alert)
            .where(Alert.id == str(alert_id))
            .values(
                status=AlertStatus.read,
                read_at=datetime.now(timezone.utc)
            )
        )
        await db.commit()
        return {"status": "ok"}
    except Exception as e:
        logger.error(f"[ALERTS] Failed to acknowledge {alert_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to acknowledge alert")
