# COMET Mobile App — Demo Workflow Implementation Plan
**For: Mobile Developer**  
**Context:** SIH 2026 Presentation Demo  
**App Stack:** React Native + Expo Router + NativeWind + Zustand + TanStack Query  
**Backend:** FastAPI @ `http://10.0.2.2:8000` (Android emulator) or `http://localhost:8000` (iOS sim)

---

## What We Are Building

The mobile app must demonstrate one complete end-to-end workflow for the SIH presentation:

> **Mine Manager opens app → logs in → sees their inspection list → starts a new Environmental Gas Inspection → records gas readings (CH₄, O₂, CO₂, etc.) → taps "Analyze" → AI anomaly engine returns risk score + anomaly cards → submits → AI-generated report card appears → notification badge fires**

**Total new screens: 5**  
**Total new components: 6**  
**Estimated build time: 1–2 days**

---

## 1. Current State vs. What We Need

| Screen/Feature | Current State | What's Needed |
|---|---|---|
| Login | ✅ Stub exists at `(auth)/login.tsx` | Rewrite with demo bypass logic |
| Home | ✅ Stub exists | Add "Pending Inspections" task card |
| Inspection List | ⚠️ Placeholder — `"No active inspections"` | Full list fetched from API |
| Start Inspection | ❌ Missing | New screen: mine + template dropdowns |
| Inspection Form | ❌ Missing (only web simulator exists) | New gas-aware observation form |
| Anomaly Analysis | ❌ Missing | New results screen after "Analyze" tap |
| Report Card | ❌ Missing | New AI-generated report screen |

---

## 2. Auth Strategy for Demo

> **For the demo, do NOT implement real Supabase Auth. Use a hardcoded demo session bypass.**
> The backend auth has been updated to do DB lookups — it accepts any valid JWT `sub` that exists in the `users` table. We will hardcode the demo user's token.

### 2.1 Demo Credentials

The seed script (`backend/seed_demo.py`) creates these users:

| Role | Name | Email | Mine |
|---|---|---|---|
| `mine_manager` | Rajesh Kumar | `rajesh.k@umrer.wcl.in` | Umrer OCP |
| `field_officer` | Sunil Patil | `sunil.p@umrer.wcl.in` | Umrer OCP |

### 2.2 Auth Bypass Implementation

**File: `src/lib/demoAuth.ts`** ← **[NEW FILE]**

```typescript
// Demo-only auth bypass. Replace with real Supabase auth after presentation.
export const DEMO_USERS = {
  mine_manager: {
    userId: 'MINE_MANAGER_UUID_FROM_SEED',  // Fill after running seed_demo.py
    name: 'Rajesh Kumar',
    role: 'mine_manager' as const,
    mineId: '00000000-0000-0000-0000-000000000004',
    mineName: 'Umrer OCP',
    // A long-lived JWT generated for this user from Supabase Dashboard
    // Settings → API → JWT → Generate token for user
    token: 'PASTE_SUPABASE_JWT_HERE',
  },
  field_officer: {
    userId: 'FIELD_OFFICER_UUID_FROM_SEED',
    name: 'Sunil Patil',
    role: 'field_officer' as const,
    mineId: '00000000-0000-0000-0000-000000000004',
    mineName: 'Umrer OCP',
    token: 'PASTE_SUPABASE_JWT_HERE',
  },
};

export type DemoUser = typeof DEMO_USERS[keyof typeof DEMO_USERS];
```

**File: `src/lib/api.ts`** ← **[MODIFY]**

Change `getAuthHeaders()` to read from `useAuthStore` instead of Supabase session:

```typescript
import { useAuthStore } from '../stores/authStore';

async function getAuthHeaders() {
  // Read the demo token stored at login time
  const token = useAuthStore.getState().session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
```

**File: `app/(auth)/login.tsx`** ← **[REWRITE]**

Replace the existing login screen with a demo role selector:

```tsx
import { DEMO_USERS } from '../../src/lib/demoAuth';
import { useAuthStore } from '../../src/stores/authStore';
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);

  const loginAs = (role: keyof typeof DEMO_USERS) => {
    const user = DEMO_USERS[role];
    setAuth(
      { access_token: user.token, user: { id: user.userId, email: '' } } as any,
      { id: user.userId, email: '' },
      user.role as any,
      user.mineId,
    );
    router.replace('/(app)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-navy justify-center px-6">
      {/* COMET Logo */}
      <View className="items-center mb-12">
        <Text className="text-white text-3xl font-bold">COMET</Text>
        <Text className="text-amber text-sm mt-1">Coal Operations Monitoring, Enforcement & Transparency</Text>
        <Text className="text-slate-400 text-xs mt-2">SIH 2026 — Ministry of Coal</Text>
      </View>

      <Text className="text-slate-400 text-center text-sm mb-6">Select demo role to continue</Text>

      <TouchableOpacity
        onPress={() => loginAs('mine_manager')}
        className="bg-amber rounded-2xl py-5 px-6 mb-4"
      >
        <Text className="text-navy font-bold text-lg">👷 Mine Manager</Text>
        <Text className="text-navy/70 text-sm">Rajesh Kumar — Umrer OCP</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => loginAs('field_officer')}
        className="border border-slate-600 rounded-2xl py-5 px-6"
      >
        <Text className="text-white font-bold text-lg">🔍 Field Officer</Text>
        <Text className="text-slate-400 text-sm">Sunil Patil — Umrer OCP</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
```

---

## 3. API Hooks

**File: `src/hooks/useInspectionApi.ts`** ← **[NEW FILE]**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

// Templates
export function useChecklistTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get('/api/v1/inspections/templates'),
    staleTime: 5 * 60 * 1000,
  });
}

// Inspections list
export function useInspections(mineId: string) {
  return useQuery({
    queryKey: ['inspections', mineId],
    queryFn: () => api.get(`/api/v1/inspections?mine_id=${mineId}`),
    enabled: !!mineId,
  });
}

// Single inspection detail
export function useInspectionDetail(id: string) {
  return useQuery({
    queryKey: ['inspection', id],
    queryFn: () => api.get(`/api/v1/inspections/${id}`),
    enabled: !!id,
  });
}

// Create inspection
export function useCreateInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: {
      mine_id: string;
      checklist_template_id: string;
      inspection_type: string;
      zone: string;
      scheduled_date: string;
    }) => api.post('/api/v1/inspections', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspections'] }),
  });
}

// Add observation
export function useAddObservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ inspectionId, data }: { inspectionId: string; data: any }) =>
      api.post(`/api/v1/inspections/${inspectionId}/observations`, data),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['inspection', vars.inspectionId] }),
  });
}

// Analyze
export function useAnalyzeInspection() {
  return useMutation({
    mutationFn: (inspectionId: string) =>
      api.post(`/api/v1/inspections/${inspectionId}/analyze`, {}),
  });
}

// Submit
export function useSubmitInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inspectionId: string) =>
      api.post(`/api/v1/inspections/${inspectionId}/submit`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inspections'] }),
  });
}

// Report summary (with Gemini AI sections)
export function useInspectionReport(inspectionId: string) {
  return useQuery({
    queryKey: ['report', inspectionId],
    queryFn: () => api.get(`/api/v1/reports/inspection/${inspectionId}/summary`),
    enabled: !!inspectionId,
  });
}
```

---

## 4. Screen-by-Screen Implementation

### 4.1 Inspection List Screen

**File:** `app/(app)/inspect/index.tsx` ← **[REWRITE]**

- Load `mineId` from `useAuthStore(s => s.mineId)`
- Call `useInspections(mineId)`
- Show 3 sections: Active (status = `in_progress`/`draft`), Scheduled, Completed
- "Continue" → `/(app)/inspect/[id]/form`
- "+ New" button → `/(app)/inspect/start`
- "View Report" → `/(app)/inspect/[id]/report`

```
┌──────────────────────────────────┐
│  INSPECTIONS          [+ New]   │
│  Umrer OCP                      │
│                                 │
│  ── ACTIVE ─────────────────── │
│  🔵 Environmental Gas           │
│  Pit 3 East · Today · 4 obs    │
│  [████░░░░░] 4/15 items        │
│  [Continue →]                  │
│                                 │
│  ── COMPLETED ─────────────── │
│  ✅ Internal Safety Committee   │
│  3 Sep 2026 · 12 obs · Synced  │
│  [View Report →]               │
└──────────────────────────────────┘
```

---

### 4.2 Start Inspection Screen

**File:** `app/(app)/inspect/start.tsx` ← **[NEW]**

- Fetch templates via `useChecklistTemplates()`
- Show Inspection Type picker (from template names)
- Auto-select matching template when type changes
- Zone input pre-filled with "Pit 3 East"
- Mine auto-filled from authStore (read-only)
- On submit: `useCreateInspection()` → navigate to `/(app)/inspect/[id]/form`

```
┌──────────────────────────────────┐
│  ← START NEW INSPECTION         │
│                                 │
│  INSPECTION TYPE                │
│  [Environmental Gas ▾]         │
│                                 │
│  CHECKLIST TEMPLATE             │
│  [Gas & Air Quality — CMR ▾]   │
│                                 │
│  ZONE / AREA                    │
│  [Pit 3 East              ]    │
│                                 │
│  MINE (auto)                    │
│  Umrer OCP — WCL               │
│                                 │
│  [  🚀 START INSPECTION  ]     │
└──────────────────────────────────┘
```

---

### 4.3 Inspection Form Screen ← CORE

**File:** `app/(app)/inspect/[id]/form.tsx` ← **[NEW]**

This is the most critical screen. It iterates through the template's `checklist_items` JSON array and renders each item as either a `GasObservationItem` (for `measurement_required: true`) or a `ChecklistItem` (OK / Non-Compliant / Observation buttons).

**Gas threshold logic (client-side):**

```typescript
const GAS_RULES: Record<string, GasRule> = {
  'GAS-CH4': { dangerAbove: 1.25, warningAbove: 0.25, unit: '%',
    dangerMsg: 'DANGER — Exceeds CMR 2017 Reg. 5(2) evacuation threshold of 1.25%',
    dangerSeverity: 'critical', warningSeverity: 'high' },

  'GAS-O2':  { dangerBelow: 19.5, unit: '%',
    dangerMsg: 'DANGER — Oxygen deficiency. Below CMR Reg. 5(1)(a) minimum 19.5%',
    dangerSeverity: 'critical' },

  'GAS-CO2': { dangerAbove: 0.5, unit: '%',
    dangerMsg: 'EXCEEDS CMR 2017 Reg. 5(1)(c) limit of 0.5%',
    dangerSeverity: 'high' },

  'GAS-CO':  { dangerAbove: 50, unit: 'ppm',
    dangerMsg: 'EXCEEDS CMR 2017 Reg. 5(1)(b) limit of 50 ppm',
    dangerSeverity: 'high' },

  'GAS-H2S': { dangerAbove: 10, unit: 'ppm',
    dangerMsg: 'EXCEEDS CMR 2017 Reg. 5(1)(d) limit of 10 ppm',
    dangerSeverity: 'high' },

  'VENT-FLOW':{ dangerBelow: 30, unit: 'm³/min',
    dangerMsg: 'BELOW CMR 2017 Reg. 68(1) minimum of 30 m³/min per worker',
    dangerSeverity: 'high' },

  'TEMP-WB': { dangerAbove: 33.5, unit: '°C',
    dangerMsg: 'EXCEEDS CMR 2017 Reg. 5(2) wet bulb temperature limit of 33.5°C',
    dangerSeverity: 'high' },

  'DUST-PM10': { dangerAbove: 3, unit: 'mg/m³',
    dangerMsg: 'EXCEEDS CMR 2017 Reg. 106 respirable dust limit of 3 mg/m³',
    dangerSeverity: 'medium' },
};
```

**Auto-description generation:**
When a threshold is breached, auto-fill the description:
```typescript
const autoDescription = `${item.text} measured at ${value}${rule.unit} — ` +
  `exceeds CMR 2017 ${item.regulation} limit in ${zone}.`;
```

**Screen wireframe:**
```
┌──────────────────────────────────┐
│ Environmental Gas Inspection     │
│ Pit 3 East · Umrer OCP         │
│ Progress: [████░░░] 4/15 items  │
├──────────────────────────────────┤
│  GAS-CH4                        │
│  Methane (CH₄) Concentration    │
│  Limit: < 1.25% (CMR Reg. 5(2))│
│                                 │
│  Measured: [  1.4  ] %         │
│  ⚠ DANGER — Exceeds limit!     │
│  Status: Non-Compliant (auto)  │
│  Severity: CRITICAL (auto)     │
│                                 │
│  "CH₄ at 1.4% exceeds CMR     │
│   2017 Reg. 5(2) limit..."     │
│  [Edit ✏️]                      │
│  [✅ Save Observation]         │
├──────────────────────────────────┤
│  GAS-O2                         │
│  Oxygen (O₂) Level              │
│  ...                            │
├──────────────────────────────────┤
│  [🔍 ANALYZE BEFORE SUBMIT]    │
│  (appears after 5+ observations)│
└──────────────────────────────────┘
```

---

### 4.4 Anomaly Analysis Screen

**File:** `app/(app)/inspect/[id]/analyze.tsx` ← **[NEW]**

- Receives analysis result from navigation params (passed from form screen after `useAnalyzeInspection` call)
- Shows: Risk Score arc gauge + anomaly cards list + Submit button

```
┌──────────────────────────────────┐
│  AI ANOMALY ANALYSIS            │
│                                 │
│       [Arc Gauge]               │
│         84/100                  │
│       CRITICAL 🔴               │
│                                 │
│  ── 2 ANOMALIES DETECTED ────  │
│                                 │
│  🔴 CRITICAL: Dangerous         │
│  Co-occurrence                  │
│  CH₄ 1.4% + O₂ 18.9%         │
│  ─────────────────────────     │
│  Simultaneous methane and      │
│  oxygen deficiency — pre-      │
│  firedamp explosion pattern    │
│  CMR 2017, Reg. 5(2) & 68     │
│  → Evacuate immediately        │
│                                 │
│  🟠 HIGH: Recurrence Pattern   │
│  CO₂ non-compliant 2/3 times  │
│  → Systemic ventilation issue  │
│                                 │
│  [  📋 SUBMIT INSPECTION  ]    │
│  [← Back to add more obs]      │
└──────────────────────────────────┘
```

**Risk Gauge Component (`src/components/RiskGauge.tsx`):**
- Use `react-native-svg` + `react-native-reanimated`
- Arc from 135° to 405° (270° span), filled based on score
- Color: 0–30 green, 31–60 amber, 61–80 orange, 81–100 red
- Animate fill on mount

**Anomaly Card Component (`src/components/AnomalyCard.tsx`):**
- Color-coded border/header by severity
- Shows: title, description, regulation reference, recommendation
- Collapsible — tap to expand full description

**Submit button:**
1. `useSubmitInspection(id)` 
2. Show `ActivityIndicator`
3. On success → navigate to `/(app)/inspect/[id]/report`

---

### 4.5 Inspection Report Card Screen

**File:** `app/(app)/inspect/[id]/report.tsx` ← **[NEW]**

- Calls `useInspectionReport(id)` 
- Polls every 2 seconds until `ai_report.executive_summary` is populated (Gemini is generating)
- Max wait: 15 seconds, then show "AI report generating — check back in a moment"

```
┌──────────────────────────────────┐
│  ✅ INSPECTION SUBMITTED        │
│  Umrer OCP · 04 Sep 2026       │
│                                 │
│  RISK SCORE                     │
│  [████████░░] 84/100  CRITICAL  │
│                                 │
│  AT A GLANCE                    │
│  13 obs │ 3 violations         │
│  93%    │ 2 anomalies          │
│                                 │
│  🤖 EXECUTIVE SUMMARY (AI)     │
│  ─────────────────────────────  │
│  "This environmental gas        │
│   inspection at Umrer OCP       │
│   (Pit 3 East) has identified   │
│   a CRITICAL risk condition     │
│   requiring immediate           │
│   operational suspension..."    │
│  [Read more ▾]                  │
│                                 │
│  ⚠️ CRITICAL FINDINGS           │
│  • CH₄: 1.4% > 1.25% limit    │
│    CMR 2017, Reg. 5(2) 🔴      │
│  • O₂: 18.9% < 19.5% min     │
│    CMR 2017, Reg. 5(1)(a) 🔴  │
│                                 │
│  📋 RECOMMENDED ACTIONS (AI)    │
│  1. [NOW] Evacuate Pit 3 East  │
│  2. [24h] Increase ventilation │
│  3. [7d] Submit DGMS report    │
│                                 │
│  🔔 Notifications sent          │
│  Mine Manager · Comp. Officer  │
│  Subsidiary Admin · 3 total    │
└──────────────────────────────────┘
```

**Polling logic:**
```typescript
const { data: report, refetch } = useInspectionReport(id);

useEffect(() => {
  if (report && !report.ai_report?.executive_summary) {
    const timer = setTimeout(() => refetch(), 2000);
    return () => clearTimeout(timer);
  }
}, [report]);
```

---

## 5. Routing — New Files to Create

```
app/(app)/inspect/
├── index.tsx          ← REWRITE existing placeholder
├── start.tsx          ← NEW
└── [id]/
    ├── form.tsx        ← NEW (Core screen)
    ├── analyze.tsx     ← NEW
    └── report.tsx      ← NEW
```

**Create `app/(app)/inspect/_layout.tsx`** ← **[MODIFY — add Stack]**
```typescript
import { Stack } from 'expo-router';

export default function InspectLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="start" options={{ title: 'New Inspection' }} />
      <Stack.Screen name="[id]/form" options={{ title: 'Inspection Form' }} />
      <Stack.Screen name="[id]/analyze" options={{ title: 'AI Analysis' }} />
      <Stack.Screen name="[id]/report" options={{ title: 'Report' }} />
    </Stack>
  );
}
```

---

## 6. New Shared Components

| Component | File | Description |
|---|---|---|
| `RiskGauge` | `src/components/RiskGauge.tsx` | Animated SVG arc 0-100, color by risk level |
| `GasObservationItem` | `src/components/GasObservationItem.tsx` | Gas checklist row: numeric input + auto-severity |
| `ChecklistItem` | `src/components/ChecklistItem.tsx` | OK / Non-Compliant / Observation 3-button row |
| `AnomalyCard` | `src/components/AnomalyCard.tsx` | Anomaly result card: severity color + regulation |
| `ReportSection` | `src/components/ReportSection.tsx` | Collapsible card for AI report sections |
| `SkeletonLoader` | `src/components/SkeletonLoader.tsx` | Animated shimmer placeholder for Gemini wait |

---

## 7. Environment Variables

**File: `app/.env.local`** ← **[ADD]**
```bash
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your_local_anon_key>

# Android emulator: use 10.0.2.2 (not localhost)
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000
# iOS Simulator: use localhost
# EXPO_PUBLIC_API_URL=http://localhost:8000
# Physical device: use your machine's LAN IP
# EXPO_PUBLIC_API_URL=http://192.168.1.XXX:8000
```

---

## 8. Demo Scripted Values (Use These Exactly)

Enter these values in the form to reliably trigger anomalies:

| Item | Value | Unit | Expected |
|---|---|---|---|
| GAS-CH4 — Methane | `1.4` | % | 🔴 CRITICAL |
| GAS-O2 — Oxygen | `18.9` | % | 🔴 CRITICAL |
| GAS-CO2 — CO₂ | `0.65` | % | 🟠 HIGH |
| GAS-CO — CO | `35` | ppm | ✅ OK |
| VENT-FLOW — Ventilation | `22` | m³/min | 🟠 HIGH |
| TEMP-WB — Temperature | `31` | °C | ✅ OK |
| DETECTOR-CALIB | Non-Compliant | — | 🟡 OBS |
| VIS-LOG | OK | — | ✅ OK |

After 6+ observations → tap **Analyze** → expect Risk Score ~84/100 CRITICAL + 2 anomalies.

---

## 9. Build Order

```
Step 1:  Set EXPO_PUBLIC_API_URL in .env.local — verify backend reachable
Step 2:  Create src/lib/demoAuth.ts (get UUIDs from seed_demo.py output)
Step 3:  Rewrite (auth)/login.tsx with demo role selector
Step 4:  Test: tap "Mine Manager" → reaches home
Step 5:  Create src/hooks/useInspectionApi.ts
Step 6:  Rewrite inspect/index.tsx — inspection list from API
Step 7:  Create GasObservationItem.tsx + ChecklistItem.tsx components
Step 8:  Create inspect/start.tsx — template picker + create inspection
Step 9:  Test: start screen creates inspection → check Supabase Studio
Step 10: Create inspect/[id]/form.tsx — gas observation form
Step 11: Test: add 6 observations → check observations table
Step 12: Create RiskGauge.tsx + AnomalyCard.tsx components
Step 13: Create inspect/[id]/analyze.tsx — analyze + submit
Step 14: Test: analyze returns anomalies, submit succeeds
Step 15: Create ReportSection.tsx + SkeletonLoader.tsx
Step 16: Create inspect/[id]/report.tsx — AI report card
Step 17: Full end-to-end test run
Step 18: Add pending task card to home screen
Step 19: Presentation rehearsal
```

---

## 10. Acceptance Criteria

- [ ] Login: "Mine Manager" button logs in → home screen
- [ ] Inspect tab: List fetched from `GET /api/v1/inspections`
- [ ] Start: Template dropdown populated from API; POST creates inspection
- [ ] Form: Gas items show numeric input with unit label
- [ ] Form: CH₄ = 1.4% → auto sets non_compliant + critical + red warning
- [ ] Form: "Analyze" button appears after 5+ saved observations
- [ ] Analyze: API returns risk_score + anomalies array
- [ ] Analyze: Risk gauge animates on mount
- [ ] Analyze: Submit navigates to report screen
- [ ] Report: Skeleton loader visible ~3–8 seconds
- [ ] Report: All 4 AI sections populate (Summary, Findings, Analysis, Actions)
- [ ] Report: "Notifications sent to 3 users" shown

---

## 11. References

| Resource | Location |
|---|---|
| FastAPI Swagger docs | `http://localhost:8000/docs` |
| Backend source | `c:\Coding\SIH2026\backend\` |
| Full mobile spec | `c:\Coding\SIH2026\docs\mobile_spec.md` |
| Main impl plan | `c:\Coding\SIH2026\docs\demo_implementation_plan.md` |
| Supabase Studio | `http://localhost:54323` |
| Seed script (run first!) | `cd backend && python seed_demo.py` |
