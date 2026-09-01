# Platform — Unified Technology Stack

This document provides a comprehensive overview of the streamlined technology stack for the (Coal Operations Monitoring, Enforcement & Transparency) platform. The architecture is designed for high velocity during development while maintaining enterprise-grade security, scalability, and AI-readiness.

---

## 1. Frontend Architecture (Web & Mobile)

The frontend is designed to be highly responsive, offline-capable (for mobile), and type-safe.

### Web Dashboard (Corporate & Mine Level)
*   **Core:** React 19 + Vite + TypeScript 5.7+
*   **Routing:** TanStack Router (Type-safe, code-split routing)
*   **State Management:** TanStack Query v5 (Server state/caching) + Zustand (Local UI state)
*   **UI & Styling:** Tailwind CSS v4 + shadcn/ui + Radix Primitives (Accessible, highly customizable)
*   **Forms & Validation:** React Hook Form + Zod (Schemas shared with backend)
*   **Data Visualization:** Recharts (Compliance health, risk gauges, production trends)
*   **Maps:** MapLibre GL JS + deck.gl (Geo-fencing, heatmaps)

### Mobile Field App (React Native)
*   **Framework:** React Native 0.85 (New Architecture) + Expo (Bare workflow)
*   **Offline Database:** WatermelonDB (SQLite-backed, handles intermittent mine-site connectivity)
*   **Local Storage:** `expo-secure-store` (for JWTs and sensitive keys)
*   **Camera/OCR:** `react-native-vision-camera` (high-performance scanning)

---

## 2. Backend Compute & AI Engine (FastAPI)

While Supabase handles standard CRUD and data persistence, a dedicated Python backend acts as the "worker" layer for complex computations, ML inference, and statutory workflows.

*   **Framework:** Python 3.12 + FastAPI (High performance, native async, auto OpenAPI generation)
*   **Data Validation:** Pydantic v2 (Strict schemas mirroring the frontend Zod schemas)
*   **Database ORM:** SQLAlchemy 2.0 (Async) + GeoAlchemy2 (For PostGIS spatial queries)
*   **Background Jobs / Workflows:** FastAPI Background Tasks (For escalation ladders, SLA timers, and PDF generation)
*   **AI Risk Engine:** XGBoost + scikit-learn (Tabular risk scoring)
*   **Anomaly Detection:** PyTorch / Facebook Prophet (Time-series production/environmental forecasting)
*   **Document Digitization:** Tesseract OCR (Extracting data from legacy scanned forms)

---

## 3. Data Layer, Auth & Infrastructure (Supabase)

Supabase serves as the central hub of the architecture, replacing a dozen disparate microservices (Keycloak, Kafka, MinIO, TimescaleDB) with a cohesive, Postgres-native ecosystem.

*   **Primary Database:** Supabase PostgreSQL 15+ (Handles relational data, time-series sensor data, and JSON document fields)
*   **Spatial / GIS:** PostGIS extension (Boundary validation, proximity alerts)
*   **Authentication & Identity:** Supabase Auth / GoTrue (OIDC/OAuth2, Magic Links, PKCE for mobile)
*   **Object Storage:** Supabase Storage (S3-compatible storage for photos, OCR scans, and PDF reports)
*   **Event Bus / Messaging:** Supabase Webhooks (Postgres triggers that asynchronously call FastAPI endpoints on data mutation)
*   **Real-time Push:** Supabase Realtime (WebSockets/SSE for live dashboard alerts without polling)
*   **Search:** OpenSearch (For full-text indexing of grievances and inspection narratives)
*   **Caching:** Redis (For heavy corporate dashboard query rollups)

---

## 4. Security Architecture

Security is baked into the architecture at the database level, ensuring data isolation across the multi-tenant hierarchy (Ministry -> Subsidiary -> Mine).

### Identity & Access Control
*   **Row-Level Security (RLS):** Enforced natively in Supabase PostgreSQL. Every query automatically scopes data to the user's `mine_id` or `subsidiary_id`, preventing cross-tenant data leaks even if an API bug occurs.
*   **Role-Based Access Control (RBAC):** JWT claims define user roles (Field Officer, Mine Manager, Regulator).
*   **Multi-Factor Authentication (MFA):** Enforced via Supabase Auth for high-privilege accounts (Corporate Executives, System Admins, Regulators).

### Data Protection
*   **Encryption at Rest:** AES-256 encryption at the volume layer (Postgres / Supabase Storage).
*   **Encryption in Transit:** TLS 1.3 mandatory for all API, Database, and Web traffic.
*   **Token Security:** Short-lived JWTs stored in HTTP-Only cookies (Web) and Secure Enclaves (Mobile).

### Auditability
*   **Tamper-Evident Logs:** All compliance-critical actions (e.g., closing a violation, approving an inspection) generate immutable audit records.
*   **Blockchain Anchoring (Optional via DGMS requirement):** Cryptographic hashes of critical records can be batched and anchored to a Hyperledger Fabric consortium to prove non-tampering to regulators.

---

## 5. DevOps & Deployment

*   **Containerization:** Docker (For the FastAPI worker services)
*   **Orchestration:** Kubernetes (K8s) via Helm charts for scalable backend deployments
*   **CI/CD:** GitHub Actions (For automated testing, linting, and building images)
*   **Observability:** OpenTelemetry (Instrumentation) + Prometheus/Grafana (Metrics) + Loki (Logs)


For notifications, use Resend for statutory PDF email reports, expo-notifications (with FCM) for standard mobile push alerts, Notifee for critical emergency alarms (bypassing DND/silent mode with native siren playback), and Supabase Realtime for live web dashboard toasts.