# COMET — All-in-One System & Workflow Diagram

**Platform:** Coal Operations Monitoring, Enforcement & Transparency (COMET)
**Purpose:** Single consolidated view of every client, service, data store, AI agent, and cross-module workflow, and how they connect end-to-end.
**References:** [TECH_STACK.md](TECH_STACK.md) · [backend_spec.md](backend_spec.md) · [frontend_spec.md](frontend_spec.md) · [workflows.md](workflows.md) · [PRD.md](PRD.md) · [Product Brief.md](Product%20Brief.md)

---

## 1. Master System & Data-Flow Diagram

This single diagram shows every client, the edge/gateway layer, Supabase (data/auth/realtime/storage/webhooks/cron), the FastAPI compute layer, every AI agent, every data store, and every notification channel — with the actual direction of data flow between them.

```mermaid
flowchart TB

%% ============ NODES (no category grouping) ============
WEB["Web Dashboard\nReact 19 + Vite + TanStack Router/Query\nMine Mgr · Subsidiary · Corporate · Admin"]
MOB["Mobile Field App\nReact Native + Expo + WatermelonDB\nInspector · Overman · Field Officer · Worker"]
REG["Regulator Portal\nRead-only Vite app\nDGMS · SPCB · Labour Dept"]
BOT["Multilingual Chatbot / Voice\nEmbedded in Web + Mobile"]

CDN["CDN\nCloudflare"]
WAF["WAF / DDoS Protection"]
GW["Supabase API Gateway\nJWT validation · rate limiting"]

AUTH["Supabase Auth (GoTrue)\nEmail/Password · Magic Link · PKCE · MFA\nissues JWT: role, mine_ids, subsidiary_id, permissions"]
PGREST["PostgREST\nDirect CRUD for simple reads/writes, RLS-scoped"]
RLS["Row-Level Security\nEvery table scoped by mine_id / subsidiary_id"]
REALTIME["Supabase Realtime\nWebSocket broadcast on table INSERT/UPDATE"]
STORAGE["Supabase Storage\nocr-uploads · inspection-media · compliance-evidence\nstatutory-reports · contractor-docs"]
WEBHOOKS["Supabase Webhooks\nPostgres triggers → HTTP POST to FastAPI"]
CRON["pg_cron\nScheduled jobs: escalation checks, risk scoring, cache refresh"]
PG[("PostgreSQL 15 + PostGIS\nAll domain tables, enums, indexes")]

AUTH --> RLS
PGREST --> RLS
RLS --> PG
WEBHOOKS -.reads/writes.-> PG
CRON -.triggers.-> PG
REALTIME -.subscribes.-> PG

ROUTERS["Domain Routers\ncompliance · inspection · contractor · environment\nproduction · incident · grievance · mine · user\nnotification · ocr · ai · report · sync · webhook"]
BGTASKS["Background Tasks\nEscalation ladders · SLA timers · PDF jobs · OCR jobs"]
SYNCENGINE["Mobile Sync Engine\n/sync/pull · /sync/push (WatermelonDB protocol)"]
GEOFENCE["PostGIS Geo-fence Validator\nST_Contains per synced record"]
OCRENGINE["Tesseract 5 OCR Pipeline\nimage preprocess → extract → confidence score"]
PDFGEN["WeasyPrint + Jinja2\nStatutory PDF rendering + SHA-256 hash"]
AUDITMW["Audit Middleware\nAppend-only audit_logs on every mutation"]

RISK["RiskScoringAgent\ngemini-1.5-pro\nTools: get_violations, get_capa_metrics,\nget_env_breaches, get_production_pressure,\nget_contractor_compliance, get_incident_history,\nget_grievance_backlog"]
ANOM["AnomalyDetectionAgent\ngemini-2.0-flash\nWeekly cluster/systemic-risk detection\n+ production/env anomaly checks"]
REPORTAI["ReportDraftingAgent\ngemini-1.5-pro\nDrafts statutory narrative sections + citations"]
CHATBOT["WorkerChatbotAgent\ngemini-2.0-flash\nTools: file_grievance, get_grievance_status,\nget_attendance, get_capa_status"]
AUDIOAGENT["GrievanceAudioAgent\ngemini-2.0-flash Audio\nTranscribe + translate + classify voice grievances"]
CLASSIFY["Incident Classifier\ngemini-2.0-flash\nSeverity + category suggestion on incident INSERT"]

REDIS[("Redis 7\nDashboard rollups, risk score cache")]
OPENSEARCH[("OpenSearch\nGrievance & violation full-text search")]

FCM["FCM Push\nexpo-notifications (standard)"]
NOTIFEE["Notifee\nEmergency alarms — DND bypass, siren, full-screen"]
RESEND["Resend API\nStatutory email + PDF delivery"]

DGMS_EXT["DGMS / SPCB / CCO / Labour Dept\nStatutory report recipients"]
NBG["National Blockchain for Governance\nSHA-256 hash anchoring (designed; prototype computes hash only)"]
BHUVAN["ISRO Bhuvan\nSatellite imagery overlay"]

%% ===== CLIENT -> EDGE -> SUPABASE/GATEWAY =====
WEB --> CDN --> WAF --> GW
MOB --> GW
REG --> GW
BOT --> GW
GW --> AUTH
GW --> PGREST
GW --> STORAGE
GW -->|"business logic calls\n/api/v1/*"| ROUTERS

%% ===== Mobile offline sync path =====
MOB <-->|"WatermelonDB local store\noffline-first read/write"| SYNCENGINE
SYNCENGINE --> GEOFENCE --> PG
SYNCENGINE --> AUDITMW

%% ===== Realtime push to web =====
REALTIME -->|"postgres_changes: alerts, violations,\ncompliance_instances"| WEB
REALTIME --> REG

%% ===== Webhooks trigger FastAPI =====
WEBHOOKS -->|"violation INSERT, compliance breach,\nenv breach, incident INSERT, ocr complete,\ndoc expiring, risk worsened"| ROUTERS
CRON -->|"escalation sweep every 15 min\nrisk recompute every 6h\nweekly cluster scan"| BGTASKS

%% ===== FastAPI internal wiring =====
ROUTERS --> BGTASKS
ROUTERS --> OCRENGINE
ROUTERS --> PDFGEN
ROUTERS --> AUDITMW
ROUTERS <--> PG
ROUTERS <--> REDIS
ROUTERS <--> OPENSEARCH
OCRENGINE --> STORAGE
PDFGEN --> STORAGE
BGTASKS --> RISK
BGTASKS --> ANOM
BGTASKS --> REPORTAI
BGTASKS --> CHATBOT
BGTASKS --> AUDIOAGENT
BGTASKS --> CLASSIFY

%% ===== AI agents call back into Postgres via tools =====
RISK -->|"FunctionTool queries"| PG
ANOM -->|"FunctionTool queries"| PG
REPORTAI -->|"FunctionTool queries"| PG
CHATBOT -->|"FunctionTool queries"| PG
RISK --> PG
ANOM --> PG
RISK -.writes.-> PG
ANOM -.writes.-> PG
CLASSIFY -.writes.-> PG
AUDIOAGENT -.writes.-> PG

%% ===== Notification dispatch =====
BGTASKS --> FCM
BGTASKS --> NOTIFEE
BGTASKS --> RESEND
FCM --> MOB
NOTIFEE --> MOB
RESEND --> DGMS_EXT

%% ===== Blockchain + GIS externals =====
PDFGEN -.SHA-256 anchor.-> NBG
ROUTERS -.satellite overlay.-> BHUVAN

%% ===== Regulator read-only =====
REG -->|"read-only, RLS-scoped\nno POST/PATCH/DELETE"| PGREST

classDef client fill:#1e293b,color:#fff,stroke:#0ea5e9;
classDef edge fill:#0f172a,color:#fff,stroke:#64748b;
classDef supabase fill:#064e3b,color:#fff,stroke:#10b981;
classDef fastapi fill:#78350f,color:#fff,stroke:#f59e0b;
classDef ai fill:#4c1d95,color:#fff,stroke:#a78bfa;
classDef data fill:#334155,color:#fff,stroke:#94a3b8;
classDef notify fill:#7f1d1d,color:#fff,stroke:#ef4444;
classDef ext fill:#1e3a8a,color:#fff,stroke:#60a5fa;

class WEB,MOB,REG,BOT client;
class CDN,WAF,GW edge;
class AUTH,PGREST,RLS,REALTIME,STORAGE,WEBHOOKS,CRON,PG supabase;
class ROUTERS,BGTASKS,SYNCENGINE,GEOFENCE,OCRENGINE,PDFGEN,AUDITMW fastapi;
class RISK,ANOM,REPORTAI,CHATBOT,AUDIOAGENT,CLASSIFY ai;
class REDIS,OPENSEARCH data;
class FCM,NOTIFEE,RESEND notify;
class DGMS_EXT,NBG,BHUVAN ext;
```

---

## 2. End-to-End Workflow Sequence (all 9 workflows combined)

This sequence diagram threads together the field-capture → AI → escalation → statutory-submission chain that every workflow in [workflows.md](workflows.md) follows, showing exactly which actor/service touches the data at each step.

```mermaid
sequenceDiagram
    autonumber
    participant FW as Field Worker / Inspector (Mobile)
    participant WMDB as WatermelonDB (local)
    participant SYNC as FastAPI Sync Router
    participant SB as Supabase (Postgres + RLS)
    participant HOOK as Supabase Webhook
    participant BG as FastAPI BackgroundTask
    participant ADK as Gemini ADK Agent(s)
    participant RT as Supabase Realtime
    participant WEBUI as Web Dashboard
    participant NOTIF as Notification Layer (FCM/Notifee/Resend)
    participant OFFICER as Mine Manager / Officer
    participant REGX as Regulator Portal

    Note over FW,WMDB: Inspection / Observation / Incident / Attendance / Env Reading / Shift Report
    FW->>WMDB: Capture geo-tagged, time-stamped record (works fully offline)
    WMDB-->>FW: Instant local confirmation (<50ms)

    Note over FW,SYNC: Connectivity restored (expo-background-task or manual)
    FW->>SYNC: POST /api/v1/sync/push (batch, JWT auth)
    SYNC->>SYNC: Validate Pydantic v2 schema per record
    SYNC->>SYNC: PostGIS ST_Contains geo-fence check (flag, never reject)
    SYNC->>SB: INSERT/UPDATE rows (mine_id scoped, RLS enforced)
    SB-->>SYNC: server_ids + conflicts
    SYNC-->>FW: Sync ack, clear local queue

    SB->>HOOK: Row INSERT/UPDATE fires trigger (violation, breach, incident, doc expiry...)
    HOOK->>BG: POST /internal/webhook (shared-secret header)
    BG->>ADK: Invoke relevant agent (Risk / Anomaly / Classify / Audio / Report)
    ADK->>SB: FunctionTool reads (violations, CAPAs, env, production, contractors, grievances)
    ADK-->>BG: Structured JSON (score, severity, category, cluster, narrative)
    BG->>SB: Persist AI output (mine_risk_scores / anomaly_flags / classification fields)

    SB->>RT: Broadcast postgres_changes on alerts / violations / compliance_instances
    RT-->>WEBUI: Live update — toast, badge count, gauge animation
    BG->>NOTIF: Dispatch by priority (critical→Notifee siren, high→FCM, statutory→Resend email)
    NOTIF-->>FW: Push notification (CAPA assigned, reminder, evacuation alarm)
    NOTIF-->>OFFICER: Push/email escalation

    OFFICER->>WEBUI: Assign CAPA / Approve compliance / Resolve grievance / Verify closure
    WEBUI->>SB: PATCH via PostgREST or FastAPI business endpoint
    SB->>HOOK: Status-change trigger (e.g. CAPA verified_closed)
    HOOK->>BG: Recompute risk score, close escalation timer
    BG->>SB: Update audit_logs (append-only, immutable)

    Note over BG,REGX: If overdue thresholds breached (T+7d / T+14d)
    BG->>SB: Set is_regulator_visible = true
    RT-->>REGX: Regulator sees escalated item in read-only portal

    Note over OFFICER,BG: Statutory Report Cycle
    OFFICER->>WEBUI: Click "Generate Report" (Form 3 / 4-A / EC report / CCO Return)
    WEBUI->>BG: POST /reports/generate
    BG->>ADK: ReportDraftingAgent gathers data + drafts narrative + citations
    BG->>BG: Jinja2 → HTML → WeasyPrint → PDF + SHA-256 hash
    BG->>SB: Store report record (status: DRAFT) in Supabase Storage
    OFFICER->>WEBUI: Digital Sign → Submit
    BG->>NOTIF: Resend email with PDF to DGMS/SPCB/CCO/Labour Dept
    REGX->>BG: "Verify Integrity" → recompute hash → compare to stored/anchored hash
    BG-->>REGX: Verified authentic / tamper mismatch
```

---

## 3. Module-to-Table-to-Agent Traceability Map

Quick lookup of which module talks to which Supabase table(s) and which AI agent (if any) reacts to it — mirrors the router catalog in [backend_spec.md](backend_spec.md#3-service-catalog-fastapi-routers).

```mermaid
flowchart LR
    subgraph MODULES["Frontend Modules"]
        M1[Compliance]
        M2[Inspection & Violation]
        M3[Contractor]
        M4[Environment]
        M5[Production]
        M6[Incident]
        M7[Attendance]
        M8[Grievance]
        M9[OCR]
        M10[Reports]
        M11[AI Analytics]
        M12[GIS Map]
        M13[Alerts]
    end

    subgraph TABLES["Core Supabase Tables"]
        T1[(compliance_instances\ncompliance_evidences)]
        T2[(inspections\nobservations\nviolations\ncorrective_actions)]
        T3[(contractors\ncontractor_documents\ncontract_workers)]
        T4[(monitoring_stations\nenvironment_readings)]
        T5[(production_readings)]
        T6[(incident_reports)]
        T7[(attendance_records)]
        T8[(grievances)]
        T9[(document_uploads\nocr_extraction_results)]
        T10[(statutory_reports)]
        T11[(mine_risk_scores\nanomaly_flags)]
        T12[(mines: boundary_geojson)]
        T13[(alerts)]
    end

    subgraph AGENTS["AI Agents (reactive)"]
        A1[RiskScoringAgent]
        A2[AnomalyDetectionAgent]
        A3[ReportDraftingAgent]
        A4[WorkerChatbotAgent]
        A5[GrievanceAudioAgent]
        A6[Incident Classifier]
    end

    M1 --> T1 --> A1
    M2 --> T2 --> A1
    T2 --> A2
    M3 --> T3 --> A1
    M4 --> T4 --> A2
    M5 --> T5 --> A2
    M6 --> T6 --> A6
    M7 --> T7
    M8 --> T8 --> A4
    T8 --> A5
    M9 --> T9
    M10 --> T10 --> A3
    M11 --> T11
    A1 --> T11
    A2 --> T11
    M12 --> T12
    M13 --> T13
    T11 --> T13
```

---

## 4. Web Dashboard — Navigation, Layout & Role-Gated UX Map

How the shell, routing, and role-based visibility actually wire together on the web — from [frontend_spec.md](frontend_spec.md#33-layout-shell) and [frontend_spec.md](frontend_spec.md#5-web-dashboard--all-pages--ux-flows). Every leaf route is a code-split, suspense-boundaried page rendered inside `MainContent`.

```mermaid
flowchart LR
    LOGIN["/login\nEmail/Password · Magic Link\nRole-based redirect on success"]
    LOGIN --> SHELL

    SHELL["AppShell"]
    TOPBAR["TopBar\nMineSelector/SubsidiarySelector · RealtimeAlertBell\nLanguageSwitcher (EN/HI/BN/OR/MR) · UserMenu"]
    SIDEBAR["Sidebar (role-filtered via usePermission)"]
    MAIN["MainContent\ncode-split · route-rendered · Suspense"]
    SHELL --> TOPBAR
    SHELL --> SIDEBAR
    SHELL --> MAIN

    SIDEBAR --> R1["/dashboard\nMine Manager view"]
    SIDEBAR --> R2["/dashboard/corporate\n/dashboard/subsidiary/:id"]
    SIDEBAR --> R3["/compliance\n/compliance/:mineId/:instanceId"]
    SIDEBAR --> R4["/inspections\n/violations\n/corrective-actions/:id"]
    SIDEBAR --> R5["/contractors\n/contractors/:id/workers"]
    SIDEBAR --> R6["/environment/:mineId"]
    SIDEBAR --> R7["/production/:mineId"]
    SIDEBAR --> R8["/incidents\n/incidents/:id/forms"]
    SIDEBAR --> R9["/ocr/upload\n/ocr/queue\n/ocr/review/:id"]
    SIDEBAR --> R10["/map/:mineId"]
    SIDEBAR --> R11["/alerts"]
    SIDEBAR --> R12["/grievances/:id"]
    SIDEBAR --> R13["/ai-analytics/:mineId"]
    SIDEBAR --> R14["/reports"]
    SIDEBAR --> R15["/admin/*\nmines · users · regulations\nchecklist-builder · env-stations"]

    R1 --> MAIN
    R2 --> MAIN
    R3 --> MAIN
    R4 --> MAIN
    R5 --> MAIN
    R6 --> MAIN
    R7 --> MAIN
    R8 --> MAIN
    R9 --> MAIN
    R10 --> MAIN
    R11 --> MAIN
    R12 --> MAIN
    R13 --> MAIN
    R14 --> MAIN
    R15 --> MAIN

    ROLE["JWT claims: role, mine_ids,\nsubsidiary_id, permissions[]"]
    ROLE -.gates visibility of.-> SIDEBAR
    ROLE -.gates action buttons.-> MAIN

    REGPORT["Regulator Portal (separate app)\n/compliance /inspections /environment\n/incidents /reports — zero write access"]
    LOGIN -.regulator role.-> REGPORT

    TOPBAR -.live badge count.-> RTFEED["Supabase Realtime\nalerts:mine_id=eq.{mineId}"]
    RTFEED --> R11
```

**UX conventions applied across every page:** skeleton loaders while parallel Supabase queries resolve → optimistic UI on mutations → toast + colour-flash on realtime insert → slide-over detail panels instead of full navigation for record drill-down → disabled buttons (not hidden) when `usePermission()` fails, with tooltip explaining the missing permission.

---

## 5. Web Dashboard — Module User Flows & Stakeholder Interactions

Exactly how each stakeholder actually moves through the web modules — which page they land on first, what they click, and what changes on screen as a result. Page IDs (R1–R15) match the route map in section 4. Derived from the per-page UX flows in [frontend_spec.md](frontend_spec.md#5-web-dashboard--all-pages--ux-flows).

```mermaid
flowchart TB
    subgraph MM["Mine Manager"]
        MM1["/dashboard (R1)\nSees Compliance/Violations/Contractor/Production KPI cards\n+ Compliance Calendar + Live Alerts feed"]
        MM1 -->|"clicks Violations KPI"| MM2["/violations (R4)\nSorted list, filter by severity"]
        MM2 -->|"opens a violation"| MM3["Violation Detail\nAssigns CAPA: officer + due date"]
        MM3 -->|"reviews evidence"| MM4["/compliance/:mineId/:instanceId (R3)\nApprove / Request Revision / Reject"]
        MM4 -->|"realtime push"| MM5["/alerts (R11)\nToast slides in on new critical alert"]
        MM5 -->|"month-end"| MM6["/reports (R14)\nAuto-populate → Digital Sign → Submit"]
    end

    subgraph SO["Safety Officer"]
        SO1["/inspections (R4)\nFilters mine/type/date/status"]
        SO1 -->|"opens inspection"| SO2["Inspection Detail\nReviews 3 violations / 7 OK / 2 observations"]
        SO2 -->|"flags high severity"| SO3["Assign CAPA panel\nsets assignee + T+7d default due date"]
        SO3 -->|"tracks progress"| SO4["/corrective-actions/:id\nVerify & Close once evidence uploaded"]
    end

    subgraph EO["Environmental Officer"]
        EO1["/environment/:mineId (R6)\nEC Conditions Tracker + MapLibre station pins"]
        EO1 -->|"adds manual reading"| EO2["Reading Form\nprescribed_limit compared instantly,\nstation pin flips red if threshold_breached"]
        EO2 -->|"AI panel updates"| EO3["AI Forecast Panel\nAcknowledges anomaly, creates investigation note"]
    end

    subgraph CM["Contractor Manager"]
        CM1["/contractors (R5)\nFilter by status / trust_score_range"]
        CM1 -->|"opens profile"| CM2["Contractor Profile\nUploads document → Supabase Storage → OCR"]
        CM2 -->|"reviews breakdown"| CM3["AI Trust Score panel\nSuspend / Blacklist button if risk_rating = HIGH"]
    end

    subgraph CO["Compliance Officer"]
        CO1["/compliance (R3)\nKanban: Pending / In Progress / Submitted / Approved"]
        CO1 -->|"low-confidence OCR"| CO2["/ocr/review/:itemId (R9)\nSide-by-side scan vs extracted fields, inline correction"]
        CO2 -->|"approves"| CO3["Instance status → approved\nAudit record + SHA-256 hash written"]
    end

    subgraph CE["Corporate Exec / Subsidiary Admin"]
        CE1["/dashboard/corporate (R2)\nMine risk heatmap + ranking + AI insight panel"]
        CE1 -->|"clicks underperforming mine"| CE2["/ai-analytics/:mineId (R13)\nContributing factors + category radar chart"]
        CE2 -->|"exports"| CE3["Download PDF compliance heatmap\n(shared with board / Ministry)"]
    end

    subgraph RG["Regulator (DGMS / SPCB)"]
        RG1["Regulator Portal /compliance\nRead-only, jurisdiction-scoped mine table"]
        RG1 -->|"audits trail"| RG2["/incidents\nForm 4-A/4-B records, view only"]
        RG2 -->|"checks authenticity"| RG3["/reports → Verify Integrity\nRecomputes SHA-256, compares to stored hash"]
    end

    subgraph SA["System Admin"]
        SA1["/admin/mines (R15)\nCreates mine, draws geo-fence polygon on map"]
        SA1 -->|"next"| SA2["/admin/users\nCreates user, assigns role_name_enum + mine scope"]
        SA2 -->|"next"| SA3["/admin/checklist-builder\nDrag-drop inspection checklist template items"]
    end

    subgraph GR["Grievance & Chatbot (any authenticated worker-facing widget)"]
        GR1["Chatbot widget (bottom-right, all pages)\nWorker types/asks in preferred language"]
        GR1 -->|"WorkerChatbotAgent responds"| GR2["Grievance status / new grievance filed\nconfirmation shown inline in chat"]
    end

    MM4 -.same instance, different actor.-> CO3
    SO3 -.same CAPA record.-> SO4
    CO2 -.same OCR item.-> CM2
```

**Per-stakeholder UX pattern (consistent across every module):**

| Stakeholder | First screen after login | Primary interaction | Resulting UI feedback |
|---|---|---|---|
| Mine Manager | `/dashboard` | Approve/reject compliance, assign CAPA, monitor alerts | KPI cards animate on change; realtime toast; gauge re-renders |
| Safety Officer | `/inspections` | Log observations → flag violations → assign CAPA | Severity chip colour-codes instantly; timeline step advances |
| Environmental Officer | `/environment/:mineId` | Enter readings, watch breach status | Station pin flips colour live; AI forecast panel updates |
| Contractor Manager | `/contractors` | Upload docs, monitor trust score | Trust badge recolors; expiry countdown gradient bar |
| Compliance Officer | `/compliance` | Review evidence, correct OCR, approve/reject | Kanban card moves column; audit hash shown on approve |
| Corporate Executive | `/dashboard/corporate` | Read-only oversight, drill into risk | Map pin colour + ranking table re-sort on new risk score |
| Regulator | Regulator Portal `/compliance` | Read-only audit, verify integrity | Green "Verified" checkmark animation / red mismatch banner |
| System Admin | `/admin/mines` | Configure mines, users, templates | Form wizard step indicator; success toast on save |
| Worker (chatbot) | Chat widget (any page) | File/check grievance in own language | Inline chat bubble response, no page navigation |

**Cross-cutting UX rule:** every stakeholder's action on one page is visible to every other relevant stakeholder within seconds via Supabase Realtime — a CAPA the Safety Officer assigns appears on the Mine Manager's `/dashboard` KPI card and the Corporate Executive's risk ranking without either of them refreshing.

---

## 6. Mobile Field App — Screen Flow & Interaction States


Mirrors [frontend_spec.md](frontend_spec.md#6-mobile-field-app--screens--flows) navigation tree, with the offline banner and sync state as a persistent cross-cutting UX layer rather than a separate screen.

```mermaid
flowchart TB
    SPLASH["Cold Start"]
    SPLASH --> SESSIONCHECK{"expo-secure-store\nsession found?"}
    SESSIONCHECK -->|no| AUTHLOGIN["LoginScreen\nEmail/Password or Magic Link"]
    SESSIONCHECK -->|yes, online| TABS
    SESSIONCHECK -->|yes, offline| BIOMETRIC["BiometricReAuthScreen\nexpo-local-authentication\n(no network needed)"]
    BIOMETRIC --> TABS
    AUTHLOGIN --> TABS

    TABS["Bottom Tab Bar (MainTabs)"]
    TABS --> HOME["Home\nPending tasks · Quick actions · Sync summary"]
    TABS --> INSPECT["Inspect stack"]
    TABS --> REPORT["Report stack"]
    TABS --> ATTEND["Attendance\nQR scan / manual + geo-fence"]
    TABS --> PROFILE["Profile\nSyncStatusScreen + Settings"]

    INSPECT --> I1["InspectionListScreen"]
    I1 --> I2["StartInspectionScreen\ntype · checklist · zone · shift · GPS stamp"]
    I2 --> I3["InspectionFormScreen\nchecklist items: OK / Non-Compliant / Observation\nphoto · voice note · severity"]
    I3 --> I4["InspectionSummaryScreen\nreview → sign off → submit"]

    REPORT --> P1["SafetyObservationScreen (STOP Card)\ntarget: under 60 seconds"]
    REPORT --> P2["IncidentReportScreen\ntype → description (voice) → persons → media"]
    REPORT --> P3["OvermanShiftReportScreen\nmanpower · gas readings · handover notes"]

    subgraph CROSSCUT["Persistent cross-cutting UX layer"]
        BANNER["OfflineBanner (top of every screen)\n🟢 synced · 🟡 N queued · 🔴 offline, N saved"]
        WMDB["WatermelonDB write on every form save\n< 50ms local confirmation, optimistic UI"]
        BGSYNC["expo-background-task\nauto-sync on connectivity resume"]
        PUSH["Push behaviour by priority\ncritical → Notifee full-screen + siren\nhigh/medium → FCM banner + badge\ninfo → in-app toast only"]
    end

    HOME -.-> BANNER
    INSPECT -.-> BANNER
    REPORT -.-> BANNER
    ATTEND -.-> BANNER
    I3 --> WMDB
    P1 --> WMDB
    P2 --> WMDB
    P3 --> WMDB
    ATTEND --> WMDB
    WMDB --> BGSYNC
    BGSYNC --> BANNER
    PUSH -.notifies while in any screen.-> HOME
```

**Critical UX exception path:** gas reading `CH4 > 1.5%` inside `InspectionFormScreen`/`OvermanShiftReportScreen` bypasses the normal save flow entirely — Notifee fires a full-screen, un-dismissable evacuation alert **on-device, offline-safe**, before the sync queue is ever touched.

---

## 7. Frontend State & Data-Binding Architecture (UI ⇄ Store ⇄ Backend)

How a UI component is actually wired to its data source, using the Compliance module as the representative example (identical pattern for every other feature folder per [frontend_spec.md](frontend_spec.md#2-monorepo--project-structure)).

```mermaid
flowchart LR
    COMP1["ComplianceInstanceCard.tsx\n(UI component)"]
    HOOK1["useComplianceInstances()\nTanStack Query hook"]
    SBCLIENT["supabase.from('compliance_instances')\n.select() — PostgREST"]
    PGDB[("Supabase Postgres\nRLS-scoped by mine_id")]

    COMP1 -->|"renders from"| HOOK1
    HOOK1 -->|"queryFn"| SBCLIENT
    SBCLIENT --> PGDB
    PGDB -->|"cached, stale-while-revalidate"| HOOK1 --> COMP1

    FORM1["SubmitEvidenceForm.tsx\nReact Hook Form"]
    ZOD["Zod schema\n(packages/shared-schemas)"]
    MUT1["useSubmitEvidence()\nTanStack mutation"]
    APIFETCH["apiFetch() → FastAPI\n/compliance/instances/:id/submit"]
    STORAGE2["Supabase Storage upload\n(evidence file)"]
    OCRJOB["FastAPI OCR BackgroundTask\n(Tesseract 5)"]

    FORM1 -->|"validates via"| ZOD --> MUT1 --> APIFETCH
    APIFETCH --> STORAGE2
    APIFETCH --> OCRJOB
    MUT1 -->|"onSuccess: invalidateQueries"| HOOK1

    RTHOOK["useRealtimeAlerts(mineId)\nSupabase Realtime channel"]
    ALERTSTORE["alertStore (Zustand)\nlive feed entries + unread count"]
    FEED["RealtimeAlertFeed.tsx / TopBar bell badge"]
    PGDB -.INSERT event.-> RTHOOK --> ALERTSTORE --> FEED

    AUTHSTORE["authStore (Zustand)\nsession, role, permissions, active mine_id"]
    PERMHOOK["usePermission(resource, action)"]
    APPROVEBTN["ApproveButton.tsx\nconditionally rendered/disabled"]
    AUTHSTORE --> PERMHOOK --> APPROVEBTN

    UISTORE["uiStore (Zustand)\nsidebar state, filters, modal state, selected mine"]
    MINESELECT["MineSelector.tsx (TopBar)"]
    MINESELECT --> UISTORE -->|"scopes all queries"| HOOK1

    classDef ui fill:#0c4a6e,color:#fff,stroke:#38bdf8;
    classDef store fill:#581c87,color:#fff,stroke:#c084fc;
    classDef net fill:#134e4a,color:#fff,stroke:#2dd4bf;
    class COMP1,FORM1,FEED,APPROVEBTN,MINESELECT ui;
    class HOOK1,MUT1,RTHOOK,ALERTSTORE,AUTHSTORE,PERMHOOK,UISTORE store;
    class SBCLIENT,PGDB,APIFETCH,STORAGE2,OCRJOB,ZOD net;
```

**Same pattern, mobile side:** `InspectionFormScreen` writes directly to a WatermelonDB `Model` (no TanStack mutation needed offline) → reactive WatermelonDB observers re-render the list instantly → `syncEngine.ts` pushes the diff to FastAPI only when connectivity allows, then TanStack Query is used solely for read-only online lookups (checklist templates, user directory).

---

## 8. Key UX Journey — Field Inspection to Resolved Violation (UI State Machine)

The literal sequence of screen/UI states a user sees, from the moment an inspector opens the app to the moment a Mine Manager sees the violation close — annotated with the UX affordance shown at each state.

```mermaid
stateDiagram-v2
    [*] --> HomeScreen: App opens, OfflineBanner shows current sync state

    HomeScreen --> StartInspection: Tap "Start Inspection"
    StartInspection --> ChecklistForm: GPS stamp captured, boundary check icon shown

    ChecklistForm --> ChecklistForm: Tap OK/Non-Compliant/Observation per item\n(instant local save, progress bar animates)
    ChecklistForm --> ViolationSubforms: "Non-Compliant" selected\n(severity chips, camera, voice-note mic expand inline)
    ViolationSubforms --> ChecklistForm: Back to checklist, item now shows red flag icon

    ChecklistForm --> SummaryReview: All checkpoints done → progress bar full
    SummaryReview --> SubmittingState: Tap "Digital Sign & Submit"

    state SubmittingState {
        [*] --> LocalSaveInstant
        LocalSaveInstant --> QueuedOffline: no connectivity\n(OfflineBanner: "🔴 3 records queued")
        LocalSaveInstant --> SyncingOnline: connectivity present\n(spinner on Submit button)
        QueuedOffline --> SyncingOnline: expo-background-task resumes on reconnect
        SyncingOnline --> [*]: server_ids returned, queue cleared
    }
    SubmittingState --> HomeScreen: Toast "Inspection synced ✅"

    HomeScreen --> [*]

    state "Web Dashboard (Mine Manager, concurrent)" as WebSide {
        [*] --> RealtimeToast: Supabase Realtime pushes violation INSERT\n(slide-down toast + red badge increment)
        RealtimeToast --> ViolationDetail: Manager clicks toast / sidebar
        ViolationDetail --> AssignCAPA: Fill assignee + due date, click "Assign CAPA"
        AssignCAPA --> EscalationWatch: CAPAStatusBadge shows "Assigned" (amber)
        EscalationWatch --> EscalationWatch: T+1d/T+3d/T+7d badges auto-update via pg_cron + Realtime, no refresh needed
        EscalationWatch --> EvidenceReview: Assignee uploads completion evidence\n(MediaGallery lightbox appears)
        EvidenceReview --> ClosedState: Manager clicks "Verify & Close"\n(badge turns green, timeline step completes)
        ClosedState --> [*]
    }

    SubmittingState --> RealtimeToast: cross-flow trigger (violation created on sync)
```

**UX principle demonstrated:** the inspector's mobile flow and the manager's web flow are two independent state machines connected only by backend events (sync push → webhook → Realtime) — neither UI ever polls the other; every cross-flow update arrives as a push (toast, badge, banner) so both users always see current state without manual refresh.

---

## 9. Notes on Fidelity to Source Docs

- Architecture and service names match [backend_spec.md](backend_spec.md) sections 1–3 and [TECH_STACK.md](TECH_STACK.md).
- Sequence diagram consolidates the nine chains in [workflows.md](workflows.md) (compliance lifecycle, inspection→CAPA, contractor trust score, environment breach, production anomaly, attendance, grievance, statutory reports, AI risk scoring) into one representative path — each workflow differs only in which table/agent is touched, per the traceability map in section 3.
- Blockchain anchoring is drawn as a dotted/prototype-flagged link per the explicit prototype note in [backend_spec.md](backend_spec.md#162-blockchain-hash-anchoring) and [PRD.md](PRD.md#21-compliance--audit-trail-blockchain).
- SMS channel intentionally omitted from notifications per [frontend_spec.md](frontend_spec.md#513-alerts--notification-center) ("not used — emergency alerts handled by Notifee").
- Sections 4–8 (navigation map, web stakeholder flows, mobile screen flow, state/data-binding, UX journey state machine) are derived from [frontend_spec.md](frontend_spec.md) sections 3, 4, 5, 6, 7, 8, 9 — page routes, component names, hooks, and store names are taken verbatim from that spec.
