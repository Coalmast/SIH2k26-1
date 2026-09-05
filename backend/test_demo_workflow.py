import httpx
from jose import jwt
import uuid
import datetime

MANAGER_USER_ID = "00000000-0000-0000-0000-000000000010"
MINE_ID = "00000000-0000-0000-0000-000000000004"
TEMPLATE_GAS_ID = "00000000-0000-0000-0000-000000000020"

BASE_URL = "http://127.0.0.1:8000/api/v1"
JWT_SECRET = "super-secret-jwt-token-with-at-least-32-characters-long"

def generate_token(sub: str):
    return jwt.encode({"sub": sub}, JWT_SECRET, algorithm="HS256")

def run():
    token = generate_token(MANAGER_USER_ID)
    headers = {"Authorization": f"Bearer {token}"}
    
    with httpx.Client(base_url=BASE_URL, headers=headers, timeout=60.0) as client:
        # 1. Schedule Inspection
        print("1. Scheduling Inspection...")
        resp = client.post("/inspections", json={
            "mine_id": MINE_ID,
            "inspection_type": "environmental_pcb",
            "checklist_template_id": TEMPLATE_GAS_ID,
            "scheduled_date": datetime.date.today().isoformat(),
            "zone": "Demo Pit"
        })
        resp.raise_for_status()
        inspection = resp.json()
        inspection_id = inspection["id"]
        print(f"Scheduled Inspection ID: {inspection_id}")
        
        # 2. Add observations
        print("2. Adding Observations...")
        observations = [
            {
                "checklist_item_id": "GAS-CH4",
                "category": "safety",
                "description": "Methane at 1.4% (Critical)",
                "status": "non_compliant",
                "severity": "critical"
            },
            {
                "checklist_item_id": "GAS-O2",
                "category": "safety",
                "description": "Oxygen at 18.9% (Critical)",
                "status": "non_compliant",
                "severity": "critical"
            },
            {
                "checklist_item_id": "GAS-CO2",
                "category": "safety",
                "description": "CO2 at 0.65% (High)",
                "status": "non_compliant",
                "severity": "high"
            },
            {
                "checklist_item_id": "GAS-CO",
                "category": "safety",
                "description": "CO at 35 ppm (OK)",
                "status": "ok",
                "severity": "low"
            },
            {
                "checklist_item_id": "VENT-FLOW",
                "category": "safety",
                "description": "Ventilation at 22 m3/min (High)",
                "status": "non_compliant",
                "severity": "high"
            },
            {
                "checklist_item_id": "TEMP-WB",
                "category": "safety",
                "description": "Temperature at 31 C (OK)",
                "status": "ok",
                "severity": "low"
            },
            {
                "checklist_item_id": "GAS-H2S",
                "category": "safety",
                "description": "H2S at 2 ppm (OK)",
                "status": "ok",
                "severity": "low"
            },
            {
                "checklist_item_id": "GAS-NO2",
                "category": "safety",
                "description": "NO2 at 1 ppm (OK)",
                "status": "ok",
                "severity": "low"
            },
            {
                "checklist_item_id": "GAS-SO2",
                "category": "safety",
                "description": "SO2 at 0.5 ppm (OK)",
                "status": "ok",
                "severity": "low"
            },
            {
                "checklist_item_id": "DUST-PM10",
                "category": "safety",
                "description": "PM10 at 1.5 mg/m3 (OK)",
                "status": "ok",
                "severity": "low"
            },
            {
                "checklist_item_id": "VENT-VEL",
                "category": "safety",
                "description": "Air velocity at 150 m/min (OK)",
                "status": "ok",
                "severity": "low"
            },
            {
                "checklist_item_id": "DETECTOR-CALIB",
                "category": "safety",
                "description": "Calibration is valid (OK)",
                "status": "ok",
                "severity": "low"
            },
            {
                "checklist_item_id": "NOISE-DB",
                "category": "safety",
                "description": "Noise at 82 dB (OK)",
                "status": "ok",
                "severity": "low"
            },
            {
                "checklist_item_id": "WATER-PH",
                "category": "environment",
                "description": "pH is 7.2 (OK)",
                "status": "ok",
                "severity": "low"
            },
            {
                "checklist_item_id": "VIS-LOG",
                "category": "safety",
                "description": "Log is maintained (OK)",
                "status": "ok",
                "severity": "low"
            }
        ]
        
        for obs in observations:
            r = client.post(f"/inspections/{inspection_id}/observations", json=obs)
            if r.status_code >= 400:
                print("Error adding observation:", r.text)
            r.raise_for_status()
            print(f"  Added observation: {obs['checklist_item_id']}")
            
        # 3. Analyze Anomalies
        print("3. Analyzing Anomalies (AI Rule Engine)...")
        r = client.post(f"/inspections/{inspection_id}/analyze")
        r.raise_for_status()
        analysis = r.json()
        import json
        print("Analysis Result:\n", json.dumps(analysis, indent=2))
        
        # 4. Submit Inspection
        print("4. Submitting Inspection...")
        r = client.post(f"/inspections/{inspection_id}/submit", json={
            "overall_remarks": "Completed demo gas survey."
        })
        r.raise_for_status()
        print("Submitted successfully!")
        
        # 5. Fetch AI Summary Report
        print("5. Generating AI Summary Report (Gemini API)...")
        r = client.get(f"/reports/inspection/{inspection_id}/summary")
        r.raise_for_status()
        report = r.json()
        print("\n=== AI GENERATED SUMMARY ===")
        print(report.get("executive_summary"))
        print("\n=== RECOMMENDED ACTIONS ===")
        print(report.get("recommended_actions"))

if __name__ == "__main__":
    run()
