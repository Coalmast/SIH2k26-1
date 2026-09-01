# COMET Mobile App — Screens & Navigation Architecture Analysis

This document provides a comprehensive inventory and analysis of all application screens identified across the codebase, HTML prototypes, and specification documents.

---

## 1. Prototype & Working Template Screens (HTML Mockups)

Standalone, high-fidelity UI templates located in the project root:

| Screen / File | Description | Key Features |
| :--- | :--- | :--- |
| **Carbon Core Login**<br>[`login.html`](file:///m:/SIH/Reference_app/Testapp/login.html) | Keycloak OIDC authentication screen | Credentials form, OAuth options, biometric login button, dark theme styling. |
| **Home Dashboard**<br>[`home.html`](file:///m:/SIH/Reference_app/Testapp/home.html) | Main field officer dashboard | Quick stats cards, pending task queue, sync status indicator, bottom tab navigation bar. |
| **Statutory Mine Inspection Form**<br>[`form.html`](file:///m:/SIH/Reference_app/Testapp/form.html) | Multi-step offline statutory inspection entry | Inspection checklist, geo-stamping (lat/long/accuracy), photo/media capture, voice note input. |

---

## 2. Mobile Field App Architecture (React Native Specification)

Derived from the architecture specification in [`Docs/frontend_spec.md`](file:///m:/SIH/Reference_app/Testapp/Docs/frontend_spec.md) and [`Docs/Product Brief.md`](file:///m:/SIH/Reference_app/Testapp/Docs/Product%20Brief.md):

```
App
├── AuthStack
│   ├── LoginScreen               (PKCE OAuth via expo-auth-session + Keycloak)
│   └── BiometricReAuthScreen     (Underground / offline biometric authentication)
│
└── MainTabs (Bottom Tab Navigator)
    ├── Home (Tab)                -> HomeScreen (Activity feed, pending tasks, quick stats)
    ├── Inspect (Tab)             -> InspectionStack
    │   ├── InspectionListScreen        (Active, scheduled & completed inspections)
    │   ├── StartInspectionScreen       (Pre-inspection setup & shift selection)
    │   ├── InspectionFormScreen        (Primary offline checklist capture)
    │   └── InspectionSummaryScreen     (Review findings & digital sign-off)
    ├── Report (Tab)              -> ReportStack
    │   ├── IncidentReportScreen        (Incident & near-miss capture)
    │   ├── SafetyObservationScreen     (STOP Card hazard reporting)
    │   └── OvermanShiftReportScreen    (Statutory daily shift log)
    ├── Attendance (Tab)          -> AttendanceScreen (QR code scan / manual check-in)
    └── Profile (Tab)             -> ProfileStack
        ├── SyncStatusScreen            (WatermelonDB offline queue & sync manager)
        └── SettingsScreen              (User profile, i18n language, offline data limits)
```

---

## 3. Persistent Overlays & Global Components

- **`OfflineBanner`**: Top sticky status bar showing online/offline status and pending sync queue count (`Online - all synced`, `Offline - 12 records saved locally`).
- **`CriticalAlertModal`**: Fullscreen blocking alert takeover for critical hazards (e.g. fatal incidents, CH4 > 2.5%, evacuation orders).

---

## 4. Current React Native Implementation Status

- **Entry Point**: [`App.tsx`](file:///m:/SIH/Reference_app/Testapp/App.tsx) configures `SafeAreaProvider` and `AuthProvider`.
- **State**: [`src/context/AuthContext.tsx`](file:///m:/SIH/Reference_app/Testapp/src/context/AuthContext.tsx) provides authentication context state.
- **Navigator**: [`src/navigation/AppNavigator.tsx`](file:///m:/SIH/Reference_app/Testapp/src/navigation/AppNavigator.tsx) currently serves as the placeholder navigator ready for stack and tab integration.
