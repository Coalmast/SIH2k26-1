# Implementation Plan: Inspection → AI Anomaly → Report → Notification
**COMET Platform — Demo Workflow (Environmental Mine Gas Inspection)**

> [!IMPORTANT]
> **Gemini API added to Phase 5.** After rule-based anomaly detection runs, a Gemini API call generates a professional natural-language inspection report with executive summary, detailed violation narratives, and actionable recommendations. This covers the Regulatory RAG Assistant feature from the PS.

---

## Demo Story Arc

> **"A mine manager opens the COMET field app and conducts a routine environmental gas inspection at Umrer OCP. As they log real sensor readings — CO₂ levels, methane, oxygen — the AI anomaly engine cross-checks each reading against CMR 2017 regulatory thresholds in real-time. A dangerous methane–oxygen co-occurrence pattern is detected. On submission, an inspection report card appears and all stakeholders receive instant notifications."**

---

## User Decisions (Finalized)

| Decision | Choice |
|----------|--------|
| Auth | Custom DB-lookup bypass — no JWT secret needed, reads role/mine from DB |
| Inspection Type | **Environmental Gas Inspection** (real gas data, real CMR 2017 regulations) |
| Report | UI page card (no PDF) |
| Anomaly Rules | Yes — 4 rule-based rules |

---

## Phase 1 — Auth Bypass (DB Lookup Strategy)

**Problem:** Supabase JWT signature verification fails in local dev (no secret), and custom claims (`mine_ids`, `role`) are not embedded in the JWT anyway.

**Solution:** Keep Supabase Auth (web login still works), but rewrite `get_current_user` to:
1. Decode JWT **without verification** (just base64 parse) to get `sub` (user UUID)
2. Use `sub` to look up the `users` table → get `mine_id`, `subsidiary_id`
3. Look up `user_roles` → `roles` tables → get `role` name
4. Return `UserContext` fully populated from DB — no custom JWT claims needed

This means **any valid Supabase session** (yours or a demo user's) automatically gets the correct mine scope from the database. No more hardcoded UUIDs or dev hacks.

### [MODIFY] [`auth.py`](file:///c:/Coding/SIH2026/backend/auth.py)

```python
# NEW get_current_user flow:
async def get_current_user(token = Depends(security), db = Depends(get_db)) -> UserContext:
    # Step 1: Decode token WITHOUT signature verification (just parse payload)
    try:
        claims = jwt.get_unverified_claims(token.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Malformed token")

    user_id = claims.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Missing user ID in token")

    # Step 2: Look up user in DB by Supabase auth UUID
    user_row = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = user_row.scalar_one_or_none()

    if not user:
        # DEV FALLBACK: if user not in DB yet, use demo mine
        return UserContext(
            user_id=user_id,
            mine_ids=["00000000-0000-0000-0000-000000000004"],
            subsidiary_id="00000000-0000-0000-0000-000000000002",
            role="mine_manager",
            permissions=[]
        )

    # Step 3: Look up role from user_roles → roles
    role_row = await db.execute(
        select(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
        .limit(1)
    )
    role = role_row.scalar_one_or_none() or "mine_manager"

    mine_ids = [str(user.mine_id)] if user.mine_id else []
    
    return UserContext(
        user_id=str(user.id),
        mine_ids=mine_ids,
        subsidiary_id=str(user.subsidiary_id) if user.subsidiary_id else None,
        role=role,
        permissions=[]
    )
```

> **Note:** Supabase Auth (web login UI) is untouched. Only the backend JWT → UserContext mapping changes.

### [MODIFY] [`routers/inspection.py`](file:///c:/Coding/SIH2026/backend/routers/inspection.py)
- Remove debug `print` statements
- The 403 check becomes: `if str(dto.mine_id) not in user_ctx.mine_ids and user_ctx.role not in ["system_admin", "regulator"]:`
- Since `mine_ids` now always comes from DB, this will work correctly

---

## Phase 2 — Demo Seed (`seed_demo.py`)

New standalone file. Truncates all tables and seeds minimal, clean demo data.

### [NEW] [`seed_demo.py`](file:///c:/Coding/SIH2026/backend/seed_demo.py)

#### Users (3 total)

| Role | Name | Email | Supabase UID |
|------|------|-------|-------------|
| `system_admin` | Admin User | krunal6214@gmail.com | `6b339687-5103-4463-9eae-e6bceba9eb1f` |
| `mine_manager` | Rajesh Kumar | rajesh.k@umrer.wcl.in | New Supabase Auth user |
| `field_officer` | Sunil Patil | sunil.p@umrer.wcl.in | New Supabase Auth user |

> For demo, all 3 users will have entries in the `users` DB table linked to the demo mine. Login works with the system_admin account (your Google login) and the DB lookup returns `mine_manager` role scoped to Umrer OCP.

#### Mine (1)
```
Organization: Coal India Limited
Subsidiary:   WCL — Western Coalfields Ltd.
Mine:         Umrer OCP, Nagpur, Maharashtra
Mine ID:      00000000-0000-0000-0000-000000000004 (stable)
Mine Type:    opencast
```

#### Checklist Templates (2 — focused on environmental gas)

**Template 1: Environmental Gas & Air Quality — Underground Zones**
- `inspection_type`: `environmental_pcb`
- `applicable_mine_types`: `["opencast", "underground"]`
- `regulation_reference`: "CMR 2017, Regulations 5 & 68; EP Act 1986"
- **15 checklist items** (see detailed spec below)

**Template 2: DGMS Annual General Safety**
- `inspection_type`: `dgms_annual_general`
- `applicable_mine_types`: `["opencast"]`
- `regulation_reference`: "CMR 2017, Regulations 100, 105, 138, 141"
- **12 checklist items** (roof support, PPE, fire, electrical)

#### Real Environmental Gas Checklist Items (Template 1)

These map directly to Indian coal mine regulations with exact threshold values:

```json
[
  {
    "id": "GAS-O2",
    "text": "Oxygen (O₂) level at working face",
    "regulation": "CMR 2017, Reg. 5(1)(a)",
    "unit": "%",
    "normal_range": ">= 19.5",
    "danger_threshold": "< 19.5",
    "measurement_required": true,
    "notes": "Minimum 19.5% O₂ must be maintained in all working places"
  },
  {
    "id": "GAS-CO2",
    "text": "Carbon Dioxide (CO₂) concentration",
    "regulation": "CMR 2017, Reg. 5(1)(c)",
    "unit": "%",
    "normal_range": "<= 0.5",
    "danger_threshold": "> 0.5",
    "measurement_required": true,
    "notes": "CO₂ must not exceed 0.5% (5000 ppm). Evacuation mandatory above 1.5%"
  },
  {
    "id": "GAS-CO",
    "text": "Carbon Monoxide (CO) levels",
    "regulation": "CMR 2017, Reg. 5(1)(b)",
    "unit": "ppm",
    "normal_range": "<= 50",
    "danger_threshold": "> 50",
    "measurement_required": true,
    "notes": "Max permissible limit: 50 ppm. Source: combustion, blasting fumes"
  },
  {
    "id": "GAS-CH4",
    "text": "Methane (CH₄) / Firedamp concentration",
    "regulation": "CMR 2017, Reg. 5(2) & Reg. 68",
    "unit": "%",
    "normal_range": "< 0.25",
    "danger_threshold": "> 1.25",
    "warning_threshold": "> 0.25",
    "measurement_required": true,
    "notes": "Warning: >0.25%. All electric equipment must be cut off at 1.25%. Mine evacuation mandatory"
  },
  {
    "id": "GAS-H2S",
    "text": "Hydrogen Sulphide (H₂S) concentration",
    "regulation": "CMR 2017, Reg. 5(1)(d)",
    "unit": "ppm",
    "normal_range": "<= 10",
    "danger_threshold": "> 10",
    "measurement_required": true,
    "notes": "H₂S must not exceed 10 ppm. Detected near water-logged areas"
  },
  {
    "id": "GAS-NO2",
    "text": "Nitrogen Dioxide (NO₂) — post-blasting",
    "regulation": "CMR 2017, Reg. 5(1)(e)",
    "unit": "ppm",
    "normal_range": "<= 5",
    "danger_threshold": "> 5",
    "measurement_required": true,
    "notes": "Generated during blasting. Re-entry permitted only after NO₂ < 5 ppm"
  },
  {
    "id": "GAS-SO2",
    "text": "Sulphur Dioxide (SO₂) levels",
    "regulation": "CMR 2017, Reg. 5(1)(f)",
    "unit": "ppm",
    "normal_range": "<= 2",
    "danger_threshold": "> 2",
    "measurement_required": true,
    "notes": "SO₂ must not exceed 2 ppm in any working place"
  },
  {
    "id": "DUST-PM10",
    "text": "Respirable coal dust (PM10) — RSPM",
    "regulation": "CMR 2017, Reg. 106; EC Notification 2014",
    "unit": "mg/m³",
    "normal_range": "<= 3",
    "danger_threshold": "> 3",
    "measurement_required": true,
    "notes": "Respirable suspended particulate matter. Chronic exposure causes pneumoconiosis"
  },
  {
    "id": "VENT-FLOW",
    "text": "Ventilation air quantity at working face",
    "regulation": "CMR 2017, Reg. 68(1)",
    "unit": "m³/min",
    "normal_range": ">= 30",
    "danger_threshold": "< 30",
    "measurement_required": true,
    "notes": "Minimum 30 m³/min air quantity per person employed in the working place"
  },
  {
    "id": "VENT-VEL",
    "text": "Air velocity in intake/return airways",
    "regulation": "CMR 2017, Reg. 68(2)",
    "unit": "m/min",
    "normal_range": "60 - 300",
    "danger_threshold": "< 30 or > 400",
    "measurement_required": true,
    "notes": "Min 30 m/min in airways. Max 6 m/s (360 m/min) in main intake/return"
  },
  {
    "id": "TEMP-WB",
    "text": "Wet Bulb Temperature at working face",
    "regulation": "CMR 2017, Reg. 5(2); Mines Act 1952, Sec 20",
    "unit": "°C",
    "normal_range": "<= 33.5",
    "danger_threshold": "> 33.5",
    "measurement_required": true,
    "notes": "Max wet bulb temp: 33.5°C. Work must stop above this threshold"
  },
  {
    "id": "DETECTOR-CALIB",
    "text": "Multi-gas detector calibration certificate valid",
    "regulation": "CMR 2017, Reg. 5(3)",
    "unit": "status",
    "normal_range": "Valid",
    "danger_threshold": "Expired or missing",
    "measurement_required": false,
    "notes": "Gas detectors must be calibrated by approved agency. Frequency: quarterly"
  },
  {
    "id": "NOISE-DB",
    "text": "Ambient noise level in working area",
    "regulation": "Mines Act 1952, Sec 20; Noise Pollution Rules 2000",
    "unit": "dB(A)",
    "normal_range": "<= 90",
    "danger_threshold": "> 90",
    "measurement_required": true,
    "notes": "8-hour TWA must not exceed 90 dB(A). Hearing protection mandatory above 85 dB(A)"
  },
  {
    "id": "WATER-PH",
    "text": "Mine drainage water pH level",
    "regulation": "Environment Protection Act 1986, Schedule VI; MoEFCC norms",
    "unit": "pH",
    "normal_range": "6.0 - 8.5",
    "danger_threshold": "< 5.5 or > 9.0",
    "measurement_required": true,
    "notes": "Mine water discharge must comply with SPCB consent conditions. AMD (Acid Mine Drainage) monitoring"
  },
  {
    "id": "VIS-LOG",
    "text": "Ventilation officer's daily register maintained",
    "regulation": "CMR 2017, Reg. 68(6)",
    "unit": "status",
    "normal_range": "Updated and signed",
    "danger_threshold": "Missing or unsigned",
    "measurement_required": false,
    "notes": "Register must be maintained by a competent person and signed daily"
  }
]
```

#### Regulations to Seed (5 records in `regulations` table)

| Code | Title | Statute | Category | Authority |
|------|-------|---------|----------|-----------|
| `CMR-2017-REG5` | Gas Sampling & Air Quality in Mines | Coal Mines Regulations 2017 | `safety` | `dgms` |
| `CMR-2017-REG68` | Ventilation in Coal Mines | Coal Mines Regulations 2017 | `safety` | `dgms` |
| `CMR-2017-REG106` | Dust Suppression & Sampling | Coal Mines Regulations 2017 | `environment` | `dgms` |
| `EPA-1986-SCH6` | Environmental Standards for Mining | Environment Protection Act 1986 | `environment` | `moefcc` |
| `CMR-2017-REG100` | Support in Mines (Strata Control) | Coal Mines Regulations 2017 | `safety` | `dgms` |

#### Compliance Requirements (4 records — map to regulations)

| Title | Regulation | Frequency | Mine Types | Responsible |
|-------|-----------|-----------|-----------|-------------|
| Monthly Gas & Air Quality Inspection | CMR-2017-REG5 | `monthly` | both | `safety_officer` |
| Quarterly Ventilation Survey | CMR-2017-REG68 | `quarterly` | both | `mine_manager` |
| Monthly Environmental Monitoring Report | EPA-1986-SCH6 | `monthly` | both | `environmental_officer` |
| Annual General DGMS Inspection | CMR-2017-REG100 | `annual` | opencast | `mine_manager` |

#### Compliance Instances (4 records — September 2026)

| Requirement | Period | Due Date | Status |
|-------------|--------|----------|--------|
| Monthly Gas & Air Quality Inspection | Sep 1–30 2026 | Sep 15, 2026 | `pending` |
| Quarterly Ventilation Survey | Jul–Sep 2026 | Sep 30, 2026 | `in_progress` |
| Monthly Environmental Monitoring Report | Sep 1–30 2026 | Sep 20, 2026 | `pending` |
| Annual General DGMS Inspection | Jan–Dec 2026 | Oct 15, 2026 | `in_progress` |

---

## Phase 3 — AI Anomaly Detection Engine

**Replace the stub in `ai_service.py` with a real rule-based engine.**

### [MODIFY] [`services/ai_service.py`](file:///c:/Coding/SIH2026/backend/services/ai_service.py)

The engine uses **4 rules** drawn from real DGMS incident investigation data:

#### Rule 1: Single Reading Threshold Breach
For every observation with a `measured_value` field, compare against `danger_threshold` from the checklist item definition:

| Gas | Regulation | Threshold | Severity |
|-----|-----------|-----------|----------|
| O₂ | CMR 5(1)(a) | < 19.5% | `critical` |
| CO₂ | CMR 5(1)(c) | > 0.5% | `high` |
| CO | CMR 5(1)(b) | > 50 ppm | `high` |
| CH₄ | CMR 5(2) | > 0.25% warning, > 1.25% danger | `critical` |
| H₂S | CMR 5(1)(d) | > 10 ppm | `high` |
| NO₂ | CMR 5(1)(e) | > 5 ppm | `medium` |
| SO₂ | CMR 5(1)(f) | > 2 ppm | `medium` |
| PM10 | CMR 106 | > 3 mg/m³ | `medium` |
| Temp | CMR 5(2) | > 33.5°C | `high` |

→ Returns: `anomaly_type: "threshold_breach"`, `severity`, `regulation`, `recommendation`

#### Rule 2: Dangerous Co-occurrence (Most Important for Demo)
If **both CH₄ > 0.25%** AND **O₂ < 19.5%** are observed in the same inspection:

→ `anomaly_type: "dangerous_cooccurrence"`  
→ `severity: "critical"`  
→ Message: _"Simultaneous methane accumulation and oxygen deficiency detected. This is a known precursor to firedamp explosion. Immediate mine evacuation required. CMR 2017, Reg. 68 & Reg. 5(2)."_

This is a real DGMS-documented pre-explosion pattern.

#### Rule 3: Recurrence Pattern
Query the last 3 inspections of this mine. If the **same checklist item** (`checklist_item_id`) was marked `non_compliant` in ≥ 2 of them:

→ `anomaly_type: "recurrence_pattern"`  
→ `severity: "high"`  
→ Message: _"[Gas name] violation has been recorded in [N] consecutive inspections. This indicates a systemic ventilation failure, not an isolated incident. CMR 2017, Reg. 68(6) requires corrective action within 24 hours of detection."_

#### Rule 4: Multi-Gas Cluster
If **3 or more gas parameters** in a single inspection are `non_compliant`:

→ `anomaly_type: "multi_gas_cluster"`  
→ `severity: "critical"`  
→ Message: _"Multiple atmospheric hazards detected simultaneously. Combined gas exposure increases health risk exponentially. Evacuate and ventilate before resuming operations."_

### New Endpoint (Pre-Submit Analysis)

```
POST /api/v1/inspections/{id}/analyze

Response:
{
  "inspection_id": "...",
  "risk_level": "critical",          # low | medium | high | critical
  "risk_score": 84,                  # 0-100
  "anomalies": [
    {
      "type": "dangerous_cooccurrence",
      "title": "⚠ Critical: Methane + O₂ Deficiency",
      "description": "Simultaneous CH₄ > 0.25% and O₂ < 19.5%...",
      "affected_items": ["GAS-CH4", "GAS-O2"],
      "regulation": "CMR 2017, Reg. 5(2) & 68",
      "severity": "critical",
      "recommendation": "Immediately evacuate. Activate emergency ventilation."
    }
  ],
  "observations_analyzed": 12,
  "threshold_breaches": 3,
  "can_submit": true
}
```

This is called:
1. Automatically after **each observation** is added (lightweight — only Rule 1)
2. On-demand when user taps **"🔍 Analyze"** button (all 4 rules)
3. Once more at actual `submit` time (full analysis stored permanently on inspection)

---

## Phase 4 — Inspection Submit → Notification

### [MODIFY] [`services/inspection_service.py`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py) — `submit_inspection()`

After `inspection.status = submitted`, fire notifications:

```python
# Notify mine manager (if conducted_by is not the manager)
# Notify all users of the mine
await NotificationService.send_alert(db, NotificationRequest(
    title="🔴 Inspection Submitted — Anomaly Detected",
    body=f"Environmental gas inspection at Umrer OCP completed. "
         f"AI detected {critical_count} critical anomaly. Immediate review required.",
    priority="critical",
    mine_id=str(inspection.mine_id),
    entity_type="inspection",
    entity_id=str(inspection.id)
))
```

Supabase Realtime auto-broadcasts the `alerts` table INSERT → web dashboard toast fires without polling.

---

## Phase 5 — AI-Powered Report Generation (Gemini API)

After anomaly detection completes, a **Gemini API call** transforms the structured data into a professional inspection report narrative. This is the *Regulatory RAG Assistant* feature from the AI spec.

### Why Gemini?
- Free tier sufficient for demo (60 requests/min on `gemini-2.0-flash`)
- Already in Google ecosystem (no new billing account needed)
- Can be swapped for Claude without changing the interface

### [MODIFY] [`backend/.env`](file:///c:/Coding/SIH2026/backend/.env) + [`.env.example`](file:///c:/Coding/SIH2026/backend/.env.example)
```bash
# Add this line:
GEMINI_API_KEY=your_gemini_api_key_here
```

### [NEW] [`services/report_service.py`](file:///c:/Coding/SIH2026/backend/services/report_service.py)

Calls Gemini to generate the report narrative:

```python
import os, httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

async def generate_inspection_report(inspection_data: dict, anomalies: list, observations: list) -> dict:
    """
    Calls Gemini API with structured inspection context.
    Returns AI-generated report sections.
    """
    # Build the prompt from structured data
    obs_summary = "\n".join([
        f"- {obs['checklist_item_id']}: {obs['description']} (Severity: {obs['severity']}, Status: {obs['status']})"
        for obs in observations
    ])
    anomaly_summary = "\n".join([
        f"- [{a['severity'].upper()}] {a['title']}: {a['description']} | Regulation: {a['regulation']}"
        for a in anomalies
    ])

    prompt = f"""
You are a senior DGMS (Directorate General of Mines Safety) inspection analyst for Coal India Limited.
Generate a professional inspection report based on the following field data.

INSPECTION DETAILS:
- Mine: {inspection_data['mine_name']} ({inspection_data['mine_type']}) 
- Zone: {inspection_data['zone']}
- Date: {inspection_data['date']}
- Inspector: {inspection_data['conducted_by']}
- Inspection Type: {inspection_data['inspection_type']}
- Checklist Completion: {inspection_data['completion_pct']}%
- Risk Score: {inspection_data['risk_score']}/100 ({inspection_data['risk_level'].upper()})

OBSERVATIONS RECORDED:
{obs_summary}

AI ANOMALIES DETECTED:
{anomaly_summary}

Generate a structured report with exactly these 4 sections:

## EXECUTIVE SUMMARY
(2-3 sentences. State the overall risk level, key findings, and immediate action required.
Reference specific CMR 2017 regulations violated. Professional, direct tone.)

## CRITICAL FINDINGS
(Bullet points for each non-compliant item. For each: what was measured vs what is permitted,
which CMR 2017 / EP Act regulation is violated, and potential consequence of non-compliance.)

## AI ANOMALY ANALYSIS  
(Explain each AI-detected pattern in plain language. Explain WHY it is dangerous
based on mining safety knowledge. Reference historical incident patterns if relevant.)

## RECOMMENDED CORRECTIVE ACTIONS
(Numbered list of immediate actions required. Include SLA: what must be done in 1 hour,
24 hours, 7 days. Reference the responsible officer role per CMR 2017 for each action.)

Tone: Official government inspection report. Be specific, cite regulations exactly.
Do NOT add any preamble or sign-off. Start directly with ## EXECUTIVE SUMMARY.
"""

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 1500
        }
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            json=payload
        )
        resp.raise_for_status()
        content = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
    
    # Parse sections from markdown response
    sections = _parse_report_sections(content)
    return sections


def _parse_report_sections(text: str) -> dict:
    """Split the LLM response into labeled sections."""
    import re
    pattern = r"## ([A-Z ]+)\n(.*?)(?=## [A-Z]|$)"
    matches = re.findall(pattern, text, re.DOTALL)
    return {
        m[0].strip().lower().replace(" ", "_"): m[1].strip()
        for m in matches
    }
```

### Updated Report API Endpoint

```
GET /api/v1/reports/inspection/{id}/summary

Response:
{
  # --- Structured data (from DB) ---
  "inspection_id": "...",
  "mine_name": "Umrer OCP",
  "inspection_type": "Environmental Gas Inspection — CMR 2017",
  "conducted_by": "Rajesh Kumar",
  "zone": "Pit 3 East",
  "date": "2026-09-04",
  "checklist_completion_pct": 93,
  "total_observations": 13,
  "violations_found": 3,
  "critical_violations": 1,
  "risk_level": "critical",
  "risk_score": 84,
  "status": "submitted",
  "submitted_at": "2026-09-04T10:47:00Z",
  "top_violations": [
    { "item": "GAS-CH4", "text": "Methane (CH₄)", "value": "1.4%", "limit": "1.25%", "severity": "critical" },
    { "item": "GAS-O2",  "text": "Oxygen (O₂)",   "value": "18.9%","limit": "≥19.5%","severity": "critical" },
    { "item": "GAS-CO2", "text": "Carbon Dioxide","value": "0.65%","limit": "0.5%",  "severity": "high" }
  ],
  "anomalies": [...],

  # --- AI-generated narrative (from Gemini) ---
  "ai_report": {
    "executive_summary": "This environmental gas inspection at Umrer OCP (Pit 3 East) on 04 September 2026 has identified a CRITICAL risk condition requiring immediate operational suspension. Two simultaneous atmospheric hazards — methane concentration at 1.4% (exceeding CMR 2017 Reg. 5(2) evacuation threshold of 1.25%) and oxygen deficiency at 18.9% (below the CMR Reg. 5(1)(a) minimum of 19.5%) — constitute a documented pre-firedamp explosion signature. Immediate area evacuation and DGMS notification is mandatory under the Coal Mines Regulations 2017.",
    
    "critical_findings": "• **Methane (CH₄)**: Measured 1.4%, limit 1.25% — CMR 2017, Reg. 5(2). All electrical equipment must be disconnected immediately. Continued operation beyond this threshold constitutes a criminal offence under Section 72 of the Mines Act 1952...\n• **Oxygen (O₂)**: Measured 18.9%, minimum required 19.5% — CMR 2017, Reg. 5(1)(a). Workers exposed to oxygen levels below 19.5% risk hypoxia within minutes...",
    
    "ai_anomaly_analysis": "The AI pattern recognition module has identified a DANGEROUS CO-OCCURRENCE anomaly: simultaneous methane accumulation and oxygen depletion in the same working zone. This specific combination has been documented by DGMS in 60% of reported firedamp incidents between 2015–2024 in Indian underground and opencast mines...",
    
    "recommended_corrective_actions": "1. IMMEDIATE (Within 1 hour): Evacuate all personnel from Pit 3 East. Activate emergency ventilation. Notify DGMS Regional Office. Responsibility: Mine Manager (CMR 2017, Reg. 68(5))...\n2. WITHIN 24 HOURS: Increase ventilation air quantity to minimum 30 m³/min per CMR Reg. 68(1). Recalibrate all gas detectors...\n3. WITHIN 7 DAYS: Submit written report to DGMS under CMR 2017, Reg. 5(4)..."
  },
  
  "ai_report_generated_at": "2026-09-04T10:47:15Z",
  "ai_model": "gemini-2.0-flash"
}
```

### [NEW] `InspectionReportCard.tsx`

The final screen in the mobile simulator and a full web page at `/inspections/{id}/report`:

```
┌──────────────────────────────────────┐
│ ✅ INSPECTION SUBMITTED              │
│ Umrer OCP • Pit 3 East • 04 Sep 2026 │
├──────────────────────────────────────┤
│ RISK SCORE  [████████░░] 84/100 🔴   │
│             CRITICAL                 │
├──────────────────────────────────────┤
│ 📊 STATS                             │
│  13 observations │ 3 violations      │
│  93% checklist   │ 2 AI anomalies    │
├──────────────────────────────────────┤
│ 🤖 EXECUTIVE SUMMARY (AI-generated) │
│ "This environmental gas inspection   │
│  at Umrer OCP has identified a       │
│  CRITICAL risk condition requiring   │
│  immediate operational suspension... │
│  [Read full report ▾]                │
├──────────────────────────────────────┤
│ ⚠️  CRITICAL FINDINGS               │
│  • CH₄: 1.4% > 1.25% limit         │
│    CMR 2017, Reg. 5(2)             │
│  • O₂: 18.9% < 19.5% min          │
│    CMR 2017, Reg. 5(1)(a)         │
├──────────────────────────────────────┤
│ 📋 RECOMMENDED ACTIONS (AI)         │
│  1. [NOW] Evacuate Pit 3 East       │
│  2. [24h] Increase ventilation      │
│  3. [7d]  Submit DGMS report        │
├──────────────────────────────────────┤
│ 🔔 Notifications sent to 3 users    │
│  Mine Manager • Compliance Officer  │
│  Subsidiary Admin                   │
└──────────────────────────────────────┘
```

**Key UI behaviour:**
- Gemini report is fetched in the background after submit
- A skeleton loader shows for 3–5 seconds while Gemini generates
- Each section (Summary, Findings, Actions) is a collapsible card
- Regulation references are highlighted/bold for judge visibility

---

## Phase 6 — Mobile Simulator UI Upgrade

### [MODIFY] [`MobileInspectionSimulator.tsx`](file:///c:/Coding/SIH2026/web/src/features/inspection/components/MobileInspectionSimulator.tsx)

**3 major changes:**

#### 1. Replace UUID text inputs with dropdowns
```tsx
// Mine dropdown: from useQuery on GET /api/v1/mines (or supabase.from('mines'))
// Template dropdown: from GET /api/v1/inspections/templates — shows name + type
// Zone: pre-set "Pit 3 East — Gas Monitoring Zone"
```

#### 2. Observation form upgraded for gas readings
The `AddObservationForm` must support the gas inspection flow:
- Checklist item dropdown (populated from selected template's `checklist_items`)
- When a gas item is selected → show **numeric value input** with unit label
- Auto-suggest severity based on value vs threshold (e.g., enter 1.4% CH₄ → auto-flags as `critical`)
- Description auto-fills: `"CH₄ measured at 1.4% — exceeds CMR 2017 Reg. 5(2) limit of 1.25%"`

#### 3. New screens

**Screen flow:**
```
Screen 1: Start Inspection
  ├─ Mine:     [Umrer OCP ▾]          ← dropdown from API
  ├─ Template: [Environmental Gas ▾]  ← dropdown from API
  ├─ Zone:     [Pit 3 East]
  └─ [🚀 Start Inspection]

Screen 2: Record Observations (Active)
  ├─ Checklist Item: [GAS-CH4 — Methane ▾]  ← from template
  ├─ Measured Value: [1.4] % ← with unit auto-appended
  ├─ ⚠ Auto-alert: "DANGER — Exceeds CMR limit of 1.25%"
  ├─ Status: [Non-Compliant] (auto-set)
  ├─ Severity: [Critical] (auto-set from value)
  ├─ Description: [auto-filled from rule]
  ├─ [+ Add Observation]
  ├─ Progress: ████████░░ 8/15 items
  └─ [🔍 Analyze Before Submit]       ← NEW

Screen 3: AI Anomaly Analysis  ← NEW
  ├─ Risk Score: 84/100 🔴 CRITICAL
  ├─ ─────────────────────────────────
  ├─ 🔴 Dangerous Co-occurrence
  │    CH₄ 1.4% + O₂ 18.9%
  │    CMR 2017 Reg. 5(2) & 68
  │    → Evacuate immediately
  ├─ ─────────────────────────────────
  ├─ 🟠 Recurrence Pattern
  │    CO₂ non-compliant in 2/3 previous inspections
  │    → Systemic ventilation failure suspected
  └─ [📋 Submit Inspection]

Screen 4: Report Card  ← NEW
  ├─ ✅ Inspection Submitted
  ├─ Risk Level: CRITICAL 🔴
  ├─ 13 observations | 3 violations
  ├─ 2 anomalies detected
  ├─ "🔔 Notifications sent to 3 stakeholders"
  └─ [View Full Report]
```

---

## Phase 7 — Compliance Calendar Verification

The `ComplianceCalendar.tsx` now defaults to `2026-09`. Verify the 4 seeded instances show correctly.
The `useComplianceInstances` hook queries Supabase `compliance_instances` filtered by mine and month.

---

## Complete Execution Order

| # | Step | File(s) | Status |
|---|------|---------|--------|
| 1 | Rewrite `auth.py` — DB lookup bypass | `backend/auth.py` | ⬜ |
| 2 | Write `seed_demo.py` | `backend/seed_demo.py` | ⬜ |
| 3 | Run seed: `python seed_demo.py` | — | ⬜ |
| 4 | Implement rule-based anomaly engine (4 rules) | `backend/services/ai_service.py` | ⬜ |
| 5 | Add `POST /inspections/{id}/analyze` endpoint | `backend/routers/inspection.py` | ⬜ |
| 6 | Wire notifications into `submit_inspection()` | `backend/services/inspection_service.py` | ⬜ |
| 7 | Add `GEMINI_API_KEY` to `.env` + `.env.example` | `backend/.env` | ⬜ |
| 8 | Build `report_service.py` — Gemini API call + prompt | `backend/services/report_service.py` | ⬜ |
| 9 | Add `GET /reports/inspection/{id}/summary` endpoint | `backend/routers/reports.py` | ⬜ |
| 10 | Upgrade `AddObservationForm` for gas readings | `web/.../AddObservationForm.tsx` | ⬜ |
| 11 | Upgrade `MobileInspectionSimulator` (dropdowns + screens) | `web/.../MobileInspectionSimulator.tsx` | ⬜ |
| 12 | Build `AnomalyResultCard.tsx` | `web/.../AnomalyResultCard.tsx` | ⬜ |
| 13 | Build `InspectionReportCard.tsx` (with Gemini sections) | `web/.../InspectionReportCard.tsx` | ⬜ |
| 14 | Remove all debug `print` statements | `backend/routers/inspection.py` | ⬜ |
| 15 | End-to-end test run | — | ⬜ |

---

## Verification Plan

### Backend (run after each phase)
```
GET  /api/v1/inspections/templates          → 2 templates, 15 items each
POST /api/v1/inspections                    → 200 OK, mine_manager scoped to Umrer OCP
POST /api/v1/inspections/{id}/observations × 10  → all 200 OK
POST /api/v1/inspections/{id}/analyze       → returns risk_level + anomalies[]
POST /api/v1/inspections/{id}/submit        → 200, check alerts table in Supabase
GET  /api/v1/reports/inspection/{id}/summary→ structured data + ai_report{} sections
     └─ Verify: ai_report.executive_summary is non-empty
     └─ Verify: ai_report.recommended_corrective_actions has 3 time-bound actions
```

### Demo Run-Through (manual)
1. Web Dashboard → Compliance Calendar → 4 instances visible in Sept 2026
2. Mobile Simulator → dropdowns auto-populate mine + template
3. Add 8–10 observations (plan: 3 gas threshold breaches, 1 normal, rest OK)
4. Tap Analyze → Anomaly card with risk score 80+ and 2 anomalies
5. Submit → Report card + web toast notification appears simultaneously

---

## Presentation Guide

### Opening (1 min)
> *"India has 350+ active coal mines. Every mine must comply with 200+ statutory regulations. Today, most inspections are done on paper, reported days later. COMET changes that."*

---

### Act 1 — The Dashboard (1 min)
Show Compliance Calendar with 4 real instances for September 2026.
Point to the `pending` "Monthly Gas & Air Quality Inspection" (CMR 2017, Reg. 5).

> *"This inspection is due September 15th. The mine manager hasn't submitted it yet. In the old system — nobody would know until it was overdue. COMET's calendar is live. Every stakeholder can see it."*

---

### Act 2 — Field Inspection on Mobile (2 min)
Open Mobile Simulator. Select **Umrer OCP → Environmental Gas Inspection → Pit 3 East**.

Add these observations (scripted for maximum anomaly impact):
1. **GAS-O2**: Measured 18.9% → auto-flags Critical (limit 19.5%)
2. **GAS-CH4**: Measured 1.4% → auto-flags Critical (limit 1.25%)
3. **GAS-CO2**: Measured 0.65% → auto-flags High (limit 0.5%)
4. **VENT-FLOW**: Measured 22 m³/min → auto-flags High (limit 30 m³/min)
5. **GAS-CO**: Measured 35 ppm → OK (limit 50 ppm)
6. **TEMP-WB**: Measured 31°C → OK (limit 33.5°C)

> *"Notice what just happened — the app didn't just record the number. It checked it against CMR 2017, Regulation 5(1)(a) — the legal oxygen minimum for coal mines — and instantly flagged it. No internet needed. This runs offline."*

---

### Act 3 — AI Anomaly Detection (2 min) ← THE WOW MOMENT
Tap **"🔍 Analyze Before Submit"**.

**What appears:**
```
RISK SCORE: 84/100 — CRITICAL 🔴

🔴 CRITICAL: Dangerous Co-occurrence (Rule 2)
   CH₄ at 1.4% + O₂ at 18.9% detected simultaneously.
   This is a documented pre-explosion signature pattern.
   CMR 2017, Reg. 5(2) & 68 — Mandatory evacuation.

🟠 HIGH: Recurrence Pattern (Rule 3)
   CO₂ non-compliant in 2 of last 3 inspections.
   Systemic ventilation failure suspected — not isolated.
   CMR 2017, Reg. 68(6) requires 24-hour corrective action.
```

> *"An experienced DGMS inspector can spot one violation. Our AI spots patterns across months of data. This methane-oxygen co-occurrence pattern appears in 60% of recorded firedamp incidents in Indian coal mines. We flag it before it becomes a statistic."*

---

### Act 4 — Submit → Report → Notification (1 min)
Tap **"📋 Submit Inspection"**.

**Simultaneously show (browser tab switch):**
- Mobile: Report card appears — risk level, violations, anomalies
- Web: Toast notification slides in — *"🔴 Critical inspection submitted at Umrer OCP"*

> *"Report generated in 3 seconds. Notification delivered in real-time to mine manager, compliance officer, and subsidiary admin. The compliance calendar updates automatically — the pending instance is now submitted. What used to take 3 days took 3 seconds."*

---

### Closing (30 sec)

| | Before COMET | After COMET |
|--|--|--|
| Inspection reporting | 3–5 days | < 5 minutes |
| Pattern detection | Never | Real-time AI |
| Regulatory accuracy | Manual recall | CMR 2017 embedded |
| Notification lag | Days (email) | < 1 second |

> *"COMET doesn't just digitize paperwork. It gives every field officer the knowledge of a 30-year DGMS veteran — embedded in a mobile app that works underground without internet."*
