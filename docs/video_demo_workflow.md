# 🎬 COMET — SIH 2026 | Pitch Video Demo Script & Web App Route Mapping

**Platform:** Coal Operations Monitoring, Enforcement & Transparency (COMET)  
**Problem Statement:** SIH 2026 — PS 26024 | Coal India Limited | Ministry of Coal  
**Target Duration:** 4 minutes 40 seconds (~700 spoken words)  
**Pitch Style:** High-impact pitch demo · Fast pace · Role-by-role story loop · Screen-by-screen route mapping  

---

> **How to use this document**  
> — This guide maps every single section of the **700-word Final Pitch Script** to structured **Page Routes Tables**.  
> — Each table lists the sequence order, screen name, exact frontend URL route, on-screen caption overlay, and visual highlight.  
> — Use the tables during screen recording on `http://localhost:5173` to maintain rapid pacing and zero dead air.

---

## ⏱️ MASTER TIMELINE & ROLE WORKFLOW SUMMARY

| Time | Segment / Role | On-Screen Visual (🖥️) | Key Route / Target | On-Screen Captions / Highlights |
|---|---|---|---|---|
| **0:00 – 0:20** | **Hook** | COMET Landing Page | `/` | *Real-Time Coal Mine Governance Platform* |
| **0:20 – 0:40** | **Problem & Solution** | PPT Slide: 3 Gaps & 3 Layers | Presentation Slide | *3 Gaps: Paper records, No warning, Manual reports* |
| **0:40 – 1:25** | **Field Inspector (Mobile)** | Mobile App: Inspection & Gas Evacuation | App / `/mobile-inspection` | *Geo-tagged · Works offline · Safety observations · Incident reporting · QR attendance* |
| **1:25 – 2:20** | **Mine Manager (Web Blitz)** | 14 Web Screens @ ~4s each | `/mine-manager` & modules | *14 Captions (Single source of truth → AI Analytics)* |
| **2:20 – 2:45** | **Safety Official** | Alerts → Incident → Env Forecast → Sign Report | `/alerts`, `/incidents`, `/environment`, `/reports` | *Safety Desk · AI Air Quality Forecast · Digital Sign-off* |
| **2:45 – 3:15** | **Corporate & Regulator** | HQ Dashboard & Regulator Portal | `/corporate-dashboard`, `/regulator` | *National Dashboard · AI Risk Ranking · Regulator Audit Trail* |
| **3:15 – 3:35** | **Contractor & Worker** | Contractor Profile & Voice Grievance | `/contractors`, `/ocr`, `/grievances` | *Contractor Obligations · Multilingual Voice Grievances* |
| **3:35 – 4:05** | **Feasibility & Methodology** | Slide: Tech Architecture & Phased Rollout | Slide / `comet-architecture.html` | *React + FastAPI + Supabase + React Native + Gemini* |
| **4:05 – 4:40** | **Scorecard & Close** | Scorecard Slide → Impact → Landing Page | Slide → `/` | *PS 26024 Compliance Scorecard · Days to Minutes* |

---

## 🎬 SEGMENT-BY-SEGMENT DETAILED SCRIPT & PAGE ROUTES TABLES

---

### 0:00 – 0:20 | Segment 1 — Hook 🖥️ Landing Page

#### 📍 Page Routes Table
| # | Screen Name | Exact Frontend Route | On-Screen Caption Overlay | Visual Focus / Element to Highlight |
|---|---|---|---|---|
| **1** | **Landing Page** | `/` | `Real-Time Coal Mine Governance Platform` | Hero banner animation, key feature badges & role login CTA |

**🎙️ SCRIPT:**
> *"In a coal mine, one missed check can cost lives. Today, compliance lives in paper registers and spreadsheets, and a problem found underground takes days to reach the manager and weeks to reach the regulator. COMET closes that gap."*

---

### 0:20 – 0:40 | Segment 2 — Problem & Solution 🖥️ Slide Deck

#### 📍 Page Routes / Slide Table
| # | Screen Name | Target / Source Path | On-Screen Caption Overlay | Visual Focus / Element to Highlight |
|---|---|---|---|---|
| **1** | **3 Gaps & 3 Solution Layers** | Presentation Slide | `3 Gaps · 3 Solution Layers` | Animate: Paper records → Mobile App; No warning → AI Gemini; Manual reporting → Web Platform |

**🎙️ SCRIPT:**
> *"The gaps are no digital field record, no early warning, and manual reporting. COMET answers with a role-based web platform, an offline mobile app, and an AI layer on Google Gemini. Let me show you the loop, role by role."*

---

### 0:40 – 1:25 | Segment 3 — Field Inspector (Mobile) 📱 Mobile App Loop

#### 📍 Mobile Screen Routes Table
| # | Screen Name | Exact Path / Trigger | On-Screen Caption Overlay | Visual Focus / Element to Highlight |
|---|---|---|---|---|
| **1** | **Mobile Inspection Start** | Mobile App / `/mobile-inspection` | `Geo-tagged + time-stamped` | Auto GPS location & timestamp stamp |
| **2** | **Safety Observation** | Mobile Checklist Screen | `Safety observations` | Complete checklist & attach photo |
| **3** | **Incident Reporting** | Mobile Incident Form | `Incident reporting` | Quick-file roof fall observation |
| **4** | **QR Attendance** | Mobile QR Scanner | `QR attendance` | Scan worker badge for attendance |
| **5** | **Gas Reading Alert** | Mobile CH4 Input `1.6%` | `Works offline · EVACUATE` | **⚡ FULL-SCREEN RED EVACUATE ALERT FIRES INSTANTLY** |

**🎙️ SCRIPT:**
> *"It starts underground, with no network. The inspector runs a geo-tagged, time-stamped inspection, records observations with photos, and files incidents like a roof fall in seconds. Attendance is a QR scan. If a methane reading crosses the limit of 1.5 percent under CMR 2017, a full-screen evacuation alert fires instantly, even offline. Everything syncs when the network returns."*

---

### 1:25 – 2:20 | Segment 4 — Mine Manager (Web) 🖥️ 14-Screen Rapid Web Blitz

#### 📍 14-Screen Page Routes Table
| # | Screen Name | Exact Frontend Route | On-Screen Caption Overlay | Visual Focus / Element to Highlight |
|---|---|---|---|---|
| **1** | **Mine Dashboard** | `/mine-manager` | `Single source of truth` | Executive KPI cards, Live Risk Gauge & Shift Summary |
| **2** | **Live Alerts** | `/alerts` | `Real-time alerts` | High-priority Methane Evacuation & Threshold alerts |
| **3** | **GIS Risk Map** | `/mine-map` | `GIS risk map` | Interactive map pins, risk heatmap overlay & mine status |
| **4** | **Compliance Tasks** | `/compliance` | `Auto-generated from Mines Act / CMR 2017` | Health score dial, auto-generated task calendar & Kanban |
| **5** | **Inspections** | `/inspection` | `Schedule + track` | Inspection tracker, filter dropdowns & mobile sync items |
| **6** | **Violations & CAPAs** | `/violations/VIO-2026-001` *(or `/corrective-actions`)* | `Digital approvals · Escalation` | Violation detail card, CAPA deadline & evidence upload |
| **7** | **Incidents** | `/incidents` | `Investigation status` | Roof-fall incident report, severity flag & workflow status |
| **8** | **Production** | `/production` | `Production reporting` | Tonnage chart, coal seam output & shift compliance |
| **9** | **Environment** | `/environment` | `SPCB thresholds` | CAAQMS sensor readings, PM10 / SO2 limits & alerts |
| **10** | **Contractors** | `/contractors` | `Licences · Training · Fitness` | Contractor safety scorecards, medical & licence status |
| **11** | **Grievances** | `/grievances` | `Text + voice, 5 languages` | Grievance queue, audio player & multilinguality tags |
| **12** | **Statutory Reports** | `/reports` | `Auto-populated · Digitally signed` | Form IV / DGMS monthly report generator & digital signature |
| **13** | **OCR** | `/ocr` | `Paper → digital` | Document drag-drop, OCR confidence score & field extraction |
| **14** | **AI Analytics** | `/ai-analytics` | `Risk · Recurring failures · Anomalies` | Gemini risk scoring engine, pattern detection & anomaly alerts |

**🎙️ SCRIPT:**
> *"The data arrives on the Mine Manager's dashboard live, one source of truth for safety, environment, production and labour compliance. Alerts appear as they happen. The GIS map shows risk by site. Compliance tasks are generated automatically from the regulations, with reminders before deadlines and escalation after them. Each violation gets a corrective action that needs digital approval and proof to close. Production, environment, contractors and grievances are all tracked here, and reports fill themselves in. OCR digitizes old records and contractor documents, with a human check for low-confidence reads. The AI layer scores risk, explains why, and flags recurring violations and unusual readings."*

---

### 2:20 – 2:45 | Segment 5 — Safety Official 🛡️ Desk Workflow

#### 📍 Page Routes Table
| # | Screen Name | Exact Frontend Route | On-Screen Caption Overlay | Visual Focus / Element to Highlight |
|---|---|---|---|---|
| **1** | **Alerts Feed** | `/alerts` | `Real-time alerts` | Roof-fall emergency alert badge & notification item |
| **2** | **Roof-Fall Incident** | `/incidents/INC-2026-001` *(or `/incidents`)* | `Investigation status` | Investigation detail, photos, severity tag & action plan |
| **3** | **Environment & AI Forecast** | `/environment` | `AI Air Quality Forecast` | Gas sensor chart, particulate trends & Gemini forecast overlay |
| **4** | **Statutory Report Sign-off** | `/reports` | `Digitally signed & submitted` | DGMS Form IV statutory filing, digital sign & submit button |

**🎙️ SCRIPT:**
> *"The Safety Official receives the roof-fall incident, investigates it, watches air quality with an AI forecast, and signs and submits the statutory report from the same system."*

---

### 2:45 – 3:15 | Segment 6 — Corporate & Regulator 🏢 Executive & Regulatory Governance

#### 📍 Page Routes Table
| # | Screen Name | Exact Frontend Route | On-Screen Caption Overlay | Visual Focus / Element to Highlight |
|---|---|---|---|---|
| **1** | **National Dashboard** | `/corporate-dashboard` | `National dashboard` | Subsidiary overview, DeckGL map layer & CIL KPI metrics |
| **2** | **Compliance Overview** | `/compliance` | `Compliance overview` | Multi-subsidiary compliance score ranking & health dial |
| **3** | **Production Analytics** | `/production` | `Production analytics` | Seam-wise output, target vs actual & tonnage charts |
| **4** | **AI Risk Intelligence** | `/ai-analytics` | `AI Risk Intelligence` | Gemini anomaly detection, risk heat matrix & recurring alerts |
| **5** | **Environmental Summary** | `/environment` | `Environmental summary` | Subsidiary-wide CAAQMS emissions summary & SPCB compliance |
| **6** | **Contractor Trust Map** | `/contractors` | `Contractor Trust Map` | Contractor compliance scoring, licence validity & risk tier |
| **7** | **Emergency Broadcast** | `/alerts` | `Emergency broadcast` | Multi-site panic broadcast modal / alert dispatch banner |
| **8** | **Regulator Read-Only View** | `/regulator` | `Regulator read-only view` | DGMS/SPCB audit portal, SHA-256 tamper-evident report logs |

**🎙️ SCRIPT:**
> *"Headquarters sees every mine and subsidiary on one screen: compliance comparison, production trends, AI risk ranking, environmental performance, contractor trust, and an emergency broadcast to every site. Regulators get read-only access to verified reports, with tamper-evident records."*

---

### 3:15 – 3:35 | Segment 7 — Contractor & Worker 🤝 Workforce & Grievances

#### 📍 Page Routes Table
| # | Screen Name | Exact Frontend Route | On-Screen Caption Overlay | Visual Focus / Element to Highlight |
|---|---|---|---|---|
| **1** | **Contractor Profile** | `/contractors` *(or `/contractors/:id`)* | `Contractor profile` | Expiring medicals badge, machinery fitness & pending actions |
| **2** | **AI Document Extraction** | `/ocr` | `AI document extraction` | OCR scan upload, auto-parsed fields & confidence scoring |
| **3** | **Worker Observation** | `/worker` *(or Mobile App)* | `Worker observation` | Field safety hazard reporting form & photo upload |
| **4** | **Voice Grievance** | `/grievances` *(or Mobile App)* | `Voice grievance` | Multilingual audio player, Gemini transcript & auto-category |

**🎙️ SCRIPT:**
> *"Contractors see their own obligations: expiring medicals, machinery fitness, training, and pending actions. Workers submit observations and speak grievances in their own language."*

---

### 3:35 – 4:05 | Segment 8 — Feasibility & Methodology ⚙️ Architecture & Phased Rollout

#### 📍 Page Routes / Slide Table
| # | Screen Name | Target / Source Path | On-Screen Caption Overlay | Visual Focus / Element to Highlight |
|---|---|---|---|---|
| **1** | **System Architecture** | Presentation Slide / `docs/comet-architecture.html` | `Architecture slide` | React, FastAPI, Supabase, React Native, Gemini ADK engine |
| **2** | **Phased Rollout Methodology** | Presentation Slide / `docs/comet-methodology.html` | `Configuration, not rebuild · Phased rollout` | Phase 1 Pilot Mine → Phase 2 Subsidiary → Phase 3 CIL Rollout |

**🎙️ SCRIPT:**
> *"COMET is built and running today on React, FastAPI, Supabase, React Native and Gemini. It is offline-first, and every mine uses the same design, so adding a mine is configuration, not a rebuild. AI suggests and humans approve. We propose a phased rollout: one pilot mine, one subsidiary, then all."*

---

### 4:05 – 4:40 | Segment 9 — Scorecard & Close 🏁 Impact & Final Vision

#### 📍 Page Routes / Slide Table
| # | Screen Name | Target / Source Path | On-Screen Caption Overlay | Visual Focus / Element to Highlight |
|---|---|---|---|---|
| **1** | **PS 26024 Compliance Scorecard** | Presentation Slide | `Scorecard slide with ticks` | 9/9 Problem statement criteria ticked green with verification |
| **2** | **Before vs After Impact** | Presentation Slide | `Before/after impact` | Digital transformation metric: 7-day paper delay reduced to 3 mins |
| **3** | **COMET Landing Page** | `/` | `Landing page` | Hero landing page closing shot with full platform branding |

**🎙️ SCRIPT:**
> *"As the problem statement asked: compliance across safety, environment, production and labour; live inspections and corrective actions; AI risk detection; geo-tagged offline mobile reporting; dashboards for mine, corporate and regulator; alerts and escalations; OCR; and an audit trail. Violation reporting drops from days to minutes. COMET is an indigenous, paperless governance platform, ready to scale across Coal India."*

---

## 🗺️ MASTER WEB APP ROUTE REFERENCE MATRIX

| Feature / Screen | Exact URL Path | Role Access | Key Demo Trigger / Action |
|---|---|---|---|
| **Landing Page** | `/` | Public | Hero banner, features, sign-in entry |
| **Mine Manager Dashboard** | `/mine-manager` | Mine Manager | Command center, AI risk score, live KPIs |
| **Live Alerts** | `/alerts` | All Roles | Methane evacuation alert, emergency broadcast |
| **GIS Mine Map** | `/mine-map` | All Roles | MapLibre pin hover, risk color coding |
| **Compliance Tracker** | `/compliance` | Mine Manager / Corp | Health dial, Mines Act / CMR task calendar |
| **Inspections List** | `/inspection` | Inspector / Manager | Mobile sync list, schedule dialog |
| **Inspection Detail** | `/inspection/:id` | Inspector / Manager | Checklist items, photos, geo-stamp |
| **Violations & CAPA** | `/violations/:id` *(or `/corrective-actions`)* | Manager / Safety | Severity badge, CAPA assignment & evidence |
| **Incidents Management** | `/incidents` | Safety / Manager | Incident log, roof fall report investigation |
| **Incident Detail** | `/incidents/:id` | Safety / Manager | Evidence attachments, status escalation |
| **Production Analytics** | `/production` | Manager / Corp | Shift tonnage, seam output compliance |
| **Environmental Sensor Status** | `/environment` | Safety / Manager | SPCB CAAQMS thresholds, AI air forecast |
| **Contractor Management** | `/contractors` | Manager / Contractor | Licence expiries, worker fitness, trust map |
| **Grievance Portal** | `/grievances` | All Roles | Multilingual voice audio, Gemini classification |
| **Statutory Reports** | `/reports` | Safety / Regulator | Form IV auto-fill, SHA-256 digital signature |
| **OCR Digitization Queue** | `/ocr` | Admin / Manager | Paper scan upload, low-confidence review |
| **AI Analytics Engine** | `/ai-analytics` | Executive / Manager | Anomaly detection, Gemini risk reasoning |
| **Corporate National Dashboard** | `/corporate-dashboard` | Executive | Subsidiary ranking, emergency broadcast |
| **Regulator Audit View** | `/regulator` | Regulator | Read-only verified filings & audit trails |
| **Worker Portal** | `/worker` | Worker / Inspector | Field observations, safety check-in |
| **Mobile Inspection View** | `/mobile-inspection` | Inspector | Offline simulation, CH4 1.6% EVACUATE modal |

---

## 🎥 RECORDING PREPARATION CHECKLIST

- [ ] **Dev Servers Running:** Web (`http://localhost:5173`), Backend (`http://localhost:8000`).
- [ ] **Demo Data Seeded:** Ensure 1 active mine (e.g., Rajmahal OCP), 3 inspections, 1 open roof-fall incident, 1 CH4 gas threshold breach, and 1 Hindi audio grievance are pre-loaded.
- [ ] **Screen Resolution & Ratio:** Browser window set to `1920×1080` (1080p 60fps recording).
- [ ] **Sidebar Navigation:** Practice clicking through the rapid page route sequences to maintain ~3–5 seconds per screen smooth pacing.
- [ ] **Mobile Evacuation Trigger:** Pre-stage CH4 gas input to `1.6%` to ensure the full-screen red EVACUATE alert pops up instantly at `1:15`.
- [ ] **Narration Sync:** Practice speaking the 700-word script alongside screen transitions — maintain smooth cadence without dead air.

---
*Updated Pitch Demo Script & Route Mapping v5.0 · SIH 2026 — PS 26024 · COMET Governance Platform*
