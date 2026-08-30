import asyncio
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

# Assuming celery app is available from main or a dedicated celery_worker module
# Here we import it from main (or we can pass it, or configure separately)
from main import celery
from database import SessionLocal
from models.inspection import CorrectiveAction, CapaStatus, Violation, ViolationStatus

# Mock notification functions to simulate alerting
async def notify_user(user_id, priority, message):
    print(f"[ALERT - {priority}] To User {user_id}: {message}")

async def notify_mine_manager(mine_id, message):
    print(f"[ALERT - HIGH] To Mine Manager of {mine_id}: {message}")

async def notify_subsidiary_head(mine_id, message):
    print(f"[ALERT - CRITICAL] To Subsidiary Head of mine {mine_id}: {message}")

async def notify_regulator(mine_id, message):
    print(f"[ALERT - CRITICAL] To Regulator for mine {mine_id}: {message}")

async def _check_overdue_capas_async():
    async with SessionLocal() as db:
        query = select(CorrectiveAction).where(
            CorrectiveAction.status.in_([CapaStatus.assigned, CapaStatus.in_progress])
        ).options(selectinload(CorrectiveAction.violation))
        
        result = await db.execute(query)
        capas = result.scalars().all()
        
        now = datetime.utcnow()
        # Ensure now is timezone aware if due_date is, or vice versa
        # Using naive for simplicity assuming due_date is converted to naive UTC
        
        for capa in capas:
            # Need to compare naive with naive or aware with aware
            # Assuming due_date is naive UTC in our DB for now
            due_date = capa.due_date.replace(tzinfo=None) if capa.due_date.tzinfo else capa.due_date
            
            if now > due_date:
                days_overdue = (now - due_date).days
                
                # Mark as overdue if it hasn't been escalated beyond overdue
                if capa.status != CapaStatus.escalated:
                    capa.status = CapaStatus.overdue
                
                msg = f"CAPA {capa.id} is {days_overdue} days overdue."
                
                if days_overdue >= 1 and days_overdue < 3:
                    await notify_user(capa.assigned_to, "high", msg)
                
                if days_overdue >= 3 and days_overdue < 7:
                    await notify_mine_manager(capa.mine_id, msg)
                
                if days_overdue >= 7:
                    await notify_subsidiary_head(capa.mine_id, msg)
                    if capa.violation and not capa.violation.is_regulator_visible:
                        capa.violation.is_regulator_visible = True
                        capa.status = CapaStatus.escalated
                        
                if days_overdue >= 14:
                    await notify_regulator(capa.mine_id, msg)
                    
        await db.commit()

@celery.task(name="services.escalation_tasks.check_overdue_capas")
def check_overdue_capas():
    """
    Periodic Celery task to check for overdue CAPAs and trigger escalations.
    Uses asyncio.run to execute the async DB logic.
    """
    print("Running periodic task: check_overdue_capas")
    asyncio.run(_check_overdue_capas_async())
