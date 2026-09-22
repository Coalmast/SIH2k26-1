# 🔔 COMET Demo Video — Notification Commands

> Run these from `c:\Coding\SIH2026\backend\` with the backend running.  
> Each command maps to a **numbered notification moment** in the script.  
> Default user `00000000-0000-0000-0000-000000000010` = Mine Manager (demo seed).

---

## Quick reference — all commands in script order

| # | Script Moment | Command |
|---|---|---|
| #2 | Inspection assigned → Inspector | `python test_notification.py medium "New Inspection Assigned — Due Friday" "Air-quality & dust check at Coal Handling Plant. Due: Friday. Complete on mobile."` |
| #3 | Assignment confirmation → Mine Manager | `python test_notification.py low "Inspection Assigned — Confirmation" "Task auto-assigned to Field Inspector Priya Sharma. Regulation: CMR 2017, Reg. 162. Source: System-generated."` |
| #4 | Deadline reminder → Inspector (before due) | `python test_notification.py medium "Inspection Due in 24 Hours" "Air-quality & dust check at CHP is due tomorrow. Checklist synced to mobile."` |
| #4b | Escalation → Subsidiary Admin / DGMS (if missed) | `python test_notification.py high "Compliance Task Escalated — Overdue" "DGMS statutory inspection overdue by 1 day. Escalated from Mine Manager → Subsidiary Admin."` |
| #5 | Dust reading over limit — violation flagged | `python test_notification.py env_breach` |
| #6 | CH₄ over limit — full-screen EVACUATE | `python test_notification.py gas_leak` |
| #7 | Sync: violation notified to all parties | `python test_notification.py safety_violation` |
| #8 | Environment AI forecast alert | `python test_notification.py env_breach` |

---

## Full commands with explanations

---

### `[1:10–1:40]` — Compliance segment, notification feed (#2, #3, #4)

Show these 3 in the Mine Manager notification sidebar. Run them **before recording** so they're already in the feed.

**#2 — Inspector receives "New inspection assigned"**
```bash
python test_notification.py medium "New Inspection Assigned — Due Friday" "Air-quality & dust check at Coal Handling Plant assigned to you. Regulation: CMR 2017, Reg. 162. Due: Friday. Open on mobile to begin."
```
> 📋 **Channel:** In-app toast + WatermelonDB sync (no OS banner — inspector is working)

---

**#3 — Mine Manager receives assignment confirmation**
```bash
python test_notification.py low "Inspection Auto-Assigned — Confirmed" "Task auto-assigned to Field Inspector Priya Sharma. Source: Regulation library (CMR 2017, Reg. 162). You can edit or reassign from /compliance."
```
> ℹ️ **Channel:** In-app info toast only

---

**#4 — Reminder: deadline approaching**
```bash
python test_notification.py medium "Inspection Due in 24 Hours — Reminder" "Air-quality & dust check at Coal Handling Plant is due tomorrow. Inspector has not submitted. Review on /compliance."
```
> 📋 **Channel:** In-app toast + WatermelonDB sync

---

**#4b — Escalation: deadline missed** *(show only if you miss the due date in demo data)*
```bash
python test_notification.py high "Compliance Task Overdue — Escalated" "DGMS statutory inspection (CMR 2017, Reg. 162) is 1 day overdue. Escalated: Mine Manager → Subsidiary Admin → DGMS."
```
> ⚠️ **Channel:** Android push banner + in-app amber toast

---

### `[1:50–2:25]` — Mobile: dust violation (#5) + CH₄ evacuation (#6)

These fire **on the mobile device** during the offline inspection. Use the preset situations.

**#5 — Dust reading over SPCB/CPCB limit — violation flagged on device**
```bash
python test_notification.py env_breach
```
> Full preset title: `"⚠️ Environmental Threshold: CAAQMS PM10 Breach"`  
> Body: `"PM10 at 185 µg/m³ near Overburden Dump #2. Deploy water mist cannons immediately."`  
> ⚠️ **Channel:** Android push banner + in-app amber toast

Or with custom text matching the script exactly:
```bash
python test_notification.py high "⚠️ Dust Limit Exceeded — Violation Flagged" "PM10 reading: 185 µg/m³ (SPCB/CPCB limit: 100 µg/m³) at Coal Handling Plant. Violation created. Syncing on network."
```

---

**#6 — CH₄ over CMR limit — full-screen EVACUATE** *(this is your biggest WOW moment)*
```bash
python test_notification.py gas_leak
```
> Full preset title: `"🚨 CRITICAL: High CH₄ Methane Breach (2.4%)"`  
> Body: `"Methane at Seam-3 Ventilation District reached 2.4% (CMR 2017 limit: 1.5%). Power cut triggered. Evacuate all personnel immediately!"`  
> 🚨 **Channel:** Full-screen Notifee alarm (bypasses DND + silent mode) + blinking RED modal overlay

**Pause 2 full seconds on this screen before narrating.**

---

### `[2:25–2:45]` — The loop: violation notified to Mine Manager, EO, Contractor (#7)

Run this after the mobile sync to show the violation appearing on the web dashboard.

**#7 — Violation auto-created and pushed to all parties**
```bash
python test_notification.py safety_violation
```
> Full preset title: `"⚠️ Major Safety Violation: Unsupported Face"`  
> Body: `"Inspection logged unsupported coal face at Heading 7. Work halted until props installed."`  
> ⚠️ **Channel:** Android push banner + in-app amber toast

Or with custom text:
```bash
python test_notification.py high "Violation Created — Action Required" "Dust reading violation at Coal Handling Plant. Photo evidence attached. Corrective action must be assigned within 24 hours."
```

---

### `[2:45–3:15]` — Environment Officer: AI forecast (#8)

**#8 — Environment AI forecast / anomaly alert**
```bash
python test_notification.py env_breach
```
> Shows: PM10 breach, AI recommends water mist cannons  
> ⚠️ **Channel:** Android push banner + in-app amber toast

Or with forecast-specific text:
```bash
python test_notification.py high "AI Forecast: PM10 Levels Rising" "AI analysis: PM10 trend indicates threshold breach likely within 2 hours. Recommended action: Activate mist suppression at CHP. Officer decision required."
```

---

### `[3:15–4:30]` — Montage notifications

Run these in sequence during the montage section. Fire them just before the screen they appear on.

**SOS raised (Field Inspector montage)**
```bash
python test_notification.py critical "🚨 SOS: Emergency Raised by Inspector" "SOS raised by Field Inspector Priya Sharma at Seam-3 Gate Road. Time: 14:32 IST. Dispatch safety team immediately."
```
> 🚨 **Channel:** Full-screen alarm — great for SOS moment in montage

---

**Contractor licence expiry (Contractor montage)**
```bash
python test_notification.py medium "Contractor Licence Expiring in 7 Days" "M/s Sharma Contractors — PESO Explosive Carrier Fitness expires in 7 days. Upload renewal to /contractors before expiry."
```

---

**Overdue CAPA (CAPA montage)**
```bash
python test_notification.py capa_overdue
```
> Full preset: `"⚠️ DGMS Statutory CAPA 3+ Days Overdue"`  
> Body: `"Corrective Action #CA-1049 (Belt conveyor pull-cord trip switch) is 3 days overdue. Escalated to Mine Manager."`

---

**Night-shift limit flag (Attendance montage)**
```bash
python test_notification.py medium "Night-Shift Limit Exceeded — Mines Act" "Worker Ram Kumar (ID: W-2041) has worked 6 consecutive night shifts. Mines Act Sec. 33 limit: 5. Reassign to day shift."
```

---

**Grievance routed (Worker montage)**
```bash
python test_notification.py medium "New Safety Grievance Routed — Priority High" "Voice grievance (Hindi) filed by Worker W-1092. AI classification: Safety. Priority: High. Assigned to Safety Officer."
```

---

**Emergency broadcast (Corporate montage)**
```bash
python test_notification.py critical "📢 Emergency Broadcast — All Units" "Corporate alert: Seismic activity reported near Jharia field. All surface blasting suspended. Report headcount to control room immediately."
```
> 🚨 **Channel:** Full-screen alarm on all connected devices — use this for the Corporate Emergency Broadcast screen

---

**Report submitted (Regulator montage)**
```bash
python test_notification.py low "Statutory Report Submitted & Signed" "Environment compliance report for August 2026 submitted to SPCB. Digitally signed by Environment Officer. Tamper-evident hash recorded."
```

---

## Priority channels — what each looks like on screen

| Priority | What fires | Best for |
|---|---|---|
| `critical` | 🚨 Full-screen Notifee alarm (bypasses DND + silent) + blinking RED modal | CH₄ gas leak, SOS, roof fall, emergency broadcast |
| `high` | ⚠️ Android push banner + in-app amber toast | Violations, overdue CAPAs, env breach, escalations |
| `medium` | 📋 In-app toast + WatermelonDB sync only (no OS banner) | Assigned inspections, reminders, grievances, expiry |
| `low` | ℹ️ In-app info toast only | Confirmations, sync complete, report submitted |

---

## All available preset situations

```bash
python test_notification.py --list
```

| Key | Priority | Use in script for |
|---|---|---|
| `gas_leak` | critical | #6 CH₄ EVACUATE — **main WOW moment** |
| `roof_fall` | critical | Incident report montage |
| `water_inrush` | critical | Emergency broadcast montage |
| `mine_fire` | critical | SOS / emergency montage |
| `fan_failure` | critical | Safety Official montage |
| `capa_overdue` | high | #4b escalation + CAPA overdue montage |
| `safety_violation` | high | #7 violation created after sync |
| `env_breach` | high | #5 dust violation + #8 AI forecast |
| `haul_road_hazard` | high | Safety montage |
| `air_velocity_low` | high | Ventilation / compliance montage |
| `doc_expiring` | medium | Contractor expiry montage |
| `shift_inspection` | medium | Compliance assignment reminder |
| `sensor_calib` | medium | Equipment montage |
| `attendance_anomaly` | medium | Attendance night-shift montage |
| `shift_handover` | low | Production/dispatch montage |
| `sync_completed` | low | After mobile sync scene |
| `weather_advisory` | low | Environment montage |

---

## Recording order — when to run each command

```
BEFORE RECORDING (seed the notification feed):
  → Run #2, #3, #4 so the notification sidebar already has 3 rows visible

DURING RECORDING (trigger live on screen):
  → 1:50  Run #5 (env_breach) — dust limit hit on mobile
  → 2:00  Run #6 (gas_leak)   — CH₄ EVACUATE full screen ⚡⚡
  → 2:25  Run #7 (safety_violation) — violation appears on web
  → 2:45  Run #8 (env_breach) — environment AI alert
  → 3:35  Run SOS critical    — montage: inspector SOS
  → 3:40  Run doc_expiring    — montage: contractor expiry
  → 3:45  Run capa_overdue    — montage: overdue CAPA
  → 3:48  Run night-shift medium — montage: attendance flag
  → 3:50  Run grievance medium   — montage: grievance routed
  → 4:05  Run emergency broadcast critical — montage: corporate
  → 4:18  Run report submitted low — montage: regulator
```

---

*Notification command reference · COMET Demo v4.0 · SIH 2026 — PS 26024*
