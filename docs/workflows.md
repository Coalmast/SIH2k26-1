# COMET Platform — System Workflows

**Platform:** Coal Operations Monitoring, Enforcement & Transparency (COMET)  
**Problem Statement:** SIH 2026 — 26024 | Coal India Limited | Ministry of Coal  
**Version:** 2.0 | September 2026

---

## Overview

COMET digitally unifies the entire governance chain between physical mine sites, corporate headquarters, and regulatory bodies. The platform operates across 9 primary workflow chains that together address every requirement of the Ministry of Coal Problem Statement (PS 26024).

All workflows share three cross-cutting capabilities:
- **Offline-first field capture** — WatermelonDB queues data locally; syncs to Supabase on reconnect
- **AI reasoning via Google ADK** — Gemini agents with database tool-calling replace all manual ML pipelines
- **Immutable audit trail** — Every state change writes an append-only audit record; critical documents anchored to blockchain (architecture designed; prototype note applies)

---

## Workflow 1 — Statutory Compliance Task Lifecycle

**Covers PS requirement:** *Digitally track statutory compliance requirements related to safety, environment, production, and labour regulations.*

```
REGULATION LIBRARY SEEDING
  System Admin seeds the regulations table once:
  (Mines Act 1952 / CMR 2017 / MMR 1961 / EP Act 1986 / CLRA 1970 / Factories Act)
  Each regulation → mine_type applicability, periodicity, responsible role, authority
  [Admin can manually create individual tasks as fallback if auto-generation fails]
          │
          ▼
AUTO TASK GENERATION
  On mine onboarding OR new compliance period:
  System cross-references mine_type → applicable regulations
  → compliance_instances created per mine per period
    (daily / weekly / monthly / quarterly / annual)
  Status: PENDING | Assigned to: responsible_role
          │
          ▼
TASK VISIBLE
  Mine Manager dashboard: Compliance Calendar (upcoming, overdue, approved)
  Field Officer mobile: Pending Tasks on Home screen
          │
          ▼
EVIDENCE SUBMISSION (Field Officer or Compliance Officer)
  Upload PDF / photo / manual entry
  → Supabase Storage → Tesseract OCR BackgroundTask triggered
  → confidence ≥ 0.85 → fields auto-applied
  → confidence < 0.85 → human OCR review queue (web side-by-side panel)
  Status: SUBMITTED
          │
          ▼
REVIEW & APPROVAL (Compliance Officer)
  Web dashboard: Compliance Instance Detail
  → [Approve] → Status: APPROVED
      → SHA-256 hash computed
      → Blockchain anchor recorded [architecture designed; not in prototype]
      → Audit record written
  → [Reject with reason] → Status back to IN_PROGRESS
      → Officer notified (push + in-app)
          │
          ▼
BREACH ESCALATION (if due date passes without APPROVED status)
  Status → BREACHED
  Escalation Ladder (FastAPI BackgroundTask via pg_cron every 15 min):
    T+0d   → Mine Manager: push + email alert
    T+3d   → Subsidiary Admin: escalated alert with risk context
    T+7d   → is_regulator_visible = true (DGMS can view in Regulator Portal)
    T+14d  → Regulatory authority system alert
```

**Key Tables:** `regulations`, `compliance_requirements`, `compliance_instances`, `compliance_evidences`, `audit_logs`  
**Triggers:** pg_cron (task generation, escalation check), Supabase Webhook (status change → escalation)

---

## Workflow 2 — Field Inspection → Violation → CAPA → Closure

**Covers PS requirement:** *Enable real-time monitoring of inspections, observations, violations, and corrective actions. Geo-tagged and time-stamped field reporting through mobile applications.*

```
INSPECTION INITIATION (Field Inspector, mobile app)
  StartInspectionScreen:
    - Select inspection type (DGMS Annual / Internal Safety / HEMM / Ventilation / Env)
    - Select checklist template (auto-matched to type)
    - Select zone / area within mine
    - Select shift (A / B / C / General)
    - GPS geo-stamp captured (expo-location)
    - Mine boundary validated (PostGIS ST_Contains check on server at next sync)
  → WatermelonDB: inspection record created instantly
    (sync_status: pending_sync, status: in_progress)
          │
          ▼
CHECKLIST COMPLETION (offline-capable)
  Multi-section form — each checkpoint: [✅ OK] [🔴 Non-Compliant] [🟡 Observation]
  
  Non-Compliant selected → expands:
    - Description (text or voice note → Gemini Audio transcribes on sync)
    - Severity: Minor / Moderate / HIGH / Critical
    - Photos / video (react-native-vision-camera)
    - Statute reference (auto-filled from checklist template)
    - Area / sub-zone
  
  ⚠️ GAS READING SPECIAL PATH (Section 2 — Ventilation & Gas Safety):
    CH4 > 0.75% → STOP WORK amber warning (local, no server needed)
    CH4 > 1.25% → STOP WORK red alert (local, synchronous FCM push to Mine Manager)
    CH4 > 1.50% → EVACUATE:
      → Notifee siren fires IMMEDIATELY on device (offline-safe)
      → Evacuation modal displayed full-screen
      → Sync push queued for server escalation on reconnect
  
  All observation records saved to WatermelonDB instantly (< 50ms write)
  Progress bar updates with each completed checkpoint
          │
          ▼
INSPECTION SUBMISSION
  InspectionSummaryScreen: review all observations + violations
  → Inspector signs off
  → If online: sync push to FastAPI /api/v1/sync/push immediately
  → If offline: WatermelonDB queue; OfflineBanner shows pending count
    → Syncs automatically when connectivity restored (expo-background-task)
          │
          ▼
SERVER PROCESSING (FastAPI Sync Router)
  1. JWT validation → extract mine_id, user scope
  2. Pydantic v2 schema validation per record
  3. PostGIS geo-fence validation (ST_Contains)
     → location_mismatch flag if outside boundary (record NOT rejected)
  4. Insert to Supabase PostgreSQL (inspection, observations, violations)
  5. Supabase Webhook → handle_violation_created() for each violation
  6. Gemini ADK RiskScoringAgent triggered (async)
  7. If voice notes: Gemini Audio API → transcription written back
          │
          ▼
VIOLATION HANDLING
  Per HIGH/CRITICAL violation:
    → Violation record: status = REPORTED
    → Push alert to Safety Officer + Mine Manager
    → Mine Manager dashboard: violation count updates (Supabase Realtime)
    
  Compliance Officer / Mine Manager: Assigns CAPA
    → CorrectiveAction record created (status: ASSIGNED)
    → Assigned officer notified
          │
          ▼
CAPA ESCALATION LADDER
  pg_cron polls every 15 min:
    If status ∈ [assigned, in_progress] AND due_date < today:
    T+1d  → Reminder to assigned officer (push)
    T+3d  → Mine Manager alerted
    T+7d  → is_regulator_visible = true; Subsidiary Head notified
    T+14d → Subsidiary Admin + regulatory authority alert
          │
          ▼
CAPA CLOSURE
  Assignee: uploads evidence (photos / report)
  Status: PENDING_VERIFICATION
  Mine Manager / Compliance Officer: Reviews evidence on web dashboard
  → [Verify & Close] → Status: VERIFIED_CLOSED
  → Audit record written
  → Risk score recalculated (ADK RiskScoringAgent)
  → Violation status → CLOSED
```

**Key Tables:** `inspections`, `observations`, `violations`, `corrective_actions`, `media_attachments`, `escalation_workflow_instances`  
**Triggers:** Supabase Webhook (violation INSERT → escalation), pg_cron (CAPA overdue check)

---

## Workflow 3 — Contractor Onboarding, Monitoring & Trust Score

**Covers PS requirement:** *Contractor management — digital integration of contractor compliance.*

```
ONBOARDING (Contractor Manager, web dashboard)
  Multi-step form:
    Step 1: Basic Info (name, GSTIN, reg number, contact)
    Step 2: Documents upload (CLRA license, ESI, EPF, Insurance, Safety cert)
      Each upload → Supabase Storage → Tesseract OCR BackgroundTask
      OCR extracts: CLRA number, valid_until, issued_by, authority
      → confidence ≥ 0.85 → auto-applied to contractor_documents
      → confidence < 0.85 → OCR review queue
    Step 3: Mine Assignment (mine, work order, worker count, duration)
          │
          ▼
TRUST SCORE COMPUTATION (FastAPI, triggered after each document processed)
  Gemini ADK is NOT used here — deterministic formula:
    40pts = document validity ratio (valid docs / total required docs)
    30pts = safety penalty (1 - violation penalty score)
    20pts = CAPA closure rate (closed CAPAs / total CAPAs)
    10pts = billing anomaly flag (0 = no flag, 1 = flagged)
  trust_score = sum of above (0–100)
  risk_rating = LOW (70–100) / MEDIUM (40–69) / HIGH (0–39)
          │
          ▼
ONGOING MONITORING
  pg_cron daily check on contractor_documents:
    30 days before expiry → Contractor Manager alert (push + email via Resend)
    7 days before expiry  → Mine Manager alert
    1 day before expiry   → CRITICAL alert
    Day of expiry         → document status → EXPIRED
      → Trust score recomputed (drops significantly)
      → ContractorTrustBadge on web turns RED
          │
          ▼
ESCALATION
  trust_score drops below 40 OR ≥ 2 critical violations linked:
    → Mine Manager approves: [Suspend] or [Blacklist]
    → Suspension: no new work orders; existing work can continue
    → Blacklist: system-wide block; alert to all mine managers in subsidiary
    → Audit record written
```

**Key Tables:** `contractors`, `contractor_documents`, `contractor_assignments`, `contract_workers`  
**Triggers:** Supabase Webhook (doc INSERT → OCR), pg_cron (expiry check), Webhook (doc expiry → trust recompute)

---

## Workflow 4 — Environmental Monitoring & Breach Response

**Covers PS requirement:** *Environmental monitoring — real-time operational insights. Automated alerts and escalation mechanisms.*

```
DATA INGESTION (Environmental Officer, mobile app)
  Manual entry via /environment screen:
    - Select monitoring station (CAAQMS-01, CAAQMS-02, etc.)
    - Select parameter (pm10, pm2_5, so2, nox, ph, noise_db, bod, cod)
    - Enter reading value + unit
    - GPS geo-stamp of station
    - Submit → POST /api/v1/environment/readings
          │
          ▼
THRESHOLD CHECK (FastAPI, synchronous — no async delay)
  Compare reading vs prescribed_limit from ec_conditions table
  If threshold_breached = true:
    → threshold_breached flag written to environment_readings
    → Supabase Webhook → handle_env_breach()
          │
          ▼
IMMEDIATE BREACH RESPONSE (synchronous)
  → CRITICAL alert dispatched:
      Environmental Officer + Mine Manager: Notifee push alarm
      Web dashboard: EC Condition card turns RED (Supabase Realtime)
  → Gemini ADK AnomalyDetectionAgent triggered (async):
      Tools called:
        get_env_readings(station_id, 72h)
        get_historical_baseline(station_id, parameter)
        get_ec_condition(mine_id, condition_ref)
      Output: anomaly explanation + 8h forecast + recommended corrective action
  → anomaly_flags record created
          │
          ▼
WEB DASHBOARD UPDATE (real-time via Supabase Realtime)
  EC Conditions Tracker: station pin → RED
  AI Forecast Panel: "PM10 predicted 740 µg/m³ by 3PM. Activate sprinklers by 2PM."
  Parameter Trends chart: red horizontal limit line crossed
          │
          ▼
RECURRENCE CHECK (pg_cron daily)
  Same EC condition breached > 2x in 30 days:
    → breach_recurrence_flag = true
    → SPCB (State Pollution Control Board) notified via Resend email
    → EC Half-Yearly Compliance Report auto-flagged for priority review
    → Mine risk score recomputed
```

**Key Tables:** `monitoring_stations`, `environment_readings`, `ec_conditions`, `anomaly_flags`  
**Triggers:** Supabase Webhook (env_reading INSERT with breach → alert), pg_cron (recurrence check)

---

## Workflow 5 — Production Reporting & Anomaly Detection

**Covers PS requirement:** *Production reporting — shift-wise operational data. AI/analytics to identify operational anomalies.*

```
SHIFT REPORT SUBMISSION (Overman / Field Officer, mobile app)
  OvermanShiftReportScreen:
    - Shift (A / B / C) + Date
    - Coal extracted (MT)
    - Equipment operational (shovels, dumpers, drills count)
    - Workforce count (workers per section)
    - Gas readings (CH4, CO, CO2, O2 per station)
    - Observations / incidents (free text or voice → Gemini Audio)
  Saved to WatermelonDB → sync push
          │
          ▼
SERVER PROCESSING
  production_readings record created
  → Supabase Webhook → handle_production_submitted()
  → Gemini ADK AnomalyDetectionAgent triggered (async):
      Tools called:
        get_production_readings(mine_id, 30d)
        get_historical_baseline(mine_id, shift_type, equipment_count, workforce)
      Gemini compares current shift vs contextual norm
      Output: anomaly_flagged (bool), explanation, severity, recommended action
          │
          ▼
IF ANOMALY DETECTED
  anomaly_flags record created
  Mine Manager dashboard: "Shift C output 22% below norm given current workforce (312)
    and equipment (4 shovels, 18 dumpers)" → [Acknowledge] [Create Note]
  Supabase Realtime: dashboard updates live
          │
          ▼
MONTHLY REPORTING
  CCO Daily Return (Form I) auto-populated from production_readings
  Mine Manager: Review → Digital Sign → Click 'Submit to Authority'
  → Resend emails CCO office with generated PDF
  → Statutory report record: status = SUBMITTED
          │
          ▼
CORPORATE DASHBOARD
  Production vs Target grouped bar (all mines in subsidiary)
  AI clustering: mines consistently underperforming flagged for inspection
```

**Key Tables:** `production_readings`, `anomaly_flags`, `overman_reports`  
**Triggers:** Supabase Webhook (production INSERT → anomaly check)

---

## Workflow 6 — Worker Attendance & Labour Compliance

**Covers PS requirement:** *Worker attendance — geo-fenced attendance integration. Labour compliance tracking.*

```
ATTENDANCE CAPTURE (Field Officer, mobile app)
  AttendanceScreen:
    → QR scan of worker badge (expo-barcode-scanner)
      OR manual entry (worker ID + name)
    → GPS geo-fence verified (must be inside mine boundary)
    → Time-stamped batch saved to WatermelonDB
  → Sync push → attendance_records in Supabase
          │
          ▼
LABOUR COMPLIANCE CHECKS (FastAPI, on each attendance sync)
  Check per worker:
    - Working hours vs statutory limits (Mines Act 1952, Reg 45)
    - Consecutive night shift count (max 3 consecutive shifts)
    - Rest period between shifts (minimum 12h)
    - Safety equipment issuance on record
  
  If violation detected:
    → Safety Officer alerted (push notification)
    → Flag written to worker profile
    → Compliance Officer can view in Labour Compliance report
          │
          ▼
MINE MANAGER VISIBILITY
  Shift-wise headcount summary (Shift A/B/C)
  Absenteeism trend (last 30 days)
  Labour law compliance % per shift
  Fatigue risk flags (workers with consecutive night shifts)
```

**Key Tables:** `attendance_records`, `contract_workers`, `alerts`  
**Triggers:** Sync push → FastAPI attendance router → compliance check

---

## Workflow 7 — Grievance Handling (Multilingual, AI-Powered)

**Covers PS requirement:** *Grievance handling — multilingual conversational interfaces for worker accessibility.*

```
GRIEVANCE FILING
  Available on: Mobile App (Tab 5) + Web Portal chatbot widget

  Option A — Voice Grievance (primary for low-literacy workers):
    Worker records audio in any language
    (Hindi / Bengali / Odia / Marathi / English supported natively by Gemini)
    Audio saved to WatermelonDB queue (offline-safe — processes on next sync)
    → On sync: audio → Supabase Storage → FastAPI
    → Gemini ADK GrievanceAudioAgent (gemini-2.0-flash Audio):
        No DB tools — pure audio analysis
        Returns:
          transcription_original: verbatim in spoken language
          transcription_english: English translation
          category: safety | wages | harassment | environment | facilities | other
          priority: critical | high | medium | low
          summary: 1-sentence English summary
          language_detected: hi | bn | or | mr | en
    → grievance record created automatically

  Option B — Text / Chat:
    Worker types in preferred language OR uses chatbot
    → Gemini ADK WorkerChatbotAgent (gemini-2.0-flash):
        Tool: file_grievance(text, mine_id, worker_id)
        Classifies + creates grievance record
        Responds in worker's language confirming submission
          │
          ▼
ROUTING
  Based on category:
    safety       → Safety Officer
    wages        → HR / Contractor Manager
    harassment   → Mine Manager (confidential flag)
    environment  → Environmental Officer
    facilities   → Mine Manager
  Assigned officer: push + email notification
          │
          ▼
ESCALATION LADDER
  Status: OPEN → UNDER_REVIEW → RESOLVED
    If no action in 48h   → Mine Manager alerted
    If no resolve in 7d   → Subsidiary Admin
    If no resolve in 14d  → Corporate Executive
    [Regulator can view if marked is_regulator_visible]
          │
          ▼
WORKER STATUS CHECK (Chatbot)
  Worker: "मेरी शिकायत का क्या हुआ?"
  → Gemini ADK WorkerChatbotAgent:
      Tool: get_grievance_status(worker_id)
      Tool: get_grievance_details(grievance_id)
      Responds in worker's language with current status + expected timeline
  
  Resolution confirmed:
    → Worker notified (push + chatbot message in their language)
    → Audit record written
    → Resolution stored with outcome
```

**Key Tables:** `grievances`, `alerts`, `audit_logs`  
**Triggers:** Sync push (audio queue), Supabase Webhook (grievance INSERT → routing), pg_cron (escalation check)

---

## Workflow 8 — Statutory Report Generation & Regulatory Submission

**Covers PS requirement:** *Generate automated compliance reports. GIS mapping, OCR-based document digitization, and secure digital audit trails for transparent and paperless governance.*

```
TRIGGER
  Manual: Officer clicks "Generate Report" on web dashboard
  Scheduled: pg_cron fires on regulatory due dates

  Supported report types:
    Form 3  — Annual Safety Return (CMR 2017 Reg 4, annual)
    Form 4-A — Accident Notice (CMR 2017 Reg 79, per accident)
    Form 4-B — Accident Register (CMR 2017 Reg 81, annual)
    Form 4-C — Return to Duty (CMR 2017 Reg 81, per person)
    Monthly Safety Committee Report (CMR 2017 Reg 167)
    EC Half-Yearly Compliance Report (EC Conditions)
    CCO Daily Return Form I (CCO Act 1974, daily)
    CLRA Contractor Register Form XII (CLRA 1970, annual)
          │
          ▼
AI REPORT DRAFTING (FastAPI BackgroundTask)
  Gemini ADK ReportDraftingAgent (gemini-1.5-pro):
    Tools called (as needed per report type):
      get_incident_details(incident_id)
      get_compliance_instances(mine_id, period_start, period_end)
      get_env_readings(mine_id, period_start, period_end)
      get_regulation_text(regulation_ref)  ← reads from regulations table
      get_contractor_register(mine_id)
      get_accident_register(mine_id, year)
      get_person_details(persons_involved)
    Agent generates:
      narrative_sections: { section_name: formal statutory text }
      data_tables: structured data for table rendering
      statutory_citations: exact regulation references
          │
          ▼
PDF RENDERING
  FastAPI:
    1. Jinja2 template + Gemini narrative sections → HTML
    2. WeasyPrint → PDF binary
    3. Upload to Supabase Storage (statutory-reports/{mine_id}/)
    4. SHA-256 hash computed
    5. [Blockchain anchor — architecture designed; not in prototype]
    6. Report record saved: status = DRAFT
          │
          ▼
REVIEW & DIGITAL SIGNING (Mine Manager)
  Web: Reports module → Download draft PDF → Review
  → Click [Digital Sign]
  → Signature recorded (user_id, timestamp, mine_id) in report record
  → Status → SIGNED
          │
          ▼
SUBMISSION TO REGULATORY AUTHORITY
  Mine Manager clicks [Submit to Authority]
  → Resend dispatches email to:
      DGMS (Form 4-A, Form 3, Form 4-B, Form 4-C)
      SPCB (EC Half-Yearly Compliance Report)
      CCO Portal (CCO Daily Return)
      Labour Department (CLRA Form XII)
  → Email: statutory HTML + PDF attachment
  → Status → SUBMITTED
  → Submission timestamp + tx_id recorded
          │
          ▼
REGULATOR VERIFICATION (DGMS Portal)
  Regulator downloads PDF
  Clicks [Verify Integrity]
  → Portal recomputes SHA-256 of downloaded PDF
  → Queries blockchain: verify { tx_id, hash }
  → ✅ "Verified Authentic & Unaltered"
     OR ❌ "Hash Mismatch — Integrity Compromised"
```

**Key Tables:** `statutory_reports`, `report_jobs`, `audit_logs`  
**Triggers:** pg_cron (scheduled generation), Manual action

---

## Workflow 9 — AI Risk Scoring, Anomaly Detection & Predictive Alerts

**Covers PS requirement:** *Use AI/analytics to identify high-risk areas, recurring compliance failures, and operational anomalies. Generate automated alerts.*

```
RISK SCORE TRIGGER
  Every 6 hours: pg_cron → FastAPI background task
  Event-driven (any of the following):
    - violation INSERT (Supabase Webhook)
    - CAPA marked overdue
    - environment_readings with threshold_breached = true
    - incident_report INSERT
          │
          ▼
GEMINI ADK RISK SCORING AGENT (gemini-1.5-pro)
  Tools called autonomously:
    get_violations(mine_id, 90d)
    get_capa_metrics(mine_id)           → avg closure days, overdue count
    get_env_breaches(mine_id, 30d)
    get_production_pressure(mine_id)   → actual / target ratio
    get_contractor_compliance(mine_id) → % with valid docs
    get_incident_history(mine_id, 36m) → fatal accident flag
    get_grievance_backlog(mine_id)     → unresolved > 7 days
    get_dgms_inspection_history(mine_id, 12m)
  
  Agent reasons over all data and returns:
    score: 0–100
    risk_level: low | medium | high | critical
    trend: improving | stable | worsening
    contributing_factors: [{feature, weight, explanation, comparison}]
    recommendations: [string]
          │
          ▼
SCORE STORED → mine_risk_scores table
  If score worsens vs previous snapshot:
    → Push alert to Mine Manager: "Risk score worsened to 74 (was 68)"
      Top 3 contributing factors shown in notification
    → Corporate Dashboard: mine pin colour updates (Supabase Realtime)
          │
          ▼
WEEKLY: RECURRING VIOLATION CLUSTER DETECTION
  Gemini ADK AnomalyDetectionAgent (gemini-2.0-flash):
    Tool: get_violations(mine_id, 18m)
    Agent groups by zone + statute_reference
    Flags patterns:
      ≥ 3 same statute+zone in 18 months → ViolationCluster flagged
      ≥ 5 → systemic_risk = true → alert to Mine Manager + Subsidiary Admin
      Gemini explains the pattern and recommends root-cause investigation
          │
          ▼
CORPORATE DASHBOARD
  Risk heatmap: MapLibre + deck.gl — mines coloured by risk_level
  Risk ranking table: sorted by score descending
  AI Insight Panel: Gemini-generated summary of top risks across subsidiary
  
  Drill-down: Click mine → mine-level risk detail with SHAP-style factor breakdown
```

**Key Tables:** `mine_risk_scores`, `anomaly_flags`, `violation_clusters`  
**ADK Agents:** `RiskScoringAgent`, `AnomalyDetectionAgent`

---

## Cross-Cutting: Notification & Alert System

All workflows share a unified notification architecture:

| Event Type | Transport | Target | Behaviour |
|---|---|---|---|
| Real-time dashboard alert | Supabase Realtime (WebSocket) | Web dashboard | Slide-in toast; badge count |
| Standard mobile push | FCM via expo-notifications | Field app (background) | OS banner; respects silent mode |
| Emergency alarm (CH4 > 1.5%, fatal incident) | FCM high-priority data → Notifee | Field app | Bypasses DND/mute; siren audio; full-screen modal |
| Statutory PDF delivery | Resend API (email) | Regulatory authority inbox | HTML email + PDF attachment |
| Escalation notifications | FCM push + Resend email | Mine Manager / Subsidiary Admin | Stacked: push first, email if unacknowledged |

---

## Cross-Cutting: Offline-First Strategy

| Scenario | Behaviour |
|---|---|
| Field inspection (no network) | WatermelonDB stores all data; OfflineBanner shows pending count |
| CH4 > 1.5% offline | Notifee siren fires immediately (device-local); sync queued |
| Grievance voice offline | Audio saved as WatermelonDB file path; Gemini processes on next sync |
| Attendance offline | Batch saved locally; geo-fence checked on server at sync time |
| Auth expired offline | Biometric re-auth via expo-local-authentication; no network needed |
| Sync on reconnect | expo-background-task triggers WatermelonDB synchronize() automatically |

---

*Version 2.0 | Workflows Reference | SIH 2026*  
*Stack: Google ADK + Gemini API (AI) · FastAPI (compute) · Supabase (data/auth/realtime) · WatermelonDB (offline) · Tesseract 5 (OCR) · Notifee (alarms) · Resend (email)*
