Listed directory routers
Listed directory app
Listed directory src
Viewed compliance_escalation_tasks.py:1-69
Viewed requirements.txt:1-13
Listed directory lib
Viewed supabase.ts:1-11
Viewed .env.example:1-6

Good — I have full context now. This is a significant architectural addition. Let me build the complete notification layer across all 3 surfaces (backend service, web, mobile) simultaneously.

Created notification_service.py
Created notification.py

Now wire the notification service into the escalation tasks to replace the `print()` stubs:

Edited compliance_escalation_tasks.py

Now the web-side Supabase Realtime hook and the mobile Notifee handler:

Created useRealtimeAlerts.ts

Now update the env files and requirements:

Edited .env.example
Edited requirements.txt

Now write the mobile-side Notifee + expo-notifications setup:

Created notifications.ts

Here's the complete picture of what was built:

---

## What Was Implemented

### Architecture — 4 Channels, One Entry Point

Every caller across the codebase only calls `send_alert()` or a helper like `alert_mine_manager()`. The routing logic is centralized in one place.

```
Backend (send_alert)
     │
     ├─ DB INSERT into alerts table
     │     └─→ Supabase Realtime broadcast → Web toast (useRealtimeAlerts.ts)
     │
     ├─ priority = critical  →  FCM with comet_alarm: "true"
     │                              └─→ Mobile: Notifee intercepts
     │                                    ├─ IMPORTANCE_HIGH channel (bypasses DND)
     │                                    ├─ comet_alarm.wav siren
     │                                    └─ Full-screen intent (locked screen)
     │
     ├─ priority = high/medium  →  FCM standard push
     │                               └─→ Mobile: expo-notifications handles
     │
     └─ channels = ["email"]   →  Resend API
                                    └─→ HTML email + PDF download button
```

### Files Created/Modified

| File | What It Does |
|------|-------------|
| [`services/notification_service.py`](file:///c:/Coding/SIH2026/backend/services/notification_service.py) | **Central dispatcher.** `send_alert()`, `alert_mine_manager()`, `alert_subsidiary_head()`, `alert_critical_gas()`, `send_statutory_report_email()` |
| [`models/notification.py`](file:///c:/Coding/SIH2026/backend/models/notification.py) | SQLAlchemy `Alert` model + enums |
| [`services/compliance_escalation_tasks.py`](file:///c:/Coding/SIH2026/backend/services/compliance_escalation_tasks.py) | **`print()` stubs replaced** with real `alert_*()` calls |
| [`web/src/hooks/useRealtimeAlerts.ts`](file:///c:/Coding/SIH2026/web/src/hooks/useRealtimeAlerts.ts) | Supabase Realtime subscriber → Sonner toast renderer (priority-styled) |
| [`app/notifications.ts`](file:///c:/Coding/SIH2026/app/notifications.ts) | Mobile bootstrap: expo-notifications + Notifee channel creation + FCM handler |
| [`backend/.env.example`](file:///c:/Coding/SIH2026/backend/.env.example) | Added `RESEND_API_KEY`, `FCM_PROJECT_ID`, `FCM_SERVICE_ACCOUNT_JSON` |
| [`backend/requirements.txt`](file:///c:/Coding/SIH2026/backend/requirements.txt) | Added `httpx`, `google-auth` |

### Two Things You Need to Do Manually
1. **Firebase** — Place `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) in the mobile app.
2. **Android siren** — Add `comet_alarm.wav` to `android/app/src/main/res/raw/`. This is the sound Notifee plays on critical alerts.
3. **iOS critical alerts** — Request the `com.apple.developer.usernotifications.critical-alerts` entitlement from Apple in the dev portal.