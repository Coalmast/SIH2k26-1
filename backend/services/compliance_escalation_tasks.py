import asyncio
from datetime import datetime
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from main import celery
from database import SessionLocal
from models.compliance import ComplianceInstance, InstanceStatus

# Mock notification functions to simulate alerting
async def notify_compliance_officer(mine_id, message):
    print(f"[ALERT - HIGH] To Compliance Officer for mine {mine_id}: {message}")

async def notify_mine_manager(mine_id, message):
    print(f"[ALERT - CRITICAL] To Mine Manager of {mine_id}: {message}")

async def notify_subsidiary_head(mine_id, message):
    print(f"[ALERT - CRITICAL] To Subsidiary Head of mine {mine_id}: {message}")

async def notify_regulator(mine_id, message):
    print(f"[ALERT - CRITICAL] To Regulator for mine {mine_id}: {message}")

async def _check_overdue_compliance_async():
    async with SessionLocal() as db:
        # Check pending or in progress or revision requested
        query = select(ComplianceInstance).where(
            ComplianceInstance.status.in_([InstanceStatus.pending, InstanceStatus.in_progress, InstanceStatus.revision_requested, InstanceStatus.breached])
        )
        
        result = await db.execute(query)
        instances = result.scalars().all()
        
        now = datetime.utcnow().date()
        
        for instance in instances:
            due_date = instance.due_date
            
            days_diff = (now - due_date).days
            
            if days_diff == -7:
                await notify_compliance_officer(instance.mine_id, f"Compliance instance {instance.id} is due in 7 days.")
                
            elif days_diff == -3:
                await notify_mine_manager(instance.mine_id, f"Compliance instance {instance.id} is due in 3 days.")
                
            elif days_diff >= 0 and instance.status != InstanceStatus.breached:
                instance.status = InstanceStatus.breached
                await notify_mine_manager(instance.mine_id, f"Compliance instance {instance.id} is breached (overdue).")
                await notify_subsidiary_head(instance.subsidiary_id, f"Compliance instance {instance.id} is breached (overdue).")
                
            elif days_diff == 7:
                await notify_subsidiary_head(instance.subsidiary_id, f"Compliance instance {instance.id} is 7 days overdue.")
                # We would set regulator_visible here if it existed, or trigger a workflow
                # instance.regulator_visible = True
                
            elif days_diff == 14:
                await notify_regulator(instance.mine_id, f"Compliance instance {instance.id} is 14 days overdue.")
                
        await db.commit()

@celery.task(name="services.compliance_escalation_tasks.check_overdue_compliance")
def check_overdue_compliance():
    """
    Periodic Celery task to check for overdue compliance instances and trigger escalations.
    Uses asyncio.run to execute the async DB logic.
    """
    print("Running periodic task: check_overdue_compliance")
    asyncio.run(_check_overdue_compliance_async())
