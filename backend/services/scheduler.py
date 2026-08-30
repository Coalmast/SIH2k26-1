import datetime
from celery.schedules import crontab
from main import celery

@celery.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Runs on the 1st of every month at 00:05 IST
    sender.add_periodic_task(
        crontab(minute=5, hour=0, day_of_month=1),
        generate_monthly_instances.s(),
        name='generate_monthly_instances_job'
    )
    
    # Runs every 6 hours
    sender.add_periodic_task(
        crontab(minute=0, hour='*/6'),
        check_overdue_instances.s(),
        name='check_overdue_instances_job'
    )
    
    sender.add_periodic_task(
        crontab(minute=0, hour='*/6'),
        escalation_ladder.s(),
        name='escalation_ladder_job'
    )

@celery.task(name="generate_monthly_instances")
def generate_monthly_instances():
    """Creates compliance_instances rows from active requirements for the new month"""
    print(f"[{datetime.datetime.now()}] Running generate_monthly_instances...")
    # Mock implementation
    # 1. Fetch active mines
    # 2. Fetch requirements mapping to each mine's type where auto_generate=True
    # 3. Insert compliance_instances with appropriate due_date
    return "Generated instances for the month."

@celery.task(name="check_overdue_instances")
def check_overdue_instances():
    """Marks status = overdue for instances past due_date where status is pending/in_progress"""
    print(f"[{datetime.datetime.now()}] Running check_overdue_instances...")
    # Mock implementation
    # UPDATE compliance_instances SET status = 'OVERDUE' WHERE due_date < NOW() AND status IN ('PENDING', 'IN_PROGRESS')
    return "Checked for overdue instances."

@celery.task(name="escalation_ladder")
def escalation_ladder():
    """Applies escalation tiers to overdue instances"""
    print(f"[{datetime.datetime.now()}] Running escalation_ladder...")
    # Mock implementation
    # 1. Fetch overdue instances
    # 2. If days overdue >= 7, set escalation_tier=1, notify Mine Manager
    # 3. If days overdue >= 14, set escalation_tier=2, notify Subsidiary Head, regulator_visible=TRUE
    return "Processed escalation ladder."
