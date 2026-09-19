import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from celery import Celery

# Load backend/.env before reading configuration or importing routers.
load_dotenv(Path(__file__).resolve().parent / ".env")
load_dotenv()

# --- Celery Configuration ---
# Use the local Redis container we set up as both the broker and result backend
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
    timezone="Asia/Kolkata", # Adjust if necessary
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

# Sample background task
@celery.task(name="sample_background_task")
def sample_background_task(message: str):
    import time
    print(f"Starting long task for: {message}")
    time.sleep(3) # Simulate a slow ML or PDF job
    print(f"Finished task for: {message}")
    return f"Processed: {message}"


# --- FastAPI Application ---
app = FastAPI(title="SIH2026 Backend Engine")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from routers import compliance, reports, inspection, mine, users, ai, alerts
from routers import contractors, environment, production, incidents, grievances, ocr, sync, attendance, webhook, webhooks
app.include_router(compliance.router)
app.include_router(reports.router)
app.include_router(inspection.router)
app.include_router(mine.router)
app.include_router(users.router)
app.include_router(ai.router)
app.include_router(alerts.router)
app.include_router(contractors.router)
app.include_router(environment.router)
app.include_router(production.router)
app.include_router(incidents.router)
app.include_router(grievances.router)
app.include_router(ocr.router)
app.include_router(sync.router)
app.include_router(attendance.router)
app.include_router(webhook.router)
app.include_router(webhooks.router)

class HealthCheckResponse(BaseModel):
    status: str
    message: str

@app.get("/", response_model=HealthCheckResponse)
async def root():
    return HealthCheckResponse(status="ok", message="FastAPI engine running.")

@app.post("/test-background-task")
async def trigger_task(message: str):
    """Endpoint to test our new Celery worker"""
    # .delay() sends the job to the Redis queue in the background
    task = sample_background_task.delay(message)
    return {"message": "Task queued successfully!", "task_id": str(task.id)}