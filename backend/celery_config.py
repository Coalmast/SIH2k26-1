"""
Celery configuration module
Separated to avoid circular imports between main.py and service modules
"""
import os
from celery import Celery

# Use the local Redis container as both the broker and result backend
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery = Celery(
    "sih2026_worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)

celery.conf.beat_schedule = {
    "check-overdue-capas-every-15min": {
        "task": "services.escalation_tasks.check_overdue_capas",
        "schedule": 900.0,  # 900 seconds = 15 minutes
    },
    "check-overdue-compliance-every-15min": {
        "task": "services.compliance_escalation_tasks.check_overdue_compliance",
        "schedule": 900.0,
    },
}
