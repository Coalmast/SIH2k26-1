# COMET Platform — Unified Technology Stack

**Platform:** Coal Operations Monitoring, Enforcement & Transparency (COMET)  
**Problem Statement:** SIH 2026 — 26024 | Coal India Limited | Ministry of Coal  
**Version:** 2.0 | September 2026

This document provides a comprehensive overview of the technology stack for the COMET platform. The architecture is designed for high development velocity while maintaining enterprise-grade security, scalability, and AI-readiness — covering every requirement of PS 26024.

---

## 1. Frontend Architecture (Web & Mobile)

### Web Dashboard (Corporate & Mine Level)

| Layer | Choice | Version | Purpose |
|---|---|---|---|
| Build Tool | **Vite** | 6.x | Fast dev server, native ESM, Rollup production build |
| Framework | **React** | 19.x | UI rendering, React Compiler, `useActionState` |
| Language | **TypeScript** | 5.7+ | Strict mode; shared types across monorepo |
| Routing | **TanStack Router** | v1 | Type-safe, file-based, code-split per feature |
| Server State | **TanStack Query v5** | 5.x | Supabase query caching, retries, stale-while-revalidate |
| Client State | **Zustand** | v4 | Lightweight UI state (sidebar, filters, modals) |
| Forms & Validation | **React Hook Form + Zod** | — | Schemas shared with backend Pydantic models |
| UI Components | **shadcn/ui + Radix Primitives** | — | Accessible, headless, composable primitives |
| Styling | **Tailwind CSS v4** | 4.x | WCAG 2.1 AA accessible design tokens |
| Charts | **Recharts** | v2 | Compliance health, risk gauges, production trends |
| Maps | **MapLibre GL JS + deck.gl** | — | Mine risk heatmaps, hazard zones, incident overlays |
| Backend Client | **Supabase JS Client** | v2 | PostgREST queries, Realtime subscriptions, Storage, Auth |
| Internationalisation | **i18next + react-i18next** | v23 | Hindi, Bengali, Odia, Marathi, English |
| Testing | **Vitest + React Testing Library + Playwright** | — | Unit → Component → E2E |

### Mobile Field App (React Native)

| Layer | Choice | Version | Purpose |
|---|---|---|---|
| Framework | **React Native** (New Architecture) | 0.85 | iOS/Android; Fabric + TurboModules + Hermes |
| Tooling | **Expo Bare + EAS Build** | SDK 52 | OTA updates, simplified native CI signing |
| Navigation | **Expo Router** (file-based) | — | Stack, Bottom Tabs, Drawer navigators |
| Offline DB | **WatermelonDB** | v0.27 | SQLite-backed reactive local DB — offline-first |
| Sync | Custom WatermelonDB sync protocol | — | Pull/push against FastAPI `/api/v1/sync` |
| Backend Client | **Supabase JS Client** | v2 | Auth sessions, Storage uploads, Realtime alerts |
| Maps / GPS | **react-native-maps + expo-location** | — | GPS geo-tagging, mine boundary display |
| Camera | **react-native-vision-camera** | v4 | High-performance photo/video for observations |
| QR Scan | **expo-barcode-scanner** | — | Worker attendance via badge QR scan |
| Background Sync | **expo-background-task** | — | Queued sync on connectivity resume |
| Biometric Auth | **expo-local-authentication** | — | Fingerprint/Face ID — underground offline re-auth |
| Secure Storage | **expo-secure-store** | — | Supabase session tokens (iOS Keychain / Android Keystore) |
| Standard Notifications | **expo-notifications + FCM** | — | CAPA assignments, compliance reminders |
| Emergency Alarms | **Notifee** | — | Bypasses DND/silent mode; custom siren; Full-Screen Intents (Android) + Critical Alerts entitlement (iOS) |
| Server State | **TanStack Query v5** | — | Same pattern as web (online lookups) |
| Client State | **Zustand v4** | — | Auth, sync status, app settings |

---

## 2. Backend Compute (FastAPI)

Supabase handles standard CRUD via PostgREST. FastAPI is the compute layer for AI inference, OCR, PDF generation, escalation scheduling, sync, and webhook handling.

| Layer | Choice | Version | Purpose |
|---|---|---|---|
| Framework | **FastAPI** | 0.115+ | Async REST API, auto OpenAPI, native Python |
| Language | **Python** | 3.12 | Backend compute, AI orchestration, OCR, PDF |
| Data Validation | **Pydantic v2** | 2.x | Strict schemas mirroring frontend Zod schemas |
| Database ORM | **SQLAlchemy 2.0 (Async)** | 2.x | Async DB access; GeoAlchemy2 for PostGIS spatial |
| Background Jobs | **FastAPI Background Tasks** | — | Escalation ladders, SLA timers, PDF generation |
| OCR Engine | **Tesseract 5** | 5.x | Legacy scanned form digitization (offline-capable) |
| PDF Generation | **WeasyPrint** | — | Statutory document rendering (pure Python, no headless browser) |
| PDF Templates | **Jinja2** | — | HTML templates for Form 3, Form 4-A/B/C, etc. |

---

## 3. AI / Intelligence Layer (Google Gemini + ADK)

All AI/ML functionality is powered exclusively by **Google Gemini API** and **Google Agent Development Kit (ADK)**. No separate ML model training, no MLflow, no Airflow pipelines.

### 3.1 Google ADK Agents

Five specialised Gemini agents, each with database tool-calling capabilities:

| Agent | Model | Role |
|---|---|---|
| **RiskScoringAgent** | `gemini-1.5-pro` | Computes 0–100 mine risk score; contributing factors; recommendations |
| **AnomalyDetectionAgent** | `gemini-2.0-flash` | Flags production/environmental anomalies; recurring violation clustering |
| **ReportDraftingAgent** | `gemini-1.5-pro` | Drafts statutory report narratives (Form 3, Form 4-A, EC Reports, etc.) |
| **WorkerChatbotAgent** | `gemini-2.0-flash` | Multilingual conversational interface for worker grievance filing and status queries |
| **GrievanceAudioAgent** | `gemini-2.0-flash` (Audio) | Transcribes, translates, and classifies voice grievances in regional languages |

### 3.2 ADK Tool Pattern

Each agent calls Supabase PostgreSQL via FastAPI async functions as tools:

```python
# Example: RiskScoringAgent tools
async def get_violations(mine_id: str, days: int) -> dict: ...
async def get_capa_metrics(mine_id: str) -> dict: ...
async def get_env_breaches(mine_id: str, days: int) -> dict: ...
async def get_regulation_text(regulation_ref: str) -> str: ...
# Agent autonomously decides which tools to call and in what order
```

This replaces: ~~XGBoost~~, ~~scikit-learn~~, ~~LightGBM~~, ~~Facebook Prophet~~, ~~PyTorch~~, ~~Isolation Forest~~, ~~TF-IDF classifiers~~, ~~Claude API~~, ~~Bhashini STT~~, ~~Whisper~~, ~~MLflow~~, ~~Apache Airflow~~

### 3.3 Gemini Audio API

Used for voice input at three points:
- **Grievance filing** — Worker voice → transcription + translation + classification
- **Inspection voice notes** — Inspector voice description → transcription written to observation
- **Incident report voice** — Incident verbal description → structured field extraction

Supports natively: Hindi (hi), Bengali (bn), Odia (or), Marathi (mr), English (en) — no Bhashini required.

### 3.4 What Gemini Does NOT Replace

| Component | Reason Kept |
|---|---|
| **Tesseract 5 OCR** | Works offline; document digitization does not require AI reasoning; free |
| **WeasyPrint PDF** | Deterministic document rendering; Gemini generates content, WeasyPrint renders format |
| **PostGIS spatial** | Geo-fence validation is deterministic math, not AI |
| **pg_cron scheduling** | Deterministic time-based triggers |

---

## 4. Data Layer, Auth & Infrastructure (Supabase)

Supabase is the central data hub, replacing Keycloak, Kafka, MinIO, and TimescaleDB with a cohesive Postgres-native ecosystem.

| Component | Choice | Purpose |
|---|---|---|
| **Primary Database** | Supabase PostgreSQL 15+ | Relational data, time-series sensor data, JSONB document fields |
| **Spatial / GIS** | PostGIS extension | Boundary validation, geo-fence checks (ST_Contains), proximity alerts |
| **Authentication** | Supabase Auth / GoTrue | OIDC/OAuth2, Magic Links, PKCE for mobile |
| **Object Storage** | Supabase Storage | S3-compatible: photos, PDFs, OCR scans, voice notes |
| **Event Bus** | Supabase Webhooks | Postgres triggers → async FastAPI HTTP handlers |
| **Real-time Push** | Supabase Realtime | WebSocket channels for live dashboard alerts (no polling) |
| **Scheduled Jobs** | pg_cron | Task generation, escalation checks, anomaly detection triggers |
| **Full-text Search** | OpenSearch | Grievance and violation full-text indexing |
| **Cache** | Redis | Corporate dashboard query rollups (5-min TTL) |

---

## 5. Notification & Alert System

A four-channel notification architecture covering every alert priority level:

| Channel | Tool | Use Case |
|---|---|---|
| **Real-time web toast** | Supabase Realtime (WebSocket) | Live dashboard alerts, status changes |
| **Standard mobile push** | expo-notifications + FCM | CAPA assignments, compliance reminders, escalations |
| **Emergency alarm** | Notifee + FCM high-priority | CH4 > 1.5%, fatal incidents — bypasses DND/mute; siren sound |
| **Statutory email** | Resend API | PDF report delivery to regulatory authority inboxes |

### Email Architecture (Resend)
- Prototype / SIH demo: Resend (instant API key, `onboarding@resend.dev` testing domain)
- Production: Amazon SES (domain-verified, high-volume)
- FastAPI BackgroundTask handles email dispatch — never blocks the main API thread

### Emergency Alarm Flow (Notifee)
```
CH4 > 1.5% entered on mobile (offline)
  → Notifee triggers IMMEDIATELY on-device (no server needed)
  → Full-screen intent (Android) / Critical Alert (iOS)
  → Custom siren audio loops until officer acknowledges
  → Sync push queued → server escalation fires on reconnect
```

---

## 6. GIS & Mapping

| Component | Choice | Purpose |
|---|---|---|
| Web maps | **MapLibre GL JS** | Open-source, no vendor lock-in |
| Web overlays | **deck.gl** | HeatmapLayer (risk visualization), ScatterplotLayer (incidents), CircleLayer (mine risk pins) |
| Mobile maps | **react-native-maps** | Mine boundary display, monitoring station pins |
| GPS capture | **expo-location** | One-shot geo-stamp per inspection/observation/incident |
| Satellite overlay | **ISRO Bhuvan API** | Government-approved satellite imagery for mine boundary verification |
| Offline tiles (mobile) | Pre-cached mine-area tiles | Available without connectivity |
| Spatial DB | **PostGIS** (ST_Contains, ST_Distance) | Geo-fence validation, proximity alerts, heatmap queries |

---

## 7. Security Architecture

### Identity & Access Control
- **Row-Level Security (RLS):** Native Supabase PostgreSQL; every query auto-scoped by `mine_id` — cross-tenant leak impossible even if API bug occurs
- **Role-Based Access Control (RBAC):** JWT claims define roles (field_officer → regulator); 10 distinct roles
- **Multi-Factor Authentication:** Enforced for `subsidiary_admin`, `corporate_executive`, `regulator`, `system_admin`

### Data Protection
- **Encryption at rest:** AES-256 (Supabase managed at volume layer)
- **Encryption in transit:** TLS 1.3 mandatory for all API, DB, and web traffic
- **JWT storage (web):** HTTP-Only cookies
- **JWT storage (mobile):** expo-secure-store (iOS Keychain / Android Keystore)
- **PII:** Aadhaar stored as hash only (`aadhaar_hash`); never plaintext

### Audit Trail
- **Immutable audit logs:** All compliance-critical mutations → append-only audit table (UPDATE/DELETE blocked via Postgres trigger)
- **Blockchain Anchoring:** SHA-256 hash of statutory documents anchored to Hyperledger Fabric consortium (CIL + DGMS + MoEFCC peer nodes) via National Blockchain Framework (NBF/Vishvasya by MeitY)

> [!NOTE]
> **Prototype Note:** The blockchain anchoring architecture is fully designed and documented. The hash computation and storage are implemented. The NBG/Hyperledger network integration is planned for the production deployment phase and is not active in the current prototype.

### Network Security
- **WAF/DDoS:** Cloudflare (edge protection)
- **API Gateway:** Supabase built-in (rate limiting, JWT validation)
- **Internal services:** FastAPI not directly internet-exposed; callable only via Supabase API Gateway or internal K8s ingress
- **Webhook security:** Supabase Webhooks call FastAPI `/internal/webhook` protected by shared secret header

---

## 8. DevOps & Deployment

| Component | Choice | Purpose |
|---|---|---|
| Containerisation | Docker | FastAPI worker services |
| Orchestration | Kubernetes (K8s) + Helm | Scalable backend deployments; HPA on CPU/RPS |
| CI/CD | GitHub Actions | Automated test, lint, build, deploy |
| IaC | Terraform | Infrastructure provisioning |
| Observability | OpenTelemetry + Prometheus/Grafana + Loki | Traces, metrics, logs |
| Error Tracking | Sentry | Runtime error alerting |
| Cloud (primary) | NIC Cloud / MeghRaj (MeitY empanelled) | Government data sovereignty compliance |
| Cloud (DR) | AWS (Mumbai + Hyderabad regions) | Intra-India disaster recovery |

---

## 9. Multilingual Support

| Layer | Tool | Languages |
|---|---|---|
| Web UI labels | i18next + react-i18next | English, Hindi, Bengali, Odia, Marathi |
| Mobile UI labels | i18next | English, Hindi, Bengali, Odia, Marathi |
| Voice input | Gemini Audio API | Hindi, Bengali, Odia, Marathi, English (natively) |
| AI responses | Gemini (WorkerChatbotAgent) | Responds in worker's detected/preferred language |
| Document OCR | Tesseract 5 (regional models: HIN, BEN, ORI, ENG) | Hindi, Bengali, Odia, English |

---

*Version 2.0 | TECH_STACK.md | SIH 2026*  
*References: [workflows.md](file:///c:/Coding/SIH2026/docs/workflows.md) · [backend_spec.md](file:///c:/Coding/SIH2026/docs/backend_spec.md) · [frontend_spec.md](file:///c:/Coding/SIH2026/docs/frontend_spec.md) · [mobile_spec.md](file:///c:/Coding/SIH2026/docs/mobile_spec.md)*