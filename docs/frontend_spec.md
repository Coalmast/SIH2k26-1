# Frontend Specification
## Web Dashboard + Mobile Field App

**Platform:** Coal Operations Monitoring, Enforcement & Transparency (COMET)
**Problem:** SIH 2026 — 26024 | Coal India Limited | Ministry of Coal
**References:** [TECH_STACK.md](file:///c:/Coding/SIH2026/docs/TECH_STACK.md) · [backend_spec.md](file:///c:/Coding/SIH2026/docs/backend_spec.md) · [workflows.md](file:///c:/Coding/SIH2026/docs/workflows.md)

---

## Table of Contents

1. [Technology Stack](#1-technology-stack)
2. [Monorepo & Project Structure](#2-monorepo--project-structure)
3. [Design System & UI Kit](#3-design-system--ui-kit)
4. [Authentication & Session Management](#4-authentication--session-management)
5. [Web Dashboard — All Pages & UX Flows](#5-web-dashboard--all-pages--ux-flows)
6. [Mobile Field App — Screens & Flows](#6-mobile-field-app--screens--flows)
7. [State Management Architecture](#7-state-management-architecture)
8. [API Client & Data Fetching (Supabase-first)](#8-api-client--data-fetching-supabase-first)
9. [Offline-First Strategy](#9-offline-first-strategy)
10. [Real-Time Alerts (Supabase Realtime)](#10-real-time-alerts-supabase-realtime)
11. [Internationalization](#11-internationalization)
12. [Form Validation & Shared Schemas](#12-form-validation--shared-schemas)
13. [Geo-Tagging & Maps](#13-geo-tagging--maps)
14. [Testing Strategy](#14-testing-strategy)
15. [Performance & Accessibility](#15-performance--accessibility)

---

## 1. Technology Stack

### 1.1 Web Dashboard

| Layer | Choice | Version | Purpose |
|-------|--------|---------|---------|
| Build | **Vite** | 6.x | Fast dev server, native ESM, Rollup prod build |
| Framework | **React** | 19.x | UI rendering, React Compiler, `useActionState` |
| Language | **TypeScript** | 5.7+ | Strict mode; shared across monorepo |
| Routing | **TanStack Router** | v1 | Type-safe, file-based, code-split per feature |
| Server State | **TanStack Query v5** | 5.x | Supabase query caching, retries, stale-while-revalidate |
| Client State | **Zustand** | v4 | Lightweight UI state (sidebar, filters, modals) |
| Forms | **React Hook Form + Zod** | — | Shared Zod schemas from `packages/shared-schemas` |
| UI | **shadcn/ui + Radix Primitives** | — | Accessible, headless, composable primitives |
| Styling | **Tailwind CSS v4** | 4.x | GIGW/WCAG accessibility design tokens |
| Charts | **Recharts** | v2 | Compliance scores, trends, production charts |
| Maps | **MapLibre GL JS + deck.gl** | — | Open-source, no vendor lock-in |
| **Backend / DB** | **Supabase JS Client** | v2 | PostgREST queries, Realtime subscriptions, Storage, Auth |
| **Real-time** | **Supabase Realtime** | — | Live alert feed via WebSocket channels (no polling) |
| i18n | **i18next + react-i18next** | v23 | EN, HI, BN, OR, MR |
| Testing | **Vitest + React Testing Library + Playwright** | — | Unit → Component → E2E |

> **No Apollo Client / GraphQL.** Dashboard aggregation is done via PostgREST queries + Redis-cached materialized views served from FastAPI. No `axios` for auth — the Supabase client handles all token management.

### 1.2 Mobile Field App

| Layer | Choice | Version | Purpose |
|-------|--------|---------|---------|
| Framework | **React Native** (New Architecture) | 0.85 | iOS/Android; Fabric + TurboModules + Hermes |
| Tooling | **Expo Bare + EAS Build** (SDK 52) | — | OTA updates, simplified native CI signing |
| Navigation | **React Navigation** | v7 | Stack, Bottom Tabs, Drawer navigators |
| Offline DB | **WatermelonDB** | v0.27 | SQLite-backed reactive local DB — offline-first |
| Sync | Custom (WatermelonDB sync protocol) | — | Pull/push against FastAPI `/api/v1/sync` |
| **Backend / Auth** | **Supabase JS Client** (React Native) | v2 | Auth sessions, Storage uploads, Realtime push alerts |
| Maps/GPS | **react-native-maps + expo-location** | — | GPS geo-tagging, mine boundary display |
| Camera | **react-native-vision-camera** | v4 | High-perf photo/video for observations |
| Voice | **Bhashini STT** (primary) + **Whisper** (fallback) | — | Regional language voice narration |
| Background | **expo-background-task** | — | Queued sync on connectivity resume |
| Push | **FCM via expo-notifications** | — | Alerts, CAPA, reminders from Supabase Realtime |
| Server State | **TanStack Query v5** | — | Same pattern as web (online lookups) |
| Client State | **Zustand v4** | — | Auth, sync status, app settings |
| Secure Store | **expo-secure-store** | — | Supabase session tokens (Keystore/Keychain) |
| Biometric | **expo-local-authentication** | — | Fingerprint/Face ID — underground re-auth |
| QR | **expo-barcode-scanner** | — | Worker attendance via badge QR scan |

---

## 2. Monorepo & Project Structure

```
comet-platform/                # pnpm workspaces + Turborepo
├── apps/
│   ├── web-dashboard/         # Vite + React 19
│   │   └── src/
│   │       ├── features/
│   │       │   ├── dashboard/         # Mine Manager + Corporate views
│   │       │   ├── compliance/        # Calendar, instance detail, evidence upload
│   │       │   ├── inspection/        # List, detail, observation, CAPA
│   │       │   ├── contractor/        # Profile, docs, workers, trust score
│   │       │   ├── environment/       # EC conditions, sensor readings, forecast
│   │       │   ├── production/        # Shift readings, anomaly flags
│   │       │   ├── incident/          # Reports, Form 4-A/4-B/4-C
│   │       │   ├── ocr/               # Upload, review queue, side-by-side
│   │       │   ├── gis/               # MapLibre fullscreen + deck.gl layers
│   │       │   ├── alerts/            # Notification center (Supabase Realtime)
│   │       │   ├── grievance/         # Intake, status, resolution
│   │       │   ├── ai-analytics/      # Risk score, clusters, anomalies
│   │       │   ├── reports/           # Statutory PDF generator
│   │       │   └── admin/             # Mine, user, regulations, checklist builder
│   │       ├── components/            # AppShell, Sidebar, TopBar, common UI
│   │       ├── hooks/                 # useAuth, usePermission, useRealtimeAlerts
│   │       ├── lib/
│   │       │   ├── supabase.ts        # createClient() singleton + typed queries
│   │       │   └── i18n.ts            # i18next init
│   │       └── routes/                # TanStack Router file-based routes
│   │
│   ├── mobile-field-app/      # React Native (Expo Bare)
│   │   └── src/
│   │       ├── screens/
│   │       ├── navigation/
│   │       ├── db/            # WatermelonDB schema + models
│   │       ├── sync/          # Sync engine + conflict resolver
│   │       ├── geo/           # GeoStamp capture via expo-location
│   │       ├── camera/        # Media capture + queued Supabase Storage upload
│   │       └── background/    # expo-background-task sync handler
│   │
│   └── regulator-portal/      # Vite, read-only (DGMS / PCB)
│
├── packages/
│   ├── shared-types/          # TS interfaces (User, Mine, Inspection…)
│   ├── shared-schemas/        # Zod schemas — mirrors Pydantic models in FastAPI
│   │   └── src/
│   │       ├── geostamp.schema.ts
│   │       ├── inspection.schema.ts
│   │       ├── observation.schema.ts
│   │       ├── violation.schema.ts
│   │       ├── corrective_action.schema.ts
│   │       ├── compliance_instance.schema.ts
│   │       ├── compliance_evidence.schema.ts
│   │       ├── incident_report.schema.ts   # incident_reports table
│   │       ├── contractor.schema.ts
│   │       ├── contract_worker.schema.ts
│   │       ├── environment_reading.schema.ts
│   │       ├── production_reading.schema.ts
│   │       ├── mine_risk_score.schema.ts
│   │       └── alert.schema.ts
│   ├── ui-kit/                # shadcn/ui component library
│   ├── mobile-ui-kit/         # React Native component library
│   └── i18n-resources/        # locales/en.json, hi.json, bn.json, or.json
│
├── turbo.json
└── pnpm-workspace.yaml
```

### Feature Folder Convention

```
features/compliance/
├── components/
│   ├── ComplianceCalendar.tsx       # Monthly calendar with due items
│   ├── ComplianceInstanceCard.tsx   # Status badge + quick actions
│   ├── ComplianceHealthScore.tsx    # 0-100 animated radial gauge
│   └── EvidenceUploader.tsx         # Drag-drop -> Supabase Storage + OCR trigger
├── hooks/
│   ├── useComplianceInstances.ts    # TanStack Query wrapping supabase.from()
│   └── useComplianceHealth.ts       # FastAPI /compliance/mines/{id}/health-score
├── forms/
│   ├── SubmitEvidenceForm.tsx        # RHF + Zod (compliance_evidence schema)
│   └── RejectInstanceForm.tsx
└── routes/
    ├── compliance.index.tsx
    ├── compliance.$mineId.tsx
    └── compliance.$mineId.$instanceId.tsx
```

---

## 3. Design System & UI Kit

### 3.1 Color Tokens

```typescript
// packages/ui-kit/src/tokens.ts
export const colors = {
  // Brand
  primaryNavy:   "hsl(216 85% 24%)",   // CIL deep navy — sidebar, headers
  accentAmber:   "hsl(35  95% 50%)",   // Safety amber — CTAs, highlights

  // Status palette (maps to compliance_instance.status enum)
  compliant:     "hsl(142 71% 45%)",   // "approved" — green
  warning:       "hsl(38  92% 50%)",   // "in_progress" / expiring — amber
  breach:        "hsl(4   86% 52%)",   // "breached" / "critical" — red
  pending:       "hsl(220 14% 60%)",   // "pending" — slate

  // Risk level palette (maps to risk_rating_enum)
  riskLow:       "hsl(142 71% 45%)",
  riskMedium:    "hsl(38  92% 50%)",
  riskHigh:      "hsl(25  95% 53%)",
  riskCritical:  "hsl(4   86% 52%)",

  // Violation severity (maps to violation_severity enum)
  severityMinor:    "hsl(220 14% 60%)",
  severityModerate: "hsl(38  92% 50%)",
  severityMajor:    "hsl(25  95% 53%)",
  severityCritical: "hsl(4   86% 52%)",

  // Surface
  surface:       "hsl(220 20% 97%)",
  card:          "hsl(0   0%  100%)",
  sidebar:       "hsl(216 30% 18%)",
};

export const typography = {
  fontFamily: "'Inter Variable', 'Noto Sans Devanagari', sans-serif",
  // Noto Sans Devanagari for Hindi/Marathi; fallback covers Bengali/Odia
};
```

### 3.2 Core Reusable Components

| Component | Description | DB Field Mapped |
|-----------|-------------|-----------------|
| `StatusBadge` | `pending/submitted/approved/breached/revision_requested` pill | `compliance_instances.status` (`instance_status` enum) |
| `RiskScoreGauge` | Animated 0-100 arc + contributing factors tooltip | `mine_risk_scores.score`, `.contributing_factors JSONB` |
| `SeverityChip` | `minor/moderate/major/critical` color chip | `violations.severity` (`violation_severity` enum) |
| `CAPAStatusBadge` | `assigned/in_progress/overdue/verified_closed` | `corrective_actions.status` (`capa_status` enum) |
| `GeoStampDisplay` | lat/lng/accuracy + mini MapLibre pin | `geo_stamp JSONB` (inspections, observations, incidents) |
| `ComplianceCalendar` | Monthly view — overdue red, upcoming amber, completed green | `compliance_instances.due_date`, `.status` |
| `ViolationTimeline` | Observation → CAPA assigned → Closed step indicator | `violations` + `corrective_actions` |
| `MediaGallery` | Lightbox grid; URLs from Supabase Storage signed URLs | `media_attachments.file_url` |
| `SyncStatusBanner` | "12 records pending upload" persistent top bar | WatermelonDB queue count |
| `OCRSideBySide` | Scan image (left) / extracted fields (right) with confidence | `ocr_extraction_results.extracted_fields JSONB`, `.overall_confidence` |
| `RealtimeAlertFeed` | Supabase Realtime WebSocket — live notification ribbon | `alerts` table INSERT events |
| `MineSelector` | Hierarchical Subsidiary → Mine dropdown scoped by JWT claims | `mines`, `subsidiaries` via PostgREST |
| `ContractorTrustBadge` | 0-100 badge with score breakdown tooltip | `contractors.trust_score`, `.risk_rating` |
| `ShiftPicker` | Shift A / B / C / General selector | `shift_enum` |

### 3.3 Layout Shell

```
AppShell
├── TopBar
│   ├── MineSelector (Mine Manager, Safety Officer, Field Officer)
│   │     OR SubsidiarySelector (Subsidiary Admin, Corporate Executive)
│   ├── RealtimeAlertBell  ← Supabase Realtime badge count
│   ├── LanguageSwitcher (EN / HI / BN / OR / MR)
│   └── UserMenu (Profile, Settings, Logout)
│
├── Sidebar (role-scoped — items hidden if permission missing)
│   ├── Dashboard              [all roles]
│   ├── Compliance             [compliance_officer, mine_manager, regulator]
│   ├── Inspections            [safety_officer, mine_manager, regulator]
│   ├── Contractors            [contractor_manager, mine_manager]
│   ├── Environment            [environmental_officer, mine_manager, regulator]
│   ├── Production             [mine_manager, corporate_executive]
│   ├── Incidents              [safety_officer, mine_manager, regulator]
│   ├── OCR / Digitization     [compliance_officer, system_admin]
│   ├── GIS Map                [all roles]
│   ├── Alerts                 [all roles]
│   ├── Grievances             [mine_manager, subsidiary_admin]
│   ├── AI Analytics           [mine_manager, corporate_executive]
│   ├── Reports                [compliance_officer, mine_manager, regulator]
│   └── Admin                  [system_admin, subsidiary_admin]
│
└── MainContent  (code-split, route-rendered, suspense boundaries)
```

---

## 4. Authentication & Session Management

### 4.1 Web Auth Flow

```
User lands on /login
  → Supabase Auth: Email/Password or Magic Link
  → supabase.auth.signIn() → session stored in memory + cookie (HTTP-Only)
  → onAuthStateChange listener updates Zustand authStore
  → Redirect to /dashboard/:mineId (mine-scoped) or /dashboard/corporate

Session refresh:
  → Supabase client auto-refreshes access token via refresh token
  → On 401: Supabase SDK retries automatically
  → On refresh failure: redirect /login

MFA (for subsidiary_admin, corporate_executive, regulator, system_admin):
  → Supabase TOTP MFA prompt after initial sign-in
```

### 4.2 Mobile Auth Flow

```
App cold start
  → Supabase checks expo-secure-store for stored session
  → Found: restore session → main app
  → Not found: → LoginScreen → supabase.auth.signIn()
  → Session persisted to expo-secure-store (iOS Keychain / Android Keystore)

Underground / offline re-auth:
  → expo-local-authentication (biometric) — no network needed
  → Last valid session grants read access to local WatermelonDB
  → Sync resumes automatically when connectivity restored
```

### 4.3 Permission Hook

```typescript
// hooks/usePermission.ts
export function usePermission(resource: string, action: string): boolean {
  const { permissions } = useAuthStore();
  return permissions.includes(`${resource}:${action}`);
}

// hooks/useRole.ts
export function useRole(): role_name_enum {
  const { role } = useAuthStore();
  return role;
}

// Usage example
function ApproveButton({ instanceId }: { instanceId: string }) {
  const canApprove = usePermission("compliance_instance", "approve");
  if (!canApprove) return null;
  return <Button onClick={() => approveInstance(instanceId)}>Approve</Button>;
}
```

### 4.4 Role Definitions (from DB seed)

```typescript
export type AppRole =
  | "field_officer"       | "mine_manager"
  | "safety_officer"      | "environmental_officer"
  | "compliance_officer"  | "contractor_manager"
  | "subsidiary_admin"    | "corporate_executive"
  | "regulator"           | "system_admin";
```

All routes wrapped in `<RequireRole roles={[...]} />`. Sidebar items filtered by `usePermission()` reading JWT claims extracted from the Supabase session.

---

## 5. Web Dashboard — All Pages & UX Flows

### 5.1 Login Page
**Route:** `/login`

```
+──────────────────────────────────────────+
|  [Coal India Logo]  COMET Platform       |
|  Coal Operations Monitoring & Enforcement|
|                                          |
|  Email: [_______________________________]|
|  Password: [____________________________]|
|                                          |
|  [Sign In]   [Send Magic Link]           |
|                                          |
|  — or —                                  |
|  [Continue as Regulator (DGMS/PCB)]      |
|                                          |
|  Trouble signing in? Contact your admin  |
+──────────────────────────────────────────+
```

**UX Notes:**
- On success: redirect is role-based (`mine_manager` → `/dashboard`, `regulator` → `/regulator/compliance`)
- Failed login: inline error, lockout after 5 attempts (Supabase Auth built-in)
- Magic link preferred for field workers (no password to forget)

---

### 5.2 Mine Manager Dashboard
**Route:** `/dashboard`
**Data:** FastAPI `/compliance/mines/{id}/health-score` + Supabase PostgREST (violations, alerts) + Redis-cached rollup
**Real-time:** Supabase Realtime `alerts:mine_id=eq.{mineId}` channel

```
+─────────────────────────────────────────────────────────────────+
|  Mine: Rajmahal OCP | ECL  [Change Mine ▾]   🔔 3  👤 Suresh  |
+──────────────┬──────────────┬──────────────┬────────────────────+
|  COMPLIANCE  |  VIOLATIONS  |  CONTRACTOR  |   PRODUCTION       |
|  Score: 84   |  Open: 12    |  Score: 78   |   45,200 MT today  |
|  ▲+2 MoM     |  ● 3 Critical|  2 expiring  |   vs 48,000 target |
|  [View All]  |  [Resolve]   |  [View]      |   [Details]        |
+──────────────┴──────────────┴──────────────┴────────────────────+
|  COMPLIANCE CALENDAR (next 14 days)  | LIVE ALERTS (Realtime)  |
|  ● Explosive Return — TODAY          | 🔴 PM10 Breach 820ug/m3 |
|  ● Safety Committee — 3 days         |    CAAQMS-01 | 10:42 AM |
|  ● EC Half-Yearly — 18 days          | 🟡 CLRA Expiring 18d   |
|                                      | 🟢 CAPA Closed OK       |
+──────────────────────────────────────+─────────────────────────+
|  TOP OPEN VIOLATIONS                 |  ENV STATUS              |
|  🔴 Roof Support — Pit 3 East        |  PM10: 820 µg/m³ BREACH |
|      CMR Reg 100 | HIGH | 5d overdue |  pH:   7.2  COMPLIANT   |
|  🟡 PPE Non-compliance x3 Shift B   |  Noise: 82dB  AMBER     |
+──────────────────────────────────────+─────────────────────────+
|  PRODUCTION TREND — Last 7 days (Recharts bar: actual vs target)|
|  [Mon][Tue][Wed][Thu][Fri][Sat][Sun]                            |
+─────────────────────────────────────────────────────────────────+
```

**UX Flow:**
1. Page loads with skeleton loaders while Supabase queries run in parallel
2. `RealtimeAlertFeed` connects on mount; new alerts animate in with slide-down + colour flash
3. Clicking any KPI card navigates to relevant module (e.g. Violations → `/inspections/violations`)
4. `RiskScoreGauge` tooltip on hover shows top 3 contributing factors

---

### 5.3 Corporate / Subsidiary Dashboard
**Route:** `/dashboard/corporate` or `/dashboard/subsidiary/:subId`
**Data:** FastAPI rollup endpoint (Redis-cached materialized view, 5 min TTL)

```
+─────────────────────────────────────────────────────────────────+
|  ECL Subsidiary — 47 Active Mines                  [Download PDF]|
+─────────────────────────────────────────────────────────────────+
|  MINE RISK MAP (MapLibre + deck.gl CircleLayer)                 |
|  Pins coloured by risk_level: 🔴 HIGH (7) 🟡 MED (23) 🟢 (17) |
|  Click pin → mini detail card → [Go to Mine Dashboard]          |
+────────────────────────────┬────────────────────────────────────+
|  RISK RANKING              |  AI INSIGHT PANEL                  |
|  1. Jambad UG Mine  81 ▲   |  "Mine Jambad shows 4 converging  |
|  2. Rajmahal OCP    74 =   |   risk indicators. Targeted        |
|  3. Sonepur Bazari  68 ▼   |   inspection recommended."         |
|  [See All 47 Mines]        |  [View Full AI Analysis]           |
+────────────────────────────┴────────────────────────────────────+
|  PRODUCTION vs PLAN — grouped bar  | INCIDENT TREND — 12 months |
|  Recharts grouped bar per mine     | Recharts line: fatal/serious|
+────────────────────────────────────+────────────────────────────+
|  COMPLIANCE HEATMAP (table)                                     |
|  Mine | Safety% | Env% | Labour% | Production% | Overdue Count  |
+─────────────────────────────────────────────────────────────────+
```

---

### 5.4 Regulator Portal
**App:** `apps/regulator-portal` — separate Vite build, zero write permissions
**Access:** DGMS Inspector, State PCB Officer (jurisdiction-scoped via JWT `mine_ids` claim)

| Route | Screen | Content |
|-------|--------|---------|
| `/compliance` | Compliance Overview | Mine-wise compliance table (all categories) + CSV/PDF export |
| `/inspections` | Inspection History | Full inspection list + observation→CAPA audit trail |
| `/environment` | Environmental Monitor | Real-time EC conditions + CAAQMS readings |
| `/incidents` | Incident Register | Form 4-A/4-B records (view only) + blockchain hash verify |
| `/reports` | Statutory Documents | Download signed PDFs; verify SHA-256 vs NBG blockchain |

> All data fetched via Supabase PostgREST with read-only JWT role. No `POST`/`PATCH`/`DELETE` ever made from this app. "Verify Integrity" button calls NBG API via FastAPI `/api/v1/reports/{id}/verify`.

---

### 5.5 Compliance Module
**Routes:** `/compliance`, `/compliance/:mineId`, `/compliance/:mineId/:instanceId`

#### Compliance Overview (`/compliance`)

```
HEADER: [Mine: Rajmahal OCP ▾] [Aug 2026 ◀ ▶] [Filter: All | Safety | Env | Production | Labour]
        Compliance Health Score: 84/100 ● [Gauge animated]

KANBAN BOARD
┌─────────────────┬──────────────────┬────────────────────┬────────────────┐
│   PENDING (8)   │  IN PROGRESS (4) │   SUBMITTED (3)    │  APPROVED (12) │
├─────────────────┼──────────────────┼────────────────────┼────────────────┤
│ 🛡 Daily Vent   │ 📋 Monthly Safety│ 🌿 Env Statement   │ ✅ Form 3      │
│  CMR Reg 105    │  Committee Mtg   │  Form V - Annual   │  Annual Return │
│  Due: TODAY     │  Due: 31 Aug     │  Submitted 25 Aug  │  Approved 2 Feb│
│  [Submit]       │  [View Progress] │  Under Review      │  [Download PDF]│
└─────────────────┴──────────────────┴────────────────────┴────────────────┘
```

**UX Flow:**
- Kanban columns map to `instance_status` enum values
- Drag-and-drop is disabled (status transitions only via explicit actions)
- `OVERDUE` items highlighted in red with days-overdue count
- Clicking a card opens the Instance Detail slide-over panel

#### Compliance Calendar View (toggle)

```
[Kanban] [Calendar ●]   ← toggle

   AUGUST 2026
Mon  Tue  Wed  Thu  Fri  Sat  Sun
                               1 🔴
 3 🟡   4     5     6     7    8    9
10    11    12    13    14   15 🔴  16
...
🔴 = Overdue  🟡 = Due this week  ⚪ = Due later  ✅ = Approved
```

#### Compliance Instance Detail (`/compliance/:mineId/:instanceId`)

```
┌─────────────────────────────────────────────────────────────────┐
│ Daily Ventilation Survey — CMR 2017, Reg 105                    │
│ Mine: Rajmahal OCP | Period: 30 Aug 2026 | Status: PENDING 🟡  │
│ Assigned: Rajesh Kumar (Safety Officer) | Due: 30 Aug 2026      │
│ Responsible Role: safety_officer | Authority: DGMS              │
├─────────────────────────────────────────────────────────────────┤
│ EVIDENCE UPLOAD                                                  │
│ Documents required: Ventilation survey sheet, Station readings  │
│                                                                  │
│  [📄 Drag & Drop PDF / JPG — or scan document with OCR]        │
│                                                                  │
│  ✅ ventilation_aug30.pdf  [OCR verified — all fields 94%+]    │
│  ⚠  station_readings.jpg  [OCR: 2 fields need review]          │
│     → [Review OCR Extraction] opens OCRSideBySide panel        │
├─────────────────────────────────────────────────────────────────┤
│ APPROVAL TIMELINE                                                │
│  ○ Submitted: Rajesh Kumar | 29 Aug 2026 14:32 | GPS verified  │
│  ○ Under Review — Sr. Compliance Officer                        │
│  ○ Awaiting Approval                                            │
│                                                                  │
│  [Approve]  [Request Revision]  [Reject]  — compliance_officer only │
├─────────────────────────────────────────────────────────────────┤
│ AUDIT TRAIL  [View Blockchain Hash]  [Export PDF]               │
└─────────────────────────────────────────────────────────────────┘
```

**Submit Evidence UX Flow:**
1. User drags PDF/JPG into upload zone
2. File uploads to Supabase Storage (`compliance-evidence/{mine_id}/{instance_id}/`)
3. FastAPI OCR BackgroundTask triggered via Supabase Webhook
4. Polling via TanStack Query (`refetchInterval: 3000`) until `ocr_status = 'completed'`
5. If `overall_confidence < 0.85`: inline `OCRSideBySide` panel opens for correction
6. On approve: `compliance_instances.status` → `approved`, audit record written

---

### 5.6 Inspection & Violation Management
**Routes:** `/inspections`, `/inspections/:id`, `/violations`, `/violations/:id`, `/corrective-actions/:id`

#### Inspection List (`/inspections`)

```
HEADER: [Mine ▾] [Type: All ▾] [Date Range ▾] [Status: All ▾]  [+ Schedule Inspection]

INSPECTION LIST
  ──────────────────────────────────────────────────────────────────
  DGMS Annual General | Rajmahal OCP | 15 Aug 2026
  By: Suresh Patel (Safety Officer) | Status: SUBMITTED ✅
  12 observations | 3 violations | GPS: verified
  [View Details]
  ──────────────────────────────────────────────────────────────────
  Internal Safety Committee | Pit 3 East | 28 Aug 2026
  By: Arun Mandal (Field Officer) | Status: IN PROGRESS 🟡
  7 / 24 checkpoints | sync_status: SYNCED
  [Continue]
  ──────────────────────────────────────────────────────────────────
```

#### Inspection Detail (`/inspections/:id`)

```
┌─────────────────────────────────────────────────────────────────┐
│ DGMS Annual General | Rajmahal OCP | 15 Aug 2026                │
│ By: Suresh Patel | GPS: 24.1543°N 87.0243°E | 09:14 → 16:27   │
│ Template: HEMM Pre-Operational Safety [v1]                      │
├─────────────────────────────────────────────────────────────────┤
│ OBSERVATIONS  (12 total | 3 violations | 7 OK | 2 observations) │
│                                                                  │
│ 🔴 [VIOLATION] Roof support spacing exceeds approved plan       │
│    Zone: Pit 3 East | Statute: CMR Reg 100 | Severity: HIGH     │
│    obs_severity: high → auto-created violation                  │
│    [3 📷 Photos]  [🎤 Voice 0:42]  [Assign CAPA]               │
│                                                                  │
│ 🟡 [OBSERVATION] PPE non-compliance — 4 workers                 │
│    Zone: Coal Handling Plant | Severity: MEDIUM                 │
│    [Flag as Violation]  [Mark Resolved]                         │
│                                                                  │
│ 🟢 [OK] Ventilation fan operational — logbook current           │
├─────────────────────────────────────────────────────────────────┤
│ [Generate Inspection Memo PDF]  [Digital Sign & Submit]         │
└─────────────────────────────────────────────────────────────────┘
```

#### Violation Detail + Assign CAPA (`/violations/:id`)

```
┌─────────────────────────────────────────────────────────────────┐
│ VIO-2026-0847 — Roof Support Spacing                            │
│ Statute: CMR 2017 Reg 100 | Severity: HIGH | Status: REPORTED  │
│ Mine: Rajmahal OCP | Zone: Pit 3 East | Observed: 15 Aug 2026  │
│ Reported by: Suresh Patel | is_regulator_visible: false        │
├─────────────────────────────────────────────────────────────────┤
│ ASSIGN CORRECTIVE ACTION (CAPA)                                 │
│ Description:  [Inspect and reinstall roof bolts per support...]  │
│ Assign To:    [Search: Ramesh Singh (Safety Officer) ▾]         │
│ Due Date:     [22 Aug 2026] (default T+7 days)                  │
│ [Assign CAPA]                                                   │
├─────────────────────────────────────────────────────────────────┤
│ ESCALATION LADDER (auto-managed by FastAPI BackgroundTasks)     │
│  T+1d  → Mine Manager notified if CAPA not started             │
│  T+3d  → Escalated to Subsidiary Head                          │
│  T+7d  → is_regulator_visible = true (Regulator can see)       │
│  T+14d → Regulatory authority alerted                          │
└─────────────────────────────────────────────────────────────────┘
```

#### CAPA Detail (`/corrective-actions/:id`)

```
CORRECTIVE ACTION — Roof Support Fix (Pit 3 East)
Status: IN PROGRESS 🟡 | Due: 22 Aug 2026 | Assigned: Ramesh Singh
Source: Violation VIO-2026-0847

PROGRESS
  [____________________________________________________]
  Status: [Assigned ▾] → [In Progress] → [Completed] → [Pending Verification]

EVIDENCE (to mark complete)
  [Upload completion photos / report]
  ← stored in Supabase Storage: corrective_actions/{id}/

TIMELINE
  15 Aug  CAPA Assigned by Suresh Patel
  17 Aug  Status → In Progress
  22 Aug  ⚠ Due Date (today)
  [Verify & Close]  — mine_manager / compliance_officer only
```

---

### 5.7 Contractor Management
**Routes:** `/contractors`, `/contractors/:id`, `/contractors/:id/workers`

#### Contractor List (`/contractors`)

```
HEADER: [Mine ▾] [Status: Active ▾] [Trust Score ▾]  [+ Onboard Contractor]

  ABC Construction Pvt Ltd  — Trust: 72/100 🟡 MEDIUM  Active
  CLRA: OK | ESI: OK | EPF: OK | Safety Cert: ⚠ EXPIRING 18d | Insurance: 🔴 EXPIRED
  47 workers assigned | Rajmahal OCP Pit 3
  [View Profile]

  XYZ Blasting Services  — Trust: 31/100 🔴 HIGH RISK  Active
  2 linked violations | CAPA closure rate: 45%
  [View Profile]  [Suspend]
```

#### Contractor Profile (`/contractors/:id`)

```
┌─────────────────────────────────────────────────────────────────┐
│ ABC Construction Pvt Ltd                                        │
│ Trust Score: 72/100 🟡 MEDIUM   Status: ACTIVE                  │
│ Reg No: MH-CLRA-20210345 | GSTIN: 27AABCC...                  │
├─────────────────────────────────────────────────────────────────┤
│ DOCUMENT STATUS                                                  │
│  CLRA License        ✅ Valid — Exp: 30 Nov 2027               │
│  ESI Registration    ✅ Valid                                   │
│  EPF Registration    ✅ Valid                                   │
│  Safety Training     ⚠ Expiring in 18 days  [Send Reminder]   │
│  Insurance Policy    🔴 EXPIRED 15 Jul 2026  [Upload New ↑]   │
│                                                                  │
│  [Upload Document] → triggers OCR extraction automatically      │
├─────────────────────────────────────────────────────────────────┤
│ ACTIVE ASSIGNMENTS                                              │
│  Rajmahal OCP | OB Removal Pit 3 | 47 Workers | Until Dec 2026 │
├─────────────────────────────────────────────────────────────────┤
│ CONTRACT WORKERS (47)   [+ Add Worker]  [Search by name/ESI]   │
│ Ramesh Kumar | CONT-2341 | Training: ✅ | ESI: ✅              │
│ John Das     | CONT-2342 | Training: 🔴 EXPIRED               │
├─────────────────────────────────────────────────────────────────┤
│ AI TRUST SCORE BREAKDOWN                                        │
│  Document Validity:    28/40 (Insurance expired: -12)           │
│  Safety Record:        24/30 (3 linked violations: -6)          │
│  CAPA Closure Rate:    16/20 (closure rate: 80%)                │
│  Billing Anomaly:       4/10 (1 flag detected)                  │
│  [View AI Explanation]  [Flag as High Risk]                     │
└─────────────────────────────────────────────────────────────────┘
```

**Onboard Contractor UX Flow:**
1. Multi-step form: Basic Info → Documents → Assignment
2. Each document upload triggers Supabase Storage → OCR BackgroundTask
3. Trust score computed automatically by FastAPI after all docs uploaded

---

### 5.8 Environmental Monitoring
**Route:** `/environment/:mineId`

```
┌─────────────────────────────────────────────────────────────────┐
│ Rajmahal OCP — Environmental Dashboard                          │
│ EC No: EC/2019/0482 | 2 Amber, 1 Red of 54 EC Conditions       │
├──────────────────────────────┬──────────────────────────────────┤
│ EC CONDITIONS TRACKER        │ MAP (MapLibre)                   │
│ Cond 23: PM10 ≤ 600 µg/m³   │ CAAQMS-01 pin → popup:          │
│   Current: 820 🔴 BREACHED  │   PM10: 820 | PM2.5: 64         │
│                              │   [Manual Entry] [Historical]   │
│ Cond 31: BOD ≤ 30 mg/L      │                                  │
│   Current: 28 🟢 COMPLIANT  │ CAAQMS-02 pin → popup...        │
│                              │                                  │
│ Cond 47: Green Belt ≥ 5 Ha   │                                  │
│   Current: 4.2 🟡 AMBER     │                                  │
│   [Add Manual Reading]       │                                  │
├──────────────────────────────┴──────────────────────────────────┤
│ PARAMETER TRENDS — Last 7 days (Recharts multi-line)            │
│ [PM10] [PM2.5] [pH] [Noise dB] [SO2] — toggle each line        │
│ Red horizontal line = EC prescribed limit                       │
├─────────────────────────────────────────────────────────────────┤
│ AI FORECAST PANEL (Prophet model, 8h ahead)                     │
│ "Predicted PM10 at CAAQMS-01: 740 µg/m³ by 3:00 PM (+/-80)"   │
│ "⚠ Recommend activating haul road sprinklers by 2:00 PM"       │
├─────────────────────────────────────────────────────────────────┤
│ BREACH HISTORY  [Last 30 days]  → table of environment_readings │
│  where threshold_breached = true, sorted by recorded_at DESC    │
└─────────────────────────────────────────────────────────────────┘
```

**Add Manual Reading Form:** Dropdown for `env_param_enum` (pm10, pm2_5, so2, nox, ph, etc.) → value → unit → station → submit to FastAPI POST which checks against `prescribed_limit` and sets `threshold_breached`.

---

### 5.9 Production Module
**Route:** `/production/:mineId`

```
┌─────────────────────────────────────────────────────────────────┐
│ Rajmahal OCP — Production | 30 Aug 2026                        │
│ Target: 48,000 MT | Actual: 45,200 MT | Shortfall: 5.8%        │
├───────────────────────────┬─────────────────────────────────────┤
│ SHIFT BREAKDOWN           │ ANOMALY FLAGS (AI)                  │
│ Shift A: 16,200 MT ✅     │ 🟡 "Shift C output 22% below norm  │
│ Shift B: 15,800 MT ✅     │  given current workforce (312) and  │
│ Shift C: 13,200 MT ⚠     │  equipment (4 shovels, 18 dumpers)" │
│  anomaly_flagged: true    │  [Acknowledge]  [Create Note]       │
├───────────────────────────┴─────────────────────────────────────┤
│ PRODUCTION TREND — Last 7 days (Recharts: actual vs target)     │
│ [Mon: 47k/48k] [Tue: 46k] [Wed: 45k] [Thu: 44k] ... 🔴        │
├─────────────────────────────────────────────────────────────────┤
│ CCO DAILY RETURN (Form I) — Auto-populated from shift data      │
│ [Review → Digital Sign → Submit to CCO Portal]                  │
├─────────────────────────────────────────────────────────────────┤
│ MONTHLY TARGETS  [Set Target — mine_manager only]               │
│  Aug 2026: 1,488,000 MT  |  Achieved: 73%  ← mid-month         │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5.10 Incident & Accident Module
**Routes:** `/incidents`, `/incidents/:id`, `/incidents/:id/forms`

#### Incident List (`/incidents`)

```
HEADER: [Mine ▾] [Severity ▾] [Date ▾]  [+ File Incident Report]

🔴 CRITICAL — Personal Injury | 28 Aug 2026 | Shift B | Pit 3
   incident_type: personal_injury | AI Suggested: HIGH (accepted)
   Persons involved: 2 | DGMS status: Initial alert sent
   [View Details]  [Generate Form 4-A]

🟡 NEAR MISS — Equipment Failure | 20 Aug 2026
   incident_type: equipment_failure | AI Category: HEMM brake failure
   [View Details]  [Link to CAPA]
```

#### Incident Detail + Statutory Forms

```
INCIDENT REPORT — INC-2026-0341
incident_type: personal_injury | severity: critical
Zone: Pit 3 East | Shift: B | Date: 28 Aug 2026 14:20
Reported by: Arun Mandal | GPS: 24.1541°N 87.0241°E

PERSONS INVOLVED (persons_involved JSONB)
  Ramesh Kumar | Regular | Operator | Nature: Crush injury | Under treatment

IMMEDIATE ACTIONS TAKEN: Medical first aid, area barricaded

AI CLASSIFICATION
  Suggested severity: critical ✅ (accepted by officer)
  Suggested category: "Fall of person / equipment contact"

DGMS NOTIFICATION WORKFLOW
  ○ Initial alert sent to DGMS — 28 Aug 2026 14:35 (auto, < 15 min)
  ○ Form 4-A (Accident Notice) — [Generate PDF]
  ○ Form 4-B (Accident Register) — [Generate PDF]
  ○ Form 4-C (Return to Duty) — [Generate when applicable]

[Generate Form 4-A]  [Download PDF]  [Verify Blockchain Hash]
```

---

### 5.11 OCR Document Digitization
**Routes:** `/ocr/upload`, `/ocr/queue`, `/ocr/review/:itemId`

#### Upload Screen

```
DOCUMENT DIGITIZATION

Category: [DGMS Inspection Memo     ▾]
          DGMS Inspection Memo
          Accident Register
          Contractor License (CLRA)
          Environmental Report
          Production Return
          Safety Committee Minutes
          Legacy Register

Link to entity (optional):
  [Compliance Instance ▾] → [Search instance...]

[📄 Drop PDF/JPG/PNG here or click to Browse]

REVIEW QUEUE (pending OCR review)
🔴 accident_register_aug2019.pdf  — low confidence: date, mine_name (0.41)
🟡 clra_abc_construction.jpg      — low confidence: expiry_date (0.68)
✅ env_report_jul2026.pdf         — auto-applied (all fields ≥ 0.85)
```

#### OCR Review Side-by-Side (`/ocr/review/:itemId`)

```
┌─────────────────────────────┬──────────────────────────────────────┐
│  SCANNED DOCUMENT           │  AI EXTRACTED FIELDS                 │
│  [PDF viewer — zoomable]    │                                      │
│                             │  Mine Name:  Rajmahal OCP  ✅ 0.97  │
│  [Hover → bounding box      │  Date:       [____________] ⚠ 0.41  │
│   highlights field on image]│              ↳ User corrects inline  │
│                             │  Shift:      B             ✅ 0.91  │
│  [Zoom ±]  [Rotate]         │  Regulation: CMR Reg 100   ✅ 0.88  │
│                             │  Signatory:  [____________] ⚠ 0.55  │
│                             │                                      │
│                             │  Overall Confidence: 0.74            │
│                             │                                      │
│                             │  [Save & Verify ✅]  [Reject 🗑]    │
└─────────────────────────────┴──────────────────────────────────────┘
```

**UX Flow:**
1. Pending items auto-sorted by `overall_confidence ASC` (lowest first)
2. Hover on field → corresponding region highlighted on scanned image
3. Click editable field → inline text edit
4. Save → `verification_status = "human_verified"` → data applied to target entity

---

### 5.12 GIS / Map Module
**Route:** `/map/:mineId` or `/map/subsidiary/:subId`

```
┌─────────────────────────────────────────────────────────────────┐
│  MapLibre GL JS — fullscreen                                    │
├────────────────────────────────┬────────────────────────────────┤
│  MAP                           │  SIDE PANEL (collapsible)      │
│  [Mine boundary polygon]       │  LAYER CONTROLS                │
│  [Inspection zones labels]     │  ✅ Mine Boundary (PostGIS)    │
│  [Heatmap — violation density] │  ✅ Inspection Zones           │
│                                │  ✅ Incident Heatmap (deck.gl) │
│  [CAAQMS-01 pin 🌿]           │  ✅ Environmental Sensors      │
│   → Popup: PM10: 820 BREACH   │  ☐ Green Belt Coverage         │
│             [Create CAPA]      │  ☐ Nearby Settlements (1km)   │
│                                │                                │
│  Click Zone → panel updates ↓  │  [Zone: Pit 3 East]           │
│                                │  Open Violations: 4            │
│                                │  Last Inspection: 10 Aug       │
│                                │  Risk: HIGH — Roof fall history│
│                                │  [View Violations]             │
│                                │  [Schedule Inspection]         │
│                                │                                │
│  [Satellite] [Street] [Custom] │  [+ Add Monitoring Station]   │
└────────────────────────────────┴────────────────────────────────┘
```

**Layers:**
- Mine boundary: `mines.boundary_geojson JSONB` → GeoJSON via PostgREST
- Incident heatmap: deck.gl `HeatmapLayer` using `observations.geo_stamp` coordinates
- Sensor pins: `monitoring_stations` with real-time readings from `environment_readings`
- Nearby settlements: static GeoJSON overlay (ISRO Bhuvan)

---

### 5.13 Alerts & Notification Center
**Route:** `/alerts`
**Implementation:** Supabase Realtime `postgres_changes` on `alerts` table — new events prepend with slide animation

```
FILTER: [All | Critical | High | Medium | Low | Unread ●3]   [Mark All Read]

🔴 CRITICAL — 08:42 AM   [Acknowledge]
   PM10 Breach — CAAQMS-01, Rajmahal OCP
   820 µg/m³ vs 600 µg/m³ limit | threshold_breached: true
   [Create CAPA]

🟡 HIGH — Yesterday 4:17 PM   [Acknowledge]
   CAPA Overdue — Roof Support Fix, Pit 3
   Assigned: Ramesh Singh | 5 days overdue | status: overdue
   [Escalate]  [View CAPA]

🟢 INFO — 2 days ago
   Compliance Submitted — Monthly Safety Committee Report
   By: Rajesh Kumar | status: submitted → Under Review
   [View Instance]
```

**Alert channels from `alerts.channels TEXT[]`:**
- `in_app`: shown in this panel + Realtime bell badge
- `push`: FCM notification to mobile app
- `sms`: SMS via Bhashini/Twilio (CRITICAL only)
- `email`: email digest (HIGH+)

---

### 5.14 Grievance Management
**Routes:** `/grievances`, `/grievances/:id`

```
GRIEVANCE LIST
  [Mine ▾] [Status ▾] [Priority ▾]  [+ File Grievance]

🔴 GRV-2026-0432 | Wage Delay | AI Priority: 8/10 | 20 Aug 2026
   "Wages for July 2026 not credited..." (anonymous)
   Due: 27 Aug | Status: UNDER REVIEW | Assigned: Sanjay Das
   [View]  [Escalate]

──────────────────────────────────────────────────────────────

GRIEVANCE DETAIL — GRV-2026-0432
Status: Under Review | Priority: HIGH (AI Score: 8/10)
Category: Wage Delay (AI auto-classified)
Submitted: 20 Aug 2026 | Anonymous: Yes

"Wages for July 2026 not credited as of filing date."

RESOLUTION WORKFLOW
  Assigned: Sanjay Das (HR Officer) | SLA Due: 27 Aug 2026
  [Update Status ▾]  [Add Internal Note]  [Escalate to AGM]
  [Mark Resolved with Outcome]

SIMILAR GRIEVANCES (AI cluster detection)
  3 wage-related grievances filed this week — possible systemic issue
  [View Cluster]
```

---

### 5.15 AI Risk Analytics
**Route:** `/ai-analytics/:mineId`

```
┌─────────────────────────────────────────────────────────────────┐
│ Mine Risk Score — Rajmahal OCP                                  │
│  67/100 🟡 HIGH  |  Trend: WORSENING ▲  |  Last: 30 Aug 10:00 │
│  [Animated gauge from 0→67]                                     │
├─────────────────────────────────────────────────────────────────┤
│ CONTRIBUTING FACTORS (XGBoost — contributing_factors JSONB)     │
│  Violation Frequency (90d):    34% — 12 violations (3x avg)     │
│  CAPA Closure Latency:         28% — avg 9.2d vs 7d target      │
│  Contractor Compliance:        18% — 74% (below 85% threshold)  │
│  Env Breaches (30d):           12% — 2 PM10 events              │
│  Production Pressure Index:     8% — 94% of target              │
│                                                                  │
│  [Progress bars for each factor — color by weight]              │
├─────────────────────────────────────────────────────────────────┤
│ CATEGORY SCORES                                                 │
│  Safety: 52 🔴  |  Environment: 71 🟡  |  Production: 88 🟢  │
│  Labour: 79 🟢                                                  │
│  [Recharts radar chart — all 4 categories]                      │
├─────────────────────────────────────────────────────────────────┤
│ RECURRING VIOLATION CLUSTERS (from anomaly_flags + violations)  │
│  "Inadequate roof support — Pit 3 East"                        │
│   Appeared 6x in 14 months | is_systemic: false                │
│   [Flag as Systemic Risk]  [View Cluster]                       │
├─────────────────────────────────────────────────────────────────┤
│ ACTIVE ANOMALY FLAGS (anomaly_flags table)                      │
│  🟡 Shift C production 22% below norm — 3 consecutive days     │
│     anomaly_type: production_anomaly | confidence: 0.87        │
│     [Acknowledge]  [Create Investigation Note]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5.16 Statutory Report Generator
**Route:** `/reports`

```
┌─────────────────────────────────────────────────────────────────┐
│ GENERATE STATUTORY DOCUMENT                                     │
│                                                                  │
│ Type: [Annual Return — CMR Form 3                        ▾]     │
│       Annual Return (CMR Form 3)                                │
│       Accident Notice (CMR Form 4-A)                            │
│       Accident Register (CMR Form 4-B)                          │
│       Monthly Safety Committee Minutes                          │
│       Half-Yearly EC Compliance Report                          │
│       Production Return (CCO Form I — Daily)                    │
│       Contractor Register Summary (CLRA Form XII)               │
│                                                                  │
│ Mine:   [Rajmahal OCP ▾]                                        │
│ Period: [01 Jan 2026] → [31 Dec 2026]                           │
│                                                                  │
│ [Auto-populate from system data]  ← calls FastAPI /reports/generate│
├─────────────────────────────────────────────────────────────────┤
│ PREVIEW (PDF iframe — pre-filled fields highlighted yellow)     │
│  [Polling: job status every 3s until "completed"]               │
│  [Review → Digital Sign → Submit]                               │
├─────────────────────────────────────────────────────────────────┤
│ SUBMISSION HISTORY                                              │
│ Form 3 | 01 Feb 2026 | ✅ SUBMITTED | [Download] [Verify 🔗]   │
│ Form 4-A | 28 Aug 2026 | ✅ | SHA256 hash | [Blockchain Verify] │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5.17 Admin & Configuration
**Routes:** `/admin/*` — `system_admin`, `subsidiary_admin` only

| Route | Screen | Purpose |
|-------|--------|---------|
| `/admin/mines` | Mine Onboarding | Create mine, draw geo-fence polygon on MapLibre, set EC metadata |
| `/admin/users` | User Management | Create users, assign `role_name_enum`, assign `mine_id` scope |
| `/admin/regulations` | Compliance Library | View/add regulations; create compliance_requirements with recurrence |
| `/admin/checklist-builder` | Checklist Builder | Create/edit `inspection_checklist_templates` with drag-drop item ordering |
| `/admin/env-stations` | Monitoring Stations | Add/edit CAAQMS/manual stations; place on MapLibre |
| `/admin/contractors/onboard` | Contractor Onboard | Register contractor entity, initial document upload |
| `/admin/audit-log` | Audit Trail Viewer | Append-only log of all statutory mutations (read-only) |

#### Mine Geo-fence Drawing UX (`/admin/mines/new`)

```
Step 1: Basic Info
  Mine Name / Type (opencast/underground/mixed) / Subsidiary / District / State

Step 2: Draw Boundary
  [MapLibre fullscreen]
  Toolbar: [Draw Polygon] [Edit] [Delete] [Reset]
  → Draw polygon → vertices snap to satellite imagery
  → boundary_geojson stored as JSONB in mines table
  → Area calculated and displayed: "3.42 km²"

Step 3: EC Details
  EC Number / EC Validity End / Coal Grade / DGMS Region

Step 4: Initial Zones
  [+ Add Zone] → name → draw sub-polygon within mine boundary

[Save Mine]  → PostgREST INSERT to mines table
```

---

## 6. Mobile Field App — Screens & Flows

### 6.1 Navigation Structure

```
App
├── AuthStack
│   ├── LoginScreen           ← Supabase Auth Email/Password or Magic Link
│   └── BiometricReAuthScreen ← expo-local-authentication (underground)
│
└── MainTabs (Bottom Tab Bar)
    ├── Home          → DashboardHomeScreen (summary cards + pending tasks)
    ├── Inspect       → InspectionStack
    │   ├── InspectionListScreen
    │   ├── StartInspectionScreen
    │   ├── InspectionFormScreen  ← PRIMARY OFFLINE CAPTURE
    │   └── InspectionSummaryScreen
    ├── Report        → ReportStack
    │   ├── IncidentReportScreen
    │   ├── SafetyObservationScreen  (STOP Card — < 60 seconds)
    │   └── OvermanShiftReportScreen
    ├── Attendance    → AttendanceScreen (QR scan / manual)
    └── Profile       → SyncStatusScreen + Settings
```

**Offline Banner** (persistent, top of every screen):
```
🟢 Online — all synced          (no pending records)
🟡 Online — 4 records queued   (uploading to FastAPI)
🔴 Offline — 12 records saved  (waiting for connectivity)
```

---

### 6.2 Home Screen

```
COMET Field App
Mine: Rajmahal OCP | Shift: B | 30 Aug 2026

PENDING TASKS
  📋 Complete inspection: Pit 3 East (7/24 done)
  📢 CAPA assigned: Roof support fix — Due today ⚠
  ✅ Submit shift report by end of shift

QUICK ACTIONS
  [🔍 Start Inspection]  [⚠ Report Incident]
  [👁 Safety Obs]       [📊 Shift Report]

SYNC STATUS
  4 records pending upload  [Sync Now ▶]
```

---

### 6.3 Inspection Form Screen

**WatermelonDB tables:** `inspections`, `observations`
**Supabase tables (after sync):** `inspections`, `observations`

```
ACTIVE INSPECTION — Internal Safety Committee
Mine: Rajmahal OCP | Zone: Pit 3 East
GPS: 24.1543°N 87.0244°E | Accuracy: 8m | ✅ Within boundary

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHECKLIST: ROOF & SIDE SUPPORT (CMR 2017, Reg 100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q1. Have roof and sides been sounded before work commenced?
    [✅ OK]  [🔴 Non-Compliant]  [🟡 Observation]

Q2. Is systematic support installed per approved support rules?
    [✅ OK]  [🔴 Non-Compliant]  [🟡 Observation]
    → Non-Compliant tapped:
       Description: [TextInput]  [🎤 Voice note — Hindi/Odia]
       [📸 Take Photo — auto geo-tag + timestamp]
       Severity: [Minor] [Moderate] [HIGH] [Critical]
       severity = high → violation auto-created on sync push

Progress: 7 / 24 checkpoints  ████████░░░░░░░░░
🔴 Offline — 3 observations queued locally

[Save Draft]  [Next Section ▶]
```

**Technical Notes:**
- Every observation saved instantly to WatermelonDB (< 50ms)
- Photos stored as local files with `sync_status: 'pending_upload'`
- Lazy upload to Supabase Storage on sync
- GeoStamp captured once per observation at save time
- Voice notes transcribed by Bhashini STT on connectivity restore

---

### 6.4 Safety Observation — STOP Card

**Target:** < 60 seconds end-to-end

```
SAFETY OBSERVATION  ⏱

1. ZONE
   [🔳 Pit 3] [Workshop] [Magazine] [Entry Road] [Other]

2. TYPE
   [Unsafe Act] [Unsafe Condition] [Positive Observation]

3. CATEGORY
   [PPE] [Housekeeping] [Equipment Guard] [Fall Protection]
   [Fire] [Traffic] [Ventilation] [Other]

4. DESCRIBE (optional — or voice note 🎤)
   [Worker not wearing hard hat in active blast zone]

5. PHOTO (optional)
   [📸 Capture]

6. ASSIGN TO
   [🔍 Search official]  [📷 Scan badge QR]

GPS: ✅ verified
[Submit Observation →]
```

Post-submit: optimistic UI — immediately shows in "My Recent Observations", queued to WatermelonDB sync.

---

### 6.5 Incident / Near-Miss Report

**Supabase table:** `incident_reports`

```
REPORT INCIDENT / NEAR-MISS

INCIDENT TYPE
  [Roof Fall] [Gas Ignition] [Equipment Failure] [Personal Injury]
  [Near Miss] [Fire] [Inundation Risk] [Explosives] [Electrical]
  [Haulage] [Fall of Person] [Other]

DESCRIPTION  [🎤 Voice — Hindi/Odia/Bengali supported]
  [Free-text input — large tap target]
  AI Suggested Severity: HIGH  [Accept ✅]  [Change ▾]
  AI Category: "Roof Fall — Support failure"
  ↳ ai_suggested_severity / ai_suggested_category written to DB

LOCATION
  Zone: [Pit 3 ▾]  |  Shift: [A] [B] [C] [General]
  GPS: 24.1541°N ✅ (verified inside mine boundary)

PERSONS INVOLVED  [+ Add Person]
  Name: Ramesh Kumar
  Type: [Regular ▾]  Role: [Injured ▾]
  Nature of injury: [crush injury]
  Outcome: [under_treatment ▾]

IMMEDIATE ACTIONS TAKEN
  [Medical first aid applied, area barricaded]

MEDIA
  [3 📷 Photos captured]  [+ Add Video]

[Submit Report →]
→ Mine Manager + Safety Officer notified via FCM + SMS within 60s
→ If severity = critical: DGMS initial alert auto-triggered by FastAPI
```

---

### 6.6 Overman Shift Report

**Supabase table:** (sync-pushed, maps to production + safety records)

```
SHIFT REPORT — Shift B | 30 Aug 2026
Reporter: Arun Mandal (Overman) | Zone: District 4, Face 2

MANPOWER DEPLOYED: [32]  ← workforce_count

GAS READINGS (mandatory — CMR Reg 116)  ← stored as JSONB
  Station 1 — Face Entry:
    CH4: [0.3] %  |  CO: [0] ppm  |  CO2: [0.1] %
  Station 2 — Return Airway:
    CH4: [0.5] %  |  CO: [0] ppm

⚠ WARNING: If CH4 > 1.25% → IMMEDIATE alert to Mine Manager
   (processed synchronously in FastAPI, not via background task)

SHIFT OBSERVATIONS  [+ Add]
  Area: [Face 2]  Status: [Normal ▾]
  Description: [All operations normal]
  Action Taken: [Routine inspection]

HANDOVER NOTES (for next shift Overman):
  [Pump P-3 vibrating — maintenance notified]

GPS: ✅ verified  |  Sync: 🔴 Offline — will upload on surface
[Complete & Handover ✅]
```

---

### 6.7 Worker Attendance Screen

**Supabase table:** attendance_records (via sync push)

```
WORKER ATTENDANCE — Shift A | 30 Aug 2026
MODE: [📷 QR Scan ●]  [✏ Manual Entry]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Camera viewfinder — scan worker badge QR]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECENT SCANS (last 10)
  ✅ Ramesh Kumar (EMP-2341) — 06:12 AM — Inside geo-fence
  ✅ Sunita Devi (CONT-ABC-087) — 06:14 AM — Inside geo-fence
  ⚠ John Das (CONT-XYZ-012) — Training cert EXPIRED
     [Allow ▸] [Block ✗]  ← mine_manager decision

SUMMARY
  47 scanned | 31 regular | 16 contract | 5 pending
  Geo-fence: ✅ verified inside Rajmahal OCP (GPS: 8m accuracy)

[Close Shift Attendance]
```

Client warns if worker GPS > 500m from mine boundary. Server sets `location_mismatch = true` on sync (not rejected — flagged for review).

---

### 6.8 Sync Status Screen

```
SYNC STATUS

Connectivity: 🔴 OFFLINE (last connected 2h 14m ago)

PENDING UPLOADS (12 records)
  📋 Inspection Form — Pit 3 East — captured 2h ago
  👁 Safety Observation × 3 — 1.5h ago
  📷 Photos × 8 (11.4 MB)
  👥 Attendance × 47 records

COMPLETED SYNCS
  ✅ Incident Report INC-0341 — synced 06:30 AM
  ✅ Shift Report (Shift A) — synced 06:35 AM

CONFLICTS (1 item)
  ⚠ Observation OBS-0129 — server version differs
     [Review & Resolve →]

[Force Sync Now ▶]  ← enabled only when online
```

---

### 6.9 Push Notification Behaviour

| Priority | Trigger | Channels | Mobile Behaviour |
|----------|---------|----------|-----------------|
| `critical` | Fatal incident / CH4 > 1.5% | FCM + SMS | Fullscreen takeover, cannot dismiss without acknowledging |
| `high` | CAPA assigned to user | FCM | Banner + badge, vibration |
| `high` | Compliance overdue > 7 days | FCM + SMS | Banner + badge |
| `medium` | Compliance due in 7 days | FCM | Badge only |
| `medium` | Contractor doc expiring 30d | FCM | Badge only |
| `low` | Daily production summary | FCM | Silent notification |
| `info` | Sync completed | In-app only | Toast inside app |

---

## 7. State Management Architecture

### 7.1 Web

| Layer | Store | Contents |
|-------|-------|----------|
| Auth / Session | `authStore` (Zustand) | user object, Supabase session, role, permissions, active mine_id |
| UI / Navigation | `uiStore` (Zustand) | sidebar open, active filters, modal state, selected mine |
| Server Cache | TanStack Query | all FastAPI REST + PostgREST data |
| Forms | React Hook Form | field values, errors, dirty/touched state per form |
| Real-time Alerts | `alertStore` (Zustand) + Supabase Realtime | live alert feed entries, unread count |

### 7.2 Mobile

| Layer | Store | Contents |
|-------|-------|----------|
| Auth | Zustand + expo-secure-store | Supabase session, user profile, mine scope |
| App State | `appStore` (Zustand) | connectivity status, sync queue count, current shift |
| Form Drafts | WatermelonDB | partially filled inspections, queued observations, incident drafts |
| Synced Records | WatermelonDB (reactive) | all offline-capable field entities |
| Online Lookups | TanStack Query | user list, mine master data, checklist templates (when online) |

---

## 8. API Client & Data Fetching (Supabase-first)

### 8.1 Supabase Client Setup

```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types"; // generated by supabase gen types

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
```

### 8.2 PostgREST Queries via TanStack Query

```typescript
// hooks/useComplianceInstances.ts
export function useComplianceInstances(mineId: string, status?: instance_status) {
  return useQuery({
    queryKey: ["compliance", "instances", mineId, status],
    queryFn: async () => {
      let query = supabase
        .from("compliance_instances")
        .select(`
          *,
          compliance_requirements (title, recurrence, responsible_role),
          compliance_evidences (id, document_url, is_verified)
        `)
        .eq("mine_id", mineId)
        .order("due_date", { ascending: true });

      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60_000,
  });
}

// mutations call FastAPI for business logic endpoints
export function useSubmitEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/compliance/instances/${instanceId}/submit`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: formData,
        }
      );
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compliance", "instances"] });
    },
  });
}
```

### 8.3 FastAPI Calls (Business Logic Endpoints)

For endpoints with computation (OCR, AI scoring, PDF generation, sync):

```typescript
// lib/api.ts — typed fetch wrapper using Supabase session token
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Usage
const score = await apiFetch<MineRiskScore>(`/api/v1/ai/score/mine/${mineId}`, {
  method: "POST",
});
```

### 8.4 Supabase Storage (File Uploads)

```typescript
// Upload file to Supabase Storage (evidence)
async function uploadEvidence(instanceId: string, file: File) {
  const path = `compliance-evidence/${mineId}/${instanceId}/${file.name}`;
  const { error } = await supabase.storage
    .from("compliance-evidence")
    .upload(path, file);
  if (error) throw error;

  // Get signed URL for display (15 min TTL)
  const { data } = await supabase.storage
    .from("compliance-evidence")
    .createSignedUrl(path, 900);
  return data?.signedUrl;
}
```

---

## 9. Offline-First Strategy

### 9.1 WatermelonDB Schema (mirrors Supabase tables)

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
        { name: "inspection_type",  type: "string" }, // inspection_type_enum
        { name: "zone",             type: "string", isOptional: true },
        { name: "geo_stamp",        type: "string" }, // JSONB as JSON string
        { name: "started_at",       type: "number" }, // Unix ms
        { name: "status",           type: "string" }, // inspection_status enum
        { name: "sync_status",      type: "string" }, // "pending_sync" | "synced"
      ],
    }),
    tableSchema({
      name: "observations",
      columns: [
        { name: "inspection_id",    type: "string" },
        { name: "server_id",        type: "string", isOptional: true },
        { name: "category",         type: "string" },
        { name: "description",      type: "string" },
        { name: "severity",         type: "string" }, // obs_severity enum
        { name: "geo_stamp",        type: "string" },
        { name: "voice_note_url",   type: "string", isOptional: true },
        { name: "sync_status",      type: "string" },
      ],
    }),
    tableSchema({ name: "incident_reports",    columns: [ /* incident_type_enum, severity_enum, etc */ ] }),
    tableSchema({ name: "safety_observations", columns: [ /* safety_obs_type, status, zone */ ] }),
    tableSchema({ name: "attendance_records",  columns: [ /* shift_enum, geo_stamp, worker_id */ ] }),
  ],
});
```

### 9.2 Sync Engine

```typescript
// sync/syncEngine.ts
import { synchronize } from "@nozbe/watermelondb/sync";

export async function performSync(db: Database) {
  const { data: { session } } = await supabase.auth.getSession();

  await synchronize({
    database: db,
    pullChanges: async ({ lastPulledAt }) => {
      const data = await apiFetch("/api/v1/sync/pull", {
        method: "POST",
        body: JSON.stringify({ last_pulled_at: lastPulledAt }),
      });
      return data; // { changes, timestamp }
    },
    pushChanges: async ({ changes }) => {
      await apiFetch("/api/v1/sync/push", {
        method: "POST",
        body: JSON.stringify({ changes }),
      });
    },
  });
}

// Triggered by: expo-background-task, app foreground, manual "Force Sync"
```

### 9.3 Media Upload Strategy

Photos/videos are fully decoupled from record sync:

```typescript
// camera/mediaUploader.ts
export async function uploadPendingMedia(db: Database) {
  const pending = await db.collections
    .get("observations")
    .query(Q.where("sync_status", "synced"), Q.where("local_photo_path", Q.notNull()))
    .fetch();

  for (const obs of pending) {
    // Get Supabase Storage signed upload URL from FastAPI
    const { upload_url, file_path } = await apiFetch("/api/v1/media/upload-url", {
      method: "POST",
      body: JSON.stringify({ filename: obs.localPhotoPath, entity_type: "observation", entity_id: obs.serverId }),
    });

    // Direct PUT to Supabase Storage (bypasses FastAPI — no bandwidth bottleneck)
    await fetch(upload_url, { method: "PUT", body: await readLocalFile(obs.localPhotoPath) });

    // Confirm to FastAPI
    await apiFetch("/api/v1/media/confirm", {
      method: "POST",
      body: JSON.stringify({ file_path, entity_type: "observation", entity_id: obs.serverId }),
    });
  }
}
```

### 9.4 Conflict Resolution Rules

| Entity | Strategy | Rationale |
|--------|----------|-----------|
| `inspections` | Last-write-wins on metadata; never drop submitted records | Append-only field capture |
| `observations` | Server wins on `violation_id`; local wins on `description` edits | Inspector annotates post-sync |
| `attendance_records` | Server authoritative (geo-fence validated server-side) | Prevents client override of location check |
| `incident_reports` | Both versions kept; flagged in Conflict queue for Mine Manager | Critical safety — no silent loss |

---

## 10. Real-Time Alerts (Supabase Realtime)

### 10.1 Web — Alert Subscription

```typescript
// hooks/useRealtimeAlerts.ts
export function useRealtimeAlerts(mineId: string) {
  const { addAlert } = useAlertStore();

  useEffect(() => {
    const channel = supabase
      .channel(`alerts:mine:${mineId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
          filter: `mine_id=eq.${mineId}`,
        },
        (payload) => {
          addAlert(payload.new as Alert);
          // Show toast notification
          showToast({
            title: payload.new.title,
            severity: payload.new.priority, // maps to alert_priority enum
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [mineId]);
}
```

### 10.2 Mobile — FCM via expo-notifications

FCM token registered with FastAPI on login:

```typescript
// background/notificationSetup.ts
export async function registerPushToken(userId: string) {
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await apiFetch("/api/v1/users/push-token", {
    method: "POST",
    body: JSON.stringify({ fcm_token: token }),
  });
}

// Incoming notification handler
Notifications.addNotificationResponseReceivedListener((response) => {
  const { entity_type, entity_id } = response.notification.request.content.data;
  // Navigate to relevant screen
  navigation.navigate(routeFor(entity_type), { id: entity_id });
});
```

---

## 11. Internationalization

| Code | Language | Target Region |
|------|---------|---------------|
| `en` | English | All — default for corporate/regulatory |
| `hi` | Hindi | MP, CG, JH, UP — primary field staff |
| `bn` | Bengali | West Bengal (ECL, BCCL) |
| `or` | Odia | Odisha (MCL) |
| `mr` | Marathi | Maharashtra (WCL) |

```json
{
  "compliance.status.pending":          "laMbit",
  "compliance.status.breached":         "ullanghan",
  "compliance.status.approved":         "svIkRt",
  "inspection.start":                   "nirikShan shuru Karen",
  "alert.critical.pm10":                "PM10 sima ka ullanghan — {{value}} µg/m³",
  "capa.overdue.days":                  "{{count}} din se vilamb",
  "contractor.trust.expiring_document": "dastAvez {{days}} dinoM meM samapt"
}
```

**Voice Input (Mobile):** Bhashini STT API (GoI, 22 scheduled languages) — primary. Fallback: Whisper API. Transcription queued offline; processed on connectivity restore.

**Font:** `Noto Sans Devanagari` loaded via Google Fonts for Hindi/Marathi rendering. `Noto Sans Bengali` for Bengali. English/default uses `Inter Variable`.

---

## 12. Form Validation & Shared Schemas

All Zod schemas in `packages/shared-schemas` are shared between the frontend (React Hook Form) and FastAPI backend (Pydantic model generation). Zero drift by design.

### Example: Incident Report Schema

```typescript
// packages/shared-schemas/src/incident_report.schema.ts
// mirrors incident_reports Supabase table + incident_type_enum, severity_enum

export const PersonInvolvedSchema = z.object({
  name:             z.string().min(1),
  employee_type:    z.enum(["regular", "contract"]),
  age:              z.number().int().min(14).max(80).optional(),
  designation:      z.string().optional(),
  nature_of_injury: z.string().min(1),
  outcome:          z.enum(["recovered", "permanent_disability", "fatal", "under_treatment"]),
});

export const IncidentReportSchema = z.object({
  mine_id:              z.string().uuid(),
  incident_type:        z.enum([
    "roof_fall", "gas_ignition", "equipment_failure", "personal_injury",
    "near_miss", "fire", "inundation_risk", "explosives_incident",
    "electrical_incident", "haulage_incident", "fall_of_person", "other"
  ]),
  description:          z.string().min(20),
  severity:             z.enum(["low", "medium", "high", "critical"]),
  zone:                 z.string().min(1),
  shift:                z.enum(["A", "B", "C", "general", "daily_aggregate"]).optional(),
  geo_stamp:            GeoStampSchema,                  // lat, lng, accuracy
  persons_involved:     z.array(PersonInvolvedSchema).default([]),
  immediate_actions:    z.string().optional(),
  voice_note_url:       z.string().url().optional(),
});

// React Hook Form usage
const form = useForm<z.infer<typeof IncidentReportSchema>>({
  resolver: zodResolver(IncidentReportSchema),
  defaultValues: { mine_id: activeMineId, severity: "medium" },
});
```

### Example: Compliance Evidence Schema

```typescript
// packages/shared-schemas/src/compliance_evidence.schema.ts
// mirrors compliance_evidences table + evidence_upload_method enum

export const ComplianceEvidenceSchema = z.object({
  instance_id:    z.string().uuid(),
  document_url:   z.string().url(),             // Supabase Storage path
  file_name:      z.string().optional(),
  file_type:      z.string().optional(),
  upload_method:  z.enum(["web_upload", "mobile_capture", "ocr_scan"]),
});
```

---

## 13. Geo-Tagging & Maps

### 13.1 GeoStamp Capture (Mobile)

```typescript
// geo/geoTagger.ts
export async function captureGeoStamp(): Promise<GeoStamp> {
  const { coords } = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.High,
  });
  return {
    latitude:                 coords.latitude,
    longitude:                coords.longitude,
    altitude_meters:          coords.altitude ?? null,
    accuracy_meters:          coords.accuracy ?? 999,
    captured_at:              new Date().toISOString(),
    low_confidence_location:  (coords.accuracy ?? 999) > 50, // flag, not reject
    location_mismatch:        false, // set server-side after PostGIS ST_Contains check
  };
}
```

Stored as `geo_stamp JSONB` in all field-captured tables (`inspections`, `observations`, `incident_reports`, `safety_observations`).

### 13.2 Server-Side Geo-Fence Validation (on Sync Push)

FastAPI Sync Router calls PostGIS via SQLAlchemy + GeoAlchemy2:

```sql
-- Executed per-record with coordinates in sync push
SELECT ST_Contains(
  mines.boundary_geojson::geometry,
  ST_SetSRID(ST_Point(:lng, :lat), 4326)
) AS within_boundary
FROM mines
WHERE mines.id = :mine_id;
```

If `within_boundary = false`: `location_mismatch = true` set on the record — **not rejected**, just flagged for Mine Manager review. Underground GPS is inherently imprecise.

### 13.3 Map Libraries

| Context | Library | Usage |
|---------|---------|-------|
| Web full map (`/map`) | MapLibre GL JS + deck.gl | Mine boundary, incident heatmap, sensor pins, zone polygons |
| Web mini-map (detail screens) | MapLibre GL JS (embedded) | GeoStamp preview, single pin |
| Mobile | react-native-maps | Mine boundary polygon, offline tile cache |
| Spatial queries (server) | PostGIS + GeoAlchemy2 (FastAPI) | Geo-fence check, buffer analysis |
| Satellite imagery | ISRO Bhuvan API | Government-approved mine boundary / green belt overlay |

---

## 14. Testing Strategy

### 14.1 Web

| Layer | Tool | Target |
|-------|------|--------|
| Unit — utils, hooks | Vitest | 80%+ line coverage |
| Component | React Testing Library + MSW (mock Supabase + FastAPI) | All ui-kit + key feature components |
| E2E | Playwright against Supabase staging project | Login, Submit compliance, Flag violation, OCR review, Assign CAPA, Generate PDF |
| Accessibility | axe-core via Playwright | WCAG 2.1 AA on all main screens |
| Realtime | Supabase Realtime mock | Alert subscription, unread badge update |

### 14.2 Mobile

| Layer | Tool | Target |
|-------|------|--------|
| Unit | Jest (Expo preset) | Sync engine, conflict resolver, geo utilities |
| Component | React Native Testing Library | Core screens: Inspection, Incident, Attendance |
| Offline/Sync | WatermelonDB in-memory adapter | Offline capture → sync → conflict resolution |
| E2E | Detox | Android: Offline capture → connectivity restore → verify sync push to FastAPI |

---

## 15. Performance & Accessibility

### 15.1 Web Performance Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.5s on 4G |
| TTI | < 3.5s |
| Initial JS bundle (gzipped) | < 200KB (code-split via TanStack Router) |
| Dashboard query (PostgREST) | < 150ms P95 |
| Dashboard query (Redis cached rollup) | < 50ms P95 |
| Supabase Realtime alert delivery | < 500ms end-to-end |

**Strategies:**
- TanStack Router lazy loading per route
- Suspense + skeleton loaders on all data-fetching routes
- Redis materialized views for cross-mine aggregate queries (5 min TTL)
- `select()` projections in PostgREST — never fetch `*` on large tables
- Supabase client-side cache via TanStack Query (`staleTime: 5 * 60_000`)

### 15.2 Mobile Performance Targets

| Metric | Target |
|--------|--------|
| Cold start | < 2s |
| WatermelonDB write (single observation) | < 50ms |
| GPS capture per record | < 1s |
| Batch sync (50 records on 3G) | < 10s |
| Max local DB size | 500MB (LRU eviction for synced media) |
| Supabase Storage upload resume (on reconnect) | Automatic — resumable upload |

### 15.3 Accessibility Standards

- **GIGW** (Government of India Website Guidelines) compliance for web portal
- **WCAG 2.1 AA**: keyboard navigable, ARIA labels on all interactive elements, color contrast ≥ 4.5:1
- Minimum touch target: **48 × 48 dp** (critical for gloved mine workers)
- All icons have visible text labels (low digital-literacy field users)
- Screen readers: NVDA / JAWS (web), TalkBack / VoiceOver (mobile)
- Font scaling: UI adapts to system large-text settings without layout break
- Critical actions (Submit, Approve, Blacklist) have confirmation dialogs — no accidental triggers
- Colour is never the **only** indicator of status — always paired with icon + text label

---

*Version 2.0 | Frontend Specification | SIH 2026*
*Stack: React 19 + Vite + TanStack Router/Query + Supabase JS Client (PostgREST/Auth/Storage/Realtime) + MapLibre GL JS + deck.gl + shadcn/ui + Tailwind CSS v4*
*References: [TECH_STACK.md](file:///c:/Coding/SIH2026/docs/TECH_STACK.md) | [backend_spec.md](file:///c:/Coding/SIH2026/docs/backend_spec.md) | [workflows.md](file:///c:/Coding/SIH2026/docs/workflows.md) | [migration SQL](file:///c:/Coding/SIH2026/backend/supabase/migrations/20260829195824_compliance_schema.sql)*
