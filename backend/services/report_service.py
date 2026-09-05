import uuid
from main import celery
import os


class ReportService:
    @staticmethod
    async def generate_inspection_summary(db, inspection_id: str) -> dict:
        from models.inspection import Inspection
        from sqlalchemy import select
        
        # 1. Fetch Inspection + Observations
        query = select(Inspection).where(Inspection.id == inspection_id)
        result = await db.execute(query)
        inspection = result.scalar_one_or_none()
        if not inspection:
            return {"error": "Inspection not found"}
            
        await db.refresh(inspection, ["observations"])
        
        obs_text = "\n".join([
            f"- {obs.checklist_item_id}: {obs.description} (Severity: {obs.severity.value})" 
            for obs in inspection.observations
        ])
        
        prompt = f"""
        You are a mining safety AI assistant. Generate a professional summary for the following inspection:
        Inspection Type: {inspection.inspection_type.value}
        Zone: {inspection.zone}
        
        Observations:
        {obs_text}
        
        Provide:
        1. An 'Executive Summary' paragraph summarizing the overall safety and compliance.
        2. A list of 'Recommended Actions' based on the critical and high severity observations.
        
        Format as JSON with keys 'executive_summary' (string) and 'recommended_actions' (list of strings).
        """
        
        from services.gemini_service import gemini_rotator
        
        try:
            return gemini_rotator.generate_json_content(prompt)
        except Exception as e:
            print("Gemini error:", e)
            return {
                "executive_summary": "Failed to generate AI summary.",
                "recommended_actions": []
            }

    @staticmethod
    def trigger_report_generation(report_type: str, mine_id: uuid.UUID, period_start: str, period_end: str) -> str:
        # Trigger Celery task
        task = generate_statutory_report.delay(report_type, str(mine_id), period_start, period_end)
        return str(task.id)

@celery.task(name="generate_statutory_report")
def generate_statutory_report(report_type: str, mine_id: str, period_start: str, period_end: str):
    import time
    print(f"Generating {report_type} for mine {mine_id}...")
    
    # In a real implementation:
    # 1. Fetch data from DB
    # 2. Render HTML using Jinja2 templates (or openpyxl for Excel)
    # 3. Convert HTML to PDF using WeasyPrint
    # 4. Upload to Supabase Storage
    # 5. Save record with SHA-256 hash to DB
    
    time.sleep(3) # Simulate generation time
    
    return {
        "status": "success",
        "file_url": f"https://mock-storage.com/reports/{mine_id}/{report_type}.pdf",
        "hash": "mock_sha256_hash_here"
    }
