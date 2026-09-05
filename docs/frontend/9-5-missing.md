# UX Gap Analysis & Implementation Plan
## COMET Platform — Coal Operations Monitoring, Enforcement & Transparency

> **Role:** Professional UI/UX Developer (Pro-Max Audit)
> **Scope:** Web dashboard (`c:\Coding\SIH2026\web`) cross-referenced against `frontend_spec.md`, `Product Brief.md`, `workflows.md`, and `demo_implementation_plan.md`

---

## Executive Summary

The COMET frontend is a **solid architectural skeleton** with correct routing, auth-gating, role-based nav, and a handful of real, data-connected pages. However, **9 of 13 sidebar destinations** either show a 404, a blank "under construction" placeholder, or use entirely hardcoded/static mock data with no backend wire-up. The demo flow described in `demo_implementation_plan.md` (Inspection → AI Anomaly → Report → Notification) is partially built but missing critical screens, and the live-data experience across all dashboards is broken.

This plan is structured into **Priority Tiers** (P0 = demo blockers, P1 = UX completeness, P2 = design polish).

---

## Audit Findings: Current State vs. Spec

### Route & Feature Coverage Matrix

| Sidebar Item | Route | Feature Folder | Current State | Spec State |
|---|---|---|---|---|
| Dashboard (Mine Mgr) | `/mine-manager` | ✅ exists | ✅ Real components, **hardcoded data** | Full KPI + live alerts |
| Dashboard (Corporate) | `/corporate-dashboard` | — | ✅ exists, **100% hardcoded** | Mine risk map + AI panel |
| **Compliance** | `/compliance` | ✅ exists | ⚠️ Calendar renders, limited interactivity | Full Kanban + Instance Detail |
| **Inspections** | `/inspection` | ✅ exists | ⚠️ List present, detail limited | Full list + CAPA trail |
| Contractors | `/contractors` | ❌ missing | 🚫 404 | Full profile + trust score |
| Environment | `/environment` | ❌ missing | 🚫 404 | EC conditions + sensor charts |
| Production | `/production` | ❌ missing | 🚫 404 | Shift breakdown + trend chart |
| Incidents | `/incidents` | ❌ missing | 🚫 404 | Form 4-A/4-B + AI classification |
| OCR / Digitization | `/ocr` | ❌ missing | 🚫 404 | Side-by-side OCR review |
| GIS Map | `/mine-map` | ✅ exists | ⚠️ Static mock pins, no click-through | Live pins + risk overlay |
| **Alerts** | `/alerts` | ❌ missing | 🚫 404 | Realtime Supabase feed |
| Grievances | `/grievances` | ❌ missing | 🚫 404 | Intake + status + resolution |
| AI Analytics | `/ai-analytics` | ❌ missing | 🚫 404 | Risk scores + clusters |
| Reports | `/reports` | ✅ exists | ⚠️ Basic, no PDF generation | Statutory PDF + verify |
| Admin / Mines | `/admin/mines` | ✅ exists | ✅ CRUD works (real Supabase) | Mine + user + checklist builder |
| Admin / Users | `/users` | ✅ exists | ✅ CRUD works | — |

### Critical Demo-Flow Gaps (from `demo_implementation_plan.md`)

The demo story arc requires these screens which are **partially or fully missing**:

| Demo Step | Required Component | Current State |
|---|---|---|
| Mobile Simulator — Mine dropdown | `MobileInspectionSimulator.tsx` | UUID text input (no dropdown) |
| Mobile Simulator — Template dropdown | same | UUID text input |
| Observation form — gas value input + auto-severity | `AddObservationForm.tsx` | Generic text fields only |
| **Screen 3: AI Anomaly Analysis** | `AnomalyResultCard.tsx` | File exists but **not wired to API** |
| **Screen 4: Inspection Report Card** | `InspectionReportCard.tsx` | ❌ File does not exist |
| Web dashboard — Realtime alert toast on submit | `LiveAlertFeed.tsx` | Hardcoded mock data, no Supabase Realtime |
| Compliance Calendar — 4 seeded instances | `ComplianceCalendar.tsx` | Hardcoded mock month/items |

---

## Open Questions

> [!IMPORTANT]
> **Q1 — Backend connectivity:** Is the FastAPI backend (`/api/v1/`) running and accessible at `http://localhost:8000`? Several P0 items depend on live API endpoints.

> [!IMPORTANT]
> **Q2 — Demo priority:** Should we build **all 13 pages** to a functional state, or focus exclusively on the demo story arc (Inspection → AI → Report → Notification) for SIH presentation?

> [!WARNING]
> **Q3 — Supabase Realtime:** Is the `alerts` table set up with Realtime enabled in Supabase? The `LiveAlertFeed` and notification toast require it.

> [!NOTE]
> **Q4 — Auth scope:** Currently `system_admin` logs in but the `DashboardDirector` routes them to `/corporate-dashboard`. Should `system_admin` see a different admin console view?

---

## Proposed Changes

---

### TIER P0 — Demo Blockers (Must fix before SIH presentation)

These directly break the demo story arc from `demo_implementation_plan.md`.

---

#### P0.1 — Mobile Inspection Simulator Upgrades

##### [MODIFY] [`MobileInspectionSimulator.tsx`](file:///c:/Coding/SIH2026/web/src/features/inspection/components/MobileInspectionSimulator.tsx)

**What's missing:** UUID text inputs for mine & template; no screen progression (only 2 steps, not 4); no "Analyze Before Submit" button tied to real API.

**Changes:**
- Replace UUID mine input → `Select` dropdown populated from `GET /api/v1/mines` (or Supabase `mines` table)
- Replace UUID template input → `Select` dropdown from `GET /api/v1/inspections/templates`
- Add `zone` pre-fill: "Pit 3 East — Gas Monitoring Zone"
- Wire the **Analyze** button → `POST /api/v1/inspections/{id}/analyze`
- Add Screen 3 (AI Anomaly Result) after analysis
- Add Screen 4 (Inspection Report Card) after submit

---

#### P0.2 — AddObservationForm — Gas Reading UX

##### [MODIFY] [`AddObservationForm.tsx`](file:///c:/Coding/SIH2026/web/src/features/inspection/forms/AddObservationForm.tsx)

**What's missing:** Gas-specific numeric value input with unit label, auto-severity based on CMR thresholds, auto-filled description.

**Changes:**
- Add `checklist_item_id` dropdown populated from selected template's `checklist_items`
- When a gas item selected → show **numeric `measured_value` input** with dynamic unit label (%, ppm, °C, etc.)
- Client-side threshold check → auto-set `severity` and `status` (non_compliant) with inline warning badge
- Auto-fill `description` field: `"CH₄ measured at 1.4% — exceeds CMR 2017 Reg. 5(2) limit of 1.25%"`
- Show progress bar: `X / 15 checklist items recorded`

---

#### P0.3 — InspectionReportCard (New Component)

##### [NEW] [`InspectionReportCard.tsx`](file:///c:/Coding/SIH2026/web/src/features/inspection/components/InspectionReportCard.tsx)

Screen 4 of the mobile simulator, shown after inspection submit.

**Sections:**
1. **Header** — "✅ Inspection Submitted" + mine name + zone + date
2. **Risk Score bar** — animated progress bar (0–100) with color-coded label (CRITICAL / HIGH / MEDIUM / LOW)
3. **Stats row** — observation count | violation count | checklist % | anomaly count
4. **AI Executive Summary** — skeleton loader (3–5s) while Gemini generates, then collapsible markdown card
5. **Critical Findings** — bullet list of top violations with CMR regulation references highlighted in bold
6. **Recommended Actions** — numbered list with time-bound SLAs (NOW / 24h / 7 days)
7. **Notifications footer** — "🔔 Notifications sent to N stakeholders"

Data source: `GET /api/v1/reports/inspection/{id}/summary`

---

#### P0.4 — Wire AnomalyResultCard to Real API

##### [MODIFY] [`AnomalyResultCard.tsx`](file:///c:/Coding/SIH2026/web/src/features/inspection/components/AnomalyResultCard.tsx)

**What's missing:** The component file exists but is not connected to the analysis API; it renders static props only.

**Changes:**
- Accept `inspectionId` prop
- Call `POST /api/v1/inspections/{id}/analyze` on mount (or via button click from Simulator)
- Render loading state → risk score arc → anomaly cards with severity badges
- Each anomaly card: type badge | title | description | affected items | CMR regulation | recommendation

---

#### P0.5 — Compliance Calendar — Live Data

##### [MODIFY] [`ComplianceCalendar.tsx`](file:///c:/Coding/SIH2026/web/src/components/mine-manager/compliance-calendar.tsx)

**What's missing:** Current month is hardcoded; compliance instances are mocked locally.

**Changes:**
- Add `useComplianceInstances` TanStack Query hook → `supabase.from('compliance_instances').select()` filtered by `mine_id` + current month
- Default to `2026-09` for demo (matching seeded data)
- Color-code calendar cells: 🔴 overdue | 🟡 due this week | ✅ approved
- Clicking a cell → navigate to `/compliance/{mineId}/{instanceId}`

---

#### P0.6 — LiveAlertFeed — Supabase Realtime

##### [MODIFY] [`LiveAlertFeed.tsx`](file:///c:/Coding/SIH2026/web/src/components/mine-manager/live-alert-feed.tsx)

**What's missing:** Currently renders 4 hardcoded static alerts; no Supabase Realtime subscription.

**Changes:**
- Subscribe to `supabase.channel('alerts').on('postgres_changes', { event: 'INSERT', table: 'alerts' })` on mount
- Animate new alerts in with `slide-down` + severity color flash
- Show unread badge count on the `Bell` icon in the topbar
- Fallback to `supabase.from('alerts').select()` initial fetch (last 20)

---

### TIER P1 — UX Completeness (Core Feature Screens)

These are 404 pages that need functional implementations to match the spec.

---

#### P1.1 — Alerts Center (`/alerts`)

##### [NEW] Route + Feature

**Route:** `/_authenticated/alerts`
**Spec reference:** `frontend_spec.md §3.3` — `RealtimeAlertFeed`

**UI:**
- Full-page notification center, grouped by date
- Each alert: severity icon + title + body + mine + timestamp + "Mark as read" / "Go to source" CTA
- Filter bar: All | Critical | High | Medium | Unread
- Supabase Realtime subscription for live push
- Mark-all-read action

---

#### P1.2 — Environment Module (`/environment`)

##### [NEW] Route + Feature folder

**Route:** `/_authenticated/environment`
**Spec reference:** `frontend_spec.md §5.8`

**UI:**
- EC Conditions tracker (table: parameter | current value | limit | status badge)
- Parameter Trend chart (Recharts multi-line: PM10, PM2.5, pH, Noise, SO₂) — last 7 days
- AI Forecast panel (mock or real: "Predicted PM10 by 3 PM…")
- Add Manual Reading form: `env_param_enum` dropdown + value + station
- Breach history table (last 30 days, `threshold_breached = true`)
- MapLibre mini-map with CAAQMS sensor pins

---

#### P1.3 — Incidents Module (`/incidents`)

##### [NEW] Route + Feature folder

**Route:** `/_authenticated/incidents`, `/_authenticated/incidents/:id`
**Spec reference:** `frontend_spec.md §5.10`

**UI (List):**
- Filter: Mine | Severity | Date range | [+ File Incident Report]
- Incident cards: type badge | severity chip | zone | shift | "View Details" + "Generate Form 4-A" CTAs

**UI (Detail):**
- Persons involved list (from `persons_involved JSONB`)
- AI Classification panel (suggested severity + category)
- DGMS Notification Workflow timeline (Initial alert sent → Form 4-A → Form 4-B)
- Generate Form 4-A / 4-B / 4-C button (triggers PDF generation via `/api/v1/reports`)

---

#### P1.4 — GIS Map — Click-through & Live Data

##### [MODIFY] [`mine-map.tsx`](file:///c:/Coding/SIH2026/web/src/routes/_authenticated/mine-map.tsx)

**What's missing:** Static hardcoded `MINE_DATA`; clicking a pin does nothing; no risk-level overlay coloring.

**Changes:**
- Fetch real mines from Supabase `mines` table + join `mine_risk_scores`
- Color pins by `risk_rating` enum (red/amber/green)
- Pin radius proportional to `score`
- Click pin → slide-in mini-detail card: mine name | risk score | compliance % | open violations count | [Go to Mine Dashboard] button
- Add layer toggle: Risk | Compliance | Incidents | Environment

---

#### P1.5 — Production Module (`/production`)

##### [NEW] Route + Feature folder

**Route:** `/_authenticated/production`
**Spec reference:** `frontend_spec.md §5.9`

**UI:**
- Header: Target MT | Actual MT | Shortfall %
- Shift breakdown table (Shift A/B/C) with anomaly flag badge
- 7-day production trend Recharts bar chart (actual vs target)
- CCO Daily Return (Form I) — auto-populated from shift data + Digital Sign & Submit
- Monthly target tracking

---

#### P1.6 — AI Analytics (`/ai-analytics`)

##### [NEW] Route + Feature folder

**Route:** `/_authenticated/ai-analytics`
**Spec reference:** `frontend_spec.md §3.2` — Risk Score Gauge + AI Insight Panel

**UI:**
- Mine Risk Score Gauge (animated arc, 0–100)
- Top 3 contributing factors (tooltip + breakdown list)
- Risk Ranking table: mine name | score | trend arrow
- AI Insight Panel: LLM-generated cluster narrative (e.g., "Mine Jambad shows 4 converging risk indicators…")
- Anomaly Detection log: past 30-day anomalies with rule type + severity + action taken

---

#### P1.7 — Contractors Module (`/contractors`)

##### [NEW] Route + Feature folder

**Route:** `/_authenticated/contractors`, `/_authenticated/contractors/:id`
**Spec reference:** `frontend_spec.md §5.7`

**UI (List):**
- Filter: Mine | Status | Trust Score range | [+ Onboard Contractor]
- Contractor card: name | trust score badge | CLRA/ESI/EPF status chips | expiry warnings | active workers count

**UI (Profile):**
- Document Status table (CLRA, ESI, EPF, Safety, Insurance) with validity + upload CTA
- Active Assignments list
- Contract Workers table with training/ESI status
- AI Trust Score Breakdown (bar per category: Document Validity / Safety Record / CAPA Closure / Billing)

---

#### P1.8 — Compliance — Kanban + Instance Detail

##### [MODIFY] Compliance feature

**What's missing:** The compliance index loads a calendar but lacks the Kanban view toggle, and instance detail page is a 404 shell.

**Changes to [`/compliance/index.tsx`](file:///c:/Coding/SIH2026/web/src/routes/_authenticated/compliance/index.tsx):**
- Add **Kanban ↔ Calendar** toggle button pair
- Kanban columns: `pending | in_progress | submitted | approved | breached`
- Cards draggable-ish (status change via explicit CTA, not drag)
- OVERDUE items highlighted red with days-overdue count badge

**Changes to [`$instanceId.tsx`](file:///c:/Coding/SIH2026/web/src/routes/_authenticated/compliance/$instanceId.tsx):**
- Full instance detail: regulation ref | assigned officer | due date | evidence upload zone
- Evidence upload → Supabase Storage → OCR status polling
- Approval timeline stepper
- Approve / Request Revision / Reject buttons (permission-gated)

---

#### P1.9 — OCR / Digitization (`/ocr`)

##### [NEW] Route + Feature folder

**Route:** `/_authenticated/ocr`
**Spec reference:** `frontend_spec.md §3.2` — `OCRSideBySide` component

**UI:**
- Upload queue table: filename | upload date | ocr_status | confidence | actions
- Side-by-side review panel: scanned image (left) + extracted fields with confidence % (right)
- Fields below confidence threshold highlighted in amber → manual correction input
- Approve extraction → writes to compliance_evidence / contractor document records

---

#### P1.10 — Grievances (`/grievances`)

##### [NEW] Route + Feature folder

**Route:** `/_authenticated/grievances`
**Spec reference:** `workflows.md §4`

**UI:**
- Intake form: worker name + type dropdown + description textarea + file attachment
- Grievances list table: id | worker | type | status | filed date | assigned dept
- Detail view: AI auto-classification label | routing dept | resolution timeline | status update CTA
- Status badges: `filed | in_review | resolved | escalated`

---

### TIER P2 — Design Polish & UX Improvements

These are existing screens that work but need UX elevation.

---

#### P2.1 — Dashboard KPI Cards — Click-through Navigation

**Issue:** `KpiCards` on Mine Manager dashboard shows numbers but clicking does nothing.

**Fix:** Each KPI card → navigate to relevant module (Compliance Score → `/compliance`, Violations → `/violations`, Contractors → `/contractors`)

---

#### P2.2 — Mine Manager Dashboard — Real Supabase Data

**Issue:** All 6 Mine Manager dashboard sub-components (`KpiCards`, `OpenViolationsTable`, `LiveAlertFeed`, `EnvironmentalStatus`, `ProductionTrendChart`, `ComplianceCalendar`) use hardcoded mocks.

**Fix:** Wire each component with a TanStack Query hook against the appropriate Supabase table. Use `mine_id` from `useAuthStore` as the scope filter.

---

#### P2.3 — Corporate Dashboard — Mine Risk Map

**Issue:** Corporate dashboard has no MapLibre map; the spec requires a mine-risk map as the hero element.

**Fix:**
- Add MapLibre risk map (reuse the GIS map component, but with smaller viewport)
- Overlay `mine_risk_scores` data as colored pins
- Click pin → mini detail card → [Go to Mine Dashboard]

---

#### P2.4 — Topbar — MineSelector & Alert Bell

**Issue:** The topbar has no `MineSelector` dropdown or realtime `Bell` with unread badge count.

**Fix:**
- `MineSelector`: dropdown of mines scoped by JWT role; persists selected mine to Zustand
- `AlertBell`: badge with unread count from Supabase Realtime; clicking → `/alerts`
- `LanguageSwitcher`: `EN | HI | MR` toggle (UI only; i18n wiring deferred)

---

#### P2.5 — Inspection List — Empty States & Filters

**Issue:** Inspection list has no filter bar (Mine | Type | Date | Status) and shows a blank state with no CTA.

**Fix:**
- Add `[Mine ▾] [Type ▾] [Date Range ▾] [Status ▾]` filter bar
- Add `[+ Schedule Inspection]` button (opens create inspection form)
- Add proper empty state: illustration + "No inspections found. Schedule your first inspection."

---

#### P2.6 — Violations Module — CAPA Timeline

**Issue:** `/_authenticated/violations` route exists but `ViolationTimeline` (Observation → CAPA Assigned → Verified/Closed) stepper is missing.

**Fix:**
- Add `ViolationTimeline` stepper component (per `frontend_spec.md §3.2`)
- Escalation ladder display: T+1d / T+3d / T+7d / T+14d
- `is_regulator_visible` toggle visible to `mine_manager`

---

#### P2.7 — Reports — Statutory PDF Generation

**Issue:** Reports page exists but has no PDF generation CTA or inspection report summary view.

**Fix:**
- Add `[Generate Inspection Memo PDF]` button per inspection → calls `/api/v1/reports/inspection/{id}/summary`
- Render `InspectionReportCard` in full-page view at `/inspections/{id}/report`
- Add "Verify Integrity" button (calls NBG blockchain verify endpoint — can be mocked for demo)

---

#### P2.8 — Settings & Profile Pages

**Issue:** Settings page exists but only shows theme toggle; no profile editing or notification preferences.

**Fix:**
- Profile section: name | email | role (read-only) | avatar upload
- Notification preferences: checkboxes for Push / Email / SMS per alert type
- Security: Change password CTA (delegates to Supabase Auth)

---

#### P2.9 — Global: Role-Scoped Sidebar Filtering

**Issue:** The sidebar currently shows **all items** for `system_admin` (no role filtering active in the rendered nav). The `roles` field in `sidebar-data.ts` is defined but the `Sidebar` render component does not filter by it.

**Fix:** In `Sidebar` render logic, filter `navGroup.items` against `useAuthStore().auth.role` — items without a `roles` array are shown to all, items with `roles` only show if user's role is included.

---

## Verification Plan

### Demo Run-Through (Critical Path)
1. Login as `mine_manager` → routed to Mine Manager Dashboard
2. Dashboard shows **live compliance instances** for Sept 2026 (4 items from seed)
3. Navigate to Mobile Simulator → dropdowns show Umrer OCP + Environmental Gas template
4. Add 6 observations (3 non-compliant gas readings)
5. Tap "🔍 Analyze" → AnomalyResultCard shows risk score 80+ and co-occurrence anomaly
6. Submit → InspectionReportCard renders with Gemini narrative + "🔔 Notifications sent"
7. Web dashboard Bell icon shows unread badge; LiveAlertFeed shows the new alert in real-time

### Automated
- `npm run build` — zero TypeScript errors
- All existing routes return HTTP 200 (no 404 regressions)

### Manual Page Smoke Test
| Route | Expected |
|---|---|
| `/mine-manager` | KPIs + calendar with real data |
| `/corporate-dashboard` | Mine risk map + charts |
| `/compliance` | Kanban board with instance cards |
| `/inspection` | Inspection list with filters |
| `/alerts` | Realtime alert feed |
| `/mine-map` | Interactive map with real mine pins |
| `/environment` | EC conditions + trend charts |
| `/incidents` | Incident list + Form 4-A generation |
| `/contractors` | Contractor list + trust scores |
| `/ai-analytics` | Risk score gauge + AI insights |
| `/reports` | Report list + PDF generation |
| `/ocr` | Upload queue + side-by-side review |
| `/grievances` | Intake form + status list |

---

## Prioritized Execution Order

| # | Item | Tier | Effort | Files |
|---|---|---|---|---|
| 1 | Wire AnomalyResultCard to API | P0 | S | `AnomalyResultCard.tsx` |
| 2 | AddObservationForm gas readings | P0 | M | `AddObservationForm.tsx` |
| 3 | MobileInspectionSimulator upgrades | P0 | M | `MobileInspectionSimulator.tsx` |
| 4 | Build `InspectionReportCard.tsx` | P0 | M | new file |
| 5 | Compliance Calendar — Supabase data | P0 | S | `compliance-calendar.tsx` |
| 6 | LiveAlertFeed — Supabase Realtime | P0 | S | `live-alert-feed.tsx` |
| 7 | Alerts page `/alerts` | P1 | M | new route + feature |
| 8 | Violations — CAPA Timeline | P2 | S | existing route |
| 9 | Sidebar role filtering | P2 | XS | `Sidebar` component |
| 10 | Topbar MineSelector + AlertBell | P2 | M | layout components |
| 11 | Inspection List filters + empty state | P2 | S | inspection index |
| 12 | KPI Cards click-through nav | P2 | XS | `kpi-cards.tsx` |
| 13 | Environment Module `/environment` | P1 | L | new route + feature |
| 14 | Incidents Module `/incidents` | P1 | L | new route + feature |
| 15 | GIS Map live data + click-through | P1 | M | `mine-map.tsx` |
| 16 | Contractors Module `/contractors` | P1 | L | new route + feature |
| 17 | AI Analytics `/ai-analytics` | P1 | M | new route + feature |
| 18 | Production Module `/production` | P1 | M | new route + feature |
| 19 | OCR Module `/ocr` | P1 | L | new route + feature |
| 20 | Grievances `/grievances` | P1 | M | new route + feature |
| 21 | Compliance Kanban + Instance Detail | P1 | L | compliance feature |
| 22 | Corporate Dashboard mine risk map | P2 | M | `corporate-dashboard.tsx` |
| 23 | Reports — PDF generation | P2 | M | reports feature |
| 24 | Settings — Profile + Preferences | P2 | S | settings feature |
| 25 | Mine Manager Dashboard — real data | P2 | M | all dashboard components |
