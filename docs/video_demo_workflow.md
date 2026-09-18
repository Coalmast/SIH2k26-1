# 🎬 COMET — SIH 2026 | Video Demo Workflow & Recording Script

**Platform:** Coal Operations Monitoring, Enforcement & Transparency (COMET)  
**Problem Statement:** SIH 2026 — PS 26024 | Coal India Limited | Ministry of Coal  
**Video Target Duration:** 5–6 minutes  
**Format:** Screen-recorded demo with voiceover narration

---

> **How to use this document**  
> Each section has a **[TIMESTAMP]**, **🎙️ SCRIPT** (what to say), and **🖥️ ACTION** (what to show on screen).  
> Record the web dashboard and mobile app side-by-side where marked.  
> Aim for a natural, energetic delivery — not a reading. Keep the pace brisk.

---

## 🎬 SEGMENT 1 — HOOK & INTRODUCTION
### `[0:00 – 0:30]`

**🖥️ ACTION:**  
Show the COMET landing page (`http://localhost:5173/`) — full screen, animated hero section.

**🎙️ SCRIPT:**  
> "Hello and greetings from our team. We are presenting **COMET** — Coal Operations Monitoring, Enforcement and Transparency — our solution to **Problem Statement 26024**, issued by the Ministry of Coal under Coal India Limited.  
>
> India's coal sector employs over half a million workers across hundreds of mines. But today, governance runs on **manual registers, fragmented spreadsheets, and delayed paper trails** — creating compliance blind spots, unsafe field conditions, and slow decision-making at every level.  
>
> COMET changes that. Let us show you how."

---

## 📊 SEGMENT 2 — THE PROBLEM (Slide 1 Reference)
### `[0:30 – 1:10]`

**🖥️ ACTION:**  
Switch to PPT — **Slide 1: Problem Statement**.  
Animate bullet points one by one as you speak.

**🎙️ SCRIPT:**  
> "The problem has five dimensions:  
>
> **One** — Compliance tracking is manual. Safety and environmental regulations under the Mines Act, CMR 2017, and EP Act are logged on paper, leading to missed deadlines and compliance gaps.  
>
> **Two** — Field inspections have no digital trail. Violations, observations, and corrective actions are tracked in registers — no real-time visibility for management.  
>
> **Three** — Contractor management is fragmented. Document expiries, worker safety records, and compliance trust scores have no central system.  
>
> **Four** — Statutory reports take days to compile. DGMS, SPCB, and Labour Department submissions are error-prone and delayed.  
>
> **Five** — There is no AI layer. Recurring safety failures, production anomalies, and environmental breaches go undetected until something goes wrong.  
>
> This is the governance gap COMET closes."

---

## 💡 SEGMENT 3 — OUR SOLUTION (Slide 2 Reference)
### `[1:10 – 1:50]`

**🖥️ ACTION:**  
Switch to PPT — **Slide 2: Solution Architecture Diagram**.  
Point to each layer as you name it.

**🎙️ SCRIPT:**  
> "COMET is a **centralized, AI-enabled governance platform** built on three pillars:  
>
> **Pillar 1 — The Web Dashboard.** Role-based portals for Mine Managers, Corporate Management, and Regulatory Authorities — with real-time data via Supabase Realtime.  
>
> **Pillar 2 — The Mobile Field App.** An offline-capable React Native app for field inspectors, overmen, and field officers — with GPS geo-tagging, QR attendance, and gas reading alerts that fire even without a network connection.  
>
> **Pillar 3 — The AI Layer.** Google Gemini and ADK power four intelligent agents: a Risk Scoring Agent, an Anomaly Detection Agent, a Report Drafting Agent, and a Multilingual Worker Chatbot — covering Hindi, Bengali, Odia, Marathi, and English.  
>
> Now let us walk you through the working prototype — end to end."

---

## 🖥️ SEGMENT 4 — WEB DASHBOARD WALKTHROUGH
### `[1:50 – 4:00]`

---

### 4.1 — Login & Landing Page
#### `[1:50 – 2:05]`

**🖥️ ACTION:**  
Open `http://localhost:5173/` — show the landing page. Click **Login as Mine Manager**.

**🎙️ SCRIPT:**  
> "This is our landing page. COMET supports multiple user roles — Mine Manager, Field Officer, Corporate Executive, Contractor Manager, and Regulator. Let us start as a Mine Manager."

---

### 4.2 — Mine Manager Dashboard
#### `[2:05 – 2:25]`

**🖥️ ACTION:**  
Navigate to `/mine-manager` — show the Mine Manager overview dashboard.  
Highlight: compliance summary cards, overdue compliance count, violation count, alerts panel.

**🎙️ SCRIPT:**  
> "This is the Mine Manager dashboard. At a glance — compliance health, active violations, pending corrective actions, and real-time alerts from the field. Everything a Mine Manager needs, updated live."

---

### 4.3 — Compliance Calendar
#### `[2:25 – 2:45]`

**🖥️ ACTION:**  
Click into the **Compliance Calendar** (`/compliance`).  
Show monthly calendar view — highlight an overdue task in red, a submitted task in amber.

**🎙️ SCRIPT:**  
> "The Compliance Calendar auto-generates tasks from the regulation library — Mines Act, CMR 2017, EP Act, CLRA. Every due date is tracked. Overdue tasks escalate automatically through a multi-level ladder — from Mine Manager to Subsidiary Admin to DGMS — so nothing slips through."

---

### 4.4 — Inspection & CAPA Module
#### `[2:45 – 3:05]`

**🖥️ ACTION:**  
Navigate to `/inspection` — show the list of recent inspections.  
Click into one inspection — show the **violation detail** and **CAPA assignment panel**.

**🎙️ SCRIPT:**  
> "Every inspection submitted from the mobile app lands here. We can see violations, their severity, the geo-stamp from the field, and the assigned Corrective Action — with a deadline and evidence trail. CAPA closure updates the mine risk score in real time."

---

### 4.5 — OCR Document Review
#### `[3:05 – 3:20]`

**🖥️ ACTION:**  
Navigate to `/ocr` — show the OCR review queue.  
Demonstrate uploading a sample contractor document — watch the OCR extracted fields populate.

**🎙️ SCRIPT:**  
> "Our OCR pipeline digitizes legacy documents — contractor licenses, safety certificates, CLRA registrations. The system auto-extracts fields like license number, validity date, and issuing authority. Documents with confidence below 85% come here for human review — a side-by-side panel with the source image."

---

### 4.6 — GIS Mine Map
#### `[3:20 – 3:38]`

**🖥️ ACTION:**  
Navigate to `/mine-map` — show the interactive MapLibre map.  
Pan and zoom into mine boundaries — highlight incident overlays and risk heatmap coloring.

**🎙️ SCRIPT:**  
> "Every inspection, incident, and environmental reading is geo-tagged. This is our live mine map — powered by MapLibre and PostGIS. Mines are colour-coded by AI risk score. Click any pin to drill down into that site's compliance status, violations, and field activity."

---

### 4.7 — Corporate / Regulator Dashboard
#### `[3:38 – 4:00]`

**🖥️ ACTION:**  
Navigate to `/corporate-dashboard` — show the multi-mine risk ranking table, AI insight panel, and production vs target charts.

**🎙️ SCRIPT:**  
> "Corporate leadership sees across all mines simultaneously. The AI Risk Scoring Agent — powered by Gemini — continuously evaluates each mine using violations, CAPA closure rates, environmental breaches, production pressure, and incident history. High-risk mines surface automatically. Regulators get read-only access to verified statutory reports — complete with SHA-256 integrity hashing for tamper-evidence."

---

## 📱 SEGMENT 5 — MOBILE APP WALKTHROUGH
### `[4:00 – 5:20]`

> **Recording note:** Switch to a screen recording of the Android emulator or physical device running the app.

---

### 5.1 — App Login & Home Screen
#### `[4:00 – 4:12]`

**🖥️ ACTION:**  
Show app launching — login screen → log in as Field Inspector.  
Home screen: pending tasks count, offline banner (if no network), quick action buttons.

**🎙️ SCRIPT:**  
> "This is the COMET mobile field app — built with React Native and Expo. It works offline. A field inspector can log in and see their pending inspection tasks, current shift, and any active alerts — even without a network connection."

---

### 5.2 — Starting an Inspection (Offline Flow)
#### `[4:12 – 4:35]`

**🖥️ ACTION:**  
Tap **Start Inspection** → Select inspection type (DGMS Annual) → Select checklist template → GPS auto-captures geo-stamp.  
Walk through 2–3 checklist items — mark one **Non-Compliant** → fill severity: **HIGH** → add description → take a photo.

**🎙️ SCRIPT:**  
> "Starting an inspection is instant. The GPS geo-stamps the location. We select the inspection type — DGMS Annual — and the checklist auto-loads from our regulation library.  
>
> For each checkpoint: tick OK, or flag Non-Compliant. We mark this ventilation checkpoint as High severity — type a description — and attach a photo. Everything saves to the device instantly. No network needed."

---

### 5.3 — Gas Reading Alert
#### `[4:35 – 4:48]`

**🖥️ ACTION:**  
In the Ventilation section — enter a CH4 reading of `1.6%`.  
Show the **EVACUATE full-screen red modal** firing immediately.

**🎙️ SCRIPT:**  
> "Watch what happens when we enter a methane reading above 1.5 percent. An evacuation alert fires **immediately** on the device — a full-screen siren modal that bypasses silent mode. This is device-local — it works offline. The alert syncs to the Mine Manager's dashboard the moment connectivity is restored."

---

### 5.4 — QR Attendance Capture
#### `[4:48 – 5:00]`

**🖥️ ACTION:**  
Switch to **Attendance tab** — show QR scanner activating → scan a worker badge QR code → worker name and shift populate instantly.

**🎙️ SCRIPT:**  
> "Attendance is captured with a QR scan of the worker's badge — geo-fenced to the mine boundary. Each entry is time-stamped and synced to the server, where automated checks verify working hour limits and consecutive night shift restrictions under the Mines Act."

---

### 5.5 — Multilingual Worker Grievance
#### `[5:00 – 5:15]`

**🖥️ ACTION:**  
Switch to the **Grievances tab** → tap **Record Voice Grievance** → record a short audio clip in Hindi → submit.  
Show the pending sync indicator and then the categorized grievance appearing in the web dashboard.

**🎙️ SCRIPT:**  
> "Any worker can file a grievance by voice — in Hindi, Bengali, Odia, Marathi, or English. The audio is queued offline and processed by our Gemini GrievanceAudio Agent on the next sync. The agent transcribes, translates, categorizes the grievance — safety, wages, harassment — assigns a priority, and routes it to the right officer automatically."

---

## 🏁 SEGMENT 6 — CLOSING
### `[5:15 – 5:45]`

**🖥️ ACTION:**  
Return to the COMET landing page — full screen. Optionally show the system architecture diagram slide.

**🎙️ SCRIPT:**  
> "What you just saw is a **fully working prototype** — not a simulation.  
>
> COMET unifies statutory compliance, field inspections, contractor management, production reporting, environmental monitoring, worker attendance, grievance handling, and regulatory reporting — into a single, AI-powered governance platform for India's coal mines.  
>
> Our stack: **React and FastAPI** on the web, **React Native with Expo** on mobile, **Google Gemini and ADK** for AI, **Supabase** for real-time data and offline sync, and **Tesseract OCR** for document digitization.  
>
> We are ready to scale this across all CIL subsidiaries.  
>
> Thank you — we look forward to Smart India Hackathon 2026."

---

## ⏱️ TIMESTAMP SUMMARY

| Segment | Content | Time |
|---|---|---|
| 1 | Hook & Introduction — Landing page | 0:00 – 0:30 |
| 2 | Problem Statement — PPT Slide 1 | 0:30 – 1:10 |
| 3 | Solution Overview — PPT Slide 2 | 1:10 – 1:50 |
| 4.1 | Web: Login & Landing | 1:50 – 2:05 |
| 4.2 | Web: Mine Manager Dashboard | 2:05 – 2:25 |
| 4.3 | Web: Compliance Calendar | 2:25 – 2:45 |
| 4.4 | Web: Inspection & CAPA | 2:45 – 3:05 |
| 4.5 | Web: OCR Document Review | 3:05 – 3:20 |
| 4.6 | Web: GIS Mine Map | 3:20 – 3:38 |
| 4.7 | Web: Corporate / Regulator View | 3:38 – 4:00 |
| 5.1 | Mobile: Login & Home | 4:00 – 4:12 |
| 5.2 | Mobile: Offline Inspection with Violation | 4:12 – 4:35 |
| 5.3 | Mobile: CH4 Gas Reading Evacuation Alert | 4:35 – 4:48 |
| 5.4 | Mobile: QR Attendance Capture | 4:48 – 5:00 |
| 5.5 | Mobile: Multilingual Voice Grievance | 5:00 – 5:15 |
| 6 | Closing & Stack Summary | 5:15 – 5:45 |

---

## 🎥 RECORDING CHECKLIST

- [ ] Web app running at `http://localhost:5173/` with seeded demo data
- [ ] Backend (`uvicorn`) running at `http://localhost:8000`
- [ ] Supabase running (`npx supabase start` inside `/backend`)
- [ ] Mobile app running on emulator or physical Android device
- [ ] Screen recording software active (OBS / QuickTime) — capture at 1920×1080
- [ ] Microphone checked — narrate clearly, no background noise
- [ ] Disable notifications on recording machine
- [ ] Demo data seeded (`python seed_demo.py`) — at least 1 mine, 3 inspections, 1 violation with CAPA, 1 contractor with documents, 1 grievance
- [ ] Gas reading demo: pre-stage a ventilation checklist section to reach it quickly

---

## 📋 KEY DIFFERENTIATORS TO HIGHLIGHT ON SCREEN

| Differentiator | Where to Show |
|---|---|
| Offline-first mobile field capture | `[5.2]` — inspection without network; OfflineBanner visible |
| Gas evacuation siren (CH4 > 1.5%) | `[5.3]` — full-screen modal fires immediately |
| AI Risk Score (Gemini ADK) | `[4.7]` — Corporate dashboard mine risk ranking |
| Realtime dashboard sync | `[4.4]` — CAPA assigned on mobile; web updates live |
| Multilingual AI grievance | `[5.5]` — Hindi voice → English category on web |
| OCR with confidence threshold | `[4.5]` — auto-filled fields vs human review queue |
| GIS mine boundary + incident overlay | `[4.6]` — mine map with coloured risk pins |

---

*Script Version 1.0 | SIH 2026 — PS 26024 | COMET Platform*
