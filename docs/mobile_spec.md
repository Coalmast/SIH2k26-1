# COMET Mobile Field App — Master Reference Document

**Platform:** Coal Operations Monitoring, Enforcement & Transparency (COMET)  
**Problem Statement:** SIH 2026 — 26024 | Coal India Limited | Ministry of Coal  
**Document Type:** All-in-One React Native App Specification  
**Version:** 1.0 | September 2026

---

## Table of Contents

1. [Setup & Config Analysis](#1-setup--config-analysis)
2. [Project Structure — Current vs. Target](#2-project-structure--current-vs-target)
3. [Navigation Architecture](#3-navigation-architecture)
4. [Design System & Color Tokens](#4-design-system--color-tokens)
5. [All Screens — Detailed Breakdown](#5-all-screens--detailed-breakdown)
   - [5.1 Auth Stack](#51-auth-stack)
   - [5.2 Home / Dashboard Screen](#52-home--dashboard-screen)
   - [5.3 Inspection List Screen](#53-inspection-list-screen)
   - [5.4 Start Inspection Screen](#54-start-inspection-screen)
   - [5.5 Inspection Form Screen ← CORE](#55-inspection-form-screen--core-offline-capture)
   - [5.6 Inspection Summary Screen](#56-inspection-summary-screen)
   - [5.7 Incident Report Screen](#57-incident-report-screen)
   - [5.8 Safety Observation (STOP Card) Screen](#58-safety-observation-stop-card-screen)
   - [5.9 Overman Shift Report Screen](#59-overman-shift-report-screen)
   - [5.10 Attendance Screen](#510-worker-attendance-screen)
   - [5.11 Sync Status Screen](#511-sync-status-screen)
   - [5.12 Settings & Profile Screen](#512-settings--profile-screen)
   - [5.13 Critical Alarm Overlay](#513-critical-alarm-overlay)
6. [Offline-First Strategy](#6-offline-first-strategy)
7. [Push Notification System](#7-push-notification-system)
8. [State Management Architecture](#8-state-management-architecture)
9. [API & Sync Architecture](#9-api--sync-architecture)
10. [Missing Dependencies & Install Commands](#10-missing-dependencies--install-commands)

---

## 1. Setup & Config Analysis

### 1.1 Current State Summary

| File | Status | Notes |
|---|---|---|
| [`App.tsx`](file:///c:/Coding/SIH2026/app/App.tsx) | ⚠️ Legacy | Uses old React Navigation pattern; app now uses **Expo Router** via `app/_layout.tsx`. `App.tsx` is effectively dead code — entry point is `"main": "expo-router/entry"` in `package.json`. |
| [`app/_layout.tsx`](file:///c:/Coding/SIH2026/app/app/_layout.tsx) | ✅ Good | Correct Expo Router root layout. Has `GestureHandlerRootView`, `BottomSheetModalProvider`, `ErrorBoundary`, `AuthProvider`. Missing: `Notifications bootstrap`, `Supabase init`. |
| [`src/context/AuthContext.tsx`](file:///c:/Coding/SIH2026/app/src/context/AuthContext.tsx) | ⚠️ Stub | Bare placeholder — just `user/setUser`. Needs full Supabase Auth integration: session restore from `expo-secure-store`, `onAuthStateChange` listener, role extraction from JWT. |
| [`src/navigation/AppNavigator.tsx`](file:///c:/Coding/SIH2026/app/src/navigation/AppNavigator.tsx) | ❌ Obsolete | Plain text placeholder; replaced by Expo Router file-based routing. Can be deleted. |
| [`notifications.ts`](file:///c:/Coding/SIH2026/app/notifications.ts) | ✅ Excellent | Production-ready dual-library notification system (`expo-notifications` + `Notifee` + `@react-native-firebase/messaging`). Correct channel architecture for critical vs standard alerts. |
| [`package.json`](file:///c:/Coding/SIH2026/app/package.json) | ⚠️ Incomplete | Good base (Expo SDK 56, RN 0.85, NativeWind). Missing core COMET packages: Supabase client, WatermelonDB, React Navigation (needed alongside Expo Router for nested stacks), Zustand, TanStack Query, expo-secure-store, expo-local-authentication, react-native-vision-camera, Notifee, Firebase. |
| [`app.json`](file:///c:/Coding/SIH2026/app/app.json) | ⚠️ Incomplete | Name/slug still "NativeShad". Missing: EAS project ID, `google-services.json` plugin, `@notifee/react-native` plugin, `expo-notifications` plugin, `expo-local-authentication` plugin, iOS critical-alert entitlement, `POST_NOTIFICATIONS` permission. |
| [`babel.config.js`](file:///c:/Coding/SIH2026/app/babel.config.js) | ✅ Good | NativeWind + Reanimated correctly configured. |
| [`tailwind.config.js`](file:///c:/Coding/SIH2026/app/tailwind.config.js) | ⚠️ Partial | Uses NativeWind preset correctly. Missing: COMET brand color tokens (navy, amber, risk palette). `content` array doesn't include `src/**` — add it. |
| [`tsconfig.json`](file:///c:/Coding/SIH2026/app/tsconfig.json) | ✅ Good | Strict mode, bundler resolution, `@/` alias correctly set. |
| [`metro.config.js`](file:///c:/Coding/SIH2026/app/metro.config.js) | ✅ Good | Expo Metro + NativeWind. Add WatermelonDB resolver when installed. |

---

### 1.2 Critical Config Gaps

> [!CAUTION]
> The following items **must be fixed** before any screen development begins.

**Gap 1 — `app.json` rename & EAS setup**
```json
// app.json — required additions
{
  "expo": {
    "name": "COMET Field App",
    "slug": "comet-field-app",
    "scheme": "comet",
    "android": {
      "package": "in.gov.coalindia.comet",
      "permissions": [
        "CAMERA", "ACCESS_FINE_LOCATION", "ACCESS_BACKGROUND_LOCATION",
        "POST_NOTIFICATIONS", "VIBRATE", "RECEIVE_BOOT_COMPLETED",
        "USE_BIOMETRIC", "USE_FINGERPRINT"
      ],
      "googleServicesFile": "./google-services.json"
    },
    "ios": {
      "bundleIdentifier": "in.gov.coalindia.comet",
      "googleServicesFile": "./GoogleService-Info.plist",
      "entitlements": {
        "com.apple.developer.usernotifications.critical-alerts": true
      }
    },
    "plugins": [
      "expo-router",
      "expo-font",
      ["expo-notifications", { "icon": "./assets/images/notification-icon.png", "color": "#1E3A5F" }],
      "expo-local-authentication",
      "expo-location",
      "@notifee/react-native",
      "@react-native-firebase/app",
      "@react-native-firebase/messaging",
      ["react-native-vision-camera", { "cameraPermissionText": "COMET needs camera access for inspection photo evidence." }]
    ],
    "extra": {
      "eas": { "projectId": "<YOUR_EAS_PROJECT_ID>" }
    }
  }
}
```

**Gap 2 — `tailwind.config.js` COMET tokens**
```js
// Add to tailwind.config.js theme.extend.colors
colors: {
  // COMET Brand
  navy: { DEFAULT: '#1E3A5F', light: '#2D5186', dark: '#152C47' },
  amber: { DEFAULT: '#F59E0B', light: '#FCD34D', dark: '#B45309' },
  // Status
  compliant: '#22C55E',
  warning: '#F59E0B',
  breach: '#EF4444',
  pending: '#94A3B8',
  // Risk levels
  'risk-low': '#22C55E',
  'risk-medium': '#F59E0B',
  'risk-high': '#F97316',
  'risk-critical': '#EF4444',
  // Severity
  'severity-minor': '#94A3B8',
  'severity-moderate': '#F59E0B',
  'severity-major': '#F97316',
  'severity-critical': '#EF4444',
}
```

**Gap 3 — `AuthContext.tsx` must be rewritten** (see Section 8 for full implementation plan)

**Gap 4 — `App.tsx` vs Expo Router conflict**  
`App.tsx` is dead code. With `"main": "expo-router/entry"`, Expo ignores `App.tsx` entirely. It can safely be deleted or repurposed as a documentation artifact. The real entry is `app/_layout.tsx`.

**Gap 5 — `notifications.ts` location**  
Move `notifications.ts` to `src/lib/notifications.ts` and call `bootstrapNotifications()` inside `app/_layout.tsx`'s `useEffect`.

---

### 1.3 Packages Needed (Not Yet Installed)

See [Section 10](#10-missing-dependencies--install-commands) for the complete install commands.

---

## 2. Project Structure — Current vs. Target

### Current (Sparse)
```
app/
├── App.tsx                    ← dead code (Expo Router takes over)
├── app/
│   ├── _layout.tsx            ← root layout ✅
│   ├── +not-found.tsx
│   └── (tabs)/
│       ├── _layout.tsx        ← tab bar layout
│       └── index.tsx          ← single demo screen
├── src/
│   ├── context/AuthContext.tsx   ← stub
│   └── navigation/AppNavigator.tsx ← obsolete
├── components/
│   ├── ui/                    ← NativeShad UI components
│   └── HapticTab.tsx
├── notifications.ts           ← move to src/lib/
└── ...configs
```

### Target (COMET Complete)
```
app/
├── app/                         # Expo Router file-based routes
│   ├── _layout.tsx              # Root — providers, splash, notifications bootstrap
│   ├── +not-found.tsx
│   ├── (auth)/                  # Auth stack (unauthenticated)
│   │   ├── _layout.tsx          # Stack navigator, no header
│   │   ├── login.tsx            # LoginScreen
│   │   └── biometric.tsx        # BiometricReAuthScreen
│   └── (app)/                   # Main app (authenticated guard)
│       ├── _layout.tsx          # Bottom tab navigator
│       ├── home/
│       │   └── index.tsx        # HomeScreen / Dashboard
│       ├── inspect/
│       │   ├── _layout.tsx      # InspectionStack
│       │   ├── index.tsx        # InspectionListScreen
│       │   ├── start.tsx        # StartInspectionScreen
│       │   ├── [id]/
│       │   │   ├── form.tsx     # InspectionFormScreen ← primary offline capture
│       │   │   └── summary.tsx  # InspectionSummaryScreen
│       ├── report/
│       │   ├── _layout.tsx
│       │   ├── incident.tsx     # IncidentReportScreen
│       │   ├── observation.tsx  # SafetyObservationScreen (STOP Card)
│       │   └── shift.tsx        # OvermanShiftReportScreen
│       ├── attendance/
│       │   └── index.tsx        # AttendanceScreen
│       └── profile/
│           ├── _layout.tsx
│           ├── index.tsx        # ProfileScreen
│           ├── sync.tsx         # SyncStatusScreen
│           └── settings.tsx     # SettingsScreen
│
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client singleton
│   │   ├── notifications.ts     # (moved from root)
│   │   └── api.ts               # apiFetch() typed wrapper
│   ├── context/
│   │   └── AuthContext.tsx      # Full Supabase auth + role context
│   ├── stores/
│   │   ├── authStore.ts         # Zustand — session, user, role, mine_id
│   │   ├── appStore.ts          # Zustand — connectivity, sync queue count, shift
│   │   └── alertStore.ts        # Zustand — realtime alert feed
│   ├── db/
│   │   ├── schema.ts            # WatermelonDB schema
│   │   ├── models/              # WatermelonDB model classes
│   │   │   ├── Inspection.ts
│   │   │   ├── Observation.ts
│   │   │   ├── IncidentReport.ts
│   │   │   ├── SafetyObservation.ts
│   │   │   └── AttendanceRecord.ts
│   │   └── index.ts             # DB singleton
│   ├── sync/
│   │   ├── syncEngine.ts        # WatermelonDB synchronize() wrapper
│   │   ├── mediaUploader.ts     # Queued photo/video upload to Supabase Storage
│   │   └── conflictResolver.ts  # Conflict resolution rules
│   ├── hooks/
│   │   ├── useConnectivity.ts   # @react-native-community/netinfo wrapper
│   │   ├── useSyncQueue.ts      # WatermelonDB pending count
│   │   ├── useGeoStamp.ts       # expo-location one-shot capture
│   │   ├── usePermission.ts     # RBAC permission check from JWT
│   │   └── useRealtimeAlerts.ts # Supabase Realtime subscription
│   ├── components/
│   │   ├── OfflineBanner.tsx    # Top persistent sync status bar
│   │   ├── CriticalAlarmModal.tsx # Fullscreen emergency overlay
│   │   ├── StatusBadge.tsx      # Compliance/sync status pills
│   │   ├── RiskChip.tsx         # Minor/moderate/major/critical color chip
│   │   ├── GeoStampDisplay.tsx  # lat/lng/accuracy display
│   │   ├── MediaCapture.tsx     # Camera trigger + gallery preview
│   │   └── VoiceInput.tsx       # Record voice note → audio queued offline → Gemini Audio API transcribes on sync
│   └── types/
│       ├── db.types.ts          # Supabase generated types
│       ├── inspection.types.ts
│       └── enums.ts             # All DB enum mirrors
│
├── assets/
│   ├── fonts/
│   ├── images/
│   └── sounds/
│       └── comet_alarm.wav      # Critical alarm sound (required)
│
└── ...configs
```

---

## 3. Navigation Architecture

```
App (Expo Router root)
│
├── /(auth)                          AuthStack (no tab bar)
│   ├── /login                       LoginScreen
│   └── /biometric                   BiometricReAuthScreen
│
└── /(app)                           MainTabs (bottom tab navigator)
    │   [OfflineBanner — top of every screen]
    │
    ├── /home                        Tab 1: Home 🏠
    │   └── HomeScreen               Activity feed, pending tasks, quick stats, sync status
    │
    ├── /inspect                     Tab 2: Inspect 🔍
    │   ├── InspectionListScreen     Active / scheduled / completed inspections
    │   ├── /inspect/start           StartInspectionScreen — pre-inspection setup
    │   └── /inspect/[id]/
    │       ├── form                 InspectionFormScreen ← PRIMARY OFFLINE CAPTURE
    │       └── summary              InspectionSummaryScreen — review & sign-off
    │
    ├── /report                      Tab 3: Report ⚠️
    │   ├── /report/incident         IncidentReportScreen — incident & near-miss
    │   ├── /report/observation      SafetyObservationScreen — STOP Card
    │   └── /report/shift            OvermanShiftReportScreen — statutory shift log
    │
    ├── /attendance                  Tab 4: Attendance 👥
    │   └── AttendanceScreen         QR scan / manual check-in + geo-fence verification
    │
    ├── /grievance                   Tab 5: Grievance / Help 💬
    │   ├── GrievanceScreen          File voice or text grievance; chat with AI assistant
    │   └── /grievance/status        My grievances list + status tracker
    │
    └── /profile                     Tab 6: Profile 👤
        ├── ProfileScreen            User info, mine assignment, language
        ├── /profile/sync            SyncStatusScreen — WatermelonDB queue manager
        └── /profile/settings        SettingsScreen — offline limits, biometric, language
```

**Global Overlays:**
- `OfflineBanner` — persists at top of every `/(app)` screen
- `CriticalAlarmModal` — fullscreen takeover for `priority = critical` alerts

---

## 4. Design System & Color Tokens

### 4.1 COMET Brand Colors

| Token | Value | Used For |
|---|---|---|
| `navy.DEFAULT` | `hsl(216 85% 24%)` | Tab bar, headers, primary buttons |
| `navy.light` | `hsl(216 65% 40%)` | Secondary nav elements |
| `amber.DEFAULT` | `hsl(35 95% 50%)` | CTAs, warning highlights, accent |
| `compliant` | `hsl(142 71% 45%)` | OK / approved status |
| `warning` | `hsl(38 92% 50%)` | Pending / approaching deadline |
| `breach` | `hsl(4 86% 52%)` | Breached / critical / overdue |
| `pending` | `hsl(220 14% 60%)` | Submitted / queued |
| `risk-low` | `hsl(142 71% 45%)` | Risk score 0–30 |
| `risk-medium` | `hsl(38 92% 50%)` | Risk score 31–60 |
| `risk-high` | `hsl(25 95% 53%)` | Risk score 61–80 |
| `risk-critical` | `hsl(4 86% 52%)` | Risk score 81–100 |

### 4.2 Typography

```typescript
// Must load in _layout.tsx
fonts: {
  primary: 'Inter',          // UI text — load from Google Fonts via expo-font
  secondary: 'NotoSansDevanagari', // Hindi/Marathi fallback
  mono: 'SpaceMono',         // Already loaded in template
}
```

### 4.3 Core Mobile Components

| Component | File | Purpose |
|---|---|---|
| `OfflineBanner` | `src/components/OfflineBanner.tsx` | Sticky top bar: online/offline + pending count |
| `CriticalAlarmModal` | `src/components/CriticalAlarmModal.tsx` | Fullscreen alert takeover |
| `StatusBadge` | `src/components/StatusBadge.tsx` | `pending/synced/breach/approved` pills |
| `RiskChip` | `src/components/RiskChip.tsx` | `minor/moderate/major/critical` colored chip |
| `GeoStampDisplay` | `src/components/GeoStampDisplay.tsx` | lat/lng + accuracy + boundary indicator |
| `SyncDot` | `src/components/SyncDot.tsx` | Green/yellow/red dot for sync status inline |
| `MediaCapture` | `src/components/MediaCapture.tsx` | Camera button + thumbnail row |
| `VoiceInput` | `src/components/VoiceInput.tsx` | Record voice note locally → queued → Gemini Audio API transcribes & classifies on sync |
| `ShiftPicker` | `src/components/ShiftPicker.tsx` | Shift A / B / C / General horizontal selector |
| `SeverityPicker` | `src/components/SeverityPicker.tsx` | Minor / Moderate / HIGH / Critical row |
| `ChecklistItem` | `src/components/ChecklistItem.tsx` | OK / Non-Compliant / Observation 3-button row |

---

## 5. All Screens — Detailed Breakdown

### 5.1 Auth Stack

---

#### 5.1.1 LoginScreen
**Route:** `/(auth)/login`  
**WatermelonDB:** Not used  
**Supabase:** `supabase.auth.signInWithPassword()` or `supabase.auth.signInWithOtp()`

```
┌─────────────────────────────────────┐
│  [COMET Logo + Coal India Emblem]   │
│                                     │
│  Coal Operations Monitoring,        │
│  Enforcement & Transparency         │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📧 Email / Employee ID     │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  🔒 Password          👁   │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │      SIGN IN  →              │   │
│  └─────────────────────────────┘   │
│                                     │
│  ── or ──                           │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📨 Send Magic Link          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  ☝ Biometric Login           │   │
│  └─────────────────────────────┘   │
│  (only shown if stored session exists│
│   and expo-local-authentication OK) │
│                                     │
│  Need help? Contact your mine admin │
└─────────────────────────────────────┘
```

**Functionality:**
- `supabase.auth.signInWithPassword()` — email/employee ID + password
- `supabase.auth.signInWithOtp({ email })` — magic link for field workers
- Session stored in `expo-secure-store` (iOS Keychain / Android Keystore)
- On success: `onAuthStateChange` fires → extract role from JWT → navigate to `/(app)/home`
- On biometric tap: calls `expo-local-authentication` → if valid, restores last session from `expo-secure-store`
- Lockout: Supabase Auth built-in 5-attempt lockout
- After login: call `registerAndSyncPushToken()` from `notifications.ts`

---

#### 5.1.2 BiometricReAuthScreen
**Route:** `/(auth)/biometric`  
**Use Case:** Underground re-authentication when session expires without connectivity

```
┌─────────────────────────────────────┐
│          [COMET Shield Icon]         │
│                                     │
│   Underground Re-Authentication     │
│   You are offline. Use biometric    │
│   to resume your session.           │
│                                     │
│         [Fingerprint Icon]          │
│    Touch sensor to authenticate     │
│                                     │
│  Last sync: 2h 14m ago              │
│  Mine: Rajmahal OCP                 │
│                                     │
│  [Use PIN instead]                  │
│  [Sign out & return online]         │
└─────────────────────────────────────┘
```

**Functionality:**
- Triggered when: JWT expires + app is offline
- `expo-local-authentication.authenticateAsync()` — no network call made
- On success: restores read/write access to local WatermelonDB
- Sync will auto-resume when connectivity restored
- All locally captured data remains accessible / saveable

---

### 5.2 Home / Dashboard Screen

**Route:** `/(app)/home`  
**WatermelonDB:** reads pending counts from all tables  
**Supabase Realtime:** `alerts:mine_id=eq.{mineId}` channel (when online)

```
┌─────────────────────────────────────────┐
│ [OfflineBanner — top]                   │
│ 🟡 Online — 4 records queued  [Sync ▶] │
├─────────────────────────────────────────┤
│ COMET Field App                         │
│ Rajmahal OCP | Shift B | 30 Aug 2026   │
│                         🔔 3  👤 Suresh │
├─────────────────────────────────────────┤
│ PENDING TASKS                           │
│ ─────────────────────────────────────── │
│ 📋 Complete inspection — Pit 3 East     │
│    7 / 24 checkpoints done      [→]    │
│ ─────────────────────────────────────── │
│ ⚠️  CAPA assigned — Roof support fix   │
│    Due TODAY | HIGH severity    [→]    │
│ ─────────────────────────────────────── │
│ 📊 Submit shift report by end of shift  │
│    [Complete →]                         │
├─────────────────────────────────────────┤
│ QUICK ACTIONS                           │
│ ┌──────────┐  ┌──────────┐             │
│ │🔍 Inspect │  │⚠️ Incident│             │
│ └──────────┘  └──────────┘             │
│ ┌──────────┐  ┌──────────┐             │
│ │👁 Obs    │  │📊 Shift  │             │
│ └──────────┘  └──────────┘             │
├─────────────────────────────────────────┤
│ LIVE ALERTS (Realtime — when online)    │
│ 🔴 PM10 Breach — CAAQMS-01  10:42 AM   │
│ 🟡 CLRA License expiring in 18 days    │
│ 🟢 CAPA Closed — Roof support OK       │
├─────────────────────────────────────────┤
│ SYNC STATUS                             │
│ 4 records pending | 8.2 MB photos      │
│ [View Sync Details →]                  │
└─────────────────────────────────────────┘
```

**Data Sources:**
- Pending tasks: WatermelonDB query on `inspections` (status = `in_progress`) + `corrective_actions` (due_date ≤ today, assigned_user_id = me)
- Quick actions: static navigation links
- Live alerts: Supabase Realtime subscription (gracefully degrades offline — shows last cached alerts)
- Sync status: WatermelonDB count of records with `sync_status = 'pending_sync'`

**Workflow Connection:**  
Implements **Workflow 1 (Compliance Task & Escalation)** — pending tasks from the compliance calendar appear here. Implements **Workflow 2 (Inspection & CAPA)** — assigned CAPAs shown in pending tasks.

---

### 5.3 Inspection List Screen

**Route:** `/(app)/inspect`  
**WatermelonDB:** `inspections` table (local)  
**Supabase (online):** `inspections` table via TanStack Query

```
┌─────────────────────────────────────────┐
│ [OfflineBanner]                         │
│                                         │
│ INSPECTIONS                    [+ New] │
│ [All ▾] [Active ●2] [Scheduled] [Done] │
│                                         │
│ ─────── ACTIVE ─────────────────────── │
│                                         │
│ Internal Safety Committee               │
│ Pit 3 East | 30 Aug 2026               │
│ By: You (Arun Mandal)                  │
│ 7 / 24 checkpoints  🔴 Offline         │
│ [Continue →]                            │
│                                         │
│ ─────── SCHEDULED ──────────────────── │
│                                         │
│ DGMS Quarterly Inspection               │
│ Zone: District 4 | 5 Sep 2026         │
│ Assigned to you                        │
│ [Start →]                              │
│                                         │
│ ─────── COMPLETED ──────────────────── │
│                                         │
│ HEMM Pre-Operational Safety             │
│ 28 Aug 2026 | ✅ Synced | 12 obs      │
│ [View →]                               │
└─────────────────────────────────────────┘
```

**Workflow Connection:**  
Maps to **Workflow 2 Step 1** — field inspector opens inspection list to start or continue work.

---

### 5.4 Start Inspection Screen

**Route:** `/(app)/inspect/start`  
**WatermelonDB:** creates new `inspections` record immediately  
**Online lookup (TanStack Query):** checklist templates, mine zones

```
┌─────────────────────────────────────────┐
│ START NEW INSPECTION                    │
│                                         │
│ INSPECTION TYPE                         │
│ ○ Internal Safety Committee             │
│ ○ DGMS Annual General                  │
│ ○ HEMM Pre-Operational Safety          │
│ ○ Ventilation & Gas Check              │
│ ○ Environmental Walk-through           │
│ ○ Electrical Safety                    │
│                                         │
│ CHECKLIST TEMPLATE                      │
│ [Auto-selected based on type ▾]        │
│                                         │
│ ZONE / AREA                             │
│ ○ Pit 3 East    ○ Pit 3 West           │
│ ○ Coal Handling ○ Workshop             │
│ ○ Magazine      ○ Entry/Exit Road      │
│ ○ [Type custom zone]                   │
│                                         │
│ SHIFT                                   │
│ [A]  [B ●]  [C]  [General]             │
│                                         │
│ GPS LOCATION                            │
│ 24.1543°N 87.0244°E  Accuracy: 8m     │
│ ✅ Inside mine boundary                 │
│                                         │
│ DATE / TIME                             │
│ 30 Aug 2026  |  14:32 (auto)           │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │    START INSPECTION  →           │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Functionality:**
- On "START": immediately creates `inspections` record in WatermelonDB with `status = 'in_progress'`, `sync_status = 'pending_sync'`
- GeoStamp captured at inspection start via `expo-location`
- If offline: checklist template loaded from cached WatermelonDB `checklist_templates` table
- Navigates to `InspectionFormScreen` with the new inspection ID

---

### 5.5 Inspection Form Screen ← CORE OFFLINE CAPTURE

**Route:** `/(app)/inspect/[id]/form`  
**WatermelonDB:** `inspections` (parent), `observations` (child records)  
**Priority:** Highest — this is the primary value-delivery screen of the entire app

This is the multi-section statutory inspection capture form. All data is written to WatermelonDB instantly (< 50ms) and synced to Supabase when connectivity is available.

---

#### Form Header (Persistent)

```
┌─────────────────────────────────────────┐
│ 🔴 Offline — 3 observations saved locally│
│ ─────────────────────────────────────── │
│ ACTIVE INSPECTION                        │
│ Internal Safety Committee               │
│ Mine: Rajmahal OCP | Zone: Pit 3 East  │
│ GPS: 24.1543°N  Acc: 8m  ✅ In boundary│
│ Shift: B  |  Started: 14:32            │
│                                         │
│ Progress: 7 / 24 checkpoints            │
│ ████████░░░░░░░░░░░░░░░ 29%             │
└─────────────────────────────────────────┘
```

---

#### Section 1: Roof & Side Support (CMR 2017, Reg 100)

```
═══════════════════════════════════════
SECTION 1: ROOF & SIDE SUPPORT
CMR 2017, Regulation 100
Mandatory — 6 checkpoints
═══════════════════════════════════════

Q1. Have roof and sides been sounded
    before work commenced in the area?
    ┌──────┐  ┌──────────────┐  ┌───────────┐
    │ ✅ OK │  │🔴 Non-Comply │  │🟡 Obs Only│
    └──────┘  └──────────────┘  └───────────┘

Q2. Is systematic support installed
    as per approved support rules?
    ┌──────┐  ┌──────────────┐  ┌───────────┐
    │ ✅ OK │  │🔴 Non-Comply │  │🟡 Obs Only│
    └──────┘  └──────────────┘  └───────────┘

    → [Non-Compliant] selected:
    ┌───────────────────────────────────┐
    │ VIOLATION DETAILS                 │
    │                                   │
    │ Description:                      │
    │ ┌──────────────────────────────┐ │
    │ │ Roof bolts spacing 2.8m vs   │ │
    │ │ approved 1.5m limit in       │ │
    │ │ face area 3E-North           │ │
    │ └──────────────────────────────┘ │
    │ [🎤 Record voice note — Hindi]   │
    │                                   │
    │ SEVERITY                          │
    │ [Minor] [Moderate] [HIGH ●] [Crit]│
    │                                   │
    │ EVIDENCE                          │
    │ [📸 Take Photo]                  │
    │ [📷 IMG_001.jpg] [📷 IMG_002.jpg] │
    │                                   │
    │ STATUTE REFERENCE (auto-filled)   │
    │ CMR 2017, Regulation 100          │
    │                                   │
    │ AREA / SUB-ZONE                   │
    │ [Face 3E-North — tap to edit]    │
    │                                   │
    │ ⚠️ severity=HIGH → violation will │
    │    be auto-created on next sync   │
    └───────────────────────────────────┘

Q3. Is withdrawal support plan posted
    at the face?
    [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q4. Are props/chocks in serviceable condition?
    [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q5. Roof fall history recorded in logbook?
    [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q6. Is the area barricaded where support
    is absent / incomplete?
    [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

                       [Next Section ▶]
```

---

#### Section 2: Ventilation & Gas Safety (CMR Reg 105, 116)

```
═══════════════════════════════════════
SECTION 2: VENTILATION & GAS SAFETY
CMR 2017, Regulations 105, 116
Mandatory — 5 checkpoints
═══════════════════════════════════════

Q7. Is ventilation current — airflow
    meeting minimum CMR requirement?
    [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q8. GAS READINGS (mandatory entry — no
    OK/NC buttons here; values required)
    ┌───────────────────────────────────┐
    │ Station: Face Entry               │
    │ CH4:  [____] %   CO: [___] ppm   │
    │ CO2:  [____] %   O2: [___] %     │
    │                                   │
    │ ⚠️ THRESHOLDS:                    │
    │  CH4 > 0.75% → Warning 🟡        │
    │  CH4 > 1.25% → STOP WORK 🔴      │
    │  CH4 > 1.50% → EVACUATE + alert  │
    └───────────────────────────────────┘
    ┌───────────────────────────────────┐
    │ Station: Return Airway            │
    │ CH4:  [____] %   CO: [___] ppm   │
    └───────────────────────────────────┘

Q9. Ventilation logbook up to date?
    [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q10. Are brattice cloths / stoppings
     in serviceable condition?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q11. Is methane monitoring equipment
     calibrated and operational?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

                       [Next Section ▶]
```

> [!IMPORTANT]
> If CH4 > 1.5% is entered, the app must immediately dispatch a **synchronous FastAPI call** (bypassing the background queue) to alert the Mine Manager. This is NOT a background task — it must fire before the record is saved.

---

#### Section 3: Personal Protective Equipment (CMR Reg 114)

```
═══════════════════════════════════════
SECTION 3: PPE COMPLIANCE
CMR 2017, Regulation 114
═══════════════════════════════════════

Q12. Are all workers wearing mandatory
     PPE (hard hat, safety boots, belt)?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q13. Are self-rescuers available and
     workers trained in their use?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q14. Is cap lamp charged and functional
     for each worker?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q15. Are flame-safety lamps available
     in fiery mines (if applicable)?
     [✅ OK]  [🔴 Non-Comply]  [N/A]

                       [Next Section ▶]
```

---

#### Section 4: Electrical Safety (CMR Reg 123)

```
═══════════════════════════════════════
SECTION 4: ELECTRICAL SAFETY
CMR 2017, Regulation 123
═══════════════════════════════════════

Q16. Are electrical switchgear enclosures
     in flameproof condition?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q17. Are earthing connections intact
     and tested?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q18. Is trailing cable in good condition
     (no exposed insulation)?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

                       [Next Section ▶]
```

---

#### Section 5: Fire & Explosives (CMR Reg 142, 155)

```
═══════════════════════════════════════
SECTION 5: FIRE SAFETY & EXPLOSIVES
CMR 2017, Regulations 142, 155
═══════════════════════════════════════

Q19. Are fire fighting appliances at
     designated stations and charged?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q20. Is explosive magazine securely
     locked and record maintained?
     [✅ OK]  [🔴 Non-Comply]  [N/A]

Q21. Are shot-firer certificates current
     and available for inspection?
     [✅ OK]  [🔴 Non-Comply]  [N/A]

                       [Next Section ▶]
```

---

#### Section 6: Haulage & HEMM Safety (CMR Reg 155–170)

```
═══════════════════════════════════════
SECTION 6: HAULAGE & HEMM
CMR 2017, Regulations 155–170
═══════════════════════════════════════

Q22. Are HEMM pre-operational checks
     completed and signed by operator?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q23. Are dump truck dump body locks
     operational and tested?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

Q24. Is travel road adequate width,
     berms in place, no excessive grade?
     [✅ OK]  [🔴 Non-Comply]  [🟡 Obs]

══════════════════════════════════════
INSPECTION COMPLETE — 24/24 checkpoints
3 violations flagged | 2 observations
══════════════════════════════════════

[Save Draft]        [Proceed to Summary →]
```

---

#### Form Technical Behavior

| Action | WatermelonDB | Supabase | Notes |
|---|---|---|---|
| Any checkpoint tap | Instant write `observations` | Queued | < 50ms, no loading state |
| Photo captured | Local file path stored | Queued upload | Uses `mediaUploader.ts` |
| Voice note recorded | Local audio path stored | Queued upload + Gemini Audio transcription | Gemini Audio API transcribes & writes back `description` on sync |
| Gas reading entry | `shift_observations` JSONB | Queued | CH4 > 1.5% → sync bypass |
| Section "Next" | `inspections.current_section` updated | Queued | Resume-safe |
| "Save Draft" | No-op (already saved) | Queued | Toast confirmation |
| "Proceed to Summary" | `inspections.status = 'completed'` | Queued | Nav to SummaryScreen |

---

### 5.6 Inspection Summary Screen

**Route:** `/(app)/inspect/[id]/summary`  
**WatermelonDB:** reads all observations for this inspection  
**Supabase:** triggers sync push on "Sign & Submit"

```
┌─────────────────────────────────────────┐
│ INSPECTION SUMMARY                      │
│ Internal Safety Committee               │
│ Pit 3 East | 30 Aug 2026 | Shift B    │
│ Inspector: Arun Mandal                  │
│ Duration: 14:32 → 16:45 (2h 13m)      │
├─────────────────────────────────────────┤
│ RESULTS                                 │
│ 24 / 24 checkpoints complete ✅        │
│ 3 VIOLATIONS (HIGH × 2, MODERATE × 1) │
│ 2 OBSERVATIONS                         │
│ 19 OK                                  │
├─────────────────────────────────────────┤
│ VIOLATIONS SUMMARY                      │
│ 🔴 Roof bolt spacing — HIGH            │
│    Zone: Face 3E-North | CMR Reg 100   │
│    3 photos attached                   │
│                                        │
│ 🔴 CH4 reading 1.35% — HIGH           │
│    Station: Face Entry | CMR Reg 116   │
│    ⚠️ Escalation auto-triggered        │
│                                        │
│ 🟡 PPE non-compliance × 4 workers      │
│    Zone: CHP Entry | CMR Reg 114       │
├─────────────────────────────────────────┤
│ GEO STAMP VERIFICATION                  │
│ Start: 24.1543°N 87.0244°E (8m acc)   │
│ End:   24.1541°N 87.0242°E (6m acc)   │
│ ✅ All within mine boundary            │
├─────────────────────────────────────────┤
│ DIGITAL SIGN-OFF                        │
│ [Sign with Fingerprint / Face ID ☝]   │
│ or [Draw Signature ✏]                  │
│                                        │
│ Inspector remarks (optional):           │
│ [Overall conditions poor in Pit 3 —]   │
│  urgent attention required             │
│                                        │
│ ┌─────────────────────────────────┐   │
│ │  SIGN & SUBMIT INSPECTION  ✅   │   │
│ └─────────────────────────────────┘   │
│                                        │
│ Sync: 🔴 Offline — will upload when   │
│       connectivity is restored          │
└─────────────────────────────────────────┘
```

**On "Sign & Submit":**
1. Biometric auth confirmation (`expo-local-authentication`)
2. `inspections.status = 'submitted'`, `inspections.signed_at = now()`
3. Queue entire inspection for sync push (WatermelonDB → FastAPI `/api/v1/sync/push`)
4. For each HIGH/CRITICAL violation: `violation_auto_create = true` flag set → CAPA triggered on server on sync
5. Toast: "Inspection saved — will sync when online"

---

### 5.7 Incident Report Screen

**Route:** `/(app)/report/incident`  
**WatermelonDB:** `incident_reports` table  
**Supabase (priority sync):** After submit, try immediate sync; fall back to queue

```
┌─────────────────────────────────────────┐
│ REPORT INCIDENT / NEAR-MISS             │
│ GPS: 24.1541°N ✅ Inside boundary       │
├─────────────────────────────────────────┤
│ INCIDENT TYPE                           │
│ ┌──────────┐  ┌──────────┐             │
│ │ Roof Fall │  │Gas Event │             │
│ └──────────┘  └──────────┘             │
│ ┌──────────┐  ┌──────────┐             │
│ │ Equipment │  │ Injury   │             │
│ └──────────┘  └──────────┘             │
│ ┌──────────┐  ┌──────────┐             │
│ │ Near Miss │  │Fire      │             │
│ └──────────┘  └──────────┘             │
│ ┌──────────┐  ┌──────────┐             │
│ │Inundation │  │Explosives│             │
│ └──────────┘  └──────────┘             │
│ ┌──────────┐  ┌──────────┐             │
│ │ Haulage  │  │Electrical│             │
│ └──────────┘  └──────────┘             │
│ ┌──────────┐                           │
│ │  Other   │                           │
│ └──────────┘                           │
├─────────────────────────────────────────┤
│ DESCRIPTION                             │
│ ┌───────────────────────────────────┐  │
│ │ [Large free-text area]            │  │
│ │                                   │  │
│ └───────────────────────────────────┘  │
│ [🎤 Voice note — Hindi/Odia/Bengali]   │
│                                         │
│ AI ASSESSMENT (when online)             │
│ ┌───────────────────────────────────┐  │
│ │ Suggested Severity: HIGH          │  │
│ │ Suggested Category: Roof Fall —   │  │
│ │   Support failure                 │  │
│ │ [Accept ✅]  [Change ▾]           │  │
│ └───────────────────────────────────┘  │
│ (if offline: manual severity entry)    │
├─────────────────────────────────────────┤
│ LOCATION                                │
│ Zone: [Pit 3 ▾]  Shift: [B ●]        │
│ GPS: 24.1541°N 87.0241°E ✅           │
├─────────────────────────────────────────┤
│ PERSONS INVOLVED  [+ Add Person]        │
│ ─────────────────────────────────────── │
│ Ramesh Kumar                            │
│ Type: [Regular ▾] Role: [Injured ▾]   │
│ Nature: [Crush injury]                  │
│ Outcome: [Under treatment ▾]           │
│ ─────────────────────────────────────── │
├─────────────────────────────────────────┤
│ IMMEDIATE ACTIONS TAKEN                 │
│ ┌───────────────────────────────────┐  │
│ │ Medical first aid, area barricaded│  │
│ └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ MEDIA  [📸 3 photos]  [+ Add Video]    │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────┐    │
│ │        SUBMIT REPORT  →          │    │
│ └─────────────────────────────────┘    │
│ → Notifications: Mine Manager + Safety │
│   Officer via FCM push + Resend email  │
│ → If severity=critical: DGMS initial   │
│   alert auto-triggered by FastAPI      │
└─────────────────────────────────────────┘
```

**Workflow Connection:** Implements **Workflow 2** — incident log → AI classification → notification → CAPA trigger.

---

### 5.8 Safety Observation (STOP Card) Screen

**Route:** `/(app)/report/observation`  
**Target:** < 60 seconds end-to-end  
**WatermelonDB:** `safety_observations` table

```
┌─────────────────────────────────────────┐
│ SAFETY OBSERVATION  ⏱ < 60 sec          │
├─────────────────────────────────────────┤
│ 1. ZONE (tap one)                       │
│ [Pit 3 ●] [Workshop] [CHP] [Entry]     │
│ [Magazine] [Other]                      │
├─────────────────────────────────────────┤
│ 2. TYPE                                 │
│ [🔴 Unsafe Act]  [🟡 Unsafe Condition] │
│ [🟢 Positive Observation]              │
├─────────────────────────────────────────┤
│ 3. CATEGORY                             │
│ [PPE] [Housekeeping] [Equipment Guard] │
│ [Fall Protection] [Fire] [Traffic]     │
│ [Ventilation] [Explosives] [Other]     │
├─────────────────────────────────────────┤
│ 4. DESCRIBE (or voice note)             │
│ ┌───────────────────────────────────┐  │
│ │ Worker not wearing hard hat in    │  │
│ │ active blast zone                 │  │
│ └───────────────────────────────────┘  │
│ [🎤 Voice — Hindi / Odia]              │
├─────────────────────────────────────────┤
│ 5. PHOTO (optional)                     │
│ [📸 Capture]                           │
├─────────────────────────────────────────┤
│ 6. ASSIGN TO (optional)                 │
│ [🔍 Search official]  [📷 Scan badge]  │
├─────────────────────────────────────────┤
│ GPS: ✅ 24.1541°N  Accuracy: 6m        │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │       SUBMIT OBSERVATION  →      │    │
│ └─────────────────────────────────┘    │
│ Saved locally → synced on connectivity  │
└─────────────────────────────────────────┘
```

**Post-submit:** Optimistic UI — instantly shows in "My Recent Observations" on Home, queued to WatermelonDB sync.

---

### 5.9 Overman Shift Report Screen

**Route:** `/(app)/report/shift`  
**WatermelonDB:** `shift_reports` table  
**Statutory:** CMR 2017 Reg 116 — mandatory daily gas readings

```
┌─────────────────────────────────────────┐
│ SHIFT REPORT                            │
│ Shift B | 30 Aug 2026                  │
│ Reporter: Arun Mandal (Overman)         │
│ Zone: District 4, Face 2               │
├─────────────────────────────────────────┤
│ MANPOWER DEPLOYED                       │
│ ┌──────────────────────────────────┐   │
│ │  Total workers: [32]              │   │
│ │  Regular: [24]  Contract: [8]    │   │
│ └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│ GAS READINGS (CMR Reg 116 — Mandatory) │
│                                         │
│ Station 1 — Face Entry                 │
│ CH4: [0.3] %  CO: [0] ppm  CO2: [0.1]%│
│ O2: [20.8] %                           │
│                                         │
│ Station 2 — Return Airway              │
│ CH4: [0.5] %  CO: [0] ppm             │
│                                         │
│ ⚠️ WARNING:                             │
│  CH4 > 1.25% → automatic Mine Manager │
│  alert (processed synchronously)       │
├─────────────────────────────────────────┤
│ PRODUCTION (Optional — if Overman role) │
│ Coal raised: [1,200] tonnes            │
│ OB removed: [3,400] BCM               │
├─────────────────────────────────────────┤
│ SHIFT OBSERVATIONS  [+ Add]            │
│ ─────────────────────────────────────── │
│ Area: [Face 2]                         │
│ Status: [Normal ▾]                     │
│ Description: [All operations normal]   │
│ ─────────────────────────────────────── │
├─────────────────────────────────────────┤
│ EQUIPMENT STATUS  [+ Add HEMM]         │
│ Shovel S-1: [Operational ▾]           │
│ Dumper D-7: [Under Maintenance ▾]     │
├─────────────────────────────────────────┤
│ HANDOVER NOTES (for next shift Overman)│
│ ┌───────────────────────────────────┐  │
│ │ Pump P-3 vibrating — maintenance  │  │
│ │ team notified, monitor closely    │  │
│ └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│ GPS: ✅ verified  Sync: 🔴 Offline     │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │    COMPLETE & HANDOVER  ✅       │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

### 5.10 Worker Attendance Screen

**Route:** `/(app)/attendance`  
**WatermelonDB:** `attendance_records` table  
**Supabase:** `attendance_records` (synced)

```
┌─────────────────────────────────────────┐
│ WORKER ATTENDANCE                       │
│ Shift A | 30 Aug 2026                  │
│ Mine: Rajmahal OCP                      │
├─────────────────────────────────────────┤
│ MODE:                                   │
│ [📷 QR Scan ●]  [✏ Manual Entry]       │
├─────────────────────────────────────────┤
│ ╔═══════════════════════════════════╗   │
│ ║  [Camera viewfinder]              ║   │
│ ║  Align worker badge QR code       ║   │
│ ║  within the frame                 ║   │
│ ╚═══════════════════════════════════╝   │
├─────────────────────────────────────────┤
│ RECENT SCANS (last 10)                 │
│ ─────────────────────────────────────── │
│ ✅ Ramesh Kumar (EMP-2341)             │
│    06:12 AM | Inside geo-fence         │
│ ─────────────────────────────────────── │
│ ✅ Sunita Devi (CONT-ABC-087)          │
│    06:14 AM | Inside geo-fence         │
│ ─────────────────────────────────────── │
│ ⚠️ John Das (CONT-XYZ-012)            │
│    Training cert EXPIRED               │
│    [Allow ▸]  [Block ✗]              │
│    ← Mine Manager decision required    │
├─────────────────────────────────────────┤
│ SHIFT SUMMARY                           │
│ 47 scanned | 31 regular | 16 contract  │
│ 5 pending | 1 flagged                  │
│ Geo-fence: ✅ Rajmahal OCP (8m acc)    │
├─────────────────────────────────────────┤
│ [Close Shift Attendance ✅]             │
└─────────────────────────────────────────┘
```

**Geo-fence Logic:**
- Worker GPS > 500m from mine boundary → `location_mismatch = true` flag (not rejected)
- Server validates on sync — flagged for Mine Manager review
- `expo-barcode-scanner` handles QR scan
- Works fully offline — records queued in WatermelonDB

**Workflow Connection:** Implements **Workflow 4 (Worker Attendance)** — real-time geo-fenced attendance capture.

---

### 5.11 Sync Status Screen

**Route:** `/(app)/profile/sync`  
**WatermelonDB:** all tables with `sync_status = 'pending_sync'`

```
┌─────────────────────────────────────────┐
│ SYNC STATUS                             │
├─────────────────────────────────────────┤
│ Connectivity                            │
│ 🔴 OFFLINE (last connected 2h 14m ago) │
│                                         │
│ Next sync attempt: when online          │
├─────────────────────────────────────────┤
│ PENDING UPLOADS (12 records)            │
│ ─────────────────────────────────────── │
│ 📋 Inspection — Pit 3 East — 2h ago    │
│    24 checkpoints | 3 violations        │
│ ─────────────────────────────────────── │
│ 👁 Safety Observation × 3 — 1.5h ago  │
│ ─────────────────────────────────────── │
│ 📷 Photos × 8 (11.4 MB)               │
│ ─────────────────────────────────────── │
│ 👥 Attendance × 47 records             │
├─────────────────────────────────────────┤
│ COMPLETED (this session)               │
│ ✅ Incident Report INC-0341 — 06:30 AM │
│ ✅ Shift Report (Shift A) — 06:35 AM  │
├─────────────────────────────────────────┤
│ CONFLICTS (1 item)                      │
│ ⚠️ Observation OBS-0129 — server version│
│    differs from local                   │
│    [Review & Resolve →]                 │
├─────────────────────────────────────────┤
│ STORAGE                                 │
│ Local DB: 142 MB / 500 MB limit        │
│ Photo queue: 11.4 MB                   │
│ [Clear Synced Photos] ← frees space    │
├─────────────────────────────────────────┤
│ [Force Sync Now ▶] ← enabled if online │
└─────────────────────────────────────────┘
```

---

### 5.12 Settings & Profile Screen

**Route:** `/(app)/profile/settings`

```
┌─────────────────────────────────────────┐
│ PROFILE                                 │
│ ─────────────────────────────────────── │
│ 👤 Arun Mandal                          │
│ Role: Field Officer                     │
│ Mine: Rajmahal OCP, ECL                │
│ Employee ID: ECL-FO-2341               │
├─────────────────────────────────────────┤
│ SETTINGS                                │
│ ─────────────────────────────────────── │
│ Language                                │
│ [English ●] [हिंदी] [ओड़िया] [বাংলা]  │
│ ─────────────────────────────────────── │
│ Biometric Authentication                │
│ [Enabled ✅ toggle]                     │
│ ─────────────────────────────────────── │
│ Offline Storage Limit                   │
│ [500 MB ▾]                             │
│ ─────────────────────────────────────── │
│ Auto-sync on Wi-Fi only                 │
│ [Disabled toggle]                       │
│ ─────────────────────────────────────── │
│ Notification Preferences               │
│ Critical Alerts:  [Always ON] (locked) │
│ CAPA Assigned:    [On ✅]               │
│ Compliance Due:   [On ✅]               │
│ Daily Summary:    [Off toggle]          │
├─────────────────────────────────────────┤
│ ABOUT                                   │
│ COMET Field App v1.0.0 (Build 42)      │
│ EAS Update: Loaded v1.0.0-patch.2      │
│ [Send Feedback]  [View Changelog]       │
├─────────────────────────────────────────┤
│ [Sign Out]                              │
└─────────────────────────────────────────┘
```

---

### 5.13 Critical Alarm Overlay

**Trigger:** Notifee `fullScreenAction` on Android when `comet_alarm = "true"` in FCM payload  
**iOS:** Critical alert notification with `interruptionLevel: 'critical'`

```
┌─────────────────────────────────────────┐
│███████████████████████████████████████ │
│█                                      █ │
│█       🚨  CRITICAL ALERT  🚨         █ │
│█                                      █ │
│█  HIGH METHANE CONCENTRATION          █ │
│█                                      █ │
│█  CH₄ Reading: 1.85%                  █ │
│█  Location: Face Entry — Station 1    █ │
│█  Mine: Rajmahal OCP                  █ │
│█  Time: 14:42 AM                      █ │
│█                                      █ │
│█  ▶ STOP ALL WORK IMMEDIATELY         █ │
│█  ▶ EVACUATE AFFECTED AREA            █ │
│█  ▶ DO NOT USE ELECTRICAL EQUIPMENT  █ │
│█                                      █ │
│█  ┌────────────────────────────────┐  █ │
│█  │   ACKNOWLEDGE & EVACUATING  ✅  │  █ │
│█  └────────────────────────────────┘  █ │
│█                                      █ │
│█  [View Full Details →]               █ │
│█                                      █ │
│███████████████████████████████████████ │
│  🔊 ALARM PLAYING — Cannot dismiss    │
│     until acknowledged                 │
└─────────────────────────────────────────┘
```

**Implementation:**
- Notifee `IMPORTANCE_HIGH` channel with `bypassDnd: true`
- `ongoing: true`, `autoCancel: false` — cannot be swiped away
- `vibrationPattern: [0, 500, 300, 500]` — aggressive vibration
- Sound: `comet_alarm.wav` in `android/app/src/main/res/raw/`
- On acknowledge: PATCH to `/api/v1/alerts/{id}/acknowledge` (queued if offline)
- **Offline-safe:** Notifee fires the alarm locally the moment CH4 > 1.5% is entered, with zero server dependency. Sync push queued for escalation when connectivity returns.

---

### 5.14 Grievance & AI Chatbot Screen

**Route:** `/(app)/grievance`  
**WatermelonDB:** `audio_queue` table (offline audio queuing)  
**Supabase:** `grievances` table + FastAPI `/api/v1/grievances/chatbot/session`  
**AI:** Gemini GrievanceAudioAgent (voice) + Gemini WorkerChatbotAgent (chat)

```
┌─────────────────────────────────────────┐
│ GRIEVANCE & HELP                       │
├─────────────────────────────────────────┤
│ [File New Grievance 🎤] [My Status 📋]│
├─────────────────────────────────────────┤
│ AI ASSISTANT (Gemini)                  │
│ Respond in your language               │
│ ─────────────────────────────────────── │
│ 🤖 नमस्ते! मैं COMET सहायक हूं।       │
│    आप हिंदी में बात कर सकते हैं।     │
│ ─────────────────────────────────────── │
│ 👤 मेरी शिकायत का क्या हुआ?        │
│ ─────────────────────────────────────── │
│ 🤖 आपकी शिकायत (GR-2341) Safety    │
│    Officer को दी गई है।              │
│    जवाब: 2 दिनों में मिलेगा।         │
│ ─────────────────────────────────────── │
├─────────────────────────────────────────┤
│ [🎤 Record Voice]  [Type message...]  │
└─────────────────────────────────────────┘
```

**Voice Grievance Flow:**
1. Worker taps [Record Voice] → `expo-av` records audio locally
2. Recording saved as local file → written to `audio_queue` WatermelonDB table (`sync_status: 'pending'`)
3. On connectivity → audio uploaded to Supabase Storage → FastAPI `/ai/grievance/process-audio`
4. Gemini Audio API → `{transcription, category, priority, summary, language_detected}`
5. Grievance record auto-created → worker notified via push + chatbot confirmation message

**Text/Chat Flow:**
1. Worker types in any language → sent to FastAPI `/grievances/chatbot/session/{session_id}`
2. Gemini WorkerChatbotAgent responds in detected language
3. If intent = file grievance: agent calls `file_grievance` tool → record created
4. If intent = status check: agent calls `get_grievance_status` tool → responds naturally

**My Status View** (`/grievance/status`):
```
┌─────────────────────────────────────────┐
│ MY GRIEVANCES                          │
│                                        │
│ GR-2341 — Safety Issue               │
│ Filed: 28 Aug 2026 (voice, Hindi)     │
│ Status: 🟡 Under Review               │
│ Assigned to: Safety Officer            │
│                                        │
│ GR-2318 — Wages Discrepancy          │
│ Filed: 15 Aug 2026 (text)             │
│ Status: ✅ Resolved (22 Aug 2026)     │
└─────────────────────────────────────────┘
```

**Workflow Connection:** Implements **Workflow 7 (Grievance Handling)** end-to-end including offline audio queuing, Gemini multilingual processing, and conversational status checking.

---

## 6. Offline-First Strategy

### 6.1 WatermelonDB Schema

```typescript
// src/db/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [

    // ── Inspections ──────────────────────────────────────────────────
    tableSchema({
      name: 'inspections',
      columns: [
        { name: 'server_id',          type: 'string',  isOptional: true },
        { name: 'mine_id',            type: 'string' },
        { name: 'inspection_type',    type: 'string' },  // inspection_type_enum
        { name: 'template_id',        type: 'string',  isOptional: true },
        { name: 'zone',               type: 'string',  isOptional: true },
        { name: 'shift',              type: 'string' },  // shift_enum
        { name: 'geo_stamp_start',    type: 'string' },  // JSONB as JSON string
        { name: 'geo_stamp_end',      type: 'string',  isOptional: true },
        { name: 'started_at',         type: 'number' },  // Unix ms
        { name: 'completed_at',       type: 'number',  isOptional: true },
        { name: 'status',             type: 'string' },  // inspection_status enum
        { name: 'current_section',    type: 'number',  isOptional: true },
        { name: 'inspector_notes',    type: 'string',  isOptional: true },
        { name: 'signature_data',     type: 'string',  isOptional: true },
        { name: 'sync_status',        type: 'string' },  // 'pending_sync' | 'synced'
      ],
    }),

    // ── Observations ─────────────────────────────────────────────────
    tableSchema({
      name: 'observations',
      columns: [
        { name: 'inspection_id',      type: 'string' },  // WatermelonDB local ID
        { name: 'server_id',          type: 'string',  isOptional: true },
        { name: 'checklist_item_id',  type: 'string',  isOptional: true },
        { name: 'result',             type: 'string' },  // 'ok' | 'non_compliant' | 'observation'
        { name: 'description',        type: 'string',  isOptional: true },
        { name: 'severity',           type: 'string',  isOptional: true },  // obs_severity
        { name: 'statute_ref',        type: 'string',  isOptional: true },
        { name: 'zone',               type: 'string',  isOptional: true },
        { name: 'geo_stamp',          type: 'string' },  // JSONB string
        { name: 'local_photo_paths',  type: 'string',  isOptional: true },  // JSON array string
        { name: 'voice_note_path',    type: 'string',  isOptional: true },
        { name: 'violation_auto_create', type: 'boolean' },
        { name: 'sync_status',        type: 'string' },
        { name: 'photos_synced',      type: 'boolean' },
      ],
    }),

    // ── Incident Reports ─────────────────────────────────────────────
    tableSchema({
      name: 'incident_reports',
      columns: [
        { name: 'server_id',            type: 'string',  isOptional: true },
        { name: 'mine_id',              type: 'string' },
        { name: 'incident_type',        type: 'string' },  // incident_type_enum
        { name: 'description',          type: 'string' },
        { name: 'severity',             type: 'string' },
        { name: 'zone',                 type: 'string',  isOptional: true },
        { name: 'shift',                type: 'string' },
        { name: 'geo_stamp',            type: 'string' },
        { name: 'persons_involved',     type: 'string',  isOptional: true }, // JSONB
        { name: 'immediate_actions',    type: 'string',  isOptional: true },
        { name: 'local_photo_paths',    type: 'string',  isOptional: true },
        { name: 'ai_suggested_severity',type: 'string',  isOptional: true },
        { name: 'occurred_at',          type: 'number' },
        { name: 'sync_status',          type: 'string' },
        { name: 'priority_sync',        type: 'boolean' }, // true for critical/fatal
      ],
    }),

    // ── Safety Observations (STOP Card) ──────────────────────────────
    tableSchema({
      name: 'safety_observations',
      columns: [
        { name: 'server_id',            type: 'string',  isOptional: true },
        { name: 'mine_id',              type: 'string' },
        { name: 'obs_type',             type: 'string' },  // unsafe_act/condition/positive
        { name: 'category',             type: 'string' },
        { name: 'zone',                 type: 'string' },
        { name: 'description',          type: 'string',  isOptional: true },
        { name: 'assigned_to_id',       type: 'string',  isOptional: true },
        { name: 'geo_stamp',            type: 'string' },
        { name: 'local_photo_path',     type: 'string',  isOptional: true },
        { name: 'voice_note_path',      type: 'string',  isOptional: true },
        { name: 'observed_at',          type: 'number' },
        { name: 'sync_status',          type: 'string' },
      ],
    }),

    // ── Attendance Records ────────────────────────────────────────────
    tableSchema({
      name: 'attendance_records',
      columns: [
        { name: 'server_id',            type: 'string',  isOptional: true },
        { name: 'mine_id',              type: 'string' },
        { name: 'worker_id',            type: 'string' },
        { name: 'worker_type',          type: 'string' },  // regular/contract
        { name: 'shift',                type: 'string' },
        { name: 'check_in_at',          type: 'number' },
        { name: 'geo_stamp',            type: 'string' },
        { name: 'location_mismatch',    type: 'boolean' },
        { name: 'training_expired',     type: 'boolean' },
        { name: 'flagged_for_review',   type: 'boolean' },
        { name: 'sync_status',          type: 'string' },
      ],
    }),

    // ── Shift Reports ─────────────────────────────────────────────────
    tableSchema({
      name: 'shift_reports',
      columns: [
        { name: 'server_id',            type: 'string',  isOptional: true },
        { name: 'mine_id',              type: 'string' },
        { name: 'zone',                 type: 'string' },
        { name: 'shift',                type: 'string' },
        { name: 'report_date',          type: 'number' },
        { name: 'workforce_count',      type: 'number' },
        { name: 'regular_count',        type: 'number' },
        { name: 'contract_count',       type: 'number' },
        { name: 'gas_readings',         type: 'string' },  // JSONB
        { name: 'shift_observations',   type: 'string',  isOptional: true }, // JSONB
        { name: 'equipment_status',     type: 'string',  isOptional: true }, // JSONB
        { name: 'production_coal',      type: 'number',  isOptional: true },
        { name: 'production_ob',        type: 'number',  isOptional: true },
        { name: 'handover_notes',       type: 'string',  isOptional: true },
        { name: 'geo_stamp',            type: 'string' },
        { name: 'sync_status',          type: 'string' },
        { name: 'ch4_alert_fired',      type: 'boolean' },
      ],
    }),

    // ── Audio Queue (Voice notes — offline Gemini Audio queuing) ─────────
    tableSchema({
      name: 'audio_queue',
      columns: [
        { name: 'server_id',            type: 'string',  isOptional: true },
        { name: 'mine_id',              type: 'string' },
        { name: 'worker_id',            type: 'string' },
        { name: 'local_audio_path',     type: 'string' },  // expo-av local URI
        { name: 'purpose',              type: 'string' },  // 'grievance' | 'inspection_note' | 'incident'
        { name: 'entity_local_id',      type: 'string',  isOptional: true }, // parent record local ID
        { name: 'language_hint',        type: 'string',  isOptional: true }, // 'hi'|'bn'|'or'|'mr'|'en'
        { name: 'gemini_result',        type: 'string',  isOptional: true }, // JSONB once processed
        { name: 'recorded_at',          type: 'number' },
        { name: 'sync_status',          type: 'string' }, // 'pending'|'uploaded'|'processed'|'failed'
      ],
    }),

    // ── Checklist Templates (cached, read-only) ───────────────────────

    tableSchema({
      name: 'checklist_templates',
      columns: [
        { name: 'server_id',            type: 'string' },
        { name: 'inspection_type',      type: 'string' },
        { name: 'title',                type: 'string' },
        { name: 'items_json',           type: 'string' }, // full JSONB
        { name: 'version',              type: 'number' },
        { name: 'cached_at',            type: 'number' },
      ],
    }),
  ],
});
```

### 6.2 Sync Engine

```typescript
// src/sync/syncEngine.ts
import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../db';
import { apiFetch } from '../lib/api';

export async function performSync(): Promise<void> {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const data = await apiFetch('/api/v1/sync/pull', {
        method: 'POST',
        body: JSON.stringify({ last_pulled_at: lastPulledAt }),
      });
      return data; // { changes: { table: { created, updated, deleted } }, timestamp }
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      await apiFetch('/api/v1/sync/push', {
        method: 'POST',
        body: JSON.stringify({ changes, last_pulled_at: lastPulledAt }),
      });
    },
    migrationsEnabledAtVersion: 1,
  });
}

// Trigger points:
// 1. expo-background-task (when app backgrounded + connectivity available)
// 2. NetInfo 'connected' event (app foreground)
// 3. Manual "Force Sync Now" button in SyncStatusScreen
// 4. Post incident-report submit (priority flush)
```

### 6.3 Conflict Resolution Rules

| Entity | Strategy | Rationale |
|---|---|---|
| `inspections` | Last-write-wins on metadata; never drop `submitted` records | Append-only field capture |
| `observations` | Server wins on `violation_id`; local wins on `description` edits | Inspector may annotate post-sync |
| `attendance_records` | Server authoritative — geo-fence validated server-side | Prevents client override of location check |
| `incident_reports` | **Both versions kept** — flagged in conflict queue for Mine Manager | Critical safety — absolutely no silent data loss |
| `safety_observations` | Local wins (field is authoritative — no server edits during capture) | Real-time field data |
| `shift_reports` | Last-write-wins; `ch4_alert_fired` is immutable once `true` | Gas alerts are one-way safety flags |

### 6.4 Background Sync (expo-background-task)

```typescript
// Registered in app/_layout.tsx useEffect
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import NetInfo from '@react-native-community/netinfo';

const SYNC_TASK = 'COMET_BACKGROUND_SYNC';

TaskManager.defineTask(SYNC_TASK, async () => {
  const { isConnected } = await NetInfo.fetch();
  if (isConnected) {
    await performSync();
    await uploadPendingMedia();
  }
  return BackgroundTask.BackgroundTaskResult.Success;
});

// Register for periodic execution
await BackgroundTask.registerTaskAsync(SYNC_TASK, {
  minimumInterval: 15 * 60, // 15 minutes minimum (OS may defer)
});
```

---

## 7. Notification System

### 7.1 Architecture Overview — Three-Tier Model

The notification system is split across **three independent channels**, each with a distinct responsibility and delivery mechanism. There is **no dependency on `@react-native-firebase/messaging`** as a standalone library — FCM is used purely as the push transport for `expo-notifications`.

```
┌──────────────────────────────────────────────────────────────────────┐
│                  COMET NOTIFICATION ARCHITECTURE                     │
├──────────────────┬───────────────────────────┬───────────────────────┤
│  TIER 1          │  TIER 2                   │  TIER 3               │
│  Email Reports   │  Mobile Push Alerts       │  Emergency Alarms     │
├──────────────────┼───────────────────────────┼───────────────────────┤
│  Resend API      │  expo-notifications       │  @notifee/react-native│
│  (server-side)   │  (FCM as transport)       │  (native, DND bypass) │
├──────────────────┼───────────────────────────┼───────────────────────┤
│  Statutory PDF   │  CAPA assignments,        │  CH₄ > 1.5%,         │
│  reports, audit  │  compliance alerts,       │  fatal incidents,     │
│  digests, CAPA   │  inspection assigned,     │  evacuation orders    │
│  closure emails  │  document expiry          │                       │
├──────────────────┼───────────────────────────┼───────────────────────┤
│  Triggered by    │  Triggered by             │  Triggered by         │
│  FastAPI backend │  FastAPI → Expo push API  │  FastAPI → Notifee    │
│  via Resend SDK  │  → FCM → device           │  data payload → app   │
└──────────────────┴───────────────────────────┴───────────────────────┘
```

> [!NOTE]
> **Supabase Realtime** is also used on the **web dashboard** for live toast notifications (compliance alerts, CAPA updates, sensor breaches). This is web-only and does not involve the mobile app's push system.

---

### 7.2 Tier 1 — Email (Resend)

**Library:** Resend SDK (server-side only — FastAPI backend)  
**Package:** `resend` (Python) in `backend/requirements.txt`  
**Mobile app involvement:** None — purely server-triggered

**What triggers an email:**

| Event | Recipients | Attachment |
|---|---|---|
| Inspection submitted (HIGH/CRITICAL violations) | Mine Manager, Safety Officer | Inspection PDF report |
| CAPA assigned | Assigned officer | CAPA detail PDF |
| CAPA overdue (> due date) | Mine Manager, Compliance Officer | CAPA status PDF |
| Incident report filed (severity ≥ HIGH) | Mine Manager, Safety Director | Incident report PDF |
| Statutory compliance deadline in 7 days | Compliance Officer, Mine Manager | Compliance calendar |
| Monthly production/compliance digest | Mine Manager, Corporate HQ | Summary PDF |
| Contractor document expiring in 30 days | HR Officer, Mine Manager | License/cert details |

**FastAPI flow:**
```python
# backend: notification_service.py
from resend import Emails

async def send_inspection_report(inspection_id: str, recipients: list[str]):
    pdf_bytes = await generate_inspection_pdf(inspection_id)
    
    Emails.send({
        "from": "reports@comet.coalindia.gov.in",
        "to": recipients,
        "subject": f"Inspection Report — {inspection.mine_name} — {inspection.date}",
        "html": render_email_template("inspection_complete", inspection),
        "attachments": [{
            "filename": f"inspection_{inspection_id}.pdf",
            "content": base64.b64encode(pdf_bytes).decode()
        }]
    })
```

---

### 7.3 Tier 2 — Standard Mobile Push (expo-notifications + FCM)

**Library:** `expo-notifications` (FCM is the underlying Android transport — no separate Firebase SDK needed)  
**Package:** `expo-notifications` (already in `app.json` plugins)

This covers all **non-emergency** mobile alerts: reminders, assignments, status updates, and compliance nudges.

**How it works:**

```
FastAPI backend
  → calls Expo Push API (https://exp.host/--/api/v2/push/send)
  → Expo routes via FCM (Android) / APNs (iOS) → device notification tray
  → expo-notifications foreground handler shows in-app banner
```

**Backend push sender (FastAPI):**
```python
# backend: push_service.py
import httpx

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

async def send_push(expo_token: str, title: str, body: str, data: dict = {}):
    payload = {
        "to": expo_token,          # stored in users.expo_push_token
        "title": title,
        "body": body,
        "data": data,
        "sound": "default",
        "priority": "high",
    }
    async with httpx.AsyncClient() as client:
        await client.post(EXPO_PUSH_URL, json=payload)
```

**Mobile app — foreground handler (in `src/lib/notifications.ts`):**
```typescript
import * as Notifications from 'expo-notifications';

// Show banner even when app is open
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isAlarm = notification.request.content.data?.comet_alarm === 'true';
    // Critical alarms are handled by Notifee (Tier 3), not shown here
    if (isAlarm) return { shouldShowAlert: false, shouldPlaySound: false, shouldSetBadge: false };

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

// Register device token with backend after login
export async function registerAndSyncPushToken(apiBase: string, accessToken: string) {
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId,
  });
  await fetch(`${apiBase}/api/v1/users/me/push-token`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expo_push_token: token }),
  });
}
```

**Priority matrix — Tier 2 events:**

| Priority | Trigger Event | Mobile Behavior |
|---|---|---|
| `high` | CAPA assigned to user | Banner + badge + sound |
| `high` | Compliance overdue > 7 days | Banner + badge + sound |
| `high` | Incident severity=HIGH submitted | Banner + badge |
| `medium` | Inspection assigned to user | Banner |
| `medium` | Compliance due in 7 days | Badge only |
| `medium` | Contractor document expiring in 30 days | Badge only |
| `low` | Daily production summary | Silent / badge |
| `info` | Sync completed successfully | In-app toast only |

---

### 7.4 Tier 3 — Critical Emergency Alarm (Notifee)

**Library:** `@notifee/react-native`  
**Behavior:** Bypasses DND/silent mode, plays native siren, launches fullscreen even from lock screen  
**Use case:** Life-safety emergencies only — CH₄ > 1.5%, fatal incidents, evacuation orders

**How it works:**

```
FastAPI backend detects emergency condition
  → calls Expo Push API with data payload { comet_alarm: "true", ... }
  → FCM delivers data message to device (background)
  → expo-notifications background task receives the message
  → detects comet_alarm flag → delegates entirely to Notifee
  → Notifee displays fullscreen alarm, plays comet_alarm.wav, bypasses DND
  → User MUST tap "Acknowledge & Evacuating" to dismiss
  → App sends PATCH /api/v1/alerts/{id}/acknowledge (queued if offline)
```

**Notifee channel setup (called once at app bootstrap):**
```typescript
// src/lib/notifications.ts
import notifee, { AndroidImportance, AndroidCategory } from '@notifee/react-native';

export async function bootstrapNotifications() {
  // Standard channel — normal priority
  await notifee.createChannel({
    id: 'comet_standard',
    name: 'COMET Alerts',
    importance: AndroidImportance.HIGH,
  });

  // Critical alarm channel — bypasses DND, siren sound
  await notifee.createChannel({
    id: 'comet_critical_alarm',
    name: 'COMET Emergency Alarms',
    importance: AndroidImportance.HIGH,
    sound: 'comet_alarm',              // comet_alarm.wav in android/app/src/main/res/raw/
    bypassDnd: true,
    vibration: true,
    vibrationPattern: [0, 500, 300, 500, 300, 500],
  });
}
```

**Triggering the alarm from the background message handler:**
```typescript
// src/lib/notifications.ts
import * as Notifications from 'expo-notifications';
import notifee, { AndroidCategory, AndroidImportance } from '@notifee/react-native';

// Register background handler
Notifications.registerTaskAsync('BACKGROUND_NOTIFICATION_TASK');

// In TaskManager.defineTask:
TaskManager.defineTask('BACKGROUND_NOTIFICATION_TASK', async ({ data }) => {
  const notification = data as Notifications.Notification;
  const payload = notification.request.content.data;

  if (payload?.comet_alarm === 'true') {
    // Hand off to Notifee for critical alarm
    await notifee.displayNotification({
      title: `🚨 ${payload.title}`,
      body: payload.body,
      android: {
        channelId: 'comet_critical_alarm',
        importance: AndroidImportance.HIGH,
        category: AndroidCategory.ALARM,
        fullScreenAction: { id: 'default' },  // Launch fullscreen even on lock screen
        ongoing: true,                         // Cannot be swiped away
        autoCancel: false,
        actions: [{
          title: '✅ Acknowledge & Evacuating',
          pressAction: { id: 'acknowledge' },
        }],
      },
      ios: {
        critical: true,           // Requires Apple entitlement
        criticalVolume: 1.0,
        sound: 'comet_alarm.wav',
        interruptionLevel: 'critical',
      },
    });
  }
});
```

**Required assets:**
- `android/app/src/main/res/raw/comet_alarm.wav` — native siren file for Android
- `assets/sounds/comet_alarm.wav` — for iOS (referenced in app.json)

**Critical alarm trigger conditions:**

| Condition | Threshold | Alert Text |
|---|---|---|
| Methane gas (CH₄) | > 1.5% | "HIGH METHANE — Evacuate area immediately" |
| Carbon monoxide (CO) | > 50 ppm | "CO BREACH — Evacuate and ventilate" |
| Fatal incident filed | severity = fatal | "FATALITY REPORTED — [Zone]" |
| Evacuation order issued | Mine Manager action | "EVACUATION ORDER — [Mine name]" |
| Inundation detected | sensor trigger | "INUNDATION RISK — Evacuate lower levels" |

> [!CAUTION]
> The `comet_critical_alarm` Notifee channel **must not** be used for non-life-safety events. Overuse will cause users to disable the channel entirely, defeating the safety purpose.

---

### 7.5 Tier 3B — Web Dashboard Live Toasts (Supabase Realtime)

**This is web-only and does not affect the mobile app.**

The web dashboard (`/web`) subscribes to Supabase Realtime channels to show live toast notifications without polling:

```typescript
// web: src/hooks/useRealtimeAlerts.ts
import { supabase } from '../lib/supabase';

supabase
  .channel(`alerts:mine_id=eq.${mineId}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'alerts' },
    (payload) => showToast(payload.new)
  )
  .subscribe();
```

Triggers: sensor breach alerts, new violations, CAPA assignments, compliance deadline breaches.

---

### 7.6 Bootstrap Integration (`app/_layout.tsx`)

```typescript
// app/_layout.tsx
import { bootstrapNotifications, registerAndSyncPushToken } from '../src/lib/notifications';

export default function RootLayout() {
  const { session, apiBase } = useAuthStore();

  useEffect(() => {
    // 1. Create Notifee channels + request permissions
    bootstrapNotifications();

    // 2. Register Expo push token with backend after login
    if (session?.access_token) {
      registerAndSyncPushToken(apiBase, session.access_token);
    }

    // 3. Register background sync task
    registerBackgroundSync();
  }, [session]);
  // ...
}
```

---

## 8. State Management Architecture

### 8.1 Zustand Stores

#### `authStore.ts`
```typescript
interface AuthState {
  session: Session | null;           // Supabase session
  user: User | null;                 // Supabase user
  profile: UserProfile | null;       // COMET user profile (role, mine_id, etc.)
  role: AppRole | null;              // field_officer | mine_manager | safety_officer | ...
  mineId: string | null;             // active mine scope
  permissions: string[];             // 'resource:action' strings from JWT claims
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>; // from expo-secure-store
}
```

#### `appStore.ts`
```typescript
interface AppState {
  isConnected: boolean;              // NetInfo connectivity
  syncQueueCount: number;            // WatermelonDB pending records
  currentShift: 'A' | 'B' | 'C' | 'General' | null;
  lastSyncAt: number | null;         // Unix ms
  pendingMediaMB: number;            // MB of unsent photos/videos
  conflictCount: number;             // WatermelonDB conflicts pending review
  setSyncQueueCount: (count: number) => void;
  setConnected: (v: boolean) => void;
}
```

#### `alertStore.ts`
```typescript
interface AlertState {
  alerts: Alert[];                   // Latest from Supabase Realtime
  unreadCount: number;
  addAlert: (alert: Alert) => void;
  markRead: (alertId: string) => void;
  markAllRead: () => void;
}
```

### 8.2 Full AuthContext Implementation Plan

The current `AuthContext.tsx` stub must be replaced with:

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check stored session (offline restore)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session) {
          // Extract role from JWT app_metadata / user_metadata
          const role = session.user.app_metadata?.role;
          const mineId = session.user.app_metadata?.mine_id;
          useAuthStore.getState().setProfile({ role, mineId });
          // Store session for offline restore
          await SecureStore.setItemAsync('supabase_session', JSON.stringify(session));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

---

## 9. API & Sync Architecture

### 9.1 Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false, // Must be false for React Native
    },
  }
);
```

### 9.2 FastAPI Typed Wrapper

```typescript
// src/lib/api.ts
import { supabase } from './supabase';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
}
```

### 9.3 Key API Endpoints (FastAPI)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/sync/pull` | Pull server changes since `last_pulled_at` |
| `POST` | `/api/v1/sync/push` | Push local WatermelonDB changes to Supabase |
| `POST` | `/api/v1/media/upload-url` | Get signed Supabase Storage URL for photo upload |
| `POST` | `/api/v1/media/confirm` | Confirm media upload + link to entity |
| `PATCH` | `/api/v1/users/me/push-token` | Register FCM push token |
| `POST` | `/api/v1/alerts/gas-emergency` | **Synchronous** — CH₄ > 1.5% immediate alert |
| `GET` | `/api/v1/checklist-templates` | Fetch templates for offline caching |
| `POST` | `/api/v1/ai/classify-incident` | AI severity/category suggestion |
| `PATCH` | `/api/v1/alerts/{id}/acknowledge` | Mark critical alert acknowledged |

---

## 10. Missing Dependencies & Install Commands

### 10.1 Core COMET Packages (Not in current `package.json`)

```bash
# Run from: c:\Coding\SIH2026\app\

# ── Offline Database ──────────────────────────────────────────────
npx expo install @nozbe/watermelondb

# ── State Management ──────────────────────────────────────────────
npx expo install zustand @tanstack/react-query

# ── Supabase ──────────────────────────────────────────────────────
npx expo install @supabase/supabase-js
npx expo install expo-secure-store         # Session storage (already in package.json? check)

# ── Authentication ────────────────────────────────────────────────
npx expo install expo-local-authentication  # Biometric / fingerprint

# ── Camera & Vision ───────────────────────────────────────────────
npx expo install react-native-vision-camera  # High-perf camera (replaces expo-camera)
npx expo install expo-barcode-scanner        # QR badge scan for attendance

# ── Navigation ────────────────────────────────────────────────────
npx expo install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs

# ── Maps & Geo ────────────────────────────────────────────────────
# expo-location is already installed ✅
npx expo install @react-native-maps/maps   # Optional: mini map on geo display

# ── Notifications (Critical Stack) ────────────────────────────────
npx expo install @notifee/react-native     # DND bypass critical alarms
npx expo install @react-native-firebase/app @react-native-firebase/messaging  # FCM
npx expo install expo-device expo-constants  # Required by notifications.ts

# ── Connectivity ──────────────────────────────────────────────────
# @react-native-community/netinfo is already installed ✅

# ── Background Tasks ──────────────────────────────────────────────
npx expo install expo-background-task expo-task-manager  # Background sync

# ── Forms & Validation ────────────────────────────────────────────
npx expo install react-hook-form zod

# ── i18n ─────────────────────────────────────────────────────────
npx expo install i18next react-i18next

# ── Utilities ────────────────────────────────────────────────────
npx expo install @react-native-async-storage/async-storage  # Required by WatermelonDB

# ── Dev Tools ────────────────────────────────────────────────────
npm install -D @types/react-native
```

### 10.2 WatermelonDB Babel Plugin (add to `babel.config.js`)

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [
      'react-native-reanimated/plugin',
      '@nozbe/watermelondb/babel/plugin',  // ← ADD THIS
    ],
  };
};
```

### 10.3 Metro Config (add WatermelonDB resolver)

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// WatermelonDB SQLite resolver
config.resolver.sourceExts.push('mjs');

module.exports = withNativeWind(config, { input: './global.css' });
```

### 10.4 Environment Variables (`.env.local`)

```bash
# c:\Coding\SIH2026\app\.env.local
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_API_URL=http://localhost:8000
```

---

## Appendix: Workflow → Screen Mapping

| Workflow (from `workflows.md`) | Primary Screen | Supporting Screens |
|---|---|---|
| **W0: Daily Report** | Overman Shift Report | Home (pending tasks), Sync Status |
| **W1: Compliance Task & Escalation** | Home (pending tasks) | InspectionList, Settings (notifications) |
| **W2: Inspection & CAPA** | InspectionFormScreen | StartInspection, Summary, SafetyObservation |
| **W3: Contractor Management** | — (web-primary) | AttendanceScreen (training cert flags) |
| **W4: Worker Attendance & Grievance** | AttendanceScreen | Home, SyncStatus |
| **W5: Environmental & Production** | OvermanShiftReport | Home alerts, InspectionForm (gas readings) |
| **Critical Alarm (CH₄/Fatal)** | CriticalAlarmOverlay | Everywhere (global modal) |

---

*Document generated: 1 September 2026 | COMET Platform v1.0 | SIH 2026 — 26024*
