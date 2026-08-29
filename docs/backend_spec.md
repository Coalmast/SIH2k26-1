# All-in-One Backend Specification
## Service Architecture, APIs, Data Layer & AI Pipeline

**Platform:** Coal Operations Monitoring, Enforcement & Transparency
**Problem:** SIH 2026 — 26024 | Coal India Limited | Ministry of Coal
**References:** [json_schemas.md](file:///c:/Coding/SIH2026/json_schemas.md) · [LLD.md](file:///c:/Coding/SIH2026/LLD.md) · [frontend_spec.md](file:///c:/Coding/SIH2026/frontend_spec.md)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Service Catalog](#3-service-catalog)
4. [API Design — REST Endpoints](#4-api-design--rest-endpoints)
5. [API Design — GraphQL Federation](#5-api-design--graphql-federation)
6. [API Design — Sync Protocol (Mobile)](#6-api-design--sync-protocol-mobile)
7. [Event-Driven Architecture (Kafka)](#7-event-driven-architecture-kafka)
8. [Database Architecture](#8-database-architecture)
9. [OCR Ingestion Pipeline](#9-ocr-ingestion-pipeline)
10. [AI / Analytics Engine](#10-ai--analytics-engine)
11. [Notification & Alert System](#11-notification--alert-system)
12. [Authentication & RBAC](#12-authentication--rbac)
13. [Multi-Tenancy Strategy](#13-multi-tenancy-strategy)
14. [Media Storage & Management](#14-media-storage--management)
15. [GIS & Spatial Services](#15-gis--spatial-services)
16. [Report Generation Service](#16-report-generation-service)
17. [Audit Trail & Blockchain Anchoring](#17-audit-trail--blockchain-anchoring)
18. [DevOps & Infrastructure](#18-devops--infrastructure)
19. [Security Architecture](#19-security-architecture)
20. [Performance Targets & SLOs](#20-performance-targets--slos)

---

## 1. Architecture Overview

```
                         INTERNET / INTRANET
                               |
              +----------------+----------------+
              |                                 |
    +---------------------+          +---------------------+
    |  Web Dashboard      |          |  Mobile Field App   |
    |  (React 19 / Vite)  |          |  (React Native 0.85)|
    +---------------------+          +---------------------+
              |                                 |
              +----------------+----------------+
                               |
                    +----------+----------+
                    |  API Gateway        |
                    |  (Supabase / Kong)  |
                    |  - Rate limiting    |
                    |  - Auth validation  |
                    |  - Request routing  |
                    +----------+----------+
                               |
       +-----------+-----------+-----------+-----------+
       |           |           |           |           |
  +--------+  +--------+  +--------+  +--------+  +--------+
  | Comply |  | Inspect|  | Contrac|  | Environ|  | Notif  |
  | Service|  | Service|  | Service|  | Service|  | Service|
  +--------+  +--------+  +--------+  +--------+  +--------+
       |           |           |           |           |
       +-----------+-----------+-----------+-----------+
                               |
            +------------------+------------------+
            |                  |                  |
     +-------------+   +-------------+   +-------------+
     |  Supabase   |   |    Redis    |   |  Supabase  |
     |  PostgreSQL |   |  (Cache +   |   |  Storage   |
     |  + PostGIS  |   |  Pub/Sub)   |   |            |
     +-------------+   +-------------+   +-------------+
                               |
            +------------------+------------------+
            |                  |                  |
     +-------------+   +-------------+   +-------------+
     |  Supabase   |   |  AI/ML      |   |  Supabase  |
     |  Webhooks   |   |  FastAPI    |   |  Auth      |
     +-------------+   +-------------+   +-------------+
                               |
                    +----------+----------+
                    |  Sync Service       |
                    |  (WatermelonDB      |
                    |   pull/push API)    |
                    +--------------------+
```

### Architecture Style

- **Backend:** FastAPI modular monolith with domain-module boundaries that can be extracted to separate microservices without API contract changes. (Note: The rest of this document may refer to NestJS patterns, but structurally they map 1:1 to FastAPI APIRouters).
- **Primary communication:** REST (CRUD), GraphQL (via Supabase pg_graphql), Supabase Webhooks (async events between modules).
- **Data:** Supabase PostgreSQL with PostGIS, row-level security (RLS) per `mine_id` tenant column.
- **Offline Sync:** Dedicated `/sync/pull` and `/sync/push` endpoints implementing the WatermelonDB sync protocol.

---

## 2. Technology Stack

| Layer | Choice | Version | Purpose |
|-------|--------|---------|---------|
| Runtime | **Python** | 3.12 | Python runtime |
| Framework | **FastAPI** | v0.100+ | Modular, DI-based, async |
| Language | **Python** | 3.12 | Type hints |
| ORM | **SQLAlchemy** | 2.0 | Type-safe DB access, migration management |
| Primary DB | **Supabase PostgreSQL + PostGIS** | 15+ | Relational data + spatial queries |
| Cache | **Redis (Redis Stack)** | 7.x | API cache, SSE fan-out, job queues, pub/sub |
| Object Storage | **Supabase Storage** | Latest | Photos, PDFs, signed documents |
| Event Bus | **Supabase Webhooks / Background Tasks** | — | Async domain events |
| API Gateway | **Supabase / Kong OSS** | 3.x | Rate limiting, auth, routing, observability |
| Auth | **Supabase Auth (GoTrue)** | — | OIDC provider, JWT issuance, RLS roles |
| Search | **OpenSearch** | 2.x | Full-text search (grievances, violations) |
| Queue | **BullMQ** (Redis-backed) | 5.x | OCR jobs, PDF generation, email/SMS |
| AI/ML | **Python FastAPI** service | 3.12 | Risk scoring, anomaly detection |
| ML Models | **XGBoost + Scikit-learn** | — | Risk score computation |
| OCR | **Tesseract 5 + Google Cloud Vision** | — | Document digitization |
| STT | **Bhashini API + OpenAI Whisper** | — | Voice transcription |
| PDF Gen | **Puppeteer + Handlebars** | — | Statutory document rendering |
| Notifications | **FCM + AWS SNS (SMS)** | — | Mobile push + SMS |
| Observability | **OpenTelemetry + Grafana + Loki** | — | Tracing, metrics, logs |
| Container | **Docker + Kubernetes (K8s)** | — | Orchestration |
| CI/CD | **GitHub Actions + ArgoCD** | — | GitOps deployment |

---

## 3. Service Catalog

### 3.1 Core Domain Services (NestJS Modules)

| Service | NestJS Module | Primary Responsibility |
|---------|--------------|----------------------|
| **Compliance Service** | `ComplianceModule` | Compliance requirement library, instance lifecycle, evidence, approval workflow |
| **Inspection Service** | `InspectionModule` | Inspection scheduling, checklist templates, observation/violation capture, CAPA |
| **Contractor Service** | `ContractorModule` | Contractor onboarding, document management, trust score computation, worker registry |
| **Environment Service** | `EnvironmentModule` | EC condition tracking, sensor readings, threshold breach detection |
| **Production Service** | `ProductionModule` | Shift production logging, CCO Form I generation, anomaly detection trigger |
| **Accident Service** | `AccidentModule` | Incident/near-miss reporting, Form 4-A/4-B/4-C generation, DGMS notification |
| **Grievance Service** | `GrievanceModule` | Worker grievance intake, priority scoring, resolution SLA tracking |
| **Mine Service** | `MineModule` | Mine master data, geo-fence polygons, EC metadata, subsidiary hierarchy |
| **User Service** | `UserModule` | User accounts, role assignments, mine-scope mapping |
| **Notification Service** | `NotificationModule` | Alert creation, SSE fan-out, FCM/SMS dispatch, escalation scheduler |
| **OCR Service** | `OcrModule` | Document upload, Tesseract/Vision AI extraction, review queue management |
| **AI Service** | External Python FastAPI | Risk scoring, anomaly flagging, recurring cluster detection |
| **Report Service** | `ReportModule` | Statutory PDF generation, digital signing, submission history |
| **Sync Service** | `SyncModule` | WatermelonDB pull/push protocol, conflict resolution, geo-fence validation on push |
| **Audit Service** | `AuditModule` | Immutable audit trail, blockchain hash anchoring |

### 3.2 Infrastructure Services

| Service | Tool | Purpose |
|---------|------|---------|
| API Gateway | Kong OSS | Single ingress, rate limiting, JWT validation, route proxying |
| Auth Provider | Keycloak | OIDC, token issuance, role management |
| Job Queue | BullMQ (Redis) | Async jobs: OCR, PDF gen, email, SMS |
| Event Bus | Kafka | Cross-module async events |
| Search Index | OpenSearch | Grievance search, violation full-text |

---

## 4. API Design — REST Endpoints

All REST endpoints are prefixed with `/api/v1` and served through the API Gateway. Every request must carry a valid JWT Bearer token. Multi-tenancy is enforced by the `X-Mine-Id` header (validated against the JWT's `mine_ids` claim).

### 4.1 Compliance Service

```
GET    /compliance/requirements                    # List all compliance requirements (filterable: category, regulation)
POST   /compliance/requirements                    # [Admin] Create new requirement
GET    /compliance/mines/:mineId/instances         # List compliance instances for a mine (filter: status, category, month)
GET    /compliance/instances/:id                   # Single instance detail
POST   /compliance/instances/:id/submit            # Submit evidence (multipart form: files + metadata)
POST   /compliance/instances/:id/approve           # [Compliance Officer] Approve instance
POST   /compliance/instances/:id/reject            # [Compliance Officer] Reject with reason
GET    /compliance/mines/:mineId/health-score      # Current compliance health score (0-100)
GET    /compliance/mines/:mineId/calendar          # Month calendar view data (due items by date)
```

### 4.2 Inspection Service

```
GET    /inspections                                # List inspections (filter: mine, type, date range, status)
POST   /inspections                                # Schedule inspection (web-side)
GET    /inspections/:id                            # Inspection detail with all observations
DELETE /inspections/:id                            # [Admin] Soft-delete
POST   /inspections/:id/submit                     # Submit completed inspection (with digital signature)

GET    /inspections/:id/observations               # All observations for an inspection
POST   /inspections/:id/observations               # Add observation (from web or sync push)

GET    /violations                                 # List violations (filter: mine, status, severity)
GET    /violations/:id                             # Violation detail
POST   /violations/:id/assign-capa                 # Assign corrective action
POST   /violations/:id/close                       # Close violation (with evidence upload)

GET    /corrective-actions/:id                     # CAPA detail
PATCH  /corrective-actions/:id                     # Update CAPA status / add progress notes
POST   /corrective-actions/:id/complete            # Mark CAPA complete (with evidence)

GET    /checklists/templates                       # [Admin] List inspection checklist templates
POST   /checklists/templates                       # [Admin] Create template
```

### 4.3 Contractor Service

```
GET    /contractors                                # List contractors (filter: status, mine, trust_score_range)
POST   /contractors                                # Onboard new contractor
GET    /contractors/:id                            # Contractor profile
PATCH  /contractors/:id                            # Update contractor details
POST   /contractors/:id/suspend                    # Suspend contractor
POST   /contractors/:id/blacklist                  # Blacklist contractor

GET    /contractors/:id/documents                  # List contractor documents
POST   /contractors/:id/documents                  # Upload document (multipart — triggers OCR for licenses)
DELETE /contractors/:id/documents/:docId           # Remove document

GET    /contractors/:id/workers                    # List contract workers
POST   /contractors/:id/workers                    # Add worker
PATCH  /contractors/:id/workers/:workerId          # Update worker details

GET    /contractors/:id/trust-score                # Current trust score with breakdown
GET    /contractors/expiring-documents             # [Mine Manager] All docs expiring in next 30d
```

### 4.4 Environment Service

```
GET    /environment/mines/:mineId/conditions       # All EC conditions for a mine
GET    /environment/mines/:mineId/readings         # Sensor readings (filter: station, parameter, date range)
POST   /environment/mines/:mineId/readings         # Submit manual reading
GET    /environment/mines/:mineId/status           # Aggregated environmental status (per condition)
GET    /environment/stations                       # List monitoring stations for a mine
POST   /environment/stations                       # [Admin] Add monitoring station
PATCH  /environment/stations/:id                   # Update station details
GET    /environment/mines/:mineId/breach-history   # EC breach events (filterable date range)
```

### 4.5 Production Service

```
GET    /production/mines/:mineId/readings          # Production readings (filter: date, shift)
POST   /production/mines/:mineId/readings          # Submit shift production data
GET    /production/mines/:mineId/targets           # Monthly production targets
POST   /production/mines/:mineId/targets           # [Admin] Set monthly target
GET    /production/mines/:mineId/anomalies         # AI-flagged production anomalies
```

### 4.6 Accident Service

```
GET    /accidents/mines/:mineId                    # List accident/incident records
POST   /accidents/mines/:mineId                    # File new accident/incident report
GET    /accidents/:id                              # Accident record detail
PATCH  /accidents/:id                              # Update record (investigation progress)
POST   /accidents/:id/persons                      # Add affected person to record
PATCH  /accidents/:id/persons/:personId            # Update person details (injury outcome)
POST   /accidents/:id/notify-dgms                  # Trigger DGMS notification (Form 4-A)
GET    /accidents/:id/forms/4a                     # Generate Form 4-A PDF
GET    /accidents/:id/forms/4b                     # Generate Form 4-B PDF
GET    /accidents/:id/forms/4c                     # Generate Form 4-C PDF
```

### 4.7 Mine Service

```
GET    /mines                                      # List all mines (scoped by JWT)
POST   /mines                                      # [Admin] Onboard new mine
GET    /mines/:id                                  # Mine detail (EC metadata, geo-fence, hierarchy)
PATCH  /mines/:id                                  # [Admin] Update mine details
GET    /mines/:id/zones                            # Named inspection zones for a mine
POST   /mines/:id/zones                            # [Admin] Create zone
GET    /subsidiaries                               # List subsidiaries
GET    /subsidiaries/:id/mines                     # All mines under a subsidiary
```

### 4.8 Grievance Service

```
GET    /grievances                                 # List grievances (filter: mine, status, category, priority)
POST   /grievances                                 # File new grievance
GET    /grievances/:id                             # Grievance detail
PATCH  /grievances/:id                             # Update status / add notes
POST   /grievances/:id/escalate                    # Escalate to next authority
POST   /grievances/:id/resolve                     # Mark resolved with outcome
```

### 4.9 Notification Service (REST + SSE)

```
GET    /notifications                              # List notifications for authenticated user
PATCH  /notifications/:id/acknowledge             # Acknowledge an alert
GET    /notifications/stream                       # SSE endpoint — keep-alive event stream
       ?mineId=xxx                                  # (or subsidiaryId for corporate)
POST   /notifications/preferences                  # Update user notification preferences
```

### 4.10 OCR Service

```
POST   /ocr/upload                                 # Upload document for digitization (multipart)
GET    /ocr/queue                                  # List review queue items (filter: confidence, category)
GET    /ocr/queue/:id                              # Review queue item detail with extracted fields
POST   /ocr/queue/:id/approve                      # Approve extracted data — writes to target entity
POST   /ocr/queue/:id/reject                       # Reject extraction — re-queue for rescan
PATCH  /ocr/queue/:id/fields                       # Update individual extracted field before approval
```

### 4.11 Report Service

```
POST   /reports/generate                           # Trigger statutory report generation
       body: { type, mineId, period_start, period_end }
GET    /reports/jobs/:jobId                        # Poll generation job status
GET    /reports/:id/download                       # Download generated PDF
GET    /reports/history                            # Submission history for a mine
POST   /reports/:id/sign                           # Digitally sign a generated report
POST   /reports/:id/submit                         # Mark as submitted to authority
```

### 4.12 Attendance / Shift Service

```
POST   /attendance                                 # Submit attendance batch (from sync push)
GET    /attendance/mines/:mineId                   # Attendance records (filter: date, shift)
GET    /attendance/mines/:mineId/summary           # Shift-wise headcount summary

POST   /overman-reports                            # Submit overman shift report
GET    /overman-reports/mines/:mineId              # List reports (filter: date, shift, zone)
GET    /overman-reports/:id                        # Report detail
```

---

## 5. API Design — GraphQL Federation

GraphQL is used exclusively for **dashboard composition** queries — aggregating data across multiple domain services in a single round trip. The Apollo Federation gateway assembles subgraphs from domain services.

### 5.1 Federation Gateway

```
Apollo Federation Gateway (/graphql)
  +-- Compliance Subgraph  (compliance-service/graphql)
  +-- Inspection Subgraph  (inspection-service/graphql)
  +-- Environment Subgraph (environment-service/graphql)
  +-- Production Subgraph  (production-service/graphql)
  +-- AI Risk Subgraph     (ai-service/graphql)
  +-- Mine Subgraph        (mine-service/graphql)
```

### 5.2 Key Query Types

```graphql
# Mine Manager dashboard — single query, composed from 5 subgraphs
query DashboardSummary($mineId: ID!) {
  mine(id: $mineId) {
    id
    name
    subsidiary { name }
    riskScore {
      score
      trend
      category
    }
    complianceHealth {
      score
      momChange
      overdueCount
      upcomingDueItems(days: 7) { id title dueDate category }
    }
    openViolations(severity: [HIGH, CRITICAL]) {
      id description statute severity zone
    }
    environmentalStatus {
      overallStatus
      breachedConditions { conditionNumber parameter currentValue limit }
      latestReadings { parameter value recordedAt stationName }
    }
    productionToday {
      targetMT
      actualMT
      shiftBreakdown { shift quantityMT }
    }
    contractorSummary {
      score
      expiringDocumentsCount
    }
  }
}

# Corporate rollup — Redis-cached, assembled from materialized view
query SubsidiaryOverview($subsidiaryId: ID!) {
  subsidiary(id: $subsidiaryId) {
    id
    name
    mineCount
    mines {
      id name riskScore { score trend } complianceHealth { score }
    }
    aggregates {
      totalProductionMT
      criticalViolationCount
      environmentalBreachCount
    }
  }
}
```

---

## 6. API Design — Sync Protocol (Mobile)

The sync protocol follows the WatermelonDB synchronization model. Two endpoints handle all mobile offline data reconciliation.

### 6.1 Pull Endpoint — Server to Client

```
POST /sync/pull
Body: { lastPulledAt: number | null }
Headers: Authorization: Bearer {token}, X-Mine-Id: {mineId}

Response:
{
  "changes": {
    "compliance_instances": {
      "created":  [...],   # new instances assigned since lastPulledAt
      "updated":  [...],   # status changes since lastPulledAt
      "deleted":  []       # soft-deletes (rare)
    },
    "violations": { "created": [...], "updated": [...], "deleted": [] },
    "corrective_actions": { "created": [...], "updated": [...], "deleted": [] },
    "checklist_templates": { "created": [...], "updated": [...], "deleted": [] }
  },
  "timestamp": 1724760000000   # server timestamp for next pull
}
```

### 6.2 Push Endpoint — Client to Server

```
POST /sync/push
Body: {
  "changes": {
    "inspections": {
      "created": [{ local_id, mine_id, inspection_type, geo_lat, geo_lng, ... }],
      "updated": [],
      "deleted": []
    },
    "observations": { "created": [...], "updated": [], "deleted": [] },
    "attendance_records": { "created": [...], "updated": [], "deleted": [] },
    "incidents": { "created": [...], "updated": [], "deleted": [] },
    "safety_observations": { "created": [...], "updated": [], "deleted": [] },
    "overman_reports": { "created": [...], "updated": [], "deleted": [] }
  }
}

Processing (Sync Service):
  1. Validate JWT + mine_id scope for every record
  2. Run Zod schema validation (same schemas as frontend)
  3. Geo-fence validation for each record with coordinates (PostGIS ST_Contains)
  4. Set location_mismatch = true if outside boundary (do NOT reject)
  5. Insert/update records in PostgreSQL
  6. Emit Kafka events for significant records (IncidentPushed, AttendancePushed)
  7. Return: { serverIds: { [localId]: serverAssignedId }, conflicts: [...] }
```

### 6.3 Media Upload (Decoupled from Sync)

```
POST /media/upload-url
Body: { filename, contentType, entityType, entityLocalId }
Response: { uploadUrl, fileKey }   # pre-signed MinIO URL (15 min TTL)

Client: PUT {uploadUrl} (direct upload to MinIO, bypasses API gateway)

POST /media/confirm
Body: { fileKey, entityType, entityId, capturedAt, geostamp }
Response: { mediaAttachmentId, fileUrl }
```

---

## 7. Event-Driven Architecture (Kafka)

All significant domain transitions emit Kafka events. Services subscribe to relevant topics and react asynchronously. This decouples modules and enables reliable escalation, AI scoring, and notification delivery.

### 7.1 Topic Catalog

| Topic | Producer | Consumers | Schema |
|-------|---------|-----------|--------|
| `inspection.submitted` | Inspection Service | Notification, AI, Audit | `inspection_id`, `mine_id`, `violation_count` |
| `violation.created` | Inspection Service | Notification, AI, CAPA Scheduler | `violation_id`, `severity`, `statute` |
| `capa.assigned` | Inspection Service | Notification Service | `capa_id`, `assignee_id`, `due_date` |
| `capa.overdue` | CAPA Scheduler (cron) | Notification, Escalation | `capa_id`, `days_overdue`, `mine_id` |
| `capa.closed` | Inspection Service | Notification, AI | `capa_id`, `closed_at` |
| `compliance.instance.overdue` | Compliance Scheduler | Notification, Escalation | `instance_id`, `days_overdue` |
| `compliance.evidence.submitted` | Compliance Service | OCR Service, Audit | `instance_id`, `file_key` |
| `environment.breach.detected` | Environment Service | Notification, AI | `reading_id`, `condition_id`, `value`, `limit` |
| `incident.reported` | Sync Service / Accident Service | Notification, Audit, AI | `incident_id`, `severity`, `mine_id` |
| `contractor.doc.expiring` | Contractor Scheduler | Notification Service | `contractor_id`, `doc_type`, `days_to_expiry` |
| `attendance.pushed` | Sync Service | Production Service (headcount) | `mine_id`, `shift`, `date`, `headcount` |
| `ocr.extraction.complete` | OCR Service | Compliance/Contractor (auto-apply) | `queue_item_id`, `confidence_min` |
| `mine.risk.recalculated` | AI Service | Notification (if score worsens sharply) | `mine_id`, `score`, `prev_score` |
| `audit.event` | All services | Audit Service | `entity_type`, `entity_id`, `action`, `actor_id` |

### 7.2 Kafka Setup

```
Bootstrap servers: kafka:9092
Replication factor: 3 (production) / 1 (dev)
Retention: 30 days
Consumer groups (one per service):
  notification-service-group
  ai-service-group
  audit-service-group
  capa-scheduler-group
  escalation-service-group
```

### 7.3 CAPA Escalation Scheduler

```typescript
// Runs every 15 minutes via BullMQ repeatable job
async function checkOverdueCAPAs() {
  const overdue = await prisma.correctiveAction.findMany({
    where: {
      status: { in: ["assigned", "in_progress"] },
      due_date: { lt: new Date() },
    },
    include: { violation: { include: { mine: true } } },
  });

  for (const capa of overdue) {
    const daysOverdue = daysBetween(capa.due_date, new Date());
    if (daysOverdue >= 1)  emitKafka("capa.overdue", { ...capa, days_overdue: daysOverdue });
    if (daysOverdue >= 3)  escalateToMineManager(capa);
    if (daysOverdue >= 7)  escalateToSubsidiaryHead(capa);
    if (daysOverdue >= 14) setRegulatorVisibleFlag(capa);
  }
}
```

---

## 8. Database Architecture

### 8.1 Primary Schema (PostgreSQL + PostGIS)

All tables carry a `mine_id` foreign key. Row-Level Security policies on PostgreSQL enforce tenant isolation at the DB level as a defense-in-depth measure.

```sql
-- Core organizational hierarchy
CREATE TABLE subsidiaries   (id UUID PK, name, coal_india_code, ...);
CREATE TABLE mines          (id UUID PK, subsidiary_id FK, name, latitude, longitude,
                             boundary_geojson GEOMETRY(POLYGON,4326),
                             ec_number, ec_validity_end, ...);
CREATE TABLE mine_zones     (id UUID PK, mine_id FK, name, boundary_geojson GEOMETRY);

-- User & Access
CREATE TABLE users          (id UUID PK, email, keycloak_id, name, language_pref, ...);
CREATE TABLE user_mine_roles(id UUID PK, user_id FK, mine_id FK, role AppRole,
                             is_active BOOL DEFAULT TRUE);

-- Compliance domain
CREATE TABLE regulations             (id UUID PK, code, title, category, authority, ...);
CREATE TABLE compliance_requirements (id UUID PK, regulation_id FK, title, category,
                                      frequency, grace_period_days, ...);
CREATE TABLE compliance_instances    (id UUID PK, mine_id FK, requirement_id FK,
                                      status, period_start, period_end, due_date,
                                      assigned_to FK, ...);
CREATE TABLE compliance_evidences    (id UUID PK, instance_id FK, file_key, file_type,
                                      ocr_status, uploaded_by FK, uploaded_at, ...);

-- Inspection domain
CREATE TABLE inspections             (id UUID PK, mine_id FK, zone_id FK,
                                      inspection_type, status,
                                      conducted_by FK, geo_lat, geo_lng, geo_accuracy_m,
                                      started_at, submitted_at, sync_source, ...);
CREATE TABLE inspection_observations (id UUID PK, inspection_id FK, checklist_item_id FK,
                                      result, severity, description,
                                      geo_lat, geo_lng, captured_at, ...);
CREATE TABLE violations              (id UUID PK, observation_id FK, mine_id FK,
                                      statute_reference, severity, status,
                                      reported_by FK, regulator_visible BOOL, ...);
CREATE TABLE corrective_actions      (id UUID PK, violation_id FK, assigned_to FK,
                                      description, due_date, status,
                                      completion_evidence_key, completed_at, ...);

-- Accident / Incident domain
CREATE TABLE accident_records        (id UUID PK, mine_id FK, occurrence_type,
                                      severity, date_of_occurrence, shift,
                                      location_in_mine TEXT, description TEXT,
                                      dgms_notification_status, ...);
CREATE TABLE persons_affected        (id UUID PK, accident_id FK, name, employee_type,
                                      contractor_id FK, nature_of_injury, outcome, ...);

-- Contractor domain
CREATE TABLE contractors             (id UUID PK, name, pan, gst, clra_number,
                                      status, trust_score INT, ...);
CREATE TABLE contractor_documents    (id UUID PK, contractor_id FK, doc_type,
                                      file_key, valid_from, valid_until, ocr_verified, ...);
CREATE TABLE contract_workers        (id UUID PK, contractor_id FK, name, id_card_number,
                                      esi_number, training_cert_key, cert_valid_until, ...);
CREATE TABLE contractor_assignments  (id UUID PK, contractor_id FK, mine_id FK,
                                      scope_of_work, start_date, end_date, worker_count, ...);

-- Environment domain
CREATE TABLE monitoring_stations     (id UUID PK, mine_id FK, name,
                                      station_type, geo_lat, geo_lng, ...);
CREATE TABLE ec_conditions           (id UUID PK, mine_id FK, condition_number,
                                      parameter, prescribed_limit, unit, measurement_point, ...);
CREATE TABLE environment_readings    (id UUID PK, mine_id FK, station_id FK, condition_id FK,
                                      parameter, value, unit, threshold_breached BOOL,
                                      source, recorded_at, recorded_by FK, ...);

-- Production domain
CREATE TABLE production_targets      (id UUID PK, mine_id FK, month, target_mt, coal_grade, ...);
CREATE TABLE production_readings     (id UUID PK, mine_id FK, shift, date,
                                      quantity_mt, coal_grade, equipment_deployed,
                                      workforce_count, recorded_by FK, ...);

-- Overman Reports
CREATE TABLE overman_reports         (id UUID PK, mine_id FK, zone_id FK,
                                      shift, date, reported_by FK,
                                      manpower_deployed INT, handover_notes TEXT, ...);
CREATE TABLE gas_readings            (id UUID PK, report_id FK, station_label,
                                      ch4_percent, co_ppm, co2_percent, recorded_at, ...);

-- Attendance domain
CREATE TABLE attendance_records      (id UUID PK, mine_id FK, worker_id FK,
                                      worker_type, contractor_id FK, shift, date,
                                      check_in_at, geo_lat, geo_lng,
                                      location_mismatch BOOL DEFAULT FALSE,
                                      captured_by FK, ...);

-- Grievance domain
CREATE TABLE grievances              (id UUID PK, mine_id FK, category, description,
                                      is_anonymous BOOL, status, ai_priority_score,
                                      assigned_to FK, sla_due_date, resolved_at, ...);

-- AI Analytics
CREATE TABLE mine_risk_scores        (id UUID PK, mine_id FK, score INT, category TEXT,
                                      trend TEXT, computed_at, contributing_factors JSONB, ...);
CREATE TABLE anomaly_flags           (id UUID PK, mine_id FK, flag_type, description,
                                      severity, acknowledged BOOL, flagged_at, ...);
CREATE TABLE recurring_violation_clusters (id UUID PK, mine_id FK, statute,
                                      zone_id FK, occurrence_count, first_seen, last_seen,
                                      is_systemic BOOL DEFAULT FALSE, ...);

-- OCR / Document
CREATE TABLE document_uploads        (id UUID PK, mine_id FK, category, file_key,
                                      linked_entity_type, linked_entity_id,
                                      status, uploaded_by FK, ...);
CREATE TABLE ocr_extraction_results  (id UUID PK, upload_id FK,
                                      extracted_fields JSONB, confidence_scores JSONB,
                                      min_confidence FLOAT, reviewed_by FK, ...);

-- Audit
CREATE TABLE audit_trail             (id UUID PK, entity_type, entity_id,
                                      action, actor_id FK, mine_id, old_value JSONB,
                                      new_value JSONB, occurred_at TIMESTAMPTZ,
                                      blockchain_hash TEXT, ...);

-- Notifications
CREATE TABLE alerts                  (id UUID PK, mine_id FK, alert_type, priority,
                                      title, body, related_entity_type, related_entity_id,
                                      acknowledged_by FK, acknowledged_at, ...);
```

### 8.2 Indexes — Critical Performance Indexes

```sql
-- Tenant scoping (all high-traffic queries)
CREATE INDEX idx_inspections_mine_id ON inspections(mine_id);
CREATE INDEX idx_compliance_instances_mine_due ON compliance_instances(mine_id, due_date, status);
CREATE INDEX idx_violations_mine_status ON violations(mine_id, status, severity);
CREATE INDEX idx_environment_readings_mine_param_time ON environment_readings(mine_id, parameter, recorded_at DESC);
CREATE INDEX idx_attendance_mine_shift_date ON attendance_records(mine_id, shift, date);
CREATE INDEX idx_alerts_mine_priority ON alerts(mine_id, priority, acknowledged_at);

-- Spatial — geo-fence queries
CREATE INDEX idx_mines_boundary ON mines USING GIST(boundary_geojson);
CREATE INDEX idx_mine_zones_boundary ON mine_zones USING GIST(boundary_geojson);

-- AI scoring lookups
CREATE INDEX idx_risk_scores_mine_time ON mine_risk_scores(mine_id, computed_at DESC);

-- Sync protocol (pull changes since timestamp)
CREATE INDEX idx_inspections_updated_at ON inspections(mine_id, updated_at);
CREATE INDEX idx_violations_updated_at ON violations(mine_id, updated_at);
```

### 8.3 Redis Usage

| Key Pattern | TTL | Purpose |
|-------------|-----|---------|
| `dashboard:mine:{mineId}` | 60s | Mine manager dashboard GraphQL query cache |
| `dashboard:subsidiary:{subId}` | 300s | Corporate rollup cache (5 min) |
| `risk:mine:{mineId}` | 3600s | Latest risk score (1 hr — recomputed by AI Service) |
| `compliance:health:{mineId}` | 300s | Compliance health score |
| `sse:channel:mine:{mineId}` | — | Redis Pub/Sub channel for SSE fan-out |
| `session:{userId}` | 86400s | Refresh token metadata for quick validation |
| `ocr:job:{jobId}` | 3600s | OCR job status (BullMQ backing store) |

---

## 9. OCR Ingestion Pipeline

```
User uploads document (PDF/JPG/PNG)
  -> POST /ocr/upload (multipart)
  -> API Gateway -> OCR Service
  -> File saved to MinIO (raw/uploads/{uuid}.pdf)
  -> document_upload record created (status: "queued")
  -> BullMQ job enqueued: { uploadId, fileKey, category }

BullMQ worker picks up job:
  1. Download file from MinIO
  2. If PDF: convert first page to PNG (Ghostscript)
  3. Run Tesseract 5 (regional language models: HIN, BEN, ORI, ENG)
  4. If confidence avg < 70%: re-run with Google Cloud Vision API
  5. Parse raw OCR output -> field extraction by category:
     - "contractor_license"  -> { clra_number, valid_until, issued_by }
     - "accident_register"   -> { mine_name, date, shift, nature, victim_name }
     - "dgms_memo"           -> { inspection_id, regulation, observation }
  6. Compute per-field confidence score (0.0 - 1.0)
  7. Save to ocr_extraction_results
  8. Emit Kafka: "ocr.extraction.complete" { uploadId, minConfidence }

Kafka consumer (Compliance/Contractor Service):
  - If minConfidence >= 0.85 AND category is known:
    -> Auto-apply extracted data to target entity (no human review needed)
  - If minConfidence < 0.85 OR low-confidence fields present:
    -> Set status = "review_required"
    -> Push alert to assigned compliance officer

Human review (web OCR Review screen):
  -> Side-by-side view: scanned doc + extracted fields
  -> Officer corrects low-confidence fields
  -> POST /ocr/queue/:id/approve
  -> OCR Service writes corrected data to target entity
```

### Supported Document Categories & Field Mappings

| Category Enum | Target Entity | Key Extracted Fields |
|---------------|--------------|---------------------|
| `contractor_license` | `contractor_documents` | CLRA number, valid_until, authority |
| `accident_register` | `accident_records` | date, shift, nature, location, victim names |
| `dgms_inspection_memo` | `inspections` (linked) | inspection_date, observations, statute references |
| `environmental_report` | `environment_readings` | parameter values, station, date, signatory |
| `production_return` | `production_readings` | shift, quantity_MT, date, grade |
| `safety_comm_minutes` | `compliance_evidences` (linked) | meeting_date, attendees, resolutions |
| `legacy_register` | `document_uploads` (archive) | Raw extraction, no auto-apply |

---

## 10. AI / Analytics Engine

### 10.1 Architecture

The AI engine is a **separate Python FastAPI service** (`ai-service`) that exposes a REST API. The NestJS services call it for on-demand scoring and receive Kafka events for proactive anomaly detection.

```
NestJS Services
  |
  | REST: POST /ai/score/mine/{mineId}
  | REST: GET  /ai/anomalies/{mineId}
  |
  v
Python FastAPI (ai-service:8001)
  |
  +-- Risk Score Model (XGBoost)
  +-- Anomaly Detection (Isolation Forest)
  +-- Recurring Violation Cluster (DBSCAN / frequency analysis)
  +-- NLP: Incident classification, grievance priority (TF-IDF + LightGBM)
  +-- Environmental Forecast (ARIMA / Prophet time-series)
  |
  v
PostgreSQL (read replica) + Redis (feature cache)
```

### 10.2 Mine Risk Score Computation

**Trigger:** Recomputed every 6 hours via BullMQ cron, or on-demand when `violation.created` / `environment.breach.detected` Kafka events arrive.

**Input Features (from PostgreSQL):**

```python
features = {
    # Safety signals
    "violation_count_90d":         count of violations in last 90 days,
    "violation_critical_count_90d": count of CRITICAL violations,
    "capa_avg_closure_days":       avg days to close CAPA (last 12 months),
    "capa_overdue_count":          currently overdue CAPAs,
    "inspection_frequency_score":  inspections per month vs expected,

    # Environment signals
    "env_breach_count_30d":        EC condition breaches in last 30 days,
    "breach_recurrence_flag":      same condition breached > 2x in 30d (bool),

    # Production signals
    "production_pressure_index":   actual/target ratio (higher = more pressure),

    # Labour signals
    "contractor_compliance_pct":   % contractors with all-valid docs,
    "grievance_open_count":        unresolved grievances > 7 days,

    # Historical risk
    "fatal_accident_36m_flag":     fatal accident in last 3 years (bool),
    "dgms_adverse_inspection_flag": DGMS adverse finding in last 12 months (bool),
}
```

**Output:**

```json
{
  "mine_id": "...",
  "score": 67,
  "category": "MEDIUM",
  "trend": "WORSENING",
  "contributing_factors": [
    { "feature": "violation_count_90d", "weight": 0.34, "value": 12, "comparison": "3x avg" },
    { "feature": "capa_avg_closure_days", "weight": 0.28, "value": 9.2, "comparison": "vs 7 target" }
  ],
  "computed_at": "2027-08-27T18:00:00Z"
}
```

### 10.3 Recurring Violation Cluster Detection

```python
# Runs weekly per mine
# Groups violations by (zone_id, statute_reference) over 18-month window
# Flags as recurring if same (zone + statute) appears >= 3 times

def detect_recurring_clusters(mine_id: str) -> List[ViolationCluster]:
    violations = query_violations_18m(mine_id)
    groups = groupby(violations, key=lambda v: (v.zone_id, v.statute_reference))
    clusters = []
    for key, items in groups:
        if len(items) >= 3:
            clusters.append(ViolationCluster(
                zone_id=key[0],
                statute=key[1],
                occurrence_count=len(items),
                first_seen=min(v.created_at for v in items),
                last_seen=max(v.created_at for v in items),
                is_systemic=len(items) >= 5,
            ))
    return clusters
```

### 10.4 Incident Classification (NLP)

On incident/near-miss report submission:
1. Extract `description` + `incident_type` from the submission
2. Run text through pre-trained TF-IDF + LightGBM multi-class classifier
3. Returns `predicted_category` + `suggested_severity`
4. Mobile app displays suggestion; officer can accept or override
5. Over time, officer corrections used as labeled training data for model refinement

### 10.5 Environmental Forecast (ARIMA / Prophet)

```python
# Runs every hour per CAAQMS station
def forecast_pm10(station_id: str, horizon_hours: int = 8) -> Forecast:
    readings = get_readings_72h(station_id, parameter="PM10")
    model = Prophet(seasonality_mode="multiplicative")
    model.fit(readings_to_df(readings))
    future = model.make_future_dataframe(periods=horizon_hours, freq="H")
    forecast = model.predict(future)
    return Forecast(
        station_id=station_id,
        predicted_values=forecast.tail(horizon_hours)[["ds", "yhat", "yhat_lower", "yhat_upper"]],
        breach_risk=any(v > EC_LIMIT_PM10 for v in forecast["yhat"].tail(horizon_hours)),
    )
```

### 10.6 Contractor Trust Score

```python
# Recomputed on: doc upload, doc expiry event, violation linked, CAPA closed
def compute_trust_score(contractor_id: str) -> int:
    doc_score   = 40 * docs_validity_ratio(contractor_id)   # 0-40
    safety_score = 30 * (1 - violation_penalty(contractor_id)) # 0-30
    capa_score  = 20 * capa_closure_rate(contractor_id)     # 0-20
    billing_score = 10 * (1 - billing_anomaly_flag(contractor_id)) # 0-10
    return round(doc_score + safety_score + capa_score + billing_score)
```

---

## 11. Notification & Alert System

### 11.1 Alert Creation Flow

```
Domain Service emits Kafka event (e.g. "environment.breach.detected")
  |
Notification Service (Kafka consumer)
  |
  1. Determine priority (CRITICAL / HIGH / MEDIUM / LOW) from event data
  2. Determine target recipients (mine_id -> user roles -> user_ids)
  3. INSERT into alerts table
  4. Redis PUBLISH to "sse:channel:mine:{mineId}"
  5. Enqueue FCM job in BullMQ (if priority >= MEDIUM)
  6. Enqueue SMS job in BullMQ (if priority = CRITICAL or HIGH+compliance_overdue)
```

### 11.2 SSE Fan-Out

```typescript
// notification.controller.ts
@Get("stream")
@Sse()
async stream(@Query("mineId") mineId: string, @Req() req: Request): Observable<MessageEvent> {
  const channel = `sse:channel:mine:${mineId}`;
  return this.redisService.subscribe(channel).pipe(
    map(message => ({ data: JSON.parse(message) })),
    takeUntil(fromEvent(req, "close")),  // cleanup on client disconnect
  );
}
```

### 11.3 Escalation Ladder (Per Compliance Instance)

| Threshold | Action |
|-----------|--------|
| T-7 days before due | Notify assigned compliance officer via FCM |
| T-3 days before due | Notify Mine Manager via FCM + email |
| Due date passed (T+0) | Mark OVERDUE; notify Mine Manager + Subsidiary Admin |
| T+7 days overdue | Notify Subsidiary Head; set `regulator_visible = true` |
| T+14 days overdue | System Alert to regulatory authority contact |

### 11.4 Gas Reading Alert (Critical Safety)

```typescript
// Handled synchronously in Overman Report submission — NOT via Kafka
// (immediate safety alert, no async delay tolerated)
async function checkGasReadings(report: OvermanReport) {
  for (const reading of report.gas_readings) {
    if (reading.ch4_percent > 1.25) {
      // IMMEDIATE alert — no queue
      await fcmService.sendCritical(mineManager.fcmToken, {
        title: "CRITICAL: High CH4 Level",
        body: `CH4 at ${reading.ch4_percent}% in ${reading.station_label}. Evacuate if >1.5%`,
      });
      await smsService.send(mineManager.phone, urgentSmsBody);
    }
    if (reading.ch4_percent > 1.5) {
      await triggerEmergencyEscalation(report.mine_id);
    }
  }
}
```

---

## 12. Authentication & RBAC

### 12.1 Keycloak Configuration

```
Realm: prod
Clients:
  web-dashboard   (public, PKCE, redirect_uris: https://dashboard.gov.in/*)
  mobile-app      (public, PKCE, redirect_uris: //auth/callback)
  regulator-portal (public, PKCE, redirect_uris: https://regulator.gov.in/*)
  backend-services (confidential, client_credentials for service-to-service)

Realm Roles:
  field_officer, mine_manager, safety_officer, environmental_officer,
  compliance_officer, contractor_manager, subsidiary_admin,
  corporate_executive, regulator, system_admin

Custom JWT Claims:
  mine_ids: [uuid, ...]       # mines the user is scoped to
  subsidiary_id: uuid         # for corporate/subsidiary admins
  permissions: [              # fine-grained permission list
    "compliance:read",
    "compliance:submit_evidence",
    "inspection:create",
    ...
  ]
```

### 12.2 NestJS RBAC Guards

```typescript
// Decorator-based permission check on each route handler
@Controller("violations")
export class ViolationController {

  @Post(":id/assign-capa")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("mine_manager", "safety_officer", "compliance_officer")
  @Permissions("violation:assign_capa")
  async assignCapa(@Param("id") id: string, @Body() dto: AssignCapaDto) {
    return this.violationService.assignCapa(id, dto);
  }
}
```

### 12.3 Row-Level Security (PostgreSQL)

```sql
-- RLS policy — enforced at DB level as defense-in-depth
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY inspections_mine_scope ON inspections
  USING (mine_id = ANY(
    string_to_array(current_setting('app.current_mine_ids', true), ',')::uuid[]
  ));
```

NestJS sets the session variable before every query:
```typescript
await prisma.$executeRaw`SET app.current_mine_ids = ${mineIds.join(',')}`;
```

---

## 13. Multi-Tenancy Strategy

### Hierarchy

```
Coal India Limited (national)
  +-- Subsidiary (ECL, BCCL, CCL, MCL, NCL, SECL, WCL, NEC)
      +-- Mine (individual colliery)
          +-- Zone (inspection areas within mine)
```

### Tenancy Isolation Rules

| Level | Isolation Method |
|-------|-----------------|
| Data isolation | `mine_id` column + PostgreSQL RLS |
| API scope | `X-Mine-Id` header validated against JWT `mine_ids` |
| Corporate queries | `subsidiary_id` in JWT — see all child mines |
| Regulator queries | `jurisdiction_mine_ids` claim — cross-subsidiary, read-only |
| System Admin | No mine_id restriction — full access |

### Cross-Mine Aggregation

Corporate dashboard and AI analytics require cross-mine data. Handled by:
1. **GraphQL Federation:** Gateway assembles subgraph queries per authorized mine set
2. **Materialized Views:** PostgreSQL materialized views per subsidiary (refreshed every 5 min), cached in Redis for 5 minutes
3. **AI Service:** Reads from PostgreSQL read replica across all mines (system-level service account, no RLS)

---

## 14. Media Storage & Management

### 14.1 MinIO Bucket Structure

```
media/
  raw/
    uploads/           # OCR source documents (original scans)
    temp/              # Transient files (cleared after 24h)
  processed/
    inspections/
      {mine_id}/
        {inspection_id}/
          photos/      # Observation photos
          voice/       # Voice note MP3s (transcribed)
    reports/
      {mine_id}/       # Generated statutory PDFs
    contractors/
      {contractor_id}/ # License/cert scans
    compliance/
      {instance_id}/   # Evidence documents
```

### 14.2 Access Control

- All MinIO buckets are **private** — no public access
- File access via pre-signed URLs (15 min TTL for reading, 15 min for upload)
- Backend generates pre-signed URL; client uploads/downloads directly to MinIO
- File keys stored in DB — never URLs (URLs regenerated on each access)

### 14.3 Media Lifecycle

```
Photo captured (mobile) -> local filesystem
  -> sync: POST /media/upload-url -> pre-signed PUT URL
  -> PUT directly to MinIO
  -> POST /media/confirm -> creates media_attachment record
  -> MinIO trigger: process thumbnails (via MinIO event -> BullMQ)
  -> Thumbnail stored at processed/inspections/.../photos/{id}_thumb.jpg

Retention policy:
  - Statutory records (accidents, inspections, compliance): PERMANENT (never delete)
  - Temp OCR uploads: 30 days if approved, 7 days if rejected
  - Voice notes: 5 years
```

---

## 15. GIS & Spatial Services

### 15.1 PostGIS Queries

```sql
-- Geo-fence check (called by Sync Service on every pushed record with coordinates)
SELECT
  m.id,
  ST_Contains(
    m.boundary_geojson::geometry,
    ST_SetSRID(ST_Point($lng, $lat), 4326)
  ) AS within_boundary,
  ST_Distance(
    m.boundary_geojson::geometry,
    ST_SetSRID(ST_Point($lng, $lat), 4326)
  ) * 111320 AS distance_from_boundary_m
FROM mines m
WHERE m.id = $mine_id;

-- Incident heatmap data (for deck.gl HeatmapLayer)
SELECT
  i.geo_lat, i.geo_lng,
  COUNT(*) AS weight
FROM inspection_observations i
JOIN violations v ON v.observation_id = i.id
WHERE i.mine_id = $mine_id
  AND i.captured_at > NOW() - INTERVAL '6 months'
GROUP BY i.geo_lat, i.geo_lng;

-- Nearest settlements within 1km of mine boundary (impact assessment)
SELECT name, type,
  ST_Distance(boundary_geojson::geometry, settlements.point) * 111320 AS distance_m
FROM mines m
CROSS JOIN settlements
WHERE m.id = $mine_id
  AND ST_DWithin(m.boundary_geojson::geometry, settlements.point, 0.009)
ORDER BY distance_m;
```

### 15.2 Map Tile Service

- **Source:** OpenStreetMap tiles (self-hosted via PMTiles / Martin tile server)
- **Satellite Overlay:** ISRO Bhuvan API (government approved source for mine boundary/green belt)
- **Offline Tiles (Mobile):** Mine-area tiles pre-downloaded on app install via react-native-maps offline tiles

---

## 16. Report Generation Service

### 16.1 Statutory Reports Supported

| Report | Regulation | Frequency | Auto-populate From |
|--------|-----------|-----------|-------------------|
| Annual Return (Form 3) | CMR 2017 Reg 4 | Annual | All yearly data |
| Accident Notice (Form 4-A) | CMR 2017 Reg 79 | Per accident | `accident_records` |
| Accident Register (Form 4-B) | CMR 2017 Reg 81 | Annual | `accident_records` + `persons_affected` |
| Return to Duty (Form 4-C) | CMR 2017 Reg 81 | Per person | `persons_affected.return_to_duty_date` |
| Monthly Safety Committee Report | CMR 2017 Reg 167 | Monthly | `compliance_instances` (linked minutes) |
| EC Half-Yearly Compliance Report | EC Conditions | 6-monthly | `environment_readings`, `ec_conditions` |
| CCO Daily Return (Form I) | CCO Act 1974 | Daily | `production_readings` |
| CLRA Contractor Register (Form XII) | CLRA Act 1970 | Annual | `contractors`, `contract_workers` |

### 16.2 Generation Flow

```typescript
// ReportService.generateReport()
async function generateReport(dto: GenerateReportDto): Promise<string> {
  // 1. Fetch all data from domain services / DB
  const data = await assembleReportData(dto.type, dto.mineId, dto.periodStart, dto.periodEnd);

  // 2. Render Handlebars template to HTML
  const template = await loadTemplate(dto.type);  // templates stored in MinIO
  const html = Handlebars.compile(template)(data);

  // 3. Generate PDF with Puppeteer (headless Chrome)
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();

  // 4. Upload to MinIO
  const fileKey = `reports/${dto.mineId}/${dto.type}_${dto.periodStart}.pdf`;
  await minioClient.putObject("media", fileKey, pdfBuffer);

  // 5. Create report record + blockchain hash
  const hash = computeSHA256(pdfBuffer);
  const report = await prisma.report.create({ data: { ...dto, fileKey, sha256Hash: hash } });

  // 6. Anchor hash to audit trail
  await auditService.record({ entity_type: "report", entity_id: report.id, action: "generated" });

  return report.id;
}
```

---

## 17. Audit Trail & Blockchain Anchoring

### 17.1 Audit Trail

Every mutation (create, update, delete) on any statutory entity is recorded in `audit_trail`:

```typescript
// AuditInterceptor — applied globally in NestJS
async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
  const req = context.switchToHttp().getRequest();
  const result = await firstValueFrom(next.handle());
  await this.auditService.record({
    entity_type: req.auditEntityType,
    entity_id:   req.auditEntityId,
    action:      req.method,
    actor_id:    req.user.id,
    mine_id:     req.user.activeMineId,
    new_value:   result,
    occurred_at: new Date(),
  });
  return result;
}
```

### 17.2 Blockchain Hash Anchoring

For statutory documents (Form 3, Form 4-A, signed compliance evidence), the SHA-256 hash is anchored to the **National Blockchain for Governance (NBG)** — the GoI shared blockchain infrastructure.

```
PDF generated
  -> SHA-256 hash computed
  -> POST to NBG API: { documentId, hash, timestamp, mineName, documentType }
  -> NBG returns { txId, blockHash, timestamp }
  -> Store in audit_trail.blockchain_hash = txId
  -> Display on web: "Verified | Blockchain TX: {txId}"

Verification flow (Regulator portal):
  -> Regulator clicks "Verify Integrity"
  -> Download PDF -> compute SHA-256 locally
  -> GET NBG API: verify { txId, hash }
  -> Match confirms document untampered since submission
```

---

## 18. DevOps & Infrastructure

### 18.1 Kubernetes Deployment

```yaml
# Namespace per environment: dev, staging, prod

Services deployed as K8s Deployments:
  - api-gateway      (Kong, 2 replicas prod)
  - nestjs           (NestJS monolith, 3-5 replicas, HPA on CPU)
  - ai-service       (Python FastAPI, 2 replicas, GPU node if available)
  - postgres         (StatefulSet, or managed PaaS: CockroachDB/Supabase)
  - redis            (StatefulSet, Redis Stack)
  - kafka            (Strimzi Operator — 3 broker StatefulSet)
  - minio            (StatefulSet, or managed)
  - keycloak         (StatefulSet)
  - opensearch       (StatefulSet)
  - bullmq-workers   (Deployment, scales by queue depth)
  - report-service   (Deployment, isolated for Puppeteer memory)
```

### 18.2 CI/CD Pipeline (GitHub Actions + ArgoCD)

```
Push to feature branch
  -> GitHub Actions:
     1. pnpm install + typecheck (tsc --noEmit)
     2. Unit tests (Vitest / Jest)
     3. Prisma schema lint
     4. Docker build (multi-stage: builder + runtime)
     5. Push image to Container Registry (GCR / ECR)

Merge to main
  -> GitHub Actions:
     6. E2E tests (Playwright on staging)
     7. Update Helm chart values (image tag)
     8. Push to GitOps repo

ArgoCD (GitOps):
  -> Detects Helm chart diff
  -> Progressive rollout (canary 10% -> 50% -> 100%)
  -> Auto-rollback on error rate spike (Grafana alert -> ArgoCD rollback)
```

### 18.3 Observability Stack

```
OpenTelemetry SDK (NestJS + Python)
  -> Collector sidecar
  -> Traces: Jaeger / Tempo
  -> Metrics: Prometheus -> Grafana dashboards
  -> Logs: Winston -> Loki -> Grafana

Key Metrics Tracked:
  - API latency P50/P95/P99 per endpoint
  - Sync push throughput (records/second)
  - Kafka consumer lag per topic
  - BullMQ job queue depth per queue
  - AI Service inference latency (P95 < 500ms)
  - PostgreSQL query duration (P95 < 100ms)
  - SSE connections active

Alerts (PagerDuty):
  - Error rate > 1% on any endpoint (5-min window)
  - API P95 > 2s
  - Kafka consumer lag > 1000 messages
  - PostgreSQL replication lag > 30s
  - Disk usage > 80% (MinIO, PostgreSQL)
```

---

## 19. Security Architecture

### 19.1 Network Security

```
Internet -> CloudFlare (DDoS protection, WAF)
         -> Load Balancer (TLS termination, HTTPS only)
         -> Kong API Gateway (internal HTTP to services)
         -> Internal K8s network (mTLS via Istio service mesh)

All internal service-to-service communication:
  - mTLS certificates via Istio
  - No service can be called directly from internet
  - Kafka traffic encrypted in transit

External dependencies:
  - Keycloak: internal (no internet exposure)
  - Bhashini STT: HTTPS API call (Govt of India endpoint)
  - FCM: HTTPS (Google)
  - NBG Blockchain: HTTPS (NIC endpoint)
```

### 19.2 Data Security

| Category | Measure |
|----------|---------|
| Data at rest | PostgreSQL: AES-256 encryption (transparent data encryption) |
| Backups | AES-256 encrypted, stored in geographically separate MinIO cluster |
| PII fields | Aadhaar numbers, phone numbers stored encrypted (AES-256 + key rotation) |
| MinIO files | Server-side encryption (SSE-S3) |
| JWT secrets | Keycloak realm keys, rotated every 90 days |
| Database passwords | Kubernetes Secrets (sealed with Sealed Secrets operator) |
| Audit logs | Write-once append (no UPDATE/DELETE on audit_trail table via DB trigger) |

### 19.3 OWASP Top 10 Mitigations

| Threat | Mitigation |
|--------|-----------|
| Injection | Prisma ORM (parameterized queries), no raw SQL in application code except spatial queries (also parameterized) |
| Broken Auth | Keycloak OIDC, short-lived JWTs (15 min), refresh token rotation |
| Broken Access Control | RLS at DB layer + NestJS Guards — double enforcement |
| Security Misconfig | Helm chart defaults: no privileged containers, read-only filesystem, non-root user |
| SSRF | No user-supplied URLs fetched server-side; all external calls use allowlisted endpoints |
| Rate Limiting | Kong: 100 req/min per user on standard endpoints; 10 req/min on auth endpoints |

---

## 20. Performance Targets & SLOs

### 20.1 API Response Time SLOs

| Endpoint Class | P50 | P95 | P99 |
|---------------|-----|-----|-----|
| Simple CRUD (GET single entity) | < 50ms | < 150ms | < 300ms |
| List endpoints (paginated) | < 100ms | < 300ms | < 500ms |
| Dashboard GraphQL (mine-scope) | < 200ms | < 800ms | < 1.5s |
| Corporate rollup GraphQL (cached) | < 50ms | < 200ms | < 400ms |
| Sync push (50 records) | < 500ms | < 1.5s | < 3s |
| Risk score recomputation | < 1s | < 2s | < 5s |
| PDF report generation | < 5s | < 15s | < 30s |
| OCR extraction (A4 page) | < 8s | < 20s | < 45s |

### 20.2 Throughput Targets

| Metric | Target |
|--------|--------|
| Concurrent API users (per mine) | 200 |
| Total concurrent users (system) | 5,000 |
| Sync push throughput | 500 records/second (burst) |
| SSE connections | 2,000 concurrent |
| Kafka messages/second | 1,000 sustained |
| PDF generation jobs | 50 concurrent |

### 20.3 Availability & Reliability

| Metric | Target |
|--------|--------|
| API availability | 99.9% (8.7 hours downtime/year) |
| Database availability | 99.95% (2.6 hours downtime/year) |
| RTO (Recovery Time Objective) | < 15 minutes |
| RPO (Recovery Point Objective) | < 5 minutes (continuous WAL streaming to replica) |
| Backup frequency | Full daily + incremental hourly |
| Sync offline tolerance | Up to 72 hours (WatermelonDB local store) |

### 20.4 Scalability Approach

- **Horizontal scaling:** All NestJS stateless pods behind Kong; HPA scales on CPU > 70% or RPS thresholds
- **Database:** PostgreSQL primary + 2 read replicas (dashboard queries hit replicas); Prisma connection pooling via PgBouncer
- **Cache:** Redis Cluster (3 primary + 3 replica nodes) for high availability
- **Kafka:** 3-broker cluster; partitioned by `mine_id` for ordered processing per mine
- **AI Service:** Python pods with optional GPU node pool for inference

---

*Version 1.0 | Backend Specification | SIH 2026*
*References: [LLD.md](file:///c:/Coding/SIH2026/LLD.md) | [json_schemas.md](file:///c:/Coding/SIH2026/json_schemas.md) | [frontend_spec.md](file:///c:/Coding/SIH2026/frontend_spec.md) | [Brainstrom1.md](file:///c:/Coding/SIH2026/Brainstrom1.md)*
