# COMET Notification & Realtime System Architecture

This document provides a comprehensive overview of the COMET notification system, detailing its architecture, the root causes of recent critical failures, the applied fixes, and a guide for maintaining and extending the system.

## 1. System Architecture

The notification system in COMET is designed to handle different priority levels with varied delivery channels:

- **Critical**: Triggers a full-screen, bypassing-DND siren on mobile (via Notifee), a Supabase Realtime broadcast (web/app toast), and an FCM high-priority push.
- **High**: Supabase Realtime + FCM standard push.
- **Medium/Low**: Supabase Realtime only (in-app toast & notification center).
- **Email/Statutory**: Resend API (email) + Supabase Realtime.

### The Pipeline
1. **Trigger**: An event occurs in the backend (e.g., `test_notification.py` or a gas threshold breach).
2. **Backend Service**: `notification_service.py` handles the request. It writes the notification to the Postgres `alerts` table and fires off external API calls (Expo Push / Resend).
3. **Database**: The `alerts` table uses Postgres Logical Replication (CDC - Change Data Capture) via Supabase Realtime to broadcast changes.
4. **Mobile App**: 
    - Listens to the `mine_alerts_{mineId}` channel using `@supabase/supabase-js`.
    - Updates local WatermelonDB via `useRealtimeAlerts` hook.
    - Triggers `notifee` alarms based on the payload priority.

---

## 2. Why It Failed (The Root Causes)

The system suffered from a cascading series of 4 deep, interacting bugs that caused crashes and silent failures.

> [!WARNING]
> These issues spanned across React Native's core, the new Fabric renderer, backend error handling, and Postgres Row Level Security (RLS).

### A. The Hermes Event Polyfill Crash
**Symptom:** App hard-crashed on launch or when receiving an event with `TypeError: Cannot assign to read-only property 'NONE'`.
**Cause:** React Native 0.74 has a known bug in its `Event.js` internal class. It defined `NONE` as both a Babel-transpiled instance property (`this.NONE = 0`) and a read-only prototype property. `supabase-js` imports `event-target-shim` under the hood for WebSockets, triggering this class constructor. Hermes strictly enforces property constraints, causing an immediate crash.

### B. The Fabric Shadow Tree Crash
**Symptom:** App crashed randomly when interacting with the UI with `java.lang.IllegalStateException: addViewAt: failed to insert view`.
**Cause:** React Native's new Fabric architecture struggles to synchronize its shadow tree with the Android UI tree when views inside a `FlatList` (or a conditional `<Modal>`) are dynamically mounted/unmounted rapidly—especially when those views are tied to reactive WatermelonDB queries.

### C. The Silent Backend Transaction Rollback
**Symptom:** Notifications worked randomly or not at all, with no visible error on the frontend.
**Cause:** The backend `notification_service.py` attempted to send Expo Pushes synchronously. If the network blocked the request (e.g., corporate firewall blocking `exp.host` with `WinError 1225`), the resulting Python exception caused the entire SQLAlchemy database transaction to roll back. Because the `alerts` record was never committed, Supabase Realtime never broadcasted the event.

### D. Supabase Realtime RLS Block
**Symptom:** The frontend reported `[REALTIME] Channel ... status: SUBSCRIBED`, but no Postgres change events were ever received.
**Cause:** The frontend was running in a dev-bypass mode (`DEV_BYPASS_AUTH = true`), connecting to Supabase using the `anon` key (no JWT session). The `alerts` table had RLS enabled, but only had a `SELECT` policy for `authenticated` users. Realtime runs CDC queries as the subscribing role. Because `anon` had no `SELECT` access, Postgres silently dropped the change events before they left the server.

---

## 3. How It Was Fixed

### Fix A: Patching React Native
We used `patch-package` to modify `node_modules/react-native/src/private/webapis/dom/events/Event.js`. We stripped out the transpiled instance properties (`this.NONE = 0`, etc.) that were colliding with the read-only prototype definitions. 
*Note: A `postinstall` script was added to `package.json` to automatically apply this patch for all developers.*

### Fix B: Static View Rendering
We refactored `NotificationsScreen`, `NotificationItem`, and `CriticalAlarmModal` to maintain completely static component trees. Instead of unmounting components conditionally (e.g., `{isVisible && <View>}`), we now use `style={{ display: isVisible ? 'flex' : 'none' }}`. For the `FlatList`, we use the `ListEmptyComponent` prop instead of conditionally hiding the list. This prevents Fabric from losing track of view nodes.

### Fix C: Fault-Tolerant Backend Dispatch
In `notification_service.py`, we wrapped the external HTTP calls (`_send_expo_push` and `_send_resend_email`) in `try-except` blocks. If an external Push API fails, the error is logged, but it no longer crashes the function or rolls back the Postgres transaction, ensuring the in-app Realtime notification still delivers.

### Fix D: Dev-Bypass RLS Policy
We added a specific `SELECT` policy for the `anon` role to the `alerts` table. This allows the Realtime engine to forward CDC events to the frontend even when bypassing standard authentication.

> [!CAUTION]
> The `alerts_anon_select` RLS policy in `supabase/migrations/20260916000000_add_expo_push_token_and_realtime.sql` MUST be removed before production to ensure secure data isolation.

---

## 4. In-Depth Implementation Guide

If you need to extend or maintain this system, follow these patterns.

### A. Backend: Triggering Notifications
Always use the helper functions in `services/notification_service.py` to trigger alerts. **Never insert directly into the `alerts` table from application code.**

```python
from services.notification_service import alert_mine_manager

await alert_mine_manager(
    mine_id="0000-...",
    title="High CH4 Level",
    body="Evacuate section A.",
    priority="critical", # Routes to Notifee Alarm + Push + Realtime
    db=db
)
```

### B. Frontend: The Realtime Hook
The `useRealtimeAlerts` hook is the core of the client-side system. It mounts at the top level of the app and listens to the WebSocket.

**Key responsibilities of the hook:**
1. Validates the incoming payload against the current user's ID to prevent cross-talk.
2. Writes the incoming alert to the local WatermelonDB instance for offline caching and UI reactivity.
3. Parses the priority. If it's `critical`, it invokes `@notifee/react-native` to trigger a full-screen, sound-bypassing alarm.
4. Adds the alert to the Zustand `useAlertStore` for the floating UI Toast.

> [!TIP]
> The `supabase-js` client automatically handles WebSocket reconnections. If you need to debug connectivity, check the `status` string in the `.subscribe((status, err) => {...})` callback.

### C. Frontend: Supabase Client Configuration
The Supabase client is initialized in `src/lib/supabase.ts`.

- **Do NOT manually set the `realtime: { endpoint }` option.** The `supabase-js` library automatically derives the correct WebSocket URL (e.g., `ws://host:port/realtime/v1`) from the base `supabaseUrl`.
- **Kong Proxy:** All local Supabase traffic (REST, GraphQL, Auth, Realtime) routes through port `54321`.

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
  },
  // realtime.endpoint is NOT required.
});
```

### D. Managing Fabric UI Stability
When building new UI components that react to notifications (or WatermelonDB data streams), **avoid conditional rendering that adds/removes elements from the DOM.**

- **Incorrect (Will crash Fabric):**
  ```tsx
  {hasAlert && <View style={styles.alert} />}
  ```
- **Correct (Static tree):**
  ```tsx
  <View style={[styles.alert, { display: hasAlert ? 'flex' : 'none' }]} />
  ```
