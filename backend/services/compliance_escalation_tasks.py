import asyncio
from datetime import datetime
from sqlalchemy.future import select

from main import celery
from database import SessionLocal
from models.compliance import ComplianceInstance, InstanceStatus
from services.notification_service import (
    alert_compliance_officer,
    alert_mine_manager,
    alert_subsidiary_head,
    send_alert,
    NotificationRequest,
)


async def _check_overdue_compliance_async():
    async with SessionLocal() as db:
        query = select(ComplianceInstance).where(
            ComplianceInstance.status.in_([
                InstanceStatus.pending,
                InstanceStatus.in_progress,
                InstanceStatus.revision_requested,
                InstanceStatus.breached,
            ])
        )
        result = await db.execute(query)
        instances = result.scalars().all()

        now = datetime.utcnow().date()

        for instance in instances:
            due_date = instance.due_date
            days_diff = (now - due_date).days
            inst_id   = str(instance.id)
            mine_id   = str(instance.mine_id)
            sub_id    = str(instance.subsidiary_id) if instance.subsidiary_id else None

            if days_diff == -7:
                # T-7: warn the compliance officer
                await alert_compliance_officer(
                    mine_id=mine_id,
                    title="Compliance Task Due in 7 Days",
                    body=f"Compliance task {inst_id} must be completed within 7 days to avoid a breach.",
                    entity_type="compliance_instance",
                    entity_id=inst_id,
                    db=db,
                )

            elif days_diff == -3:
                # T-3: escalate to mine manager
                await alert_mine_manager(
                    mine_id=mine_id,
                    title="⚠️ Compliance Task Due in 3 Days",
                    body=f"Compliance task {inst_id} is due in 3 days. Immediate action required.",
                    priority="high",
                    entity_type="compliance_instance",
                    entity_id=inst_id,
                    db=db,
                )

            elif days_diff >= 0 and instance.status != InstanceStatus.breached:
                # T+0: mark breached, alert manager + subsidiary head
                instance.status = InstanceStatus.breached
                await db.flush()

                await alert_mine_manager(
                    mine_id=mine_id,
                    title="🚨 Compliance Breach — Task Overdue",
                    body=f"Compliance task {inst_id} has passed its due date without completion.",
                    priority="critical",
                    entity_type="compliance_instance",
                    entity_id=inst_id,
                    db=db,
                )
                if sub_id:
                    await alert_subsidiary_head(
                        subsidiary_id=sub_id,
                        title="🚨 Compliance Breach Reported",
                        body=f"Mine {mine_id}: task {inst_id} is now BREACHED. Escalation initiated.",
                        priority="critical",
                        entity_type="compliance_instance",
                        entity_id=inst_id,
                        db=db,
                    )

            elif days_diff == 7 and sub_id:
                # T+7: escalate to subsidiary head, set regulator visible
                await alert_subsidiary_head(
                    subsidiary_id=sub_id,
                    title="Compliance Breach: 7 Days Overdue",
                    body=f"Task {inst_id} remains unresolved 7 days after its deadline. Regulator has been notified.",
                    priority="high",
                    entity_type="compliance_instance",
                    entity_id=inst_id,
                    db=db,
                )

            elif days_diff == 14:
                # T+14: send directly to regulator contact (email)
                await send_alert(
                    NotificationRequest(
                        title="Statutory Compliance Breach — 14 Days Overdue",
                        body=(
                            f"Compliance task {inst_id} at mine {mine_id} remains unresolved "
                            f"14 days past its statutory deadline. Formal escalation is recorded."
                        ),
                        priority="critical",
                        mine_id=mine_id,
                        entity_type="compliance_instance",
                        entity_id=inst_id,
                        channels=["realtime", "push"],
                    ),
                    db=db,
                )

        await db.commit()


@celery.task(name="services.compliance_escalation_tasks.check_overdue_compliance")
def check_overdue_compliance():
    """
    Periodic Celery task to check for overdue compliance instances and trigger escalations.
    Now wired to the real notification_service — no more print() stubs.
    """
    asyncio.run(_check_overdue_compliance_async())

