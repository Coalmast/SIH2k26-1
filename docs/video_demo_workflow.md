# 🎬 COMET — SIH 2026 | Video Demo Script & Recording Workflow

**Platform:** Coal Operations Monitoring, Enforcement & Transparency (COMET)  
**PS:** SIH 2026 — PS 26024 | Coal India Limited | Ministry of Coal  
**Target Duration:** 5 minutes exactly  
**Style:** Live demo narration · fast-pace montage · captions carry PS coverage

> **Script Version:** Based on the final 5-minute cross-checked script (September 2026).  
> Each section has a `[TIMESTAMP]`, a **🖥️ ACTION** (what is on screen), **📌 CAPTIONS** (on-screen text), and a **🎙️ SCRIPT** (narration — speak naturally, don't read word for word).

---

## 📋 PS CROSS-CHECK TABLE

| PS Requirement | How It Is Shown | Status |
|---|---|---|
| Track compliance for safety, environment, production, labour | `/compliance` auto-tasks; environment inspection; Production tab; attendance night-shift limits; contractor compliance montage | ✅ |
| Real-time monitoring of inspections, observations, violations, CAPA | Whole workflow; worker and inspector observations | ✅ |
| AI: high-risk areas | Risk score with reasons, GIS risk map, corporate ranking | ✅ |
| AI: recurring failures | AI Analytics tab (Mine Manager) | ⚠️ Show only if screen has it |
| AI: anomaly detection | Environment AI anomaly + sensor spike | ⚠️ Show only if built |
| AI: predictive alerts | Environment AI forecast + recommended action | ⚠️ Show only if built |
| Geo-tagged, time-stamped mobile reporting | Mobile inspection, incident, attendance | ✅ |
| Dashboards: mine officials, corporate, regulators | Mine Manager, Environment Officer, Corporate, Regulator read-only | ✅ |
| Automated alerts, reminders, compliance reports, escalation | Notifications table, escalation ladder, statutory report auto-populate | ✅ |
| Minimize paperwork | OCR, auto-reports, digital signature | ✅ |
| Scalable across mines and subsidiaries | Solution slide, Corporate dashboard, close | ✅ |
| Workflow automation, digital approvals | Manager review/reassign, CAPA approval, report sign-off | ✅ |
| GIS mapping | Mine map, site explorer | ✅ |
| OCR | Contractor documents, legacy records, human review queue | ✅ |
| Tamper-evident audit trail | SHA-256 hashing — say "tamper-evident audit trail", NOT "blockchain" unless records are chained | ⚠️ |
| Multilingual conversational interface | Voice grievance in 5 languages; AI assistant | ✅ |
| Offline support | Mobile workflow | ✅ |
| Fragmented systems background problem | Hook + "single source of truth" | ✅ |
| Expected outcomes | Impact slide and close | ✅ |

---

## 🎬 SEGMENT 1 — HOOK: THE PROBLEM
### `[0:00 – 0:35]`

**🖥️ ACTION:**
1. Full-screen COMET landing page with hero animation.
2. Quick-cut × 3: paper register → spreadsheet → old paper inspection form.
3. Animated timeline: `Field → Manager → Corporate → Regulator` with a delay flag at each step.

**📌 CAPTIONS:** `300+ mines` · `Paper registers` · `Fragmented systems` · `Delayed reports`

**🎙️ SCRIPT:**
> "Coal mining is one of India's most safety-critical industries. Coal India runs mines across many subsidiaries, with thousands of workers and contractors. And yet the governance behind it is still fragmented. Statutory compliance under the Mines Act, CMR 2017, and the Environment Protection Act is tracked in registers and spreadsheets. When an inspector finds a problem underground, it is written on paper. It reaches the Mine Manager days later. It reaches corporate management weeks later. And by the time it reaches the regulator, the evidence is old, the data is inconsistent, and the same record exists in three places. This causes delayed decisions, missed deadlines, compliance gaps, and in the worst cases, preventable accidents. The problem statement asks for one integrated, AI-enabled governance platform. This is COMET."

---

## 💡 SEGMENT 2 — SOLUTION: WHAT COMET IS
### `[0:35 – 1:10]`

**🖥️ ACTION:** Architecture slide, **animated**:
`Mobile app ↔ Sync ↔ Backend + Regulation library + Rules engine ↔ Web dashboards`
AI layer on top. GIS and audit trail shown alongside.

**📌 CAPTIONS:** `Web dashboards · 5 roles` · `Offline mobile app` · `AI layer (Gemini + ADK)` · `Rules + workflow engine` · `GIS` · `OCR` · `Tamper-evident audit trail`

**🎙️ SCRIPT:**
> "COMET works in three layers. First, role-based web dashboards — so a Mine Manager, Environment or Safety Officer, Corporate Management, a Contractor, and a Regulator each see only what they need, updated in real time. Second, an offline-first mobile app for inspectors, overmen, and workers — geo-tagged, time-stamped, and it works deep underground with no network. Third, an AI layer built on Google Gemini and ADK, with five agents: risk scoring, anomaly detection, statutory-report drafting, grievance classification from voice in five languages, and document reading through OCR. Underneath is a regulation library that generates compliance tasks, a rules engine that checks every observation, a workflow engine that handles alerts, reminders, approvals, and escalations, GIS mapping, and a tamper-evident audit trail. One system. One source of truth. Let me show you a real workflow from start to finish."

---

## 🖥️ SEGMENT 3 — MINE MANAGER: /compliance, System-Generated + Auto-Assigned
### `[1:10 – 1:40]`

**🖥️ ACTION:**
- Navigate to `/compliance`
- Show health dial + stat cards (Pending / In Progress / Approved / Breached)
- Switch between **Calendar view** and **Kanban view**
- Open a task tagged **"System-generated"** → show source regulation, due date, "Auto-assigned to [Inspector]" + reason
- Show **Edit / Reassign** dropdown
- Show notification feed: assigned · confirmation · reminder · escalation

**📌 CAPTIONS:** `System-generated from regulation library` · `Auto-assigned` · `Manager can edit or reassign` · `Reminder + escalation`

**🎙️ SCRIPT:**
> "We start as the Mine Manager on the Compliance page. This is the mine's compliance health, and these are its tasks in calendar and Kanban views. This inspection — an air-quality and dust check at the coal handling plant — was generated by our system from the regulation library, and the system assigned it to the right inspector automatically. The manager can review every generated inspection, edit its details, or reassign it if needed. The moment the task is assigned, notifications go out: the inspector receives 'New inspection assigned, due Friday'; the manager receives a confirmation; a reminder goes out before the deadline; and if the deadline is missed, the task escalates up the ladder — from Mine Manager, to Subsidiary Admin, to DGMS."

---

## 🔍 SEGMENT 4 — INSPECTOR: WEB CALENDAR
### `[1:40 – 1:50]`

**🖥️ ACTION:**
- Log in as **Field Inspector**
- Show inspector calendar → the assigned task
- Show checklist preview + location
- Click **"Continue on mobile"**

**📌 CAPTIONS:** `Inspector calendar` · `Synced to mobile`

**🎙️ SCRIPT:**
> "Now the Field Inspector's web view. Her assigned inspections appear on her calendar with location, checklist, and deadline. She continues the inspection in the mine on her phone."

---

## 📱 SEGMENT 5 — MOBILE: UNDERGROUND, OBSERVATIONS, ON-DEVICE RULES
### `[1:50 – 2:25]`

**🖥️ ACTION:**
1. Mobile app — offline icon visible → open assigned task
2. GPS stamp activates → walk through checklist → record observations → attach photo
3. Enter dust reading over the SPCB/CPCB limit → **red violation alert on device** (on-device rules, no network)
4. *6-second cut:* Methane reading above CMR limit → **full-screen EVACUATE alert**
5. Submit → "Saved, will sync"

**📌 CAPTIONS:** `Offline` · `Geo-tagged + time-stamped` · `Photo evidence` · `Rules checked on device` · `Evacuation alert`

**🎙️ SCRIPT:**
> "She enters the mine with no signal, but the task is already on her phone. The app stamps her location and time. She works through the checklist, records observations, attaches photos, and enters a dust reading. The app checks the reading against the regulatory limit right on the device — it is over the limit, so a violation is flagged instantly, with no network needed. The same rules engine watches gas: a methane reading above the safe limit fires a full-screen evacuation alert, even offline. She submits, and everything syncs as soon as she is back in range."

---

## 🔄 SEGMENT 6 — THE LOOP: NOTIFICATIONS, DIGITAL APPROVAL, AUDIT TRAIL
### `[2:25 – 2:45]`

**🖥️ ACTION:**
- Web: **Live Alerts card** → Mine Manager opens the violation (photo evidence, location, severity)
- Manager **assigns corrective action**: deadline + responsible officer (digital approval flow)
- Show "proof required to close" notice
- Show calendar with **follow-up inspection** auto-scheduled

**📌 CAPTIONS:** `Violation auto-created` · `Digital approval` · `Audit trail` · `Follow-up inspection`

**🎙️ SCRIPT:**
> "On sync, everyone who needs to know is notified together: the Mine Manager, the Environment Officer, and the responsible contractor. The violation is already created with photo, location, and time. The manager assigns a corrective action with a deadline and an owner. It cannot be closed without proof — and closing it updates the risk score. A follow-up inspection is then scheduled to verify the fix. The loop continues until the issue is truly closed, and every step is recorded."

---

## 🌿 SEGMENT 7 — ENVIRONMENT OFFICER: DASHBOARD, AI ANALYTICS, DIGITAL SIGN
### `[2:45 – 3:15]`

**🖥️ ACTION:**
- Navigate to `/environment`
- Show inspection details: AQI, PM10, noise trend charts **against regulatory limits**
- Show **AI forecast + recommended action panel**
- Show **GIS sensor map** with reading locations pinned
- Navigate to Statutory Report → click **Auto-populate** → **Digital Sign** → **Submit** → confirmation toast

**📌 CAPTIONS:** `AI analytics` · `Forecast + recommended action` · `GIS sensor map` · `Auto-populated report` · `Digital signature`

**🎙️ SCRIPT:**
> "The Environment Officer sees the same inspection on his dashboard, with photos and readings, alongside sensor trends for air quality, PM10, and noise against regulatory limits. Here the AI analyses the trend, detects anomalies, forecasts whether levels will stay high, and recommends an action. AI advises; the officer decides. The map shows exactly where the readings come from. And when it is time to report, the statutory report is auto-populated from the same data, digitally signed and submitted. No re-typing."

---

## ⚡ SEGMENT 8 — FAST MONTAGE (ROLE BY ROLE)
### `[3:15 – 4:30]`

> **Recording note:** Each screen 3–5 seconds. Keep captions in the same corner throughout. Record each tab separately and speed up in editing.

---

### 8.1 — Mine Manager: Remaining Tabs `[~3:15 – 3:35]`

**🖥️ ACTION (quick cuts):**
Mine Dashboard → Live Alerts → GIS Risk Map → Inspections (create & allocate) → Violations & CAPAs → Incidents → Production & Dispatch → Contractor Management → Grievances → OCR → AI Analytics

**📌 CAPTIONS:** `Compliance score` · `Risk map` · `Allocate inspections` · `Production + dispatch` · `Compliance radar + AI assistant`

**🎙️ SCRIPT:**
> "The Mine Manager's command center brings it all together: live compliance score, alerts, risk map, inspection allocation, violations and corrective actions, incidents, production and dispatch, contractor performance, worker grievances, and OCR digitization of legacy records. AI Analytics adds aggregated risk, a compliance radar, recurring-failure detection, and an assistant that answers questions from safety, environment, incident, and production data."

---

### 8.2 — Field Inspector & Worker `[~3:35 – 3:50]`

**🖥️ ACTION (quick cuts):**
Mobile: Report Incident → Mine Map → Alerts and SOS → QR attendance scan → Web `/attendance` night-shift flag → Worker Observation → Voice grievance in Hindi → Web grievance case with category + priority

**📌 CAPTIONS:** `Incident report` · `SOS` · `QR attendance, geo-fenced` · `Night-shift limit flag` · `Voice grievance, 5 languages`

**🎙️ SCRIPT:**
> "In the field, an inspector can report an incident like a roof fall in seconds, use the mine map, and press SOS in an emergency. Workers scan a QR badge for geo-fenced attendance, and the system flags night-shift limits under the Mines Act. Workers can submit observations and speak a grievance in Hindi, Bengali, Odia, Marathi, or English. The AI transcribes it, sorts it, sets priority, and routes it to the right officer."

---

### 8.3 — Safety Official `[~3:50 – 4:00]`

**🖥️ ACTION (quick cuts):**
Incidents → Form 4-A → File Incident Report → Violations & CAPAs → Statutory Reports

**📌 CAPTIONS:** `Incident investigation` · `Form 4-A` · `Statutory reports`

**🎙️ SCRIPT:**
> "The Safety Official investigates incidents, files statutory forms such as Form 4-A, tracks corrective actions, and signs and submits reports."

---

### 8.4 — Corporate Management `[~4:00 – 4:15]`

**🖥️ ACTION (quick cuts):**
National Dashboard → Compliance Overview → Production Analytics → AI Risk Intelligence → Environmental Summary → Contractor Trust Map → Emergency Broadcast

**📌 CAPTIONS:** `All mines, one view` · `AI risk ranking` · `Contractor trust map` · `Emergency broadcast`

**🎙️ SCRIPT:**
> "Corporate management sees every mine and subsidiary: compliance comparison, production analytics, an AI ranking of the highest-risk sites and why, environmental performance, contractor trust scores, and an emergency broadcast to all units."

---

### 8.5 — Regulator `[~4:15 – 4:23]`

**🖥️ ACTION:**
Regulator login → read-only verified statutory reports → tamper-evident indicator / audit trail badge visible

**📌 CAPTIONS:** `Read-only access` · `Verified reports` · `Tamper-evident audit trail`

**🎙️ SCRIPT:**
> "Regulators get read-only access to verified statutory reports, with a tamper-evident audit trail — so trust does not depend on phone calls."

---

### 8.6 — Contractor `[~4:23 – 4:33]`

**🖥️ ACTION:**
Contractor profile → expiring medicals, machinery fitness, overdue training, pending CAPAs → AI Document Extraction → RFID/QR attendance

**📌 CAPTIONS:** `Expiry tracking` · `Pending corrective actions` · `AI document extraction`

**🎙️ SCRIPT:**
> "Contractors see their own obligations: expiring medicals, machinery fitness, overdue training, and corrective actions assigned to them — and upload documents that AI reads and verifies. Low-confidence reads go to a human review queue."

---

## 🏁 SEGMENT 9 — FEASIBILITY, SCORECARD, IMPACT, CLOSE
### `[4:30 – 5:00]`

**🖥️ ACTION:**
1. Slide: Methodology + phased rollout plan (10 s)
2. PS scorecard slide — every requirement ticked (12 s)
3. Before/after impact numbers — e.g. "Days → Minutes" reporting delay (8 s)
4. Return to COMET landing page — hero animation

**🎙️ SCRIPT:**
> "Is this feasible? It is built and running today on React, FastAPI, Supabase, React Native, and Gemini. It works offline, uses the same design for every mine, and adding a mine is configuration — not a rebuild. We propose a phased rollout: one pilot mine, one subsidiary, then all of Coal India, on existing phones and without new hardware. Against the problem statement, COMET covers compliance across safety, environment, production and labour, live inspections and corrective actions, AI risk detection, geo-tagged offline reporting, dashboards for mine, corporate, and regulator, automated alerts and escalations, GIS, OCR, and a secure audit trail. It cuts reporting delays from days to minutes, removes paperwork, and gives early warnings that protect workers. COMET is an indigenous, paperless governance platform, built for Indian coal mines. Thank you."

---

## ⏱️ TIMESTAMP TABLE (v4.0)

| Time | Scene | Route / Action |
|---|---|---|
| 0:00 – 0:35 | Hook: The Problem | Landing page → paper cuts → delay timeline |
| 0:35 – 1:10 | Solution: Architecture | Architecture slide (animated) |
| 1:10 – 1:40 | Mine Manager: /compliance + auto-assign ⚡ | `/compliance` → system-generated task → notification feed |
| 1:40 – 1:50 | Inspector: Web calendar | Inspector login → calendar |
| 1:50 – 2:25 | Mobile: Offline inspection + evacuation alert ⚡⚡ | Mobile → dust violation alert → CH4 EVACUATE |
| 2:25 – 2:45 | The loop: violation → digital approval → audit trail | Web violations → CAPA assign → follow-up calendar |
| 2:45 – 3:15 | Environment Officer: AI forecast + digital sign ⚡ | `/environment` → AI panel → sign → submit |
| 3:15 – 3:35 | Montage: Mine Manager all tabs | All MM tabs rapid cuts |
| 3:35 – 3:50 | Montage: Inspector + Worker | Mobile incident / SOS / QR + web `/attendance` + `/grievances` |
| 3:50 – 4:00 | Montage: Safety Official | `/incidents` → Form 4-A |
| 4:00 – 4:15 | Montage: Corporate | `/corporate-dashboard` all tabs |
| 4:15 – 4:23 | Montage: Regulator | `/regulator` read-only |
| 4:23 – 4:33 | Montage: Contractor | `/contractors` profile + `/ocr` |
| 4:30 – 5:00 | Feasibility + scorecard + impact + close | Slides → landing page |

---

## ✅ ALL PAGES THAT MUST APPEAR ON SCREEN

| Page / Feature | URL / Location | Segment |
|---|---|---|
| Landing Page | `/` | 1, close |
| Architecture Slide | PPT / animated HTML | 2 |
| Compliance Tracker | `/compliance` | 3 |
| Inspector Calendar (inspector role login) | `/compliance` or inspector dashboard | 4 |
| Mobile: Offline Inspection + dust violation | Mobile app | 5 |
| Mobile: CH4 Evacuation Alert ⚡⚡ | Mobile app | 5 |
| Web: Live Alerts + Violation detail | `/alerts` → violation detail | 6 |
| Web: CAPA digital approval | Violation detail / CAPA panel | 6 |
| Web: Follow-up inspection on calendar | `/compliance` calendar | 6 |
| Environment Dashboard + AI forecast | `/environment` | 7 |
| Environment: GIS sensor map | `/environment` map tab | 7 |
| Statutory Report: auto-populate + digital sign | `/reports` or env report modal | 7 |
| Mine Manager: Mine Dashboard | `/mine-manager` | 8.1 |
| Mine Manager: GIS Risk Map | `/mine-map` | 8.1 |
| Mine Manager: Incidents | `/incidents` | 8.1 |
| Mine Manager: Production & Dispatch | `/production` | 8.1 |
| Mine Manager: AI Analytics | `/ai-analytics` | 8.1 |
| Mobile: Incident Report | Mobile app | 8.2 |
| Mobile: SOS | Mobile app | 8.2 |
| Mobile: QR Attendance | Mobile app | 8.2 |
| Web: Attendance (night-shift flag) | `/attendance` | 8.2 |
| Mobile: Voice Grievance (Hindi) | Mobile app | 8.2 |
| Web: Grievance case (category + priority) | `/grievances` | 8.2 |
| Safety: Incidents + Form 4-A | `/incidents` (safety role) | 8.3 |
| Corporate Dashboard (all tabs) | `/corporate-dashboard` | 8.4 |
| Regulator Read-Only + Audit Trail Badge | `/regulator` | 8.5 |
| Contractor Profile + Doc Extraction | `/contractors` | 8.6 |
| OCR: Human Review Queue | `/ocr` | 8.6 |

---

## 🔔 NOTIFICATIONS TO SHOW IN THE MONTAGE

Only show notifications your app actually sends.

| Type | To | Example Text |
|---|---|---|
| Inspection assigned | Inspector | "New inspection assigned, due Friday." |
| Assignment confirmation | Mine Manager | "Inspection assigned to [Inspector]." |
| Deadline reminder | Inspector | "Inspection due in 24 hours." |
| Escalation | Subsidiary Admin → DGMS | "Compliance task overdue: [title]." |
| Violation created | Mine Manager, EO, Contractor | "Violation flagged: [location], [severity]." |
| CAPA assigned | Responsible officer | "Corrective action assigned: [title], due [date]." |
| SOS raised | Manager, Safety Official | "SOS raised by [Inspector], [location], [time]." |
| Contractor expiry | Contractor, Mine Manager | "[Contractor] licence expires in [N] days." |
| Overdue CAPA | Officer → Manager | "Corrective action overdue: [title]." |
| Night-shift limit | Mine Manager | "[Worker] exceeded consecutive night-shift limit." |
| Grievance routed | Responsible officer | "New [category] grievance, priority [level]." |
| Emergency broadcast | All units | "[Message from Corporate]." |
| Report submitted | Manager, Regulator | "Statutory report submitted and signed." |

---

## 🛠️ SYSTEM CHANGES NEEDED BEFORE RECORDING

> Prioritized by how visible they are in the video. Fix **P0** before any test recording. Fix **P1** before the final take. **P2** strengthens the demo but is cuttable.

### P0 — MUST FIX (video breaks without these)

| # | What | Where | Notes |
|---|---|---|---|
| 1 | **"System-generated" badge** on compliance tasks | `/compliance` Kanban + Calendar | Tasks auto-created by regulation library must show a visible "System-generated" label + source regulation + auto-assigned inspector in the detail panel |
| 2 | **Notification feed** showing 4 types | Mine Manager sidebar or `/alerts` | Seed: assigned · confirmation · reminder · escalation — all 4 visible in one scroll |
| 3 | **"Proof required to close" notice** on CAPA/violation | `/violations/:id` or CAPA panel | Must be visible so the digital-approval story lands |
| 4 | **Follow-up inspection auto-scheduled** after violation | `/compliance` calendar | Either show it scheduled on calendar, or cut that caption and voice line |
| 5 | **Environment AI forecast + recommended action** | `/environment` | If not built → remove caption + say "next phase" in voiceover |
| 6 | **Digital Sign button + confirmation flow** on statutory report | `/reports` or env report modal | Must show a visible "Signed & Submitted" toast/confirmation |
| 7 | **Regulator read-only view** with tamper-evident indicator | `/regulator` | No edit controls; audit trail badge visible; looks distinct from Mine Manager |
| 8 | **Inspector role login + inspector calendar** | Auth → inspector dashboard | Separate role login showing only inspector's calendar, not Mine Manager's full dashboard |

---

### P1 — SHOULD FIX (caption/voiceover will mislead without these)

| # | What | Where | Notes |
|---|---|---|---|
| 9 | **Incident report on mobile** | Mobile app | Quick form: type, location, photo; syncs to `/incidents` on web |
| 10 | **SOS button on mobile** | Mobile app | Full-screen red button; fires notification to Manager + Safety Official |
| 11 | **Night-shift limit flag on `/attendance`** | `/attendance` web | Badge/highlight workers who exceeded consecutive night-shift limit under Mines Act |
| 12 | **Worker Observation on mobile** | Mobile app | Simple text/photo submit that lands in a web queue |
| 13 | **Voice grievance → auto-category + priority on `/grievances`** | `/grievances` web | If Gemini audio agent not wired, mock the category/priority fields in the submitted case |
| 14 | **Contractor Trust Map / trust score** on corporate dashboard | `/corporate-dashboard` | If not built, cut "contractor trust map" caption and line from script |
| 15 | **Emergency Broadcast button** on corporate dashboard | `/corporate-dashboard` | Fires a broadcast notification to all units |
| 16 | **Form 4-A** in incidents (Safety Official role) | `/incidents` safety role | Statutory form must be visible and fillable |
| 17 | **RFID / QR attendance on mobile** (confirm working) | Mobile app | QR scan → stamped geo-fenced attendance; verify end-to-end |

---

### P2 — NICE TO HAVE (cut if not built, captions handle it)

| # | What | Where | Notes |
|---|---|---|---|
| 18 | **Recurring-failure detection** in AI Analytics | `/ai-analytics` | Show if present; skip if not |
| 19 | **Anomaly detection indicator** in Environment | `/environment` AI panel | Show if present; skip if not |
| 20 | **GIS sensor map** in Environment with pinned readings | `/environment` map tab | Verify it renders; already in script |
| 21 | **Architecture animated slide** | PPT / HTML | Animate each layer on cue with voiceover |
| 22 | **PS scorecard slide** | PPT | One page; all PS requirements ticked; shown in closing |
| 23 | **Before/after impact numbers slide** | PPT | e.g. "Days → Minutes" for reporting delay |

---

## 🎥 RECORDING GUIDE

### 🖥️ Pre-Recording Setup

```
✅ Web app running at http://localhost:5173 — demo data seeded (see below)
✅ Backend running at http://localhost:8000
✅ Screen recorder (OBS / Loom) — 1920×1080, 30 fps, mic levels checked
✅ Mobile: emulator or physical device, app installed and logged in as Field Inspector
✅ All browser notifications, system alerts, Slack/Teams CLOSED
✅ Browser zoom: 100% (no scaling artefacts)
✅ Font size legible at 1080p — test a screenshot first
✅ Incognito/private window to avoid autofill popups and extension toolbars
```

---

### 🗄️ Demo Data to Seed Before Recording

| Entity | Count | Details |
|---|---|---|
| Mine | 1 main + 5 for corporate map | Main: "Dhanbad Central Colliery" |
| Inspections | 3 | 1 completed, 1 in-progress, 1 scheduled (system-generated, tagged) |
| Open violation | 1 | Photo attached, severity HIGH, underground location, CAPA assigned, "proof required to close" |
| Compliance tasks | 5 | 1 overdue (red), 1 due today (amber), 3 upcoming; at least 1 labelled "System-generated" with regulation source |
| Contractors | 2 | 1 with expiring medical in 7 days, 1 with pending CAPA |
| Attendance records | 20+ | 1 worker with night-shift limit flag |
| Grievance | 1 pending | Voice grievance (Hindi), auto-categorised as "Safety", priority "High" |
| Notifications | 4+ rows | Assigned · confirmation · reminder · escalation |
| Environment readings | 24 h trend | PM10 slightly above SPCB limit at one point to trigger AI comment |
| Statutory report | 1 draft | Ready to auto-populate, sign, and submit |
| Incident | 1 | Roof fall, Safety Official role, Form 4-A attached |

---

### 📽️ Shot-by-Shot Recording Order

> Record in this order to minimise re-logins. Record every "wow" moment **twice** as insurance.

1. Architecture slide (full-screen, separate recording)
2. Hook cuts — paper register photo, spreadsheet screenshot, old form, delay timeline animation
3. Login as **Mine Manager** → `/compliance` → open system-generated task → notification feed
4. Login as **Inspector** → inspector calendar → "Continue on mobile"
5. **Mobile** — offline inspection → dust violation alert → CH4 → EVACUATE → submit ("saved, will sync")
6. **Web (Mine Manager)** — Live Alerts → open violation → assign CAPA (digital approval) → follow-up on calendar
7. Login as **Environment Officer** → `/environment` → AI forecast panel → sensor map → sign + submit report
8. **Mine Manager montage** — all remaining tabs, 3–5 seconds each, screen recorded separately, speed up in edit
9. **Mobile montage** — incident report → SOS → QR attendance scan
10. **Web** → `/attendance` night-shift flag → voice grievance on mobile → `/grievances` web case
11. Login as **Safety Official** → `/incidents` → Form 4-A
12. Login as **Corporate** → `/corporate-dashboard` → all tabs → emergency broadcast
13. Login as **Regulator** → `/regulator` → read-only verified reports + audit trail badge
14. Login as **Contractor** → profile → document upload → OCR human review queue
15. PS scorecard + impact slides (full-screen, separate recording)
16. COMET landing page close — hero animation running

---

### 🎙️ Voice Recording Tips

- **Record audio separately** from screen recording, then sync in editing — gives you clean retakes.
- **Speak at 80% of your normal pace.** You can slow down in editing; you cannot slow down rushed speech cleanly.
- **Pause one full second between segments** — that silence is your cut point in the editor.
- **Drink water before recording.** Dry throat creates pops on mic.
- **Do 3 full run-throughs** before the final take. Time yourself: if you go over 5:00, trim the montage voiceover, not the workflow.
- **Captions carry coverage** — if a screen is too fast to narrate, the caption alone counts for the PS judges.

---

### ✂️ Editing Notes

| Technique | When to Use |
|---|---|
| Speed up 1.2–1.3× | Montage sections (8.1–8.6) — never exceed 1.5× or speech becomes unintelligible |
| Cut on action | Click button → cut to result already loaded; never show a loading spinner |
| Hold 1–2 seconds on WOW moments | CH4 EVACUATE, AI forecast panel, digital signature toast, regulator audit badge |
| Caption overlay | Every 3-second montage cut — bottom-left corner, consistent font/style |
| Fade to black | Only between: architecture slide ↔ demo, and demo ↔ closing scorecard |
| No jump cuts in narration | Jump-cut the screen recording only; keep audio continuous per segment |

---

### ⚡ WOW MOMENTS — SLOW DOWN HERE

| # | Moment | Why It Lands |
|---|---|---|
| 1 | System-generated task with source regulation visible | Proves the regulation library is real — not manual data entry |
| 2 | Dust reading → on-device violation alert (no network) | Offline rules engine is rare in any demo — let it breathe |
| 3 | CH4 → full-screen EVACUATE ⚡⚡ | Highest emotional impact — pause 2 full seconds, then narrate |
| 4 | Environment AI forecast + recommended action | AI advising an officer in real time — strong for PS judges |
| 5 | Statutory report: one click → auto-populated → signed | Paperwork eliminated in 10 seconds — direct PS answer |
| 6 | Regulator read-only + tamper-evident audit badge | Accountability visible to regulator — often the deciding moment |

---

### ✅ Pre-Record Checklist

```
□ All P0 system changes done and tested end-to-end
□ Demo data seeded — every screen non-empty and realistic
□ Full 5-minute run-through rehearsed × 3 — timed
□ Each WOW moment rehearsed until it fits under 10 seconds on screen
□ Mic levels checked — no clipping, no room echo
□ Phone notifications OFF (physical device) or emulator notifications OFF
□ Screen recorder test clip — plays back at correct resolution and frame rate
□ Architecture slide animation working / exported
□ PS scorecard slide ready
□ Impact before/after slide ready
```

---

*Script v4.0 — Final 5-min · SIH 2026 — PS 26024 · COMET Platform*
