# 🎬 COMET — SIH 2026 | Video Demo Script & Recording Workflow

**Platform:** Coal Operations Monitoring, Enforcement & Transparency (COMET)  
**Problem Statement:** SIH 2026 — PS 26024 | Coal India Limited | Ministry of Coal  
**Target Duration:** 5 minutes 30 seconds  
**Style:** Tarang-inspired — fast pace · live demo · no dead air · narration drives every transition

---

> **How to use this document**  
> — Each section has a **`[TIMESTAMP]`**, a **🖥️ ACTION** (what's on screen), and a **🎙️ SCRIPT** (what to say — speak naturally, don't read).  
> — The script has a light story thread woven through it — no character names, just the *situation* of a field inspector and the governance problem that follows.  
> — Transitions are written **into the narration** — one page flows directly into the next without pause.  
> — Highlight **⚡ WOW moments** — slow down, let the judges absorb them.

---

## 🎬 SEGMENT 1 — INTRODUCTION & HOOK
### `[0:00 – 0:30]`

**🖥️ ACTION:** Show COMET landing page — full screen, hero animation running.

**🎙️ SCRIPT:**
> "Hello and greetings. Acting upon Problem Statement 26024, issued by Coal India Limited under the Ministry of Coal, we are excited to present **COMET** — Coal Operations Monitoring, Enforcement and Transparency — our comprehensive platform designed to bring real-time AI-powered governance to India's coal mines.
>
> Across India's 300-plus coal mines, statutory compliance is tracked on paper registers, field inspections leave no digital trail, and by the time a violation reaches a Mine Manager's desk — the evidence is already a week old. By the time it reaches DGMS — it is a month old.
>
> Let me quickly demonstrate how COMET solves this — end to end."

---

## 📊 SEGMENT 2 — THE PROBLEM
### `[0:30 – 1:00]`

**🖥️ ACTION:** Switch to PPT — **Slide 1: Problem Statement** — animate bullet points one by one.

**🎙️ SCRIPT:**
> "The problem has five dimensions. Compliance tracking is entirely manual — dozens of statutory deadlines under the Mines Act, CMR 2017, and the EP Act, all tracked on paper. Field inspections have no digital trail — observations, violations, corrective actions logged in registers with no real-time visibility. Contractor management is fragmented — license expiries and safety documents have no central system. Statutory reports to DGMS and SPCB take days to compile. And there is no AI layer — recurring safety failures go undetected until something goes wrong.
>
> This is the governance gap COMET is built to close."

---

## 💡 SEGMENT 3 — THE SOLUTION
### `[1:00 – 1:30]`

**🖥️ ACTION:** Switch to PPT — **Slide 2: Solution Architecture** — point to each pillar.

**🎙️ SCRIPT:**
> "COMET is built on three pillars. A **role-based web dashboard** — for Mine Managers, Corporate Leadership, and Regulators — with real-time data via Supabase Realtime. An **offline-capable mobile field app** — for inspectors and overmen — geo-tagged, voice-enabled, working deep inside the mine with zero network. And an **AI layer powered by Google Gemini and ADK** — five intelligent agents continuously scoring risk, detecting anomalies, drafting statutory reports, and classifying worker grievances across five languages.
>
> Now — let us walk through the working prototype."

---

## 🖥️ SEGMENT 4 — WEB DASHBOARD WALKTHROUGH
### `[1:30 – 3:55]`

---

### 4.1 — Login & Landing
#### `[1:30 – 1:42]`

**🖥️ ACTION:** Open `http://localhost:5173` → landing page → click **Login** → sign in as Mine Manager.

**🎙️ SCRIPT:**
> "This is COMET's web platform — supporting five roles: Mine Manager, Corporate Executive, Contractor Manager, Field Officer, and Regulator. We log in as Mine Manager."

---

### 4.2 — Mine Manager Command Center
#### `[1:42 – 2:08]`  
**Route:** `/mine-manager`

**🖥️ ACTION:** Dashboard loads fully — point across the screen in one sweeping motion:  
**KPI cards** → **Production Trend Chart** → **AI Risk Panel** → **Compliance Calendar** → **Open Violations Table** → *(right sidebar)* **Environmental Status** → **Worker Attendance Summary** → **Live Alert Feed**.

**🎙️ SCRIPT:**
> "⚡ The Mine Manager Command Center — everything on one screen, updated live.
>
> Across the top — compliance health, open violations, pending corrective actions, worker attendance. Left — production trends charted by shift, and right beside it — the **AI Risk Panel** powered by Google Gemini, giving a live risk score computed from violation history, CAPA closure rate, gas readings, and production pressure.
>
> Below — the Compliance Calendar, with every statutory deadline auto-generated from our regulation library — overdue tasks turning red, automatically escalating up the chain.
>
> Right sidebar — live alerts streaming in from the field, environmental sensor status, and workforce attendance summary.
>
> This used to arrive as a paper report at the end of the week. On COMET — it is live. Now, let us go deeper into compliance."

---

### 4.3 — Compliance Tracker
#### `[2:08 – 2:28]`  
**Route:** `/compliance`

**🖥️ ACTION:** Navigate to `/compliance` — animated stat cards (Pending / In Progress / Approved / Breached) + circular health score dial → switch between **Calendar view** and **Kanban view**.

**🎙️ SCRIPT:**
> "The Compliance module — the heartbeat of the platform. COMET auto-generates compliance tasks from the Mines Act, CMR 2017, EP Act, and CLRA. That circular dial is the mine's live compliance health score.
>
> A Mine Manager can switch between a **Calendar view** — what is due this month — or a **Kanban board** — tasks by status. Breached tasks automatically trigger a multi-level escalation ladder — from Mine Manager, to Subsidiary Admin, to DGMS — so nothing disappears quietly.
>
> Speaking of what actually happens in the field — let us look at inspections."

---

### 4.4 — Inspections
#### `[2:28 – 2:48]`  
**Route:** `/inspection`

**🖥️ ACTION:** Navigate to `/inspection` — show list with filter dropdowns → open **Schedule Inspection** dialog.

**🎙️ SCRIPT:**
> "Every field inspection submitted from the mobile app lands here — instantly. No phone call. No paper. Filter by type — DGMS Annual, Safety Committee, Environmental PCB. Every record carries the geo-stamp, timestamp, checklist outcome, and attached photos from the field.
>
> When an inspection flags a violation — it becomes this."

---

### 4.5 — Violation Detail & CAPA
#### `[2:48 – 3:05]`  
**Route:** `/violations/:id`

**🖥️ ACTION:** Click into an open violation → show **Violation Detail page** — severity badge, location, evidence section, CAPA assignment panel.

**🎙️ SCRIPT:**
> "A violation detail — severity, location, observation, and evidence. Right here, the Mine Manager assigns a **Corrective Action** — sets a deadline, assigns the responsible officer.
>
> That CAPA now has a digital trail. Closure requires uploaded evidence. The AI risk score updates the moment it is closed.
>
> One of the biggest compliance gaps in coal mines is contractors — let us address that next."

---

### 4.6 — Contractors & OCR
#### `[3:05 – 3:22]`  
**Routes:** `/contractors` → `/ocr`

**🖥️ ACTION:** Navigate to `/contractors` — show contractor list with document status badges → navigate to `/ocr` — drag in a sample contractor document → watch fields auto-populate.

**🎙️ SCRIPT:**
> "The Contractor module — every contractor's license, CLRA registration, and safety certificate tracked in one place. Expiry flags fire automatically.
>
> ⚡ And this is our OCR pipeline. Drag a paper contractor document in — COMET reads it. License number, validity date, issuing authority — auto-extracted. Documents with confidence below 85 percent route to this human review queue — source image on the left, extracted fields on the right.
>
> Paper onboarding eliminated. Now — what does the mine look like in real time?"

---

### 4.7 — Alerts & Environment
#### `[3:22 – 3:38]`  
**Routes:** `/alerts` → `/environment`

**🖥️ ACTION:** Navigate to `/alerts` — live alert cards loading → navigate to `/environment` — environmental readings against SPCB thresholds.

**🎙️ SCRIPT:**
> "The Alerts page is the mine's live emergency feed — every gas reading spike, compliance breach, and missed inspection deadline in one place, with escalation timestamps.
>
> The Environment module tracks CAAQMS readings — dust, SO₂, NOₓ — against SPCB regulatory limits. A threshold breach triggers an immediate alert and escalation. No more discovering environmental violations at the end of a quarterly audit.
>
> Let us pull out and look at the full spatial picture."

---

### 4.8 — GIS Mine Map
#### `[3:38 – 3:52]`  
**Route:** `/mine-map`

**🖥️ ACTION:** Navigate to `/mine-map` — map loads with mine pins → hover over a red pin to show popup — name, risk score, active alerts count.

**🎙️ SCRIPT:**
> "⚡ The COMET Mine Map — every mine, geo-pinned and colour-coded by AI risk score.
>
> Green — healthy. Red — critical. Hover over any pin — the current risk score, number of active alerts, and subsidiary. A regional manager can see at a glance exactly which mines need immediate attention — without making a single phone call.
>
> Built on MapLibre and PostGIS, every inspection, incident, and environmental reading is spatially anchored here.
>
> Now — step up to the corporate level."

---

### 4.9 — Corporate Dashboard
#### `[3:52 – 3:55]`  
**Route:** `/corporate-dashboard`

**🖥️ ACTION:** Navigate to `/corporate-dashboard` — KPI cards, embedded live mine map with DeckGL scatter overlay, mine risk ranking table, AI insight panel.

**🎙️ SCRIPT:**
> "Corporate leadership sees across every mine and every subsidiary on one dashboard. The **AI Risk Ranking table** — powered by Gemini — continuously scores and surfaces the highest-risk sites. No manual roll-up calls. No waiting for a subsidiary report.
>
> Regulatory authorities get read-only access to verified statutory reports — with SHA-256 hash anchoring for tamper-evident audit trails.
>
> That is the web side. Now — let us go underground, into the field."

---

## 📱 SEGMENT 5 — MOBILE APP WALKTHROUGH
### `[3:55 – 5:10]`

> **Recording note:** Switch to Android emulator or physical device screen recording from here.

---

### 5.1 — App Login & Home
#### `[3:55 – 4:07]`

**🖥️ ACTION:** App launch → login screen → sign in as Field Inspector → home screen with pending tasks and offline sync indicator.

**🎙️ SCRIPT:**
> "The COMET mobile field app — built with React Native and Expo. It works completely offline. A field inspector logs in and sees today's pending inspection tasks, active alerts, and shift status — even with zero network signal inside the mine."

---

### 5.2 — Offline Inspection
#### `[4:07 – 4:27]`

**🖥️ ACTION:** Tap **Start Inspection** → select DGMS Annual → GPS stamps location → walk through checklist → mark one item **Non-Compliant** → set severity HIGH → add description → attach photo.

**🎙️ SCRIPT:**
> "Starting an inspection — GPS stamps the location. The checklist loads from our regulation library. Each checkpoint — safe, or non-compliant.
>
> This ventilation checkpoint is flagged **High severity** — a short description is added, a photo attached. Everything saves to the device instantly. No network required.
>
> The moment connectivity is restored — it syncs directly to the Mine Manager dashboard. But what happens when a reading crosses a safety threshold?"

---

### 5.3 — ⚡ Gas Reading Evacuation Alert
#### `[4:27 – 4:40]`

**🖥️ ACTION:** In the ventilation section — enter CH4 reading `1.6%` → **full-screen red EVACUATE modal fires immediately**.

**🎙️ SCRIPT:**
> "Watch this. A methane reading of 1.6 percent — above the safe limit of 1.5 percent.
>
> ⚡ Instantly — a full-screen evacuation alert. It bypasses silent mode. It is device-local — fires even offline, underground, with zero network.
>
> On the next sync, this reading appears on the Mine Manager's Live Alert Feed automatically — from the field to the dashboard in seconds.
>
> Attendance is tracked with equal precision."

---

### 5.4 — QR Attendance
#### `[4:40 – 4:52]`

**🖥️ ACTION:** Switch to Attendance tab → QR scanner activates → scan worker badge → name and shift populate → **cut to web** `/attendance` — show the Attendance Management Module with attendance records.

**🎙️ SCRIPT:**
> "Worker attendance — captured by scanning a QR badge, geo-fenced to the mine boundary. Every scan is time-stamped and synced.
>
> On the web — the Attendance module automatically flags workers exceeding consecutive night shift limits under the Mines Act. Labour compliance enforced without a single manual check.
>
> And workers have a voice too."

---

### 5.5 — Worker Grievance
#### `[4:52 – 5:10]`

**🖥️ ACTION:** Switch to Grievances tab → tap **Record Voice Grievance** → record audio in Hindi → submit → show pending sync indicator → **cut to web** `/grievances` — grievance appears with auto-category and priority assigned.

**🎙️ SCRIPT:**
> "Any worker can file a grievance by voice — in Hindi, Bengali, Odia, Marathi, or English.
>
> ⚡ The audio is processed by our **Gemini Grievance Audio Agent**. It transcribes, translates, categorises — safety, wages, harassment — assigns a priority, and routes it to the responsible officer automatically.
>
> From a voice recording in Hindi, to a categorised, escalated case on the Mine Manager's dashboard — fully automated."

---

## 🏁 SEGMENT 6 — CLOSING
### `[5:10 – 5:30]`

**🖥️ ACTION:** Return to the COMET landing page — full screen.

**🎙️ SCRIPT:**
> "What you just saw is a **fully working prototype** — not a simulation.
>
> COMET unifies statutory compliance, field inspections, CAPA management, contractor onboarding, production reporting, environmental monitoring, worker attendance, grievance handling, and AI-powered risk scoring — into one centralized platform for India's coal mines.
>
> Stack: **React, FastAPI, Google Gemini ADK, Supabase, React Native** — ready to scale across all Coal India subsidiaries.
>
> We are excited to be part of Smart India Hackathon 2026. Thank you."

---

## ⏱️ TIMESTAMP TABLE

| Time | Scene | Route / Action |
|---|---|---|
| 0:00 – 0:30 | Introduction & Hook | Landing page |
| 0:30 – 1:00 | Problem Statement | PPT Slide 1 |
| 1:00 – 1:30 | Solution Overview | PPT Slide 2 |
| 1:30 – 1:42 | Login | `/` sign-in |
| 1:42 – 2:08 | Mine Manager Command Center ⚡ | `/mine-manager` |
| 2:08 – 2:28 | Compliance Tracker ⚡ | `/compliance` |
| 2:28 – 2:48 | Inspections | `/inspection` |
| 2:48 – 3:05 | Violation Detail + CAPA | `/violations/:id` |
| 3:05 – 3:22 | Contractors + OCR ⚡ | `/contractors` → `/ocr` |
| 3:22 – 3:38 | Alerts + Environment | `/alerts` → `/environment` |
| 3:38 – 3:52 | GIS Mine Map ⚡ | `/mine-map` |
| 3:52 – 3:55 | Corporate Dashboard ⚡ | `/corporate-dashboard` |
| 3:55 – 4:07 | Mobile: Login & Home | App home screen |
| 4:07 – 4:27 | Mobile: Offline Inspection | App inspection flow |
| 4:27 – 4:40 | Mobile: CH4 Evacuation Alert ⚡⚡ | App gas reading `1.6%` |
| 4:40 – 4:52 | Mobile: QR Attendance → Web | App → `/attendance` |
| 4:52 – 5:10 | Mobile: Voice Grievance → Web | App → `/grievances` |
| 5:10 – 5:30 | Closing | Landing page |

---

## ✅ ALL WORKING PAGES COVERED

| Page | URL | Segment |
|---|---|---|
| Landing Page | `/` | 1, 4.1, 6 |
| Mine Manager Dashboard | `/mine-manager` | 4.2 |
| Compliance Tracker | `/compliance` | 4.3 |
| Inspections | `/inspection` | 4.4 |
| Violation Detail | `/violations/:id` | 4.5 |
| Contractors | `/contractors` | 4.6 |
| OCR Review | `/ocr` | 4.6 |
| Alerts | `/alerts` | 4.7 |
| Environment | `/environment` | 4.7 |
| GIS Mine Map | `/mine-map` | 4.8 |
| Corporate Dashboard | `/corporate-dashboard` | 4.9 |
| Attendance | `/attendance` | 5.4 |
| Grievances | `/grievances` | 5.5 |
| Mobile: Home | App | 5.1 |
| Mobile: Inspection | App | 5.2 |
| Mobile: Gas Alert | App | 5.3 |
| Mobile: QR Attendance | App | 5.4 |
| Mobile: Voice Grievance | App | 5.5 |

---

## 🎥 RECORDING CHECKLIST

- [ ] Web app at `http://localhost:5173` — demo data seeded
- [ ] Backend `uvicorn` at `http://localhost:8000` — running
- [ ] Screen recorder (OBS / QuickTime) — 1920×1080, mic checked
- [ ] Mobile emulator / device — app installed, logged in as Field Inspector
- [ ] Pre-stage the ventilation inspection so the CH4 input is reachable in under 60 seconds
- [ ] Demo data: 1 mine · 3 inspections · 1 open violation with CAPA · 1 contractor with documents · 1 overdue compliance task (red) · 1 pending grievance
- [ ] All notifications disabled on the recording machine
- [ ] Rehearse spoken transitions at least 3 times — every page must flow into the next without silence

---

## ⚡ WOW MOMENTS — PRACTICE THESE UNTIL SHARP

| # | Moment | Why It Lands |
|---|---|---|
| 1 | Mine Manager dashboard fully loaded | Every widget live simultaneously — judges see a real product, not a mockup |
| 2 | Compliance health dial + calendar | Animated, visual, emotional — colour-coded risk is immediately readable |
| 3 | OCR auto-extracts contractor document | Paper to digital in one action — immediately communicates the paperwork problem solved |
| 4 | GIS mine map — red pin hover | Spatial, visual, dangerous — risk becomes real when you can point at it on a map |
| 5 | CH4 reading → full-screen EVACUATE | Your single highest-impact moment — pause, let it fill the screen, let the judges absorb it |

---

*Script v3.0 — Tarang-style · SIH 2026 — PS 26024 · COMET Platform*
