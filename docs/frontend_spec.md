# All-in-One Frontend Specification
## Web Dashboard + Mobile Field App

**Platform:** Coal Operations Monitoring, Enforcement & Transparency
**Problem:** SIH 2026 — 26024 | Coal India Limited | Ministry of Coal
**References:** [json_schemas.md](file:///c:/Coding/SIH2026/json_schemas.md) · [LLD.md](file:///c:/Coding/SIH2026/LLD.md) · [Brainstrom1.md](file:///c:/Coding/SIH2026/Brainstrom1.md)

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Monorepo & Project Structure](#2-monorepo--project-structure)
3. [Design System & UI Kit](#3-design-system--ui-kit)
4. [Authentication & Session Management](#4-authentication--session-management)
5. [Web Dashboard — Module Screens](#5-web-dashboard--module-screens)
6. [Mobile Field App — Screens & Flows](#6-mobile-field-app--screens--flows)
7. [State Management Architecture](#7-state-management-architecture)
8. [API Client & Data Fetching](#8-api-client--data-fetching)
9. [Offline-First Strategy](#9-offline-first-strategy)
10. [Internationalization](#10-internationalization)
11. [Form Validation & Shared Schemas](#11-form-validation--shared-schemas)
12. [Geo-Tagging & Maps](#12-geo-tagging--maps)
13. [Testing Strategy](#13-testing-strategy)
14. [Performance & Accessibility](#14-performance--accessibility)

---

## 1. Technology Stack

### 1.1 Web Dashboard

| Layer | Choice | Purpose |
|-------|--------|---------|
| Build | **Vite 6** | Fast dev server, native ESM, Rollup prod build |
| Framework | **React 19.2** | UI rendering, React Compiler, `useActionState` |
| Language | **TypeScript 5.7+** | Strict mode; shared across monorepo |
| Routing | **TanStack Router v1** | Type-safe, file-based, code-split per feature |
| Server State | **TanStack Query v5** | Caching, retries, stale-while-revalidate |
| Client State | **Zustand v4** | Lightweight UI state (sidebar, filters, modals) |
| Forms | **React Hook Form + Zod** | Shared Zod schemas from `packages/shared-schemas` |
| UI | **shadcn/ui + Radix Primitives** | Accessible, headless, composable primitives |
| Styling | **Tailwind CSS v4** | GIGW/WCAG accessibility design tokens |
| Charts | **Recharts v2** | Compliance scores, trends, production charts |
| BI | **Apache Superset** | Ad-hoc analytics, iframe-embedded |
| Maps | **MapLibre GL JS + deck.gl** | Open-source, no vendor lock-in |
| REST | **Axios** (openapi-typescript generated) | CRUD, mutations |
| GraphQL | **Apollo Client v3** | Federated dashboard aggregation queries |
| Real-time | **EventSource / SSE** | Live alert feed from Notification Service |
| i18n | **i18next + react-i18next v23** | EN, HI, BN, OR, MR |
| Testing | **Vitest + React Testing Library + Playwright** | Unit → Component → E2E |

### 1.2 Mobile Field App

| Layer | Choice | Purpose |
|-------|--------|---------|
| Framework | **React Native 0.85** (New Architecture) | iOS/Android; Fabric + TurboModules + Hermes |
| Tooling | **Expo Bare + EAS Build (SDK 52)** | OTA updates, simplified native CI signing |
| Navigation | **React Navigation v7** | Stack, Bottom Tabs, Drawer navigators |
| Offline DB | **WatermelonDB v0.27** | SQLite-backed reactive local DB — offline-first |
| Sync | Custom (WatermelonDB sync protocol) | Pull/push against REST sync API |
| Maps/GPS | **react-native-maps + expo-location** | GPS geo-tagging, mine boundary display |
| Camera | **react-native-vision-camera v4** | High-perf photo/video for observations |
| Voice | **Bhashini STT** (primary) + **Whisper** (fallback) | Regional language voice narration |
| Background | **expo-background-task** | Queued sync on connectivity resume |
| Push | **FCM via expo-notifications** | Alerts, CAPA, reminders |
| Server State | **TanStack Query v5** | Same pattern as web (offline-first mode) |
| Client State | **Zustand v4** | Auth, sync status, app settings |
| Secure Store | **expo-secure-store** | JWT refresh tokens (Keystore/Keychain) |
| Biometric | **expo-local-authentication** | Fingerprint/Face ID — underground re-auth |
| QR | **expo-barcode-scanner** | Worker attendance via badge QR scan |

---

## 2. Monorepo & Project Structure

```
smart-governance-coal/           # pnpm workspaces + Turborepo
├── apps/
│   ├── web-dashboard/           # Vite + React 19
│   │   └── src/
│   │       ├── features/
│   │       │   ├── dashboard/
│   │       │   ├── compliance/
│   │       │   ├── inspection/
│   │       │   ├── contractor/
│   │       │   ├── environment/
│   │       │   ├── production/
│   │       │   ├── ocr/
│   │       │   ├── gis/
│   │       │   ├── alerts/
│   │       │   ├── grievance/
│   │       │   ├── ai-analytics/
│   │       │   ├── reports/
│   │       │   └── admin/
│   │       ├── components/      # Global layout, nav, common
│   │       ├── hooks/           # useAuth, usePermission, useLiveAlerts
│   │       ├── lib/             # Apollo client, i18n init, axios instance
│   │       └── routes/          # TanStack Router definitions
│   │
│   ├── mobile-field-app/        # React Native (Expo)
│   │   └── src/
│   │       ├── screens/
│   │       ├── navigation/
│   │       ├── db/              # WatermelonDB schema + models
│   │       ├── sync/            # Sync engine + conflict resolver
│   │       ├── geo/             # GeoStamp capture
│   │       ├── camera/          # Media capture + queued upload
│   │       └── background/      # Background sync task
│   │
│   └── regulator-portal/        # Vite, read-only (DGMS / PCB)
│
├── packages/
│   ├── shared-types/            # TS interfaces (User, Mine, Inspection…)
│   ├── shared-schemas/          # Zod schemas — 1:1 with json_schemas.md
│   │   └── src/
│   │       ├── geostamp.schema.ts
│   │       ├── inspection.schema.ts
│   │       ├── observation.schema.ts
│   │       ├── violation.schema.ts
│   │       ├── corrective_action.schema.ts
│   │       ├── compliance_requirement.schema.ts
│   │       ├── compliance_instance.schema.ts
│   │       ├── compliance_evidence.schema.ts
│   │       ├── accident_register.schema.ts   # Form 4-A / 4-B / 4-C
│   │       ├── overman_report.schema.ts
│   │       ├── contractor.schema.ts
│   │       ├── contract_worker.schema.ts
│   │       ├── attendance_record.schema.ts
│   │       ├── incident_report.schema.ts
│   │       ├── environment_reading.schema.ts
│   │       ├── production_reading.schema.ts
│   │       ├── mine_risk_score.schema.ts
│   │       └── alert.schema.ts
│   ├── ui-kit/                  # shadcn/ui web component library
│   ├── mobile-ui-kit/           # React Native component library
│   ├── api-client/              # Generated typed REST client
│   └── i18n-resources/          # locales/en.json, hi.json, bn.json, or.json
│
├── turbo.json
└── pnpm-workspace.yaml
```

### Feature Folder Convention (one per module)

```
features/compliance/
├── components/
│   ├── ComplianceCalendar.tsx       # Monthly calendar with due items
│   ├── ComplianceInstanceCard.tsx   # Status badge + actions
│   ├── ComplianceHealthScore.tsx    # 0-100 animated radial gauge
│   └── EvidenceUploader.tsx         # Drag-drop + inline OCR trigger
├── hooks/
│   ├── useComplianceInstances.ts    # TanStack Query wrapper
│   └── useComplianceHealth.ts
├── forms/
│   ├── SubmitEvidenceForm.tsx       # RHF + Zod (compliance_evidence.schema)
│   └── CreateRequirementForm.tsx
├── routes/
│   ├── compliance.index.tsx
│   ├── compliance.$mineId.tsx
│   └── compliance.$mineId.$instanceId.tsx
└── compliance.graphql               # Apollo operations
```

---

## 3. Design System & UI Kit

### 3.1 Color Tokens

```typescript
// packages/ui-kit/src/tokens.ts
export const colors = {
  primaryBlue:   "hsl(216 85% 34%)",   // CIL navy
  accentAmber:   "hsl(35  95% 50%)",   // Safety amber
  compliant:     "hsl(142 71% 45%)",
  warning:       "hsl(38  92% 50%)",
  breach:        "hsl(4   86% 58%)",
  pending:       "hsl(220 14% 60%)",
  riskLow:       "hsl(142 71% 45%)",
  riskMedium:    "hsl(38  92% 50%)",
  riskHigh:      "hsl(25  95% 53%)",
  riskCritical:  "hsl(4   86% 58%)",
  surface:       "hsl(220 20% 97%)",
  card:          "hsl(0   0%  100%)",
  sidebar:       "hsl(216 30% 18%)",
};

export const typography = {
  fontFamily: "'Inter Variable', 'Noto Sans Devanagari', sans-serif",
};
```

### 3.2 Core Reusable Components

| Component | Description | Schema Field |
|-----------|-------------|-------------|
| `StatusBadge` | `pending/submitted/approved/breached` pill | `compliance_instance.status` |
| `RiskScoreGauge` | Animated 0-100 arc + contributing factors tooltip | `mine_risk_score.score` |
| `SeverityChip` | `low/medium/high/critical` color chip | `observation.severity` |
| `GeoStampDisplay` | lat/lng/accuracy + mini map pin | `geostamp` (all field entities) |
| `ComplianceCalendar` | Monthly calendar — overdue red, upcoming amber | `compliance_instance.due_date` |
| `ViolationTimeline` | Observation -> CAPA -> Closed audit trail | `violation`, `corrective_action` |
| `MediaGallery` | Lightbox grid of inspection photos | `media_attachment.file_url` |
| `SyncStatusIndicator` | "12 records pending upload" banner | `sync_envelope` |
| `OCRReviewSideBySide` | Scan image left / extracted fields right | `ocr_extraction_result` |
| `AlertFeed` | SSE-driven live notification ribbon | `alert` |
| `MineSelector` | Hierarchical Subsidiary -> Mine dropdown | `mine`, `subsidiary` |
| `ContractorTrustScore` | 0-100 badge with breakdown tooltip | `contractor.trust_score` |

---

## 4. Authentication & Session Management

### 4.1 Web Auth Flow (Supabase Auth)

```
User -> /login -> Supabase Email/Password or Magic Link
     -> Supabase Client handles token management automatically
     -> Supabase session JWT used in HTTP headers for API calls
     -> 401 -> Supabase SDK automatically refreshes session
     -> Refresh fail -> redirect /login
```

### 4.2 Mobile Auth Flow

```
App start
  -> Supabase checks async storage for existing session
  -> Found: Session restored in memory
  -> Not found: Login screen -> Supabase Email/Password
  -> Store session via Supabase persistent storage plugin (SecureStore)

Underground / offline:
  -> expo-local-authentication (biometric) -> re-auth without network
  -> Last valid JWT grants read-only access to local WatermelonDB
  -> Sync resumes automatically when connectivity restored
```

### 4.3 Role Types

```typescript
export type AppRole =
  | "field_officer"         | "mine_manager"
  | "safety_officer"        | "environmental_officer"
  | "compliance_officer"    | "contractor_manager"
  | "subsidiary_admin"      | "corporate_executive"
  | "regulator"             | "system_admin";
```

All routes wrapped in `<RequireRole roles={[...]} />`. Sidebar items filtered by `usePermission(resource, action)` reading JWT claims from Supabase.

---

## 5. Web Dashboard — Module Screens

### 5.1 Role-Based Layout Shell

```
AppShell
+-- TopBar
|   +-- MineSelector (Mine Manager, Field Officer)
|   |   OR SubsidiarySelector (Corporate, Subsidiary Admin)
|   +-- AlertBell (SSE badge count)
|   +-- LanguageSwitcher (EN / HI / BN / OR / MR)
|   +-- UserMenu (Profile, Settings, Logout)
|
+-- Sidebar (role-scoped nav links)
|   +-- Dashboard              [all roles]
|   +-- Compliance             [compliance_officer, mine_manager, regulator]
|   +-- Inspections            [safety_officer, mine_manager, regulator]
|   +-- Contractors            [contractor_manager, mine_manager]
|   +-- Environment            [environmental_officer, mine_manager, regulator]
|   +-- Production             [mine_manager, corporate_executive]
|   +-- OCR / Digitization     [compliance_officer, system_admin]
|   +-- GIS Map                [all roles]
|   +-- Alerts                 [all roles]
|   +-- Grievances             [mine_manager, subsidiary_admin]
|   +-- AI Analytics           [mine_manager, corporate_executive]
|   +-- Reports                [compliance_officer, mine_manager, regulator]
|   +-- Admin                  [system_admin, subsidiary_admin]
|
+-- MainContent (code-split, route-rendered)
```

---

### 5.2 Mine Manager Dashboard

**Route:** `/dashboard/mine/:mineId`
**Data:** Apollo GraphQL `DashboardSummary(mineId)` — composed from Compliance + Inspection + Production + AI Risk services
**Real-time:** SSE from `/notifications/stream?mineId=`

**Screen Layout:**
```
+--------------------------------------------------------------+
|  Mine: Rajmahal OCP | ECL | Risk Score: 67/100 WORSENING    |
+------------+---------------+---------------+-----------------+
| Compliance | Open          | Contractor     | Production      |
| Score: 84  | Violations:12 | Score: 78/100  | 45,200 MT       |
| +2 MoM     | (3 critical)  | 2 expiring     | vs 48,000 MT    |
| [View All] | [Resolve]     | [View]         | [Details]       |
+------------+---------------+---------------+-----------------+
| COMPLIANCE CALENDAR (7-day) | LIVE ALERT FEED (SSE)          |
| Explosive Return - TODAY    | [RED] PM10 Breach 820 ug/m3    |
| Safety Committee - 3d       |       CAAQMS-01 | 10:42 AM     |
| EC Half-yearly - 18d        | [YEL] CLRA Expiring 18d        |
+-----------------------------| [GRN] CAPA Closed               |
| TOP OPEN VIOLATIONS         |       Ventilation fix done      |
| Roof Support CMR Reg 68 Pit3|                                 |
| PPE Non-compliance x3 Sft B |                                 |
+-----------------------------+---------------------------------+
| ENV STATUS        | PRODUCTION TREND (7d - Recharts bar)     |
| PM10: 820 ug/m3   | [daily actual vs target bars]            |
| Water: pH 7.2     |                                           |
+-------------------+-------------------------------------------+
```

---

### 5.3 Area GM / Corporate Dashboard

**Route:** `/dashboard/subsidiary/:subId` or `/dashboard/corporate`
**Data:** GraphQL -> Redis materialized rollup (refreshed every 5 min)

**Screen Layout:**
```
+--------------------------------------------------------------+
|  ECL Subsidiary - 47 Active Mines                            |
+--------------------------------------------------------------+
|  COMPLIANCE HEATMAP (MapLibre + deck.gl)                     |
|  Mine locations colored by risk score                        |
|  [RED] High Risk (7)  [YEL] Medium (23)  [GRN] Low (17)    |
+-----------------------------+--------------------------------+
| RISK RANKING                | AI INSIGHT PANEL               |
| 1. Jambad UG Mine  81 (up)  | "Mine Jambad has 4 converging |
| 2. Rajmahal OCP    74 (=)   |  risk indicators. Recommend   |
| 3. Sonepur Bazari  68 (dn)  |  targeted inspection soon."   |
| [Download PDF Report]       |                                |
+-----------------------------+--------------------------------+
| PRODUCTION VS PLAN (grouped bar)  | INCIDENT TREND 12M       |
+-----------------------------------+--------------------------+
```

---

### 5.4 Regulator Portal

**App:** `apps/regulator-portal` — separate Vite build, zero write permissions
**Access:** DGMS Inspector, State PCB Officer (jurisdiction-scoped)

| Screen | Content |
|--------|---------|
| `/compliance` | Mine-wise compliance table (all categories) + CSV/PDF export |
| `/inspections` | Full inspection history + observation to CAPA audit trail |
| `/environment` | Real-time CAAQMS readings + EC condition tracker |
| `/accidents` | Accident register (Form 4-A/4-B records, view only) |
| `/reports` | Download signed statutory PDFs with blockchain hash |

> No `POST / PATCH / DELETE` calls are ever made from this app.

---

### 5.5 Compliance Module

**Routes:** `/compliance`, `/compliance/:mineId`, `/compliance/:mineId/:instanceId`

#### Compliance Calendar View

```
HEADER: [Mine Selector] [Month/Year Picker] [Filter: All|Safety|Env|Production|Labour]

KANBAN COLUMNS: PENDING | IN PROGRESS | OVERDUE | APPROVED

Card example:
  [Safety Icon] Form 3 - Annual Return (CMR 2017 Reg 4)
  Due: 01 Feb 2027 | Assigned: Rajesh Kumar (Compliance Officer)
  Docs required: Annual Return Form + Safety Committee Minutes
  [Submit Evidence]  [View History]
```

#### Compliance Instance Detail

```
Title: Monthly Safety Committee Report - Jan 2027
Reg: CMR 2017 Reg 167 | Authority: Internal
Status: Pending | Due: 31 Jan 2027 | Grace: 0 days

EVIDENCE UPLOAD
  [Drag & Drop PDF/JPG - or trigger OCR scan]
  Uploaded: safety_comm_jan27.pdf  [VERIFIED]

APPROVAL TIMELINE
  o Submitted: Rajesh Kumar | 28 Jan 2027 | GPS verified
  o Under Review - Senior Compliance Officer
  o Approved / Rejected (pending)

AUDIT TRAIL  [View Blockchain Hash]  [Export PDF]
```

**Submit Evidence Form** uses schema: `compliance_evidence.schema.json`
If any OCR field confidence < 85% -> inline `OCRReviewSideBySide` before save.

---

### 5.6 Inspection & Violation Management

**Routes:** `/inspections`, `/inspections/:mineId`, `/violations/:id`, `/corrective-actions/:id`

#### Inspection Detail

```
Inspection: DGMS Annual General | Rajmahal OCP | 15 Aug 2027
By: Suresh Patel (Safety Officer)
GPS: 24.1543N 87.0243E | 09:14 AM -> 04:27 PM | Sync OK

OBSERVATIONS (12 total | 3 violations)
  [RED] [VIOLATION] Roof support spacing exceeds approved plan
        Zone: Pit 3 | Statute: CMR Reg 68 | Severity: HIGH
        [3 photos]  [Voice note 0:42]  [Assign CAPA]

  [YEL] [OBSERVATION] PPE non-compliance - 4 workers
        Zone: Coal Handling Plant | Severity: MEDIUM
        [Flag as Violation]  [Mark Resolved]

  [GRN] [OK] Ventilation fan running - logbook current

[Generate Inspection Memo PDF]  [Digital Sign & Submit]
```

#### Violation + CAPA Form

```
ASSIGN CORRECTIVE ACTION
  Statute: CMR 2017 Reg 68 - Roof Support
  Description:  [TextArea]
  Assign To:    [UserSelector - mine officials]
  Due Date:     [DatePicker - default T+7 per DGMS norm]
  [Assign CAPA]

ESCALATION (Temporal workflow)
  T+24h -> Mine Manager notified if CAPA not started
  T+72h -> Escalated to Subsidiary Head
  T+7d  -> Regulator-visible flag set on violation
```

Schemas: `inspection.schema.json`, `observation.schema.json`, `violation.schema.json`, `corrective_action.schema.json`

---

### 5.7 Contractor Management

**Routes:** `/contractors`, `/contractors/:id`, `/contractors/:id/workers`

#### Contractor Profile

```
ABC Construction Pvt Ltd
Trust Score: 72/100 [MEDIUM] | Status: Active

DOCUMENTS STATUS
  CLRA License:         [OK]  Valid - Exp: 30 Nov 2027
  ESI Registration:     [OK]  Valid
  EPF Registration:     [OK]  Valid
  Safety Training Cert: [WARN] Expiring in 18 days  [Send Reminder]
  Insurance Policy:     [FAIL] Expired 15 Jul 2027  [Upload New]

ACTIVE ASSIGNMENTS
  Rajmahal OCP | OB Removal Pit 3 | 47 Workers | Until Dec 2027

CONTRACT WORKERS (47)
  [Searchable: Name, ID Card, Training Status, ESI No]
  [+ Add Worker]

AI RISK FLAGS
  Violations linked: 3 | CAPA Closure Rate: 89%
  Billing Anomaly Flagged: 1  [View AI Explanation]
```

**Onboard Form:** `contractor.schema.json`
**Add Worker Form:** `contract_worker.schema.json` (training cert validity, Aadhaar-linked ID)

---

### 5.8 Environmental Monitoring

**Route:** `/environment/:mineId`

```
Rajmahal OCP - Environmental Dashboard
EC No: EC/2019/0482 | Status: 2 Amber, 1 Red / 54 conditions

EC CONDITIONS TRACKER
  Cond 23: PM10 <= 600 ug/m3    Current: 820  [RED] BREACHED
  Cond 31: BOD <= 30 mg/L        Current: 28   [GRN] COMPLIANT
  Cond 47: Green Belt >= 5 Ha    Current: 4.2  [YEL] BELOW TARGET

MAP - MONITORING STATIONS (MapLibre, sensor pins + reading popups)

PARAMETER TRENDS (Recharts - PM10 | PM2.5 | pH | Noise dB)

AI FORECAST PANEL
  "Predicted PM10: 740 ug/m3 at 3 PM today (+/-80 ug/m3)"
  "Recommendation: Activate haul road sprinklers by 2 PM"
```

**Manual Entry Form:** `environment_reading.schema.json`
Auto-flag `threshold_breached = true` if value exceeds `ec_condition.prescribed_limit`.

---

### 5.9 Production Module

**Route:** `/production/:mineId`

```
Rajmahal OCP - Production | 27 Aug 2027
Target: 48,000 MT | Actual: 45,200 MT | Shortfall: 5.8%

SHIFT BREAKDOWN
  Shift A: 16,200 MT | Shift B: 15,800 MT | Shift C: 13,200 MT

AI ANOMALY ALERT
  "Shift C output is 22% below historical average given current
   workforce (312) and equipment (4 shovels, 18 dumpers)."
  [Acknowledge]  [Create Investigation Note]

FORM I - CCO Daily Return (auto-populated from shift data)
  [Review -> Digital Sign -> Submit to CCO Portal]
```

Schema: `production_reading.schema.json`

---

### 5.10 OCR Document Digitization

**Routes:** `/ocr/upload`, `/ocr/queue`, `/ocr/review/:itemId`

#### Upload Screen

```
Document Category: [Dropdown - document_upload.schema.json enum]
  DGMS Inspection Memo | Accident Register | Contractor License
  Environmental Report | Production Return | Legacy Register

Link to: [Compliance Instance / Contractor / Inspection - optional]
[Drag & Drop or Browse]

PENDING REVIEW QUEUE
  [RED] accident_register_aug2019.pdf - Low confidence: date, mine_name
  [YEL] clra_license_abc.jpg          - Low confidence: expiry_date
```

#### OCR Review Side-by-Side

```
+---------------------------+--------------------------------------+
|  SCANNED DOCUMENT         |  AI EXTRACTED FIELDS                 |
|  [PDF / image viewer]     |                                      |
|  [Zoom | Rotate]          |  Mine Name: Rajmahal OCP  OK  0.97   |
|                           |  Date:      [__________]  WARN 0.41  |
|  [Hover -> bounding box   |  Shift:     B             OK  0.91   |
|   highlights on image]    |  Regulation: CMR Reg 68   OK  0.88   |
|                           |  Signatory: [__________]  WARN 0.55  |
|                           |                                      |
|                           |  [Save & Verify]  [Reject & Re-scan] |
+---------------------------+--------------------------------------+
```

Schemas: `document_upload.schema.json`, `ocr_extraction_result.schema.json`, `ocr_review_queue_item.schema.json`

---

### 5.11 GIS / Map Module

**Route:** `/map/:mineId`

```
MapLibre GL fullscreen + collapsible side panel

LAYER TOGGLES
  [ON]  Mine Boundary (PostGIS polygon)
  [ON]  Inspection Zones (named polygons)
  [ON]  Incident Heatmap (deck.gl HeatmapLayer - red = hot)
  [ON]  Environmental Sensors (pin markers + reading popups)
  [OFF] Green Belt Coverage (satellite overlay)
  [OFF] Nearby Settlements (500m / 1km buffer rings)

CLICK FEATURE -> SIDE PANEL
  [Zone: Pit 3 East]
  Open Violations: 4
  Last Inspection: 10 Aug 2027
  Risk Contribution: HIGH - Roof fall history
  [View Violations]  [Schedule Inspection]
```

---

### 5.12 Alerts & Notification Center

**Route:** `/alerts`
**Implementation:** SSE stream from `/notifications/stream` — new events prepended with CSS animation

```
FILTER: [All | Critical | High | Medium | Low | Unread]

[RED] CRITICAL - 08:42 AM
   PM10 Breach - CAAQMS-01, Rajmahal OCP
   820 ug/m3 vs 600 ug/m3 limit
   [Create CAPA]  [Acknowledge]

[YEL] HIGH - Yesterday 4:17 PM
   CAPA Overdue - Roof Support Fix, Pit 3
   Assigned: Ramesh Singh | 5 days overdue
   [Escalate to Mine Manager]  [View CAPA]

[GRN] INFO - 2 days ago
   Compliance Submitted: Monthly Safety Committee Report
   By: Rajesh Kumar - Under Review
   [View Instance]
```

Schema: `alert.schema.json`

---

### 5.13 Grievance Management

**Route:** `/grievances`, `/grievances/:id`

```
Grievance #GRV-2027-0432
Worker: Anonymous | Category: Wage Delay | Filed: 20 Aug 2027
AI Priority Score: 8/10 [RED] (multiple similar grievances this week)

"Wages for July 2027 not credited as of filing date."

RESOLUTION WORKFLOW
  Assigned: Sanjay Das (HR Officer) | Due: 27 Aug 2027
  Status: Under Review
  [Update Status]  [Add Note]  [Escalate to AGM]
```

---

### 5.14 AI Risk Analytics Panel

**Route:** `/ai-analytics/:mineId`

```
Mine Risk Score - Rajmahal OCP
67/100 [MEDIUM] | Trend: WORSENING

CONTRIBUTING FACTORS (XGBoost feature importance)
  Violation Frequency (90d):     34% - 12 violations (3x avg)
  CAPA Closure Lateness:         28% - avg 9.2 days vs 7 target
  Contractor Compliance:         18% - 74% (below 85% threshold)
  Environmental Breaches (30d):  12% - 2 PM10 breach events
  Production Pressure Index:      8% - 94% of target

CATEGORY SCORES
  Safety: 52/100 [RED]  |  Environment: 71/100 [YEL]
  Production: 88/100 [GRN]  |  Labour: 79/100 [GRN]

RECURRING VIOLATION CLUSTERS
  "Inadequate roof support - Pit 3 East"
   Appeared 6x in 14 months - Not systemically resolved
   [Flag as Systemic Risk]  [View Cluster]

ANOMALY FLAGS
  Shift C production 22% below norm - 3 consecutive days
  [Acknowledge]  [Create Investigation Note]
```

Schemas: `mine_risk_score.schema.json`, `anomaly_flag.schema.json`, `recurring_violation_cluster.schema.json`

---

### 5.15 Statutory Report Generator

**Route:** `/reports`

```
GENERATE STATUTORY DOCUMENT

Type: [Dropdown]
  Annual Return (CMR Form 3)
  Accident Notice (CMR Form 4-A)
  Monthly Safety Committee Minutes
  Half-Yearly EC Compliance Report
  Production Return (CCO Form I)
  Contractor Register Summary (CLRA Form XII)

Mine: [MineSelector]   Period: [DateRange]
[Auto-populate from system data]

PREVIEW (PDF iframe - pre-filled fields highlighted in yellow)
[Review -> Digital Sign -> Submit]

HISTORY
  Form 3 - 01 Feb 2027 - [SUBMITTED]  [Download]  [Blockchain Hash]
```

---

### 5.16 Admin & Configuration

**Routes:** `/admin/*` — System Admin, Subsidiary Admin only

| Sub-Screen | Purpose | Schema |
|------------|---------|--------|
| `/admin/mines` | Onboard mine, draw geo-fence polygon on map | `mine.schema.json` |
| `/admin/users` | Create users, assign roles + mine scope | `user.schema.json` |
| `/admin/regulations` | Manage compliance requirement library | `compliance_requirement.schema.json` |
| `/admin/checklist-builder` | Create/edit dynamic inspection checklists | `inspection_checklist_template.schema.json` |
| `/admin/workflow-config` | Configure escalation ladders per compliance category | `workflow_template.schema.json` |
| `/admin/env-stations` | Add/edit CAAQMS sensor points on map | `monitoring_station.schema.json` |
| `/admin/contractors/onboard` | Register new contractor entity | `contractor.schema.json` |
| `/admin/audit-log` | Immutable audit trail viewer (read-only) | `audit_trail_entry.schema.json` |

---

## 6. Mobile Field App — Screens & Flows

### 6.1 App Navigation Structure

```
App
+-- AuthStack
|   +-- LoginScreen           - Supabase Auth Login
|   +-- BiometricReAuthScreen - expo-local-authentication (underground)
|
+-- MainTabs (Bottom Tab Bar)
    +-- Home         -> Summary card + pending tasks list
    +-- Inspect      -> InspectionStack
    |   +-- InspectionListScreen
    |   +-- StartInspectionScreen
    |   +-- InspectionFormScreen  <- PRIMARY OFFLINE CAPTURE SCREEN
    |   +-- InspectionSummaryScreen
    +-- Report       -> ReportStack
    |   +-- IncidentReportScreen
    |   +-- SafetyObservationScreen  (STOP Card)
    |   +-- OvermanShiftReportScreen
    +-- Attendance   -> AttendanceScreen (QR scan / manual)
    +-- Profile      -> SyncStatusScreen + Settings
```

**Offline Banner** (persistent, top of every screen):
- Online - all synced
- Online - 4 records queued
- Offline - 12 records saved locally

---

### 6.2 Inspection Form Screen

**Schemas:** `inspection.schema.json` + `observation.schema.json` + `geostamp.schema.json`

```
ACTIVE INSPECTION
Mine: Rajmahal OCP  |  Type: Internal Safety Committee
Zone: [Select Zone]  ->  Pit 3 East

-----------------------------------------------
CHECKLIST: ROOF SUPPORT (CMR 2017 Reg 68)
-----------------------------------------------
Q: Support rules posted at section entrance?
   [OK]  [Non-Compliant]  [Observation]

Q: Support spacing <= approved plan?
   [OK]  [Non-Compliant]  [Observation]
   -> Non-Compliant tapped:
       Description: [TextInput]  [Voice]
       [Take Photo - auto geo-tag + timestamp]
       Severity: [Minor] [Moderate] [HIGH -> auto Violation] [Critical]

Progress: 7 / 24 checkpoints
GPS: 24.1543N 87.0244E  Accuracy: 8m
Offline: 3 observations queued locally
[Save Draft]  [Next Section]
```

**Technical notes:**
- Every observation saved instantly to WatermelonDB
- Photos stored as local files; lazy upload to Supabase Storage on sync
- GeoStamp captured once per observation at save time (not continuous polling)
- Voice queued offline, transcribed via Bhashini STT on sync

---

### 6.3 Safety Observation — STOP Card

**Schema:** `safety_observation.schema.json`
**Target:** < 60 seconds — 3 taps + photo

```
SAFETY OBSERVATION

1. ZONE
   [Pit 3]  [Workshop]  [Magazine]  [Entry Road]  [Other]

2. TYPE
   [Unsafe Act]  [Unsafe Condition]  [Positive Observation]

3. CATEGORY
   [PPE]  [Housekeeping]  [Equipment Guard]  [Fall Protection]
   [Fire]  [Traffic]  [Ventilation]  [Other]

4. DESCRIBE (optional - or voice note)
   [Worker not wearing hard hat in active blast zone]

5. PHOTO (optional but encouraged)
   [Capture]

6. ASSIGN TO
   [Search official by name or scan badge QR]

GPS: verified   [Submit Observation]
```

---

### 6.4 Incident / Near-Miss Report

**Schema:** `incident_report.schema.json`

```
REPORT INCIDENT / NEAR-MISS

INCIDENT TYPE (scroll-picker)
  Roof Fall | Gas Ignition | Equipment Failure | Personal Injury
  Near Miss | Fire | Inundation | Explosives | Electrical | Other

DESCRIPTION  [Voice - Hindi/Odia supported]
  [                                                    ]
  AI Suggested Severity: HIGH  [Accept]  [Change]
  AI Category: "Roof Fall - Support failure"

LOCATION
  Zone: [____]  |  GPS: 24.1543N [verified]  |  Shift: [A] [B] [C]

PERSONS INVOLVED
  [+ Add Person]
  Name:___  Type: [Regular / Contract]  Role: [Injured / Witness]

IMMEDIATE ACTIONS TAKEN: [____]

MEDIA
  [3 photos captured]  [Add Video]

[Submit -> Mine Manager + Safety Officer notified via FCM + SMS < 60s]
```

---

### 6.5 Overman Shift Report

**Schema:** `overman_report.schema.json`

```
SHIFT REPORT - Shift B | 27 Aug 2027
Reporter: Arun Mandal (Overman) | Zone: District 4, Face 2

MANPOWER DEPLOYED: [32]

GAS READINGS (mandatory for underground mines - CMR Reg 44)
  Station 1 - Face Entry:
    CH4: [0.3] %  |  CO: [0] ppm  |  CO2: [0.1] %
  Station 2 - Return Air:
    CH4: [0.5] %  |  CO: [0] ppm
  WARNING: If CH4 > 1.25% -> instant alert fires to Mine Manager

SHIFT OBSERVATIONS
  [+ Add]  Area:____  Status: [Normal / Attention / Danger]
  Description:____   Action Taken:____

HANDOVER NOTES (to next shift): [____]

GPS: verified  Sync Status: Offline - will upload on surface
[Complete & Handover]
```

---

### 6.6 Attendance Screen

**Schema:** `attendance_record.schema.json`

```
WORKER ATTENDANCE - Shift A | 27 Aug 2027
MODE: [QR Scan]  [Manual Entry]

-- QR SCAN ----------------------------------------------------
[Camera viewfinder - point at worker badge]

Last Scanned:
  [OK] Ramesh Kumar (EMP-2341) - 06:12 AM - Inside geo-fence
  [OK] Sunita Devi (CONT-ABC-087) - 06:14 AM - Inside geo-fence
  [WARN] John Das (CONT-XYZ-012) - Training cert EXPIRED - [Allow / Block]

SUMMARY: 47 scanned | 31 regular | 16 contract | 5 pending
Geo-fence: verified inside Rajmahal OCP boundary (GPS 8m accuracy)
[Close Shift]
```

Geo-fence: client warns if >500m from boundary; server validates on sync and sets `location_mismatch`.

---

### 6.7 Offline Sync Status Screen

```
SYNC STATUS

Connectivity: OFFLINE (last connected 2h 14m ago)

PENDING UPLOADS (12 records)
  Inspection Form - Pit 3 - captured 2h ago
  Safety Observation x3 - 1.5h ago
  Photos x8 (11.4 MB)
  Attendance x47 records

COMPLETED SYNCS
  [OK] Incident Report - synced 06:30 AM
  [OK] Shift Report (Shift A) - synced 06:35 AM

[Force Sync Now]  (enabled when online only)
[Conflict Review: 1 item - tap to resolve manually]
```

---

### 6.8 Push Notification Behaviour

| Priority | Trigger | Channels | App Behaviour |
|----------|---------|----------|--------------|
| CRITICAL | Fatal incident / CH4 > 2.5% | FCM + SMS | Fullscreen takeover, cannot dismiss without action |
| HIGH | CAPA assigned to you | FCM | Banner + badge |
| HIGH | Compliance overdue > 7 days | FCM + SMS | Banner + badge |
| MEDIUM | Compliance due in 7 days | FCM | Badge only |
| MEDIUM | Contractor doc expiring 30 days | FCM | Badge only |
| LOW | Daily production summary | FCM | Silent notification |

---

## 7. State Management Architecture

### 7.1 Web

| Layer | Store | Contains |
|-------|-------|---------|
| Auth / Session | Zustand `authStore` | user object, access token, active mine_id |
| UI / Navigation | Zustand `uiStore` | sidebar open, active filters, modal state |
| Server Cache | TanStack Query | all REST API data (compliance, inspections, etc.) |
| GraphQL Cache | Apollo InMemoryCache | dashboard summary, risk scores |
| Forms | React Hook Form | field values, errors, dirty/touched state |
| Real-time | Zustand `alertStore` + SSE | live alert feed entries |

### 7.2 Mobile

| Layer | Store | Contains |
|-------|-------|---------|
| Auth | Zustand + expo-secure-store | tokens, user profile |
| App State | Zustand `appStore` | connectivity status, sync queue count |
| Form Drafts | WatermelonDB | partially filled inspections, queued observations |
| Synced Records | WatermelonDB (reactive) | all offline-capable field entities |
| Online Lookups | TanStack Query | user list, mine master data (when online) |

---

## 8. API Client & Data Fetching

### 8.1 Axios REST Instance

```typescript
// packages/api-client/src/http.ts
const api = axios.create({ baseURL: env.VITE_API_URL, timeout: 30_000 });

api.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${authStore.getState().accessToken}`;
  config.headers["X-Mine-Id"]  = authStore.getState().activeMineId;
  return config;
});

api.interceptors.response.use(null, async error => {
  if (error.response?.status === 401) {
    await authStore.getState().refreshToken();
    return api(error.config);   // retry once
  }
  throw error;
});
```

### 8.2 Apollo Client (GraphQL — dashboard aggregation)

```typescript
const client = new ApolloClient({
  uri: "/graphql",
  cache: new InMemoryCache({
    typePolicies: {
      DashboardSummary: { keyFields: ["mineId"] },
      MineRiskScore:    { keyFields: ["mineId"] },
    },
  }),
  link: from([authLink, httpLink]),
});
```

### 8.3 TanStack Query Patterns

```typescript
// Standard query — compliance instances
export const useComplianceInstances = (mineId: string, status?: string) =>
  useQuery({
    queryKey: ["compliance", "instances", mineId, status],
    queryFn:  () => api.get(`/compliance/mines/${mineId}/instances`, { params: { status } }),
    staleTime: 5 * 60_000,
    gcTime:    30 * 60_000,
  });

// Mutation with cache invalidation
export const useSubmitEvidence = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/compliance/instances/${data.instanceId}/submit`, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["compliance"] }),
  });
};
```

---

## 9. Offline-First Strategy

### 9.1 WatermelonDB Schema (mirrors json_schemas.md)

```typescript
// mobile-field-app/src/db/schema.ts
export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "inspections",
      columns: [
        { name: "server_id",        type: "string", isOptional: true },
        { name: "mine_id",          type: "string" },
        { name: "inspection_type",  type: "string" },
        { name: "geo_lat",          type: "number" },
        { name: "geo_lng",          type: "number" },
        { name: "geo_accuracy_m",   type: "number" },
        { name: "captured_at",      type: "number" },  // Unix ms — device time
        { name: "sync_status",      type: "string" },  // "pending" | "synced"
        { name: "status",           type: "string" },
      ],
    }),
    tableSchema({ name: "observations",        columns: [/* observation fields */] }),
    tableSchema({ name: "attendance_records",  columns: [/* attendance fields */] }),
    tableSchema({ name: "incidents",           columns: [/* incident fields */] }),
    tableSchema({ name: "safety_observations", columns: [/* stop card fields */] }),
    tableSchema({ name: "overman_reports",     columns: [/* overman fields */] }),
  ],
});
```

### 9.2 Sync Engine

```typescript
// sync/syncEngine.ts
import { synchronize } from "@nozbe/watermelondb/sync";

export async function performSync(db: Database) {
  await synchronize({
    database: db,
    pullChanges: async ({ lastPulledAt }) => {
      const { data } = await api.post("/sync/pull", { lastPulledAt });
      return data;
    },
    pushChanges: async ({ changes }) => {
      await api.post("/sync/push", { changes });
    },
  });
}
```

### 9.3 Conflict Resolution Rules

| Entity | Strategy | Rationale |
|--------|----------|-----------|
| `inspection` | Last-write-wins on metadata; never drop submitted record | Append-only field capture |
| `observation` | Server wins on `violation_id`; local wins on `description` edits | Inspector annotates post-sync |
| `attendance` | Server authoritative (geo-fence check server-side) | Prevents client override of location check |
| `incident` | Both versions kept; flagged for Mine Manager conflict queue | Critical safety — no silent loss |

> Media uploads are fully decoupled from record sync — photos upload lazily via resumable multipart POST to Supabase Storage. Poor connectivity blocks photo upload, never blocks record capture.

---

## 10. Internationalization

| Code | Language | Target Region |
|------|---------|---------------|
| `en` | English | All — default for corporate/regulatory |
| `hi` | Hindi | MP, CG, JH, UP — primary field staff |
| `bn` | Bengali | West Bengal (ECL, BCCL) |
| `or` | Odia | Odisha (MCL) |
| `mr` | Marathi | Maharashtra (WCL) |

```json
{
  "compliance.status.pending":   "laMbit",
  "compliance.status.breached":  "ullanghan",
  "inspection.start":            "nirikShan shuru Karen",
  "alert.critical.pm10":         "PM10 sima ka ullanghan -- {{value}} µg/m³"
}
```

**Voice Input:** Bhashini STT API (Govt of India, 22 scheduled languages) — primary.
Fallback: Whisper API (better accuracy in noisy mine environments).
Transcription queued offline; processed on connectivity restoration.

---

## 11. Form Validation & Shared Schemas

All Zod schemas in `packages/shared-schemas` run identically on the **frontend** (React Hook Form validation) and **backend** (FastAPI Pydantic validation via generated types) — zero drift by design.

**Example — Accident Register (statutory Form 4-A / 4-B / 4-C mapping):**

```typescript
// packages/shared-schemas/src/accident_register.schema.ts
// 1:1 with sgcmp/accident_register_entry.schema.json

export const PersonAffectedSchema = z.object({
  name:                z.string().min(1),
  employee_type:       z.enum(["regular", "contract"]),
  age:                 z.number().int().min(14).max(80).optional(),
  designation:         z.string().optional(),
  nature_of_injury:    z.string().min(1),
  // outcome maps to Form 4-B column "Nature of Injury / Fatality"
  outcome:             z.enum(["recovered", "permanent_disability",
                               "fatal", "under_treatment"]),
  return_to_duty_date: z.string().optional(),   // Form 4-C field
});

export const AccidentRegisterEntrySchema = z.object({
  mine_id:             z.string().uuid(),
  occurrence_type:     z.enum(["fatal_accident", "serious_bodily_injury",
                               "dangerous_occurrence", "near_miss"]),
  date_of_occurrence:  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time_of_occurrence:  z.string().regex(/^\d{2}:\d{2}$/),
  shift:               z.enum(["A", "B", "C", "general"]),
  location_in_mine:    z.string().min(5),
  description:         z.string().min(20),
  persons_affected:    z.array(PersonAffectedSchema).min(1),
  dgms_notification_status: z.enum(["pending", "initial_alert_sent",
                                    "form_4a_submitted"]),
});

// Usage in React Hook Form:
const form = useForm<z.infer<typeof AccidentRegisterEntrySchema>>({
  resolver: zodResolver(AccidentRegisterEntrySchema),
});
```

---

## 12. Geo-Tagging & Maps

### 12.1 GeoStamp Capture (Mobile)

```typescript
// geo/geoTagger.ts — matches geostamp.schema.json exactly
export async function captureGeoStamp(deviceId: string): Promise<GeoStamp> {
  const { coords } = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    latitude:                coords.latitude,
    longitude:               coords.longitude,
    altitude_meters:         coords.altitude ?? null,
    accuracy_meters:         coords.accuracy ?? 999,
    captured_at:             new Date().toISOString(),
    device_id:               deviceId,
    low_confidence_location: (coords.accuracy ?? 999) > 50,  // flag, not reject
    location_mismatch:       false,  // set server-side after geo-fence check
  };
}
```

### 12.2 Server-Side Geo-Fence Validation (on Sync)

```sql
SELECT ST_Contains(
  m.boundary_geojson::geometry,
  ST_SetSRID(ST_Point($lng, $lat), 4326)
) AS within_boundary
FROM mines m
WHERE m.id = $mine_id;
```

If `within_boundary = false`: sets `location_mismatch = true` — record is **not rejected**, just flagged. Mine Manager sees the flag on the web dashboard for review. (Underground GPS is inherently imprecise.)

### 12.3 Map Libraries

| Context | Library | Usage |
|---------|---------|-------|
| Web full map | MapLibre GL JS + deck.gl | Mine boundary, heatmap, sensor pins |
| Web widget | MapLibre (embedded) | GeoStamp preview in detail screens |
| Mobile | react-native-maps | Mine boundary polygon, offline tile cache |
| Spatial queries | PostGIS (server) | Geo-fence check, buffer analysis |

---

## 13. Testing Strategy

### 13.1 Web

| Layer | Tool | Target |
|-------|------|--------|
| Unit — utils, hooks | Vitest | 80%+ line coverage |
| Component | React Testing Library + MSW | All ui-kit + key feature components |
| E2E | Playwright | Login, Submit compliance, Flag violation, OCR review, Assign CAPA |
| Accessibility | axe-core via Playwright | WCAG 2.1 AA on all main screens |

### 13.2 Mobile

| Layer | Tool | Target |
|-------|------|--------|
| Unit | Jest (Expo preset) | Sync engine, conflict resolver, geo utilities |
| Component | React Native Testing Library | Core screens |
| Offline/Sync | WatermelonDB in-memory adapter | Offline capture to sync to conflict resolution |
| E2E | Detox | Android: Offline capture -> connectivity restore -> verify sync |

---

## 14. Performance & Accessibility

### 14.1 Web Performance Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s on 4G |
| TTI | < 3.5s |
| Initial JS bundle (gzipped) | < 200KB (code-split via TanStack Router) |
| Dashboard query — mine-scope | < 800ms P95 (live query) |
| Dashboard query — corporate rollup | < 200ms P95 (Redis cache hit) |

Strategies: Apollo `@defer`, Suspense + skeleton loaders, Redis materialized rollups for cross-mine aggregates.

### 14.2 Mobile Performance Targets

| Metric | Target |
|--------|--------|
| Cold start | < 2s |
| WatermelonDB write (single record) | < 50ms |
| GPS capture per record | < 1s |
| Batch sync (50 records on 3G) | < 10s |
| Max local DB size | 500MB (LRU eviction for synced media cache) |

### 14.3 Accessibility Standards

- **GIGW** (Government of India Website Guidelines) compliance for web portal
- **WCAG 2.1 AA**: keyboard navigable, ARIA labels, color contrast >= 4.5:1
- Minimum touch target: **48x48dp** (critical for gloved mine workers)
- All icons have visible text labels (low digital-literacy field users)
- Screen readers: NVDA / JAWS (web), TalkBack / VoiceOver (mobile)
- Font scaling: UI adapts to system large-text settings without layout break

---

*Version 1.0 | Frontend Specification | SIH 2026*
*References: [LLD.md](file:///c:/Coding/SIH2026/LLD.md) | [json_schemas.md](file:///c:/Coding/SIH2026/json_schemas.md) | [Brainstrom1.md](file:///c:/Coding/SIH2026/Brainstrom1.md)*
