# 🎬 COMET — Pitch Video Demo Script & Recording Sequence

**Target Duration:** 5:00 minutes  
**Note:** Voice lines have no word limit since audio will be sped up in editing. Past ~1.5x speed, listeners lose the meaning, so captions will carry the rest.

---

## ⏱️ RECORDING SEQUENCE & PAGE MAPPING TABLE

Record each screen separately. For the montage sections, speed up the clicking so you don't wait for loading.

| Seq | Time | Segment | Pages / Routes to Record |
|---|---|---|---|
| **1** | 0:00–0:35 | **Hook** | Landing page `/` → Paper register → Spreadsheet → Old paper inspection form → Timeline animation |
| **2** | 0:35–1:10 | **Solution** | Animated Architecture Slide |
| **3** | 1:10–1:40 | **Mine Manager** | `/compliance` (Health dial, stat cards, Calendar, Kanban) → System-generated task detail → Edit/Reassign dropdown → Notification feed |
| **4** | 1:40–1:50 | **Inspector Web** | Web Inspector Calendar → Task detail preview |
| **5** | 1:50–2:25 | **Mobile Offline** | Mobile App: Task view → Geo-tag/Time-stamp → Checklist → Photo upload → Dust reading (Red Alert) → Methane reading (Full-screen EVACUATE) → Submit |
| **6** | 2:25–2:45 | **The Loop** | Web `/alerts` (Live Alerts card) → Open Violation → Assign corrective action (CAPA) with deadline/officer → Calendar (Follow-up inspection) |
| **7** | 2:45–3:15 | **Environment Officer** | `/environment` → Inspection details (AQI, PM10, noise vs limits) → AI forecast & recommended action → GIS sensor map → Statutory report (Auto-populate → Digital Sign → Submit) |
| **8.1** | 3:15–3:35 | **Mine Manager Montage** | `/mine-manager` → `/alerts` → `/mine-map` → `/compliance` (Allocate) → `/violations` → `/incidents` → `/production` → `/contractors` → `/grievances` → `/ocr` → `/ai-analytics` |
| **8.2** | 3:35–3:50 | **Field Inspector/Worker** | Mobile App: Report Incident → Mine Map → SOS → QR attendance scan<br>Web `/attendance` (Night-shift flag) → Web `/grievances` (Case priority) |
| **8.3** | 3:50–4:00 | **Safety Official** | `/incidents` → Form 4-A → File Incident Report → `/violations` → `/reports` |
| **8.4** | 4:00–4:15 | **Corporate** | `/corporate-dashboard` → Compliance Overview → Production Analytics → AI Risk Intelligence → Environmental Summary → Contractor Trust Map → Emergency Broadcast |
| **8.5** | 4:15–4:23 | **Regulator** | `/regulator` → Read-only verified reports → Tamper-evident verification indicator |
| **8.6** | 4:23–4:33 | **Contractor** | `/contractors` (Profile, expiring medicals, machinery fitness, overdue training, pending CAPAs) → AI Document Extraction → RFID attendance |
| **9** | 4:30–5:00 | **Close** | Feasibility Slide (Methodology/Rollout) → PS Scorecard Slide → Impact Before/After Slide → Landing page `/` |

---

## 🎬 VIDEO SCRIPT

### 0:00–0:35 | Hook: The problem, in detail
**🖥️ Action:** Landing page → three quick cuts: paper register, spreadsheet, old inspection form → a timeline "Field → Manager → Corporate → Regulator" that shows delay at each step.
**📌 Captions:** `300+ mines` · `Paper registers` · `Fragmented systems` · `Delayed reports`
**🎙️ Voiceover:**
> "Coal mining is one of India's most safety-critical industries. Coal India runs mines across many subsidiaries, with thousands of workers and contractors. And yet the governance behind it is still disconnected. Statutory compliance under the Mines Act, CMR 2017 and the Environment Protection Act is tracked in registers and spreadsheets. When an inspector finds a problem underground, it is written on paper. It reaches the mine manager days later. It reaches corporate management weeks later. And by the time it reaches the regulator, the evidence is old, the data is inconsistent, and the same record exists in three places. This causes delayed decisions, missed deadlines, compliance gaps, and in the worst cases, preventable accidents. The problem statement asks for one integrated, AI-enabled governance platform. This is COMET."

### 0:35–1:10 | Solution: What COMET is and how it works
**🖥️ Action:** Architecture slide, animated: Mobile app ↔ Sync ↔ Backend + Regulation library + Rules engine ↔ Web dashboards. AI layer on top. GIS and audit trail alongside.
**📌 Captions:** `Web dashboards · 5 roles` · `Offline mobile app` · `AI layer (Gemini + ADK)` · `Rules + workflow engine` · `GIS` · `OCR` · `Tamper-evident audit trail`
**🎙️ Voiceover:**
> "COMET works in three layers. First, role-based web dashboards, so a Mine Manager, an Environment or Safety Officer, Corporate Management, a Contractor and a Regulator each see only what they need, updated in real time. Second, an offline-first mobile app for inspectors, overmen and workers. It is geo-tagged and time-stamped, and it works deep underground with no network. Third, an AI layer with five agents: risk scoring, anomaly detection, statutory-report drafting, grievance classification from voice in five languages, and document reading through OCR. Underneath is a regulation library that generates compliance tasks, a rules engine that checks every observation, a workflow engine that handles alerts, reminders, approvals and escalations, GIS mapping, and a tamper-evident audit trail. One system, one source of truth. Let me show you a real workflow from start to finish."

### 1:10–1:40 | Mine Manager: System-generated and auto-assigned
**🖥️ Action:** `/compliance` → health dial and stat cards → Calendar and Kanban → open a task tagged "System-generated" → source regulation, due date, "Auto-assigned to [Inspector]" and the reason → Edit / Reassign dropdown → show the notification feed.
**📌 Captions:** `System-generated from regulation library` · `Auto-assigned` · `Manager can edit or reassign` · `Reminder + escalation`
**🎙️ Voiceover:**
> "We start as the Mine Manager on the Compliance page. This is the mine's compliance health, and these are its tasks in calendar and Kanban views. This inspection, an air-quality and dust check at the coal handling plant, was generated by our system from the regulation library, and the system assigned it to the right inspector automatically. The manager can review every generated inspection, edit its details, or reassign it to someone else if needed. The moment the task is assigned, notifications go out: the inspector receives 'New inspection assigned, due Friday'; the manager receives a confirmation; a reminder goes out before the deadline; and if the deadline is missed, the task escalates up the ladder from Mine Manager to Subsidiary Admin to DGMS."

### 1:40–1:50 | Inspector: Web calendar
**🖥️ Action:** Log in as Field Inspector → calendar → the task → checklist preview and location → "Continue on mobile".
**📌 Captions:** `Inspector calendar` · `Synced to mobile`
**🎙️ Voiceover:**
> "Now the Field Inspector's web view. Her assigned inspections appear on her calendar with location, checklist and deadline. She can continue the inspection in the mine on her phone."

### 1:50–2:25 | Mobile: Underground, observations, on-device rules
**🖥️ Action:** Mobile, offline icon → open task → GPS stamp → checklist → observations and photo → dust reading over limit → red alert on device → submit → "saved, will sync". Then 6 seconds: methane over limit → full-screen EVACUATE.
**📌 Captions:** `Offline` · `Geo-tagged + time-stamped` · `Photo evidence` · `Rules checked on device` · `Evacuation alert`
**🎙️ Voiceover:**
> "She enters the mine with no signal, but the task is already on her phone. The app stamps her location and time. She works through the checklist, records observations, attaches photos, and enters a dust reading. The app checks the reading against the regulatory limit right on the device. It is over the limit, so a violation is flagged instantly, with no network needed. The same rules engine watches gas: a methane reading above the safe limit fires a full-screen evacuation alert, even offline. She submits, and everything syncs as soon as she is back in range."

### 2:25–2:45 | The loop: Notifications to everyone
**🖥️ Action:** Web: Live Alerts card → Mine Manager opens violation (evidence, location, severity) → assigns corrective action, deadline, officer → proof required to close → calendar shows follow-up inspection.
**📌 Captions:** `Violation auto-created` · `Digital approval` · `Audit trail` · `Follow-up inspection`
**🎙️ Voiceover:**
> "On sync, everyone who needs to know is notified together: the Mine Manager, the Environment Officer, and the responsible contractor. The violation is already created, with photo, location and time. The manager assigns a corrective action with a deadline and an owner. It cannot be closed without proof, and closing it updates the risk score. A follow-up inspection is then scheduled to verify the fix. The loop continues until the issue is truly closed, and every step is recorded."

### 2:45–3:15 | Environment Officer: Dashboard and AI analytics
**🖥️ Action:** `/environment` → the inspection details → AQI, PM10, noise trends against limits → AI forecast and recommended action → sensor map → Statutory report: Auto-populate → Digital Sign → Submit.
**📌 Captions:** `AI analytics` · `Forecast + recommended action` · `GIS sensor map` · `Auto-populated report` · `Digital signature`
**🎙️ Voiceover:**
> "The Environment Officer sees the same inspection on his own dashboard, with photos and readings, alongside sensor trends for air quality, PM10 and noise against regulatory limits. Here the AI analyses the trend, detects anomalies, forecasts whether levels will stay high, and recommends an action. AI advises; the officer decides. The map shows exactly where the readings come from. And when it is time to report, the statutory report is auto-populated from the same data, digitally signed and submitted. No re-typing."

### 3:15–4:30 | Fast Montage (Role by Role)
*(Each screen 3 to 5 seconds. Keep the caption in the same corner.)*

#### Mine Manager, remaining tabs (~20s)
**🖥️ Action:** Mine Dashboard → Live Alerts → GIS Risk Map → Inspections (create and allocate) → Violations & CAPAs → Incidents → Production & Dispatch → Contractor Management → Grievances → OCR → AI Analytics.
**📌 Captions:** `Compliance score` · `Risk map` · `Allocate inspections` · `Production + dispatch` · `Compliance radar + AI assistant`
**🎙️ Voiceover:**
> "The Mine Manager's command center brings it all together: live compliance score, alerts, risk map, inspection allocation, violations and corrective actions, incidents, production and dispatch, contractor performance, worker grievances, and OCR digitization of legacy records. AI Analytics adds aggregated risk, a compliance radar, recurring-failure detection, and an assistant that answers questions from safety, environment, incident and production data."

#### Field Inspector and Worker (~15s)
**🖥️ Action:** Mobile: Report Incident → Mine Map → Alerts and SOS → QR attendance → web `/attendance` night-shift flag → worker Observation → voice grievance in Hindi → web case with category and priority.
**📌 Captions:** `Incident report` · `SOS` · `QR attendance, geo-fenced` · `Night-shift limit flag` · `Voice grievance, 5 languages`
**🎙️ Voiceover:**
> "In the field, an inspector can report an incident like a roof fall in seconds, use the mine map, and press SOS in an emergency. Workers scan a QR badge for geo-fenced attendance, and the system flags night-shift limits under the Mines Act. Workers can submit observations and speak a grievance in Hindi, Bengali, Odia, Marathi or English. The AI transcribes it, sorts it, sets priority and routes it to the right officer."

#### Safety Official (~10s)
**🖥️ Action:** Incidents → Form 4-A → File Incident Report → Violations & CAPAs → Statutory Reports.
**📌 Captions:** `Incident investigation` · `Form 4-A` · `Statutory reports`
**🎙️ Voiceover:**
> "The Safety Official investigates incidents, files statutory forms such as Form 4-A, tracks corrective actions, and signs and submits reports."

#### Corporate Management (~15s)
**🖥️ Action:** National Dashboard → Compliance Overview → Production Analytics → AI Risk Intelligence → Environmental Summary → Contractor Trust Map → Emergency Broadcast.
**📌 Captions:** `All mines, one view` · `AI risk ranking` · `Contractor trust map` · `Emergency broadcast`
**🎙️ Voiceover:**
> "Corporate management sees every mine and subsidiary: compliance comparison, production analytics, an AI ranking of the highest-risk sites and why, environmental performance, contractor trust scores, and an emergency broadcast to all units."

#### Regulator (~8s)
**🖥️ Action:** Regulator login → read-only verified reports → verification / tamper-evident indicator.
**📌 Captions:** `Read-only access` · `Verified reports` · `Tamper-evident audit trail`
**🎙️ Voiceover:**
> "Regulators get read-only access to verified statutory reports, with a tamper-evident audit trail, so trust does not depend on phone calls."

#### Contractor (~10s)
**🖥️ Action:** Contractor profile → expiring medicals, machinery fitness, overdue training, pending CAPAs → AI Document Extraction → RFID attendance.
**📌 Captions:** `Expiry tracking` · `Pending corrective actions` · `AI document extraction`
**🎙️ Voiceover:**
> "Contractors see their own obligations: expiring medicals, machinery fitness, overdue training and corrective actions assigned to them, and upload documents that AI reads and verifies. Low-confidence reads go to a human review queue."

### 4:30–5:00 | Feasibility, Scorecard, Impact, Close
**🖥️ Action:** Slide: methodology + rollout (10s) → PS scorecard with ticks (12s) → before/after impact (8s) → landing page.
**🎙️ Voiceover:**
> "Is this feasible? It is built and running today on React, FastAPI, Supabase, React Native and Gemini. It works offline, uses the same design for every mine, and adding a mine is configuration, not a rebuild. We propose a phased rollout: one pilot mine, one subsidiary, then all of Coal India, on existing phones and without new hardware. Against the problem statement, COMET covers compliance across safety, environment, production and labour, live inspections and corrective actions, AI risk detection, geo-tagged offline reporting, dashboards for mine, corporate and regulator, automated alerts and escalations, GIS, OCR, and a secure audit trail. It cuts reporting delays from days to minutes, removes paperwork, and gives early warnings that protect workers. COMET is an indigenous, paperless governance platform, built for Indian coal mines. Thank you."

---

## 🔔 EXTRA NOTIFICATIONS TO SHOW IN MONTAGE

Use only those your app actually sends.

| Type | To | Example |
|---|---|---|
| **SOS** | Manager, Safety Official | "SOS raised by [Inspector], [location], [time]." |
| **Contractor expiry** | Contractor, Mine Manager | "[Contractor] licence expires in [N] days." |
| **Overdue CAPA** | Responsible officer, then Manager | "Corrective action overdue: [title]." |
| **Night-shift limit** | Mine Manager | "[Worker] exceeded the consecutive night-shift limit." |
| **Grievance routed** | Responsible officer | "New [category] grievance, priority [level]." |
| **Emergency broadcast** | All units | "[Message from Corporate]." |
| **Report submitted** | Manager, Regulator | "Statutory report submitted and signed." |

---

## ⚠️ BEFORE YOU RECORD

- **Show only what is built.** If recurring-failure detection, anomaly detection, the AI forecast or the follow-up inspection are not live, delete that caption and voice line, or say "next phase."
- **Use the right limits** (PM10 under SPCB/CPCB, methane under CMR) and name the source on screen.
- **Speed up the clicking** so you don't wait for loading.
- **Timing:** If the total goes over 5:00, trim the montage voiceover, not the workflow. The captions keep the coverage.
