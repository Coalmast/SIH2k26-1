# Backend Specification
## Service Architecture, APIs, Data Layer & AI Pipeline

**Platform:** Coal Operations Monitoring, Enforcement & Transparency (COMET)
**Problem:** SIH 2026 — 26024 | Coal India Limited | Ministry of Coal
**References:** [TECH_STACK.md](file:///c:/Coding/SIH2026/docs/TECH_STACK.md) · [workflows.md](file:///c:/Coding/SIH2026/docs/workflows.md) · [PRD.md](file:///c:/Coding/SIH2026/docs/PRD.md)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Service Catalog (FastAPI Routers)](#3-service-catalog-fastapi-routers)
4. [API Design — REST Endpoints](#4-api-design--rest-endpoints)
5. [Mobile Sync Protocol](#5-mobile-sync-protocol)
6. [Event-Driven Architecture (Supabase Webhooks)](#6-event-driven-architecture-supabase-webhooks)
7. [Database Architecture (Supabase PostgreSQL)](#7-database-architecture-supabase-postgresql)
8. [OCR Ingestion Pipeline](#8-ocr-ingestion-pipeline)
9. [AI / Analytics Engine](#9-ai--analytics-engine)
10. [Notification & Alert System](#10-notification--alert-system)
11. [Authentication & RBAC (Supabase Auth)](#11-authentication--rbac-supabase-auth)
12. [Multi-Tenancy Strategy](#12-multi-tenancy-strategy)
13. [Media Storage (Supabase Storage)](#13-media-storage-supabase-storage)
14. [GIS & Spatial Services](#14-gis--spatial-services)
15. [Report Generation Service](#15-report-generation-service)
16. [Audit Trail & Blockchain Anchoring](#16-audit-trail--blockchain-anchoring)
17. [DevOps & Infrastructure](#17-devops--infrastructure)
18. [Security Architecture](#18-security-architecture)
19. [Performance Targets & SLOs](#19-performance-targets--slos)

---

## 1. Architecture Overview

```
                        INTERNET / INTRANET
                                |
              +-----------------+-----------------+
              |                                   |
    +------------------+               +-------------------+
    |  Web Dashboard   |               | Mobile Field App  |
    |  React 19/Vite   |               | React Native      |
    +------------------+               +-------------------+
              |                                   |
              +-----------------+-----------------+
                                |
                   +------------+------------+
                   |     Supabase API        |
                   |   (PostgREST + Auth)    |
                   |   - JWT validation      |
                   |   - RLS enforcement     |
                   |   - Rate limiting       |
                   +------------+------------+
                                |
              +-----------------+-----------------+
              |                                   |
   +---------------------+            +--------------------+
   | FastAPI Worker      |            | Supabase Realtime  |
   | (Python 3.12)       |            | (WebSocket / SSE   |
   | - OCR pipeline      |            |  alert fan-out)    |
   | - AI risk engine    |            +--------------------+
   | - PDF generation    |
   | - Escalation tasks  |
   | - Sync endpoints    |
   +---------------------+
              |
   +----------+---------------------------+
   |          |                           |
+------+  +------------------+  +------------------+
|  PG  |  | Supabase         |  | Redis Cache      |
| +    |  | Storage          |  | (Dashboard       |
| Post |  | (Photos, PDF,    |  |  rollup cache)   |
| GIS  |  |  OCR scans)      |  +------------------+
+------+  +------------------+
```

### Architecture Style

- **Primary data layer:** Supabase (PostgreSQL 15+ with PostGIS, Auth/GoTrue, Storage, Realtime, Webhooks). Standard CRUD is served directly via PostgREST — no intermediary service needed.
- **Backend compute layer:** Python 3.12 + FastAPI. Acts as the "worker" layer for AI inference, OCR, PDF generation, escalation scheduling, and the WatermelonDB sync protocol. FastAPI is a modular monolith structured as domain-level `APIRouter` modules.
- **Async events:** Supabase Webhooks call FastAPI endpoints on DB mutations (e.g., `compliance_instances` status change → escalation handler).
- **Real-time push:** Supabase Realtime (WebSocket channels) delivers live alerts to web dashboards without polling.
- **Offline sync:** Dedicated `/sync/pull` and `/sync/push` FastAPI endpoints implement the WatermelonDB sync protocol for the mobile field app.
- **Tenant isolation:** Row-Level Security (RLS) enforced natively in Supabase PostgreSQL on every operational table, scoped by `mine_id`.

---

## 2. Technology Stack

| Layer | Choice | Version | Purpose |
|-------|--------|---------|----|
| **Backend Framework** | FastAPI | 0.115+ | Async REST API, auto OpenAPI, native Python |
| **Language** | Python | 3.12 | Backend compute, AI, OCR, PDF |
| **Data Validation** | Pydantic v2 | 2.x | Strict schemas mirroring frontend Zod schemas |
| **Database ORM** | SQLAlchemy 2.0 (Async) | 2.x | Async DB access; GeoAlchemy2 for PostGIS |
| **Primary Database** | Supabase PostgreSQL + PostGIS | 15+ | Relational + spatial data, time-series readings |
| **Auth** | Supabase Auth / GoTrue | — | OIDC/OAuth2, Magic Links, PKCE for mobile |
| **Storage** | Supabase Storage | — | S3-compatible: photos, PDFs, OCR scans |
| **Real-time** | Supabase Realtime | — | WebSocket channels for live dashboard alerts |
| **Event Bus** | Supabase Webhooks | — | Postgres triggers to FastAPI HTTP handlers |
| **Background Jobs** | FastAPI Background Tasks | — | Escalation ladders, SLA timers, PDF generation |
| **Cache** | Redis | 7.x | Corporate dashboard rollup cache (heavy queries) |
| **Search** | OpenSearch | 2.x | Full-text search on grievances & inspection narratives |
| **AI Risk Engine** | XGBoost + scikit-learn | — | Tabular risk score computation |
| **Anomaly Detection** | PyTorch / Facebook Prophet | — | Time-series production & environmental forecasting |
| **OCR** | Tesseract 5 | — | Legacy scanned form digitization |
| **PDF Generation** | WeasyPrint / ReportLab | — | Statutory document rendering (pure Python) |
| **Containerisation** | Docker | — | FastAPI worker services |
| **Orchestration** | Kubernetes (K8s) + Helm | — | Scalable backend deployments |
| **CI/CD** | GitHub Actions | — | Automated test, lint, build, deploy |
| **Observability** | OpenTelemetry + Prometheus/Grafana + Loki | — | Tracing, metrics, logs |

> **What this stack replaces from older drafts:**
> - ~~NestJS~~ -> FastAPI (Python)
> - ~~Keycloak~~ -> Supabase Auth
> - ~~Kafka~~ -> Supabase Webhooks (Postgres triggers)
> - ~~MinIO~~ -> Supabase Storage
> - ~~BullMQ~~ -> FastAPI Background Tasks
> - ~~Apollo Federation / GraphQL gateway~~ -> PostgREST + Redis-cached materialized views
> - ~~Prisma~~ -> SQLAlchemy 2.0 Async

---

## 3. Service Catalog (FastAPI Routers)

All domain logic that cannot be served directly by PostgREST lives in FastAPI as an `APIRouter`. Each router maps to a domain module.

| Router Module | Path Prefix | Responsibility |
|---------------|-------------|----------------|
| `compliance` | `/api/v1/compliance` | Instance lifecycle, evidence, approval workflow, health score |
| `inspection` | `/api/v1/inspections` | Scheduling, checklists, observations, CAPA |
| `contractor` | `/api/v1/contractors` | Onboarding, documents (OCR trigger), trust score |
| `environment` | `/api/v1/environment` | EC condition tracking, sensor readings, breach detection |
| `production` | `/api/v1/production` | Shift production logging, anomaly trigger |
| `incident` | `/api/v1/incidents` | Incident/near-miss reporting, Form 4-A/4-B/4-C |
| `grievance` | `/api/v1/grievances` | Intake, NLP priority scoring, resolution SLA |
| `mine` | `/api/v1/mines` | Mine master data, geo-fence, EC metadata |
| `user` | `/api/v1/users` | User accounts, role assignments |
| `notification` | `/api/v1/notifications` | Alert creation, Supabase Realtime dispatch |
| `ocr` | `/api/v1/ocr` | Document upload, Tesseract extraction, review queue |
| `ai` | `/api/v1/ai` | Risk scoring, anomaly detection, incident classification |
| `report` | `/api/v1/reports` | Statutory PDF generation, digital signing |
| `sync` | `/api/v1/sync` | WatermelonDB pull/push protocol, conflict resolution |
| `webhook` | `/internal/webhook` | Supabase Webhook receiver (internal, not public) |

### Infrastructure Services

| Service | Tool | Purpose |
|---------|------|---------|
| Auth Provider | Supabase Auth (GoTrue) | OIDC, JWT issuance, role management |
| API Gateway | Supabase built-in | Rate limiting, JWT validation |
| Cache | Redis | Corporate rollup dashboard queries |
| Search Index | OpenSearch | Grievance & violation full-text search |

---

## 4. API Design — REST Endpoints

All FastAPI endpoints are prefixed with `/api/v1`. Every request must carry a valid Supabase JWT Bearer token. Multi-tenancy is enforced through Supabase RLS policies on the database (keyed by `mine_id`).

> **Note:** Simple list/get/patch CRUD endpoints can be consumed directly from the PostgREST API (`/rest/v1/<table>`) with RLS scoping. FastAPI endpoints below cover business logic that requires computation, file handling, or multi-step workflows.

### 4.1 Compliance

```
GET    /compliance/mines/{mine_id}/instances         # List compliance instances (filter: status, category, month)
GET    /compliance/instances/{id}                    # Instance detail with evidences
POST   /compliance/instances/{id}/submit             # Submit evidence (multipart: files + metadata) -> triggers OCR
POST   /compliance/instances/{id}/approve            # [Compliance Officer] Approve instance
POST   /compliance/instances/{id}/reject             # [Compliance Officer] Reject with reason
GET    /compliance/mines/{mine_id}/health-score      # Current compliance health score (0-100)
GET    /compliance/mines/{mine_id}/calendar          # Month calendar view (due items by date)
```

### 4.2 Inspection

```
GET    /inspections                                  # List inspections (filter: mine, type, date range, status)
POST   /inspections                                  # Schedule inspection
GET    /inspections/{id}                             # Inspection detail with all observations
POST   /inspections/{id}/submit                      # Submit completed inspection (triggers Supabase Webhook -> escalation check)

GET    /inspections/{id}/observations                # All observations for an inspection
POST   /inspections/{id}/observations                # Add observation (from web or sync push)

GET    /violations                                   # List violations (filter: mine, status, severity)
GET    /violations/{id}                              # Violation detail
POST   /violations/{id}/assign-capa                  # Assign corrective action
POST   /violations/{id}/close                        # Close violation with evidence upload

GET    /corrective-actions/{id}                      # CAPA detail
PATCH  /corrective-actions/{id}                      # Update CAPA status / progress notes
POST   /corrective-actions/{id}/complete             # Mark CAPA complete with evidence

GET    /checklists/templates                         # List inspection checklist templates
```

### 4.3 Contractor

```
GET    /contractors                                  # List contractors (filter: status, mine, trust_score_range)
POST   /contractors                                  # Onboard new contractor
GET    /contractors/{id}                             # Contractor profile
PATCH  /contractors/{id}                             # Update contractor details
POST   /contractors/{id}/suspend                     # Suspend contractor
POST   /contractors/{id}/blacklist                   # Blacklist contractor

POST   /contractors/{id}/documents                   # Upload document -> triggers OCR + trust score recomputation
GET    /contractors/{id}/documents                   # List contractor documents

GET    /contractors/{id}/trust-score                 # Current trust score with breakdown
GET    /contractors/expiring-documents               # [Mine Manager] All docs expiring in next 30d
```

### 4.4 Environment

```
GET    /environment/mines/{mine_id}/conditions       # EC conditions for a mine
GET    /environment/mines/{mine_id}/readings         # Sensor readings (filter: station, parameter, date range)
POST   /environment/mines/{mine_id}/readings         # Submit manual reading (triggers breach detection)
GET    /environment/mines/{mine_id}/status           # Aggregated environmental status per EC condition
GET    /environment/mines/{mine_id}/breach-history   # Breach events (filterable date range)
```

### 4.5 Production

```
GET    /production/mines/{mine_id}/readings          # Production readings (filter: date, shift)
POST   /production/mines/{mine_id}/readings          # Submit shift production data (triggers anomaly check)
GET    /production/mines/{mine_id}/targets           # Monthly targets
GET    /production/mines/{mine_id}/anomalies         # AI-flagged anomalies
```

### 4.6 Incident & Accident

```
GET    /incidents/mines/{mine_id}                    # List incident records
POST   /incidents/mines/{mine_id}                    # File new incident report (triggers AI classification)
GET    /incidents/{id}                               # Incident detail
PATCH  /incidents/{id}                               # Update record (investigation progress)
GET    /incidents/{id}/forms/4a                      # Generate Form 4-A PDF
GET    /incidents/{id}/forms/4b                      # Generate Form 4-B PDF
GET    /incidents/{id}/forms/4c                      # Generate Form 4-C PDF
```

### 4.7 Mine

```
GET    /mines                                        # List all mines (scoped by JWT via RLS)
POST   /mines                                        # [Admin] Onboard new mine
GET    /mines/{id}                                   # Mine detail (EC metadata, geo-fence, hierarchy)
PATCH  /mines/{id}                                   # [Admin] Update mine details
GET    /subsidiaries                                 # List subsidiaries
GET    /subsidiaries/{id}/mines                      # All mines under a subsidiary
```

### 4.8 Grievance

```
GET    /grievances                                   # List grievances (filter: mine, status, category, priority)
POST   /grievances                                   # File new grievance (triggers NLP classification)
GET    /grievances/{id}                              # Grievance detail
PATCH  /grievances/{id}                              # Update status / add notes
POST   /grievances/{id}/escalate                     # Escalate to next authority
POST   /grievances/{id}/resolve                      # Mark resolved with outcome
```

### 4.9 Notifications (REST + Supabase Realtime)

```
GET    /notifications                                # List notifications for authenticated user
PATCH  /notifications/{id}/acknowledge              # Acknowledge an alert

# Real-time: clients subscribe directly via Supabase Realtime JS client
# Channel: "alerts:mine_id=eq.{mineId}"
# No polling endpoint needed — Supabase broadcasts INSERT events on the alerts table
```

### 4.10 OCR

```
POST   /ocr/upload                                   # Upload document for digitization (multipart)
GET    /ocr/queue                                    # List review queue items (filter: confidence, category)
GET    /ocr/queue/{id}                               # Review item detail with extracted fields
POST   /ocr/queue/{id}/approve                       # Approve extracted data -> writes to target entity
POST   /ocr/queue/{id}/reject                        # Reject extraction — re-queue for rescan
PATCH  /ocr/queue/{id}/fields                        # Update individual extracted field before approval
```

### 4.11 Reports

```
POST   /reports/generate                             # Trigger statutory PDF generation
       body: { type, mine_id, period_start, period_end }
GET    /reports/jobs/{job_id}                        # Poll generation status
GET    /reports/{id}/download                        # Download generated PDF (signed Supabase Storage URL)
GET    /reports/history                              # Submission history for a mine
POST   /reports/{id}/sign                            # Digitally sign a generated report
POST   /reports/{id}/submit                          # Mark as submitted to authority
```

### 4.12 AI

```
POST   /ai/score/mine/{mine_id}                      # On-demand mine risk score recomputation
GET    /ai/anomalies/{mine_id}                       # List AI-flagged anomalies for a mine
POST   /ai/classify-incident                         # NLP incident classification (called internally on report submission)
POST   /ai/contractor-trust/{contractor_id}          # Recompute contractor trust score
```

### 4.13 Attendance / Shift

```
POST   /attendance                                   # Submit attendance batch (from sync push)
GET    /attendance/mines/{mine_id}                   # Records (filter: date, shift)
GET    /attendance/mines/{mine_id}/summary           # Shift-wise headcount summary

POST   /overman-reports                              # Submit overman shift report (triggers gas reading alert check)
GET    /overman-reports/mines/{mine_id}              # List reports (filter: date, shift, zone)
GET    /overman-reports/{id}                         # Report detail
```

---

## 5. Mobile Sync Protocol

The sync protocol implements the **WatermelonDB synchronization model**. Two FastAPI endpoints handle all mobile offline data reconciliation.

### 5.1 Pull Endpoint — Server to Client

```
POST /api/v1/sync/pull
Body:    { "last_pulled_at": number | null }
Headers: Authorization: Bearer {supabase_jwt}

Response:
{
  "changes": {
    "compliance_instances": {
      "created": [...],   # new instances assigned since last_pulled_at
      "updated": [...],   # status changes since last_pulled_at
      "deleted": []       # soft-deletes (rare)
    },
    "violations":          { "created": [...], "updated": [...], "deleted": [] },
    "corrective_actions":  { "created": [...], "updated": [...], "deleted": [] },
    "checklist_templates": { "created": [...], "updated": [...], "deleted": [] }
  },
  "timestamp": 1724760000000   # server timestamp for next pull
}
```

Implementation: FastAPI queries each table with `WHERE mine_id = :mine_id AND updated_at > :last_pulled_at` using SQLAlchemy Async against Supabase PostgreSQL.

### 5.2 Push Endpoint — Client to Server

```
POST /api/v1/sync/push
Body:
{
  "changes": {
    "inspections":         { "created": [...], "updated": [], "deleted": [] },
    "observations":        { "created": [...], "updated": [], "deleted": [] },
    "attendance_records":  { "created": [...], "updated": [], "deleted": [] },
    "incident_reports":    { "created": [...], "updated": [], "deleted": [] },
    "safety_observations": { "created": [...], "updated": [], "deleted": [] }
  }
}

Processing (FastAPI Sync Router):
  1. Validate Supabase JWT -> extract user + mine scope
  2. Pydantic v2 schema validation per record (mirrors frontend Zod schemas)
  3. Geo-fence validation via PostGIS ST_Contains for each record with coordinates
  4. Set location_mismatch flag if outside boundary (do NOT reject)
  5. Insert/update records via SQLAlchemy Async into Supabase PostgreSQL
  6. Trigger FastAPI BackgroundTasks for significant records:
     - incident_reports -> AI classification
     - attendance_records -> headcount update
  7. Return: { "server_ids": { "<local_id>": "<server_id>" }, "conflicts": [...] }
```

### 5.3 Media Upload (Decoupled from Sync)

```
POST /api/v1/media/upload-url
Body:     { filename, content_type, entity_type, entity_local_id }
Response: { upload_url, file_path }   # Supabase Storage signed upload URL (15 min TTL)

Client: PUT {upload_url}  (direct upload to Supabase Storage, bypasses FastAPI)

POST /api/v1/media/confirm
Body:     { file_path, entity_type, entity_id, captured_at, geo_stamp }
Response: { media_attachment_id, file_url }
```

---

## 6. Event-Driven Architecture (Supabase Webhooks)

Supabase Webhooks replace Kafka. Database triggers on operational tables fire HTTP POST requests to FastAPI's internal `/internal/webhook` router. This is sufficient for the scale of this platform and avoids the operational complexity of a Kafka cluster.

### 6.1 Webhook Event Catalog

| Trigger Table & Event | Supabase Webhook Condition | FastAPI Handler | Effect |
|--|--|--|--|
| `compliance_instances` status = `breached` | `UPDATE` where `status = 'breached'` | `handle_compliance_overdue` | Level-1 alert -> Mine Manager; starts escalation timer |
| `violations` INSERT | `INSERT` | `handle_violation_created` | Notify assigned officer; trigger AI risk score recomputation |
| `corrective_actions` due_date exceeded | `pg_cron` poll every 15 min | `handle_capa_overdue` | Escalation ladder (L1 -> L2 -> Regulator) |
| `contractor_documents` status = `expiring_soon` | Postgres function + `pg_cron` | `handle_doc_expiring` | Alert contractor manager 30/7/1 days before expiry |
| `environment_readings` threshold_breached = true | `INSERT` | `handle_env_breach` | Immediate CRITICAL alert; trigger AI anomaly check |
| `incident_reports` INSERT | `INSERT` | `handle_incident_reported` | AI severity classification; DGMS notification if critical |
| `ocr_extraction_results` INSERT | `INSERT` | `handle_ocr_complete` | Auto-apply if confidence >= 0.85; else push to review queue |
| `mine_risk_scores` INSERT (score worsens) | `INSERT` | `handle_risk_worsened` | Push alert to Mine Manager + Subsidiary Admin |

### 6.2 CAPA Escalation Ladder

Managed by a **Postgres `pg_cron`** job (runs every 15 minutes) that calls a FastAPI background task:

```python
# FastAPI background task — called from /internal/webhook or pg_cron HTTP call
async def check_overdue_capas():
    async with async_session() as db:
        result = await db.execute(
            select(CorrectiveAction)
            .where(
                CorrectiveAction.status.in_(["assigned", "in_progress"]),
                CorrectiveAction.due_date < date.today(),
            )
            .options(selectinload(CorrectiveAction.mine))
        )
        for capa in result.scalars():
            days_overdue = (date.today() - capa.due_date).days
            if days_overdue >= 1:
                await notify_user(capa.assigned_to, priority="high", entity=capa)
            if days_overdue >= 3:
                await notify_mine_manager(capa.mine_id, capa)
            if days_overdue >= 7:
                await notify_subsidiary_head(capa.subsidiary_id, capa)
            if days_overdue >= 14:
                await set_regulator_visible(capa.id)
```

---

## 7. Database Architecture (Supabase PostgreSQL)

The authoritative schema is defined in the migration file:
[`20260829195824_compliance_schema.sql`](file:///c:/Coding/SIH2026/backend/supabase/migrations/20260829195824_compliance_schema.sql)

### 7.1 Schema Summary

All tables use UUID primary keys (`gen_random_uuid()`). Every operational table carries a `mine_id` foreign key enforced via PostgreSQL RLS.

#### Foundational Tables

| Table | Purpose |
|-------|---------|
| `organizations` | Top-level org (Coal India Limited, Ministry) |
| `subsidiaries` | ECL, BCCL, CCL, MCL, NCL, SECL, WCL, NEC |
| `mines` | Individual colliery; holds `boundary_geojson JSONB`, EC metadata |
| `users` | Linked to Supabase Auth `uid` via `keycloak_subject` field |
| `roles` | RBAC roles with `permissions JSONB` |
| `user_roles` | M2M user <-> role |

#### Compliance Domain

| Table | Purpose |
|-------|---------|
| `regulations` | Statute library (CMR 2017, EP Act, Mines Act) |
| `compliance_requirements` | Periodic tasks derived from regulations (daily/monthly/annual) |
| `compliance_instances` | Per-mine, per-period task instances with `status`, `due_date` |
| `compliance_evidences` | Uploaded documents tied to instances |

#### Inspection & Violation Domain

| Table | Purpose |
|-------|---------|
| `inspection_checklist_templates` | Configurable checklists per inspection type |
| `inspections` | Inspection record with `geo_stamp JSONB`, `sync_status` |
| `observations` | Checklist item outcomes; optional AI classification fields |
| `violations` | Derived from non-compliant observations; tracks severity & status |
| `corrective_actions` | CAPA records; links to `escalation_workflow_instances` |
| `media_attachments` | Photos/video/audio for observations and CAPAs |

#### Statutory Registers

| Table | Purpose |
|-------|---------|
| `monitoring_stations` | CAAQMS / manual air / water stations |
| `environment_readings` | Sensor/manual readings with `threshold_breached` flag |
| `production_readings` | Shift-wise coal output with `anomaly_flagged` flag |

#### Contractor Ecosystem

| Table | Purpose |
|-------|---------|
| `contractors` | Profile, `trust_score`, `risk_rating` |
| `contractor_documents` | CLRA, ESI, EPF etc.; linked to `ocr_extraction_results` |
| `contractor_assignments` | Work order -> mine mapping |
| `contract_workers` | Worker registry per contractor |

#### Mobile Field Reporting

| Table | Purpose |
|-------|---------|
| `incident_reports` | Near-miss / accident; has `ai_suggested_severity`, `voice_note_url` |
| `safety_observations` | Quick in-field hazard flags; tracks correction lifecycle |

#### Alerts & Escalation

| Table | Purpose |
|-------|---------|
| `alerts` | All system notifications; `channels TEXT[]` (push/sms/email/in-app) |
| `escalation_workflow_instances` | Active escalation state machine per entity |

#### OCR & Document Digitization

| Table | Purpose |
|-------|---------|
| `document_uploads` | Raw upload record with `ocr_status` |
| `ocr_extraction_results` | Structured field extraction + `overall_confidence` |

#### AI / Analytics

| Table | Purpose |
|-------|---------|
| `mine_risk_scores` | Timestamped score snapshots with `contributing_factors JSONB` |
| `anomaly_flags` | AI-detected production/environmental anomalies |

### 7.2 Key Enums (from migration)

Defined as PostgreSQL `ENUM` types. Selected important ones:

| Enum | Values |
|------|--------|
| `instance_status` | `pending`, `in_progress`, `submitted`, `revision_requested`, `approved`, `breached` |
| `violation_status` | `reported`, `under_review`, `capa_assigned`, `in_progress`, `pending_verification`, `closed`, `dismissed`, `systemic_risk` |
| `capa_status` | `assigned`, `in_progress`, `completed`, `pending_verification`, `verified_closed`, `overdue`, `escalated` |
| `inspection_type_enum` | `dgms_annual_general`, `dgms_surprise`, `dgms_inquiry`, `internal_safety_committee`, `environmental_pcb`, `medical_fitness`, `electrical`, `explosives` |
| `role_name_enum` | `field_officer`, `mine_manager`, `safety_officer`, `environmental_officer`, `compliance_officer`, `contractor_manager`, `subsidiary_admin`, `corporate_executive`, `regulator`, `system_admin` |
| `shift_enum` | `A`, `B`, `C`, `general`, `daily_aggregate` |
| `alert_priority` | `critical`, `high`, `medium`, `low`, `info` |
| `escalation_entity` | `compliance_instance`, `corrective_action`, `grievance`, `contractor_document` |
| `doc_category_enum` | `dgms_inspection_memo`, `accident_register`, `attendance_muster`, `environmental_report`, `contractor_license`, `explosive_return`, `production_return`, `safety_committee_minutes`, `statutory_form`, `legacy_register`, `other` |

### 7.3 Row-Level Security (RLS) Policies

RLS is enabled on all operational tables. Policies from the migration:

```sql
-- Master data: read-only to all authenticated users
CREATE POLICY "regulations_select_all"  ON regulations            FOR SELECT USING (true);
CREATE POLICY "requirements_select_all" ON compliance_requirements FOR SELECT USING (true);

-- Operational data: scoped to authenticated users
-- (app layer further filters by mine_id from JWT claims)
CREATE POLICY "ci_authenticated"   ON compliance_instances  FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "insp_authenticated" ON inspections           FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "vio_authenticated"  ON violations            FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "capa_authenticated" ON corrective_actions    FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "ir_authenticated"   ON incident_reports      FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "so_authenticated"   ON safety_observations   FOR ALL USING ((select auth.role()) = 'authenticated');

-- Alerts: user sees only their own
CREATE POLICY "alerts_own" ON alerts FOR SELECT USING (target_user_id = (select auth.uid()));
```

FastAPI enforces mine-scope additionally at the application layer by extracting `mine_id` from the decoded Supabase JWT.

### 7.4 Critical Indexes (from migration)

```sql
CREATE INDEX idx_ci_mine_due_status      ON compliance_instances(mine_id, due_date, status);
CREATE INDEX idx_inspections_mine        ON inspections(mine_id, started_at);
CREATE INDEX idx_violations_mine_status  ON violations(mine_id, status);
CREATE INDEX idx_capas_mine_status       ON corrective_actions(mine_id, status, due_date);
CREATE INDEX idx_env_readings_mine_time  ON environment_readings(mine_id, recorded_at);
CREATE INDEX idx_prod_mine_date          ON production_readings(mine_id, reporting_date);
CREATE INDEX idx_alerts_user_status      ON alerts(target_user_id, status);
CREATE INDEX idx_risk_scores_mine        ON mine_risk_scores(mine_id, computed_at DESC);
CREATE INDEX idx_anomalies_mine          ON anomaly_flags(mine_id, detected_at DESC);
```

### 7.5 Redis Cache Usage

Redis is used only for heavy corporate rollup queries. Supabase Realtime handles pub/sub natively.

| Key Pattern | TTL | Purpose |
|-------------|-----|---------|
| `dashboard:mine:{mine_id}` | 60s | Mine manager dashboard composite query |
| `dashboard:subsidiary:{sub_id}` | 300s | Corporate rollup (5 min) |
| `risk:mine:{mine_id}` | 3600s | Latest risk score (1 hr, recomputed by AI) |
| `compliance:health:{mine_id}` | 300s | Compliance health score |
| `search:grievance:{query_hash}` | 120s | OpenSearch result cache |

---

## 8. OCR Ingestion Pipeline

```
User uploads document (PDF/JPG/PNG)
  -> POST /api/v1/ocr/upload (multipart)
  -> FastAPI OCR Router
  -> File saved to Supabase Storage: ocr-uploads/{uuid}.pdf
  -> document_uploads record created (ocr_status: "queued")
  -> FastAPI BackgroundTask: { document_id, file_path, category }

BackgroundTask worker:
  1. Download file from Supabase Storage
  2. If PDF: convert first page to PNG (pdf2image / Ghostscript)
  3. Run Tesseract 5 (regional models: HIN, BEN, ORI, ENG)
  4. Parse OCR output -> field extraction by document_category:
     - "contractor_license"        -> { clra_number, valid_until, issued_by }
     - "accident_register"         -> { mine_name, date, shift, nature, victim_name }
     - "dgms_inspection_memo"      -> { inspection_date, observations, statute }
     - "environmental_report"      -> { parameter values, station, date }
     - "production_return"         -> { shift, quantity_MT, date, grade }
     - "safety_committee_minutes"  -> { meeting_date, attendees, resolutions }
  5. Compute per-field confidence score (0.0 - 1.0)
  6. Save to ocr_extraction_results
  7. Update document_uploads.ocr_status = "completed" / "awaiting_review"
  8. Supabase Webhook fires -> FastAPI handle_ocr_complete()

handle_ocr_complete():
  - If overall_confidence >= 0.85 AND category is known:
      -> Auto-apply extracted data to target entity (no human review)
      -> verification_status = "auto_accepted"
  - Else:
      -> verification_status = "pending_review"
      -> INSERT alert for assigned compliance officer

Human review (web OCR Review screen):
  -> Side-by-side: scanned doc + extracted fields
  -> Officer corrects low-confidence fields
  -> POST /api/v1/ocr/queue/{id}/approve
  -> FastAPI writes corrected data to target entity
  -> verification_status = "human_verified"
```

### Supported Document Categories

| `doc_category_enum` value | Target Table | Key Extracted Fields |
|--|--|--|
| `contractor_license` | `contractor_documents` | CLRA number, valid_until, authority |
| `accident_register` | `incident_reports` | date, shift, nature, location, victim names |
| `dgms_inspection_memo` | `inspections` (linked) | inspection_date, observations, statute refs |
| `environmental_report` | `environment_readings` | parameter values, station, date, signatory |
| `production_return` | `production_readings` | shift, quantity_MT, date, grade |
| `safety_committee_minutes` | `compliance_evidences` | meeting_date, attendees, resolutions |
| `legacy_register` | `document_uploads` (archive) | Raw extraction only, no auto-apply |

---

## 9. AI / Analytics Engine

The AI engine runs as a set of FastAPI routers within the same Python service. It reads from Supabase PostgreSQL and writes results back.

### 9.1 Mine Risk Score Computation

**Trigger:** Every 6 hours via `pg_cron`, or on-demand when a `violation.created` Supabase Webhook or `environment_readings.threshold_breached` fires.

**Input Features (queried from Supabase PostgreSQL):**

```python
features = {
    # Safety signals
    "violation_count_90d":           count of violations in last 90 days,
    "violation_critical_count_90d":  count of CRITICAL violations in 90d,
    "capa_avg_closure_days":         avg days to close CAPA (last 12 months),
    "capa_overdue_count":            currently overdue CAPAs,
    "inspection_frequency_score":    inspections per month vs expected,

    # Environment signals
    "env_breach_count_30d":          EC condition breaches in last 30 days,
    "breach_recurrence_flag":        same condition breached > 2x in 30d (bool),

    # Production signals
    "production_pressure_index":     actual / target ratio,

    # Labour signals
    "contractor_compliance_pct":     % contractors with all-valid docs,
    "grievance_open_count":          unresolved grievances > 7 days,

    # Historical
    "fatal_accident_36m_flag":       fatal accident in last 3 years (bool),
    "dgms_adverse_inspection_flag":  DGMS adverse finding in last 12 months (bool),
}
```

**Output written to `mine_risk_scores`:**

```json
{
  "mine_id": "...",
  "score": 67.4,
  "risk_level": "high",
  "trend": "worsening",
  "contributing_factors": [
    { "feature": "violation_count_90d", "weight": 0.34, "value": 12, "comparison": "3x avg" },
    { "feature": "capa_avg_closure_days", "weight": 0.28, "value": 9.2, "comparison": "vs 7 target" }
  ],
  "model_version": "xgb-v2.1",
  "computed_at": "2026-08-30T06:00:00Z"
}
```

### 9.2 Recurring Violation Cluster Detection

```python
# Runs weekly per mine via pg_cron -> FastAPI background task
async def detect_recurring_clusters(mine_id: str) -> list[ViolationCluster]:
    violations = await query_violations_18m(mine_id)
    groups = groupby(
        sorted(violations, key=lambda v: (v.zone, v.statute_reference)),
        key=lambda v: (v.zone, v.statute_reference)
    )
    clusters = []
    for key, items in groups:
        items = list(items)
        if len(items) >= 3:
            clusters.append(ViolationCluster(
                zone=key[0],
                statute=key[1],
                occurrence_count=len(items),
                first_seen=min(v.created_at for v in items),
                last_seen=max(v.created_at for v in items),
                is_systemic=len(items) >= 5,
            ))
    return clusters
```

### 9.3 Incident Classification (NLP)

On `incident_reports` INSERT (via Supabase Webhook):
1. Extract `description` + `incident_type`
2. Run through pre-trained TF-IDF + LightGBM multi-class classifier
3. Return `ai_suggested_category` + `ai_suggested_severity`
4. Written back to the `incident_reports` row
5. Mobile app displays suggestion; officer can accept or override
6. Officer corrections feed labeled training data for model refinement

### 9.4 Environmental Forecast (Prophet)

```python
# Runs every hour per CAAQMS station via pg_cron -> FastAPI background task
async def forecast_pm10(station_id: str, horizon_hours: int = 8) -> Forecast:
    readings = await get_readings_72h(station_id, parameter="pm10")
    model = Prophet(seasonality_mode="multiplicative")
    model.fit(readings_to_df(readings))
    future = model.make_future_dataframe(periods=horizon_hours, freq="H")
    forecast = model.predict(future)
    breach_risk = any(v > EC_LIMIT_PM10 for v in forecast["yhat"].tail(horizon_hours))
    return Forecast(station_id=station_id, breach_risk=breach_risk, predicted=forecast)
```

### 9.5 Contractor Trust Score

```python
# Recomputed on: document upload, doc expiry event, violation linked, CAPA closed
async def compute_trust_score(contractor_id: str) -> float:
    doc_score     = 40 * await docs_validity_ratio(contractor_id)        # 0-40
    safety_score  = 30 * (1 - await violation_penalty(contractor_id))    # 0-30
    capa_score    = 20 * await capa_closure_rate(contractor_id)          # 0-20
    billing_score = 10 * (1 - await billing_anomaly_flag(contractor_id)) # 0-10
    return round(doc_score + safety_score + capa_score + billing_score, 2)
```

---

## 10. Notification & Alert System

### 10.1 Alert Creation Flow

```
Supabase Webhook fires (e.g., environment_readings INSERT with threshold_breached = true)
  |
FastAPI Webhook handler (POST /internal/webhook)
  |
  1. Determine priority (CRITICAL / HIGH / MEDIUM / LOW) from event payload
  2. Determine target recipients (mine_id -> user roles via user_roles table)
  3. INSERT into alerts table
  4. Supabase Realtime broadcasts INSERT to channel "alerts:mine_id=eq.{mine_id}"
     -> Web dashboard receives live push notification (no polling)
  5. If priority = CRITICAL or HIGH: FCM push via Firebase Admin SDK (BackgroundTask)
  6. If priority = CRITICAL: SMS via Bhashini / Twilio (BackgroundTask)
```

### 10.2 Supabase Realtime Integration

The web dashboard subscribes directly using the Supabase JS client:

```typescript
// Web dashboard (React)
const channel = supabase
  .channel(`alerts:mine_id=eq.${mineId}`)
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'alerts' },
    (payload) => showToastNotification(payload.new)
  )
  .subscribe();
```

No custom SSE endpoint needed — Supabase Realtime handles this natively.

### 10.3 Escalation Ladder (Compliance Instance)

| Threshold | Action |
|-----------|--------|
| T-7 days before due | Notify assigned compliance officer (FCM push) |
| T-3 days before due | Notify Mine Manager (FCM + email) |
| Due date passed (T+0) | `status -> breached`; notify Mine Manager + Subsidiary Admin |
| T+7 days overdue | Notify Subsidiary Head; set `is_regulator_visible = true` |
| T+14 days overdue | System alert to regulatory authority contact |

### 10.4 Gas Reading Alert (Critical Safety)

```python
# Handled synchronously inside the overman report submission endpoint.
# NOT via background task — immediate safety alert, no async delay tolerated.
async def check_gas_readings(report: OvermanReport):
    for reading in report.gas_readings:
        if reading.ch4_percent > 1.25:
            await fcm_service.send_critical(mine_manager.fcm_token, {
                "title": "CRITICAL: High CH4 Level",
                "body": f"CH4 at {reading.ch4_percent}% in {reading.station_label}. Evacuate if >1.5%"
            })
        if reading.ch4_percent > 1.5:
            await trigger_emergency_escalation(report.mine_id)
```

---

## 11. Authentication & RBAC (Supabase Auth)

### 11.1 Supabase Auth Configuration

```
Providers enabled:
  - Email / Password
  - Magic Link (passwordless)
  - PKCE flow for mobile React Native app

Custom JWT Claims (via Supabase Auth hooks):
  mine_ids:      [uuid, ...]       # mines the user is scoped to
  subsidiary_id: uuid              # for corporate/subsidiary admins
  role:          role_name_enum    # primary role for RLS policy matching
  permissions:   [                 # fine-grained permission list
    "compliance:read",
    "compliance:submit_evidence",
    "inspection:create",
    ...
  ]

MFA: Enforced for high-privilege accounts
  (subsidiary_admin, corporate_executive, regulator, system_admin)
```

### 11.2 FastAPI JWT Verification

```python
from fastapi import Security, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def get_current_user(token: str = Security(security)) -> UserContext:
    """Verify Supabase JWT and extract user context."""
    try:
        # Verify against Supabase JWT secret (RS256 or HS256 depending on config)
        claims = jwt.decode(token.credentials, settings.SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return UserContext(
            user_id=claims["sub"],
            mine_ids=claims.get("mine_ids", []),
            subsidiary_id=claims.get("subsidiary_id"),
            role=claims.get("role"),
            permissions=claims.get("permissions", []),
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
```

### 11.3 RBAC Role Definitions (from DB seed)

| Role | Scope | Key Permissions |
|------|-------|-----------------|
| `field_officer` | mine | inspection:create/read/update, safety_observation:create |
| `mine_manager` | mine | compliance:approve, inspection:approve, violation:read/update, dashboard:read |
| `safety_officer` | mine | inspection:create, violation:create/update, compliance:read |
| `environmental_officer` | mine | compliance:read/update, dashboard:read |
| `compliance_officer` | subsidiary | compliance:approve/escalate, report:read/export |
| `contractor_manager` | mine | contractor:create/read/update, contractor_document:create |
| `subsidiary_admin` | subsidiary | compliance:full, contractor:full, dashboard:read/export |
| `corporate_executive` | organization | dashboard:read/export, report:read/export |
| `regulator` | jurisdiction | compliance:read/export, violation:read, dashboard:read |
| `system_admin` | organization | Full access to all resources |

---

## 12. Multi-Tenancy Strategy

### Hierarchy

```
Coal India Limited (Ministry level)
  |-- Subsidiary (ECL, BCCL, CCL, MCL, NCL, SECL, WCL, NEC)
        |-- Mine (individual colliery)
              |-- Zone (inspection areas within mine)
```

### Tenancy Isolation Rules

| Level | Isolation Method |
|-------|-----------------|
| Data isolation | `mine_id` column + PostgreSQL RLS (enforced at Supabase DB level) |
| API scope | `mine_ids` claim in Supabase JWT validated by FastAPI `get_current_user` |
| Corporate queries | `subsidiary_id` in JWT — PostgREST returns all child mines |
| Regulator queries | `mine_ids` claim spans cross-subsidiary, read-only via RLS policy |
| System Admin | Service role key — bypasses RLS for admin operations |

### Cross-Mine Aggregation

Corporate dashboard and AI analytics require cross-mine data. Handled by:
1. **PostgreSQL Materialized Views** per subsidiary (refreshed every 5 min via `pg_cron`), cached in Redis for 5 minutes
2. **AI Service:** Reads via Supabase service role key (bypasses RLS) — internal only, never exposed to API clients
3. **OpenSearch:** Full-text search across grievances/violations, scoped by `subsidiary_id` query filter

---

## 13. Media Storage (Supabase Storage)

### 13.1 Bucket Structure

```
Supabase Storage Buckets:

ocr-uploads/              # Raw uploaded documents for OCR
  {uuid}.pdf

inspection-media/         # Photos, video, voice notes from field
  {mine_id}/
    {inspection_id}/
      {observation_id}_{media_type}_{timestamp}.jpg

compliance-evidence/      # Documents submitted as compliance evidence
  {mine_id}/
    {instance_id}/
      {evidence_id}_{filename}

statutory-reports/        # Generated PDF statutory reports
  {mine_id}/
    {report_type}_{period}_{report_id}.pdf

contractor-docs/          # CLRA, ESI, EPF scans per contractor
  {contractor_id}/
    {doc_type}_{doc_id}.pdf
```

### 13.2 Access Control

- All buckets are **private** — no public access
- File access via **Supabase Storage signed URLs** (15 min TTL for read, 15 min for upload)
- FastAPI generates signed URL; client uploads/downloads directly to Supabase Storage
- File paths (not full URLs) stored in DB columns — URLs regenerated on each access request
- Storage RLS policies mirror PostgreSQL `mine_id` scoping

### 13.3 Media Lifecycle

```
Photo captured (mobile) -> local WatermelonDB filesystem
  -> sync: POST /api/v1/media/upload-url -> Supabase Storage signed PUT URL
  -> PUT directly to Supabase Storage (bypasses FastAPI)
  -> POST /api/v1/media/confirm -> creates media_attachments record

Retention policy:
  - Statutory records (accidents, inspections, compliance): PERMANENT
  - Temp OCR uploads: 30 days if approved, 7 days if rejected
  - Voice notes: 5 years
  - Contractor docs: 7 years after contract end
```

---

## 14. GIS & Spatial Services

### 14.1 PostGIS Queries (via SQLAlchemy + GeoAlchemy2)

```python
# Geo-fence check — called by Sync Service on every pushed record with coordinates
from geoalchemy2.functions import ST_Contains, ST_SetSRID, ST_Point, ST_Distance

result = await db.execute(
    select(
        Mine.id,
        ST_Contains(
            func.cast(Mine.boundary_geojson, Geometry),
            ST_SetSRID(ST_Point(lng, lat), 4326)
        ).label("within_boundary"),
        (ST_Distance(
            func.cast(Mine.boundary_geojson, Geometry),
            ST_SetSRID(ST_Point(lng, lat), 4326)
        ) * 111320).label("distance_from_boundary_m")
    ).where(Mine.id == mine_id)
)
```

```sql
-- Incident heatmap data (for deck.gl HeatmapLayer on web dashboard)
SELECT
  (i.geo_stamp->>'lat')::float AS geo_lat,
  (i.geo_stamp->>'lng')::float AS geo_lng,
  COUNT(*) AS weight
FROM observations i
JOIN violations v ON v.observation_id = i.id
JOIN inspections ins ON ins.id = i.inspection_id
WHERE ins.mine_id = $mine_id
  AND i.created_at > NOW() - INTERVAL '6 months'
GROUP BY geo_lat, geo_lng;
```

> **Note:** `boundary_geojson` is stored as `JSONB` in the current migration. PostGIS functions are invoked via `::geometry` cast. A future migration can add a dedicated `GEOMETRY(POLYGON,4326)` column with a GIST index for better spatial query performance.

### 14.2 Map Tile Service

- **Source:** OpenStreetMap tiles (self-hosted via PMTiles / Martin tile server, or Mapbox CDN)
- **Satellite Overlay:** ISRO Bhuvan API (government-approved source for mine boundary / green belt verification)
- **Offline Tiles (Mobile):** Mine-area tiles pre-downloaded on app install via `react-native-maps` offline tiles

---

## 15. Report Generation Service

### 15.1 Statutory Reports Supported

| Report | Regulation | Frequency | Auto-populated From |
|--------|-----------|-----------|-------------------|
| Annual Return (Form 3) | CMR 2017 Reg 4 | Annual | All yearly data |
| Accident Notice (Form 4-A) | CMR 2017 Reg 79 | Per accident | `incident_reports` |
| Accident Register (Form 4-B) | CMR 2017 Reg 81 | Annual | `incident_reports` + persons involved |
| Return to Duty (Form 4-C) | CMR 2017 Reg 81 | Per person | `incident_reports.persons_involved` |
| Monthly Safety Committee Report | CMR 2017 Reg 167 | Monthly | `compliance_instances` (linked minutes) |
| EC Half-Yearly Compliance Report | EC Conditions | 6-monthly | `environment_readings` |
| CCO Daily Return (Form I) | CCO Act 1974 | Daily | `production_readings` |
| CLRA Contractor Register (Form XII) | CLRA Act 1970 | Annual | `contractors`, `contract_workers` |

### 15.2 Generation Flow

```python
# FastAPI report router
async def generate_report(dto: GenerateReportDto, background_tasks: BackgroundTasks) -> str:
    job = await create_report_job(dto)
    background_tasks.add_task(_generate_report_task, job.id, dto)
    return job.id

async def _generate_report_task(job_id: str, dto: GenerateReportDto):
    # 1. Fetch all data from Supabase PostgreSQL via SQLAlchemy
    data = await assemble_report_data(dto.type, dto.mine_id, dto.period_start, dto.period_end)

    # 2. Render Jinja2 template -> HTML
    template = env.get_template(f"{dto.type}.html.j2")
    html = template.render(data)

    # 3. Generate PDF with WeasyPrint (pure-Python, no headless browser required)
    pdf_bytes = HTML(string=html).write_pdf()

    # 4. Upload to Supabase Storage
    file_path = f"statutory-reports/{dto.mine_id}/{dto.type}_{dto.period_start}_{job_id}.pdf"
    supabase.storage.from_("statutory-reports").upload(file_path, pdf_bytes)

    # 5. Compute SHA-256 hash for tamper evidence
    sha256_hash = hashlib.sha256(pdf_bytes).hexdigest()

    # 6. Save report record to DB + audit trail entry
    await finalize_report(job_id, file_path, sha256_hash)
```

---

## 16. Audit Trail & Blockchain Anchoring

### 16.1 Audit Trail

Every mutation (create, update, delete) on any statutory entity is recorded via FastAPI middleware writing to an immutable audit table in Supabase PostgreSQL:

```python
# FastAPI middleware pattern (applied globally via Starlette middleware)
async def audit_middleware(request: Request, call_next):
    response = await call_next(request)
    if request.method in ("POST", "PATCH", "PUT", "DELETE"):
        background_tasks.add_task(record_audit, {
            "entity_type": extract_entity_type(request.url.path),
            "entity_id":   extract_entity_id(request),
            "action":      request.method,
            "actor_id":    request.state.user.user_id,
            "mine_id":     request.state.user.mine_ids[0] if request.state.user.mine_ids else None,
            "occurred_at": datetime.utcnow(),
        })
    return response
```

Audit records are write-only (no UPDATE/DELETE permitted via Postgres trigger).

### 16.2 Blockchain Hash Anchoring

For statutory documents (Form 3, Form 4-A, signed compliance evidence):

```
PDF generated
  -> SHA-256 hash computed
  -> POST to National Blockchain for Governance (NBG) API:
      { documentId, hash, timestamp, mine_name, document_type }
  -> NBG returns { tx_id, block_hash, timestamp }
  -> Store tx_id in report record
  -> Display on web: "Verified | Blockchain TX: {tx_id}"

Verification flow (Regulator portal):
  -> Regulator clicks "Verify Integrity"
  -> Download PDF -> compute SHA-256 locally
  -> GET NBG API: verify { tx_id, hash }
  -> Match confirms document untampered since submission
```

---

## 17. DevOps & Infrastructure

### 17.1 Deployment Architecture

```
Supabase Cloud (managed):
  - PostgreSQL 15 + PostGIS
  - Auth (GoTrue)
  - Storage
  - Realtime
  - pg_cron (for scheduled jobs)

Kubernetes (self-hosted or GKE/EKS):
  - fastapi-worker    (Python 3.12 FastAPI, 2-5 replicas, HPA on CPU)
  - redis             (StatefulSet, Redis 7)
  - opensearch        (StatefulSet, for grievance full-text search)
```

### 17.2 CI/CD Pipeline (GitHub Actions)

```
Push to feature branch:
  -> GitHub Actions:
     1. uv install + mypy type check
     2. Unit tests (pytest + pytest-asyncio)
     3. Supabase migration lint (supabase db lint)
     4. Docker build (multi-stage: builder + slim runtime)
     5. Push image to Container Registry (GHCR / GCR)

Merge to main:
  -> GitHub Actions:
     6. E2E tests (Playwright on Supabase staging project)
     7. supabase db push (apply migrations to staging)
     8. Update Helm chart values (image tag)
     9. kubectl apply / Helm upgrade (production)
```

### 17.3 Observability Stack

```
OpenTelemetry SDK (FastAPI via opentelemetry-instrumentation-fastapi)
  -> Collector sidecar
  -> Traces:  Jaeger / Tempo
  -> Metrics: Prometheus -> Grafana dashboards
  -> Logs:    Python structlog -> Loki -> Grafana

Key Metrics Tracked:
  - API latency P50/P95/P99 per endpoint
  - Sync push throughput (records/second)
  - Supabase Webhook processing latency
  - FastAPI BackgroundTask queue depth
  - AI inference latency (P95 < 500ms)
  - PostgreSQL query duration (P95 < 100ms)
  - Supabase Realtime active subscriptions

Alerts (PagerDuty):
  - Error rate > 1% on any endpoint (5-min window)
  - API P95 > 2s
  - FastAPI background task failure rate > 5%
  - PostgreSQL replication lag > 30s
  - Supabase Storage usage > 80% quota
```

---

## 18. Security Architecture

### 18.1 Network Security

```
Internet -> CloudFlare (DDoS protection, WAF)
         -> Supabase API Gateway (JWT validation, rate limiting)
         -> FastAPI Worker (K8s internal, not directly internet-exposed)
         -> Supabase PostgreSQL (internal VPC only)

FastAPI only reachable via Supabase API Gateway or internal K8s ingress.
Supabase Webhooks call FastAPI /internal/webhook — protected by shared secret header.
All service-to-service communication over TLS 1.3.
```

### 18.2 Data Security

| Category | Measure |
|----------|---------|
| Data at rest | Supabase PostgreSQL: AES-256 (managed by Supabase) |
| Supabase Storage | Server-side encryption (AES-256) |
| PII fields | Aadhaar hashes (stored as `aadhaar_hash`, never plaintext) |
| JWT tokens | Short-lived Supabase JWTs (1 hour), refresh token rotation |
| JWT storage (web) | HTTP-Only cookies |
| JWT storage (mobile) | `expo-secure-store` (iOS Keychain / Android Keystore) |
| Audit logs | Append-only (no UPDATE/DELETE via DB trigger on audit table) |
| Supabase service role key | Only in FastAPI server env vars, never exposed to client |

### 18.3 OWASP Top 10 Mitigations

| Threat | Mitigation |
|--------|-----------|
| Injection | SQLAlchemy 2.0 parameterized queries; no raw string SQL in application code |
| Broken Auth | Supabase Auth OIDC, short-lived JWTs, refresh token rotation, MFA for privileged roles |
| Broken Access Control | RLS at DB layer (Supabase) + FastAPI `get_current_user` dependency — double enforcement |
| Security Misconfig | Helm defaults: non-root containers, read-only filesystem, no privileged pods |
| SSRF | No user-supplied URLs fetched server-side; all external calls use allowlisted endpoints |
| Rate Limiting | Supabase API Gateway: 100 req/min per user on standard; 10 req/min on auth endpoints |

---

## 19. Performance Targets & SLOs

### 19.1 API Response Time SLOs

| Endpoint Class | P50 | P95 | P99 |
|----------------|-----|-----|-----|
| Simple CRUD (GET single entity via PostgREST) | < 30ms | < 100ms | < 200ms |
| List endpoints (paginated, FastAPI) | < 80ms | < 250ms | < 500ms |
| Dashboard composite query (Redis-cached) | < 50ms | < 200ms | < 400ms |
| Corporate rollup (materialized view + Redis) | < 50ms | < 200ms | < 400ms |
| Sync push (50 records) | < 400ms | < 1.2s | < 3s |
| Risk score recomputation (XGBoost) | < 1s | < 2s | < 5s |
| PDF report generation (WeasyPrint) | < 4s | < 12s | < 25s |
| OCR extraction (A4 page, Tesseract) | < 8s | < 20s | < 45s |

### 19.2 Throughput Targets

| Metric | Target |
|--------|--------|
| Concurrent API users (per mine) | 200 |
| Total concurrent users (system) | 5,000 |
| Sync push throughput | 500 records/second (burst) |
| Supabase Realtime connections | 2,000 concurrent |
| FastAPI BackgroundTask workers | 50 concurrent |

### 19.3 Availability & Reliability

| Metric | Target |
|--------|--------|
| API availability | 99.9% (8.7 hours downtime/year) |
| Supabase PostgreSQL availability | 99.95% (managed by Supabase SLA) |
| RTO (Recovery Time Objective) | < 15 minutes |
| RPO (Recovery Point Objective) | < 5 minutes (Supabase continuous WAL streaming) |
| Backup frequency | Supabase daily full + continuous WAL (PITR) |
| Sync offline tolerance | Up to 72 hours (WatermelonDB local store) |

### 19.4 Scalability Approach

- **FastAPI:** Stateless pods behind K8s Ingress; HPA scales on CPU > 70% or RPS thresholds
- **Supabase PostgreSQL:** Managed primary + read replicas; PgBouncer connection pooling built-in
- **Redis:** Single-node for MVP; Redis Cluster (3+3) for production scale
- **OpenSearch:** Single-node for MVP; 3-node cluster for production
- **AI Workers:** Python pods with optional GPU node pool for inference workloads

---

*Version 2.0 | Backend Specification | SIH 2026*
*Stack: Python 3.12 + FastAPI + Supabase (PostgreSQL / Auth / Storage / Realtime / Webhooks) + Redis + OpenSearch*
*References: [TECH_STACK.md](file:///c:/Coding/SIH2026/docs/TECH_STACK.md) | [workflows.md](file:///c:/Coding/SIH2026/docs/workflows.md) | [PRD.md](file:///c:/Coding/SIH2026/docs/PRD.md) | [migration SQL](file:///c:/Coding/SIH2026/backend/supabase/migrations/20260829195824_compliance_schema.sql)*
