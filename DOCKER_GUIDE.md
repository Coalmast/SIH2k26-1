# SIH2026 — Docker Setup & Operations Guide

> Complete guide to building, running, and managing all project services with Docker.

---

## Architecture Overview

```
+-----------------------------------------------------+
|                    HOST MACHINE                      |
|                                                      |
|  +----------------------------------------------+   |
|  |          Docker Network: sih2026_net          |   |
|  |                                              |   |
|  |  +----------+     +----------------------+  |   |
|  |  |  web     +---->|      backend         |  |   |
|  |  | (Nginx)  |     |   (FastAPI/Uvicorn)  |  |   |
|  |  | :3000->80|     |      :8000           |  |   |
|  |  +----------+     +----------+-----------+  |   |
|  |                              |               |   |
|  |  +----------+     +----------v-----------+  |   |
|  |  |  beat    |     |       worker         |  |   |
|  |  | (Celery  |     |  (Celery Worker)     |  |   |
|  |  |  Beat)   |     |                      |  |   |
|  |  +----+-----+     +----------+-----------+  |   |
|  |       |                      |               |   |
|  |       +-----------+----------+               |   |
|  |                   v                          |   |
|  |            +----------+                      |   |
|  |            |  redis   |                      |   |
|  |            |  :6379   |                      |   |
|  |            +----------+                      |   |
|  +----------------------------------------------+   |
|                       |                              |
|           host.docker.internal                       |
|                       |                              |
|  +--------------------v--------------------------+   |
|  |          Supabase (via CLI -- external)        |   |
|  |   PostgreSQL :54322 | API :54321 | Studio :54323| |
|  +----------------------------------------------+   |
+-----------------------------------------------------+
```

### Service Summary

| Container | Image | Port | Purpose |
|---|---|---|---|
| `sih2026_redis` | `redis:7.4-alpine` | `6379` | Celery broker & result backend |
| `sih2026_backend` | `./backend` (custom) | `8000` | FastAPI REST API |
| `sih2026_worker` | `./backend` (custom) | -- | Celery async task worker |
| `sih2026_beat` | `./backend` (custom) | -- | Celery beat periodic scheduler |
| `sih2026_web` | `./web` (custom -> Nginx) | `3000` | React/Vite admin portal |

> **Not managed by Docker Compose:** Supabase (PostgreSQL, GoTrue Auth, PostgREST, Storage, Realtime) is run via the Supabase CLI on your host machine.

---

## Prerequisites

Before starting, ensure you have:

- **Docker Desktop** >= 4.x -- [Download](https://www.docker.com/products/docker-desktop/)
- **Docker Compose** v2.x (bundled with Docker Desktop) -- verify with `docker compose version`
- **Supabase CLI** -- [Install Guide](https://supabase.com/docs/guides/cli)
- A `.env.docker` file (see setup below)

---

## Quick Start (TL;DR)

```bash
# 1. Start Supabase (must be running FIRST)
pnpm dlx supabase start

# 2. Copy and fill in secrets
cp .env.docker.example .env.docker
# Edit .env.docker with your Supabase keys (shown by supabase start output)

# 3. Build and start all containers
docker compose --env-file .env.docker up --build

# 4. Access the services:
#   Web portal:  http://localhost:3000
#   Backend API: http://localhost:8000
#   API Docs:    http://localhost:8000/docs
#   Redis:       localhost:6379
```

---

## Step-by-Step Setup

### Step 1 -- Start Supabase

The containers connect to Supabase running on your host machine.

```bash
supabase start
```

This outputs the local credentials you need. Example output:

```
API URL: http://127.0.0.1:54321
DB URL:  postgresql://postgres:postgres@127.0.0.1:54322/postgres
anon key:         eyJhbGci...
service_role key: eyJhbGci...
JWT secret:       super-secret-jwt-token-with-at-least-32-characters-long
```

Copy these values -- you will need them in the next step.

### Step 2 -- Configure Environment Variables

```bash
cp .env.docker.example .env.docker
```

Open `.env.docker` and update with the values from `supabase start`:

```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@host.docker.internal:54322/postgres
SUPABASE_URL=http://host.docker.internal:54321
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_JWT_SECRET=<your-jwt-secret>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

> [!IMPORTANT]
> Note that the host address is `host.docker.internal` (not `127.0.0.1`).
> Containers cannot reach `127.0.0.1` -- it would refer to themselves.
> `host.docker.internal` is the special hostname Docker provides to reach your host machine.

### Step 3 -- Build and Start All Services

```bash
docker compose --env-file .env.docker up --build
```

On the **first run**, Docker will:
1. Build the `backend` image (installs Python deps) -- ~2 min
2. Build the `web` image (runs `pnpm build`) -- ~3 min
3. Pull `redis:7.4-alpine` -- ~30 sec
4. Start all containers in dependency order

**Subsequent starts** (no code changes):
```bash
docker compose --env-file .env.docker up
```

**Run in background (detached mode):**
```bash
docker compose --env-file .env.docker up -d --build
```

---

## Daily Operations

### View running containers
```bash
docker compose ps
```

### View logs

```bash
# All services
docker compose --env-file .env.docker logs -f

# Individual service
docker compose --env-file .env.docker logs -f backend
docker compose --env-file .env.docker logs -f worker
docker compose --env-file .env.docker logs -f web
docker compose --env-file .env.docker logs -f redis
```

### Stop all services
```bash
docker compose --env-file .env.docker down
```

### Stop and remove volumes (full reset)
```bash
docker compose --env-file .env.docker down -v
```

### Rebuild a single service after code changes
```bash
# Rebuild and restart only the backend (worker/beat share the same image)
docker compose --env-file .env.docker up --build backend worker beat

# Rebuild only the web portal
docker compose --env-file .env.docker up --build web
```

### Execute a command inside a running container

```bash
# Open a shell in the backend container
docker exec -it sih2026_backend bash

# Run database seed inside the backend container
docker exec -it sih2026_backend python seed.py

# Monitor Celery tasks in real time
docker exec -it sih2026_worker celery -A main.celery inspect active
```

### Check Celery worker status
```bash
docker exec -it sih2026_worker celery -A main.celery status
```

---

## Service Details

### Redis (`sih2026_redis`)

- **Image:** `redis:7.4-alpine`
- **Port:** `6379` (also exposed to host for tools like RedisInsight)
- **Data persistence:** Named volume `redis_data` -- survives `docker compose down` but cleared by `docker compose down -v`
- **Health check:** `redis-cli ping` every 10 seconds

### Backend -- FastAPI (`sih2026_backend`)

- **Built from:** `./backend/Dockerfile` (multi-stage, Python 3.12 slim)
- **Port:** `8000`
- **API docs:** http://localhost:8000/docs (Swagger UI)
- **ReDoc:** http://localhost:8000/redoc
- **Live reload:** Source is volume-mounted (`./backend:/app`) so file changes hot-reload Uvicorn
- **Routers active:** compliance, reports, inspection, mine, users, ai

### Celery Worker (`sih2026_worker`)

- **Same image** as the backend -- no separate Dockerfile
- **Command override:** `celery -A main.celery worker --loglevel=info --concurrency=4`
- Processes tasks: escalation notifications, FCM push, report generation

### Celery Beat (`sih2026_beat`)

- **Same image** as the backend
- **Command override:** `celery -A main.celery beat --loglevel=info`
- Periodic schedule (from `main.py`):
  - `check_overdue_capas` -- every 15 minutes
  - `check_overdue_compliance` -- every 15 minutes

### Web Portal -- React/Vite (`sih2026_web`)

- **Built from:** `./web/Dockerfile` (multi-stage: `pnpm build` then Nginx)
- **Port:** `3000` (host) -> `80` (container)
- Nginx serves the SPA with `try_files` fallback and proxies `/api/*` to `backend:8000`
- Supabase keys are baked into the bundle at build time via `ARG` + `VITE_*` env vars
- After changing Supabase keys in `.env.docker`, **rebuild** the web image

---

## Environment Variable Reference

All variables loaded from `.env.docker`.

| Variable | Used By | Description |
|---|---|---|
| `DATABASE_URL` | backend, worker, beat | PostgreSQL asyncpg connection string |
| `SUPABASE_URL` | backend, worker, beat | Supabase API base URL |
| `SUPABASE_SERVICE_ROLE_KEY` | backend, worker, beat | Admin-level Supabase key |
| `SUPABASE_JWT_SECRET` | backend | JWT verification secret |
| `REDIS_URL` | backend, worker, beat | Celery broker/backend URL |
| `RESEND_API_KEY` | backend, worker | Transactional email API key |
| `RESEND_FROM_EMAIL` | backend, worker | Sender email address |
| `FCM_PROJECT_ID` | backend, worker | Firebase project ID |
| `FCM_SERVICE_ACCOUNT_JSON` | backend, worker | Firebase service account (one-line JSON) |
| `VITE_SUPABASE_URL` | web (build arg) | Supabase URL baked into the frontend |
| `VITE_SUPABASE_ANON_KEY` | web (build arg) | Public anon key baked into the frontend |
| `VITE_API_BASE_URL` | web (build arg) | Backend API URL baked into the frontend |

---

## Networking

All containers share the `sih2026_net` bridge network.

| From | To | How |
|---|---|---|
| `web` | `backend` | DNS name `backend` via Nginx proxy at `/api/` |
| `backend` | `redis` | DNS name `redis` |
| `worker` | `redis` | DNS name `redis` |
| `beat` | `redis` | DNS name `redis` |
| `backend/worker/beat` | Supabase | `host.docker.internal:54321` / `54322` |

---

## Troubleshooting

### `host.docker.internal` not resolving (Linux)

The compose file includes `extra_hosts: ["host.docker.internal:host-gateway"]`. If you still see failures on Linux:

```bash
# Get the host IP on the Docker bridge
ip route show default | awk '/default/ {print $3}'
# Then use that IP in .env.docker instead:
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@172.17.0.1:54322/postgres
```

### Backend exits immediately

```bash
docker compose --env-file .env.docker logs backend
```

Common causes:
- **Import error** -- a Python package is missing from `requirements.txt`
- **DB connection refused** -- Supabase is not running; run `supabase start` first
- **`SUPABASE_SERVICE_ROLE_KEY` is empty** -- fill in `.env.docker`

### Celery worker not processing tasks

```bash
docker compose --env-file .env.docker logs worker
docker exec -it sih2026_worker celery -A main.celery inspect active

# Verify Redis is healthy
docker exec -it sih2026_redis redis-cli ping
# Should return: PONG
```

### Web portal shows blank page or 502

1. Check backend health: `docker compose ps`
2. Check Nginx logs: `docker compose --env-file .env.docker logs web`
3. Rebuild if env vars changed: `docker compose --env-file .env.docker up --build web`

### Port already in use (Windows)

```powershell
# Find what is using the port (e.g. 8000)
netstat -ano | findstr :8000
# Kill by PID
taskkill /PID <pid> /F
```

Or change the host-side port mapping in `docker-compose.yml`, e.g. `"8001:8000"`.

### Full clean rebuild

```bash
# Stop everything and remove volumes
docker compose --env-file .env.docker down -v

# Remove cached images
docker rmi sih2026-backend sih2026-web 2>nul || true

# Rebuild from scratch
docker compose --env-file .env.docker up --build
```

---

## Mobile App (React Native / Expo)

> [!NOTE]
> The React Native mobile app (`app/`) **cannot** run inside Docker. It requires native Android build tooling (Android Studio, NDK, a physical device or emulator). Docker manages only the server-side services.

Once Docker services are running, point the Expo app at the host:

```env
# app/.env.local
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Android emulator reaches the host at 10.0.2.2
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000

# Physical device: use your LAN IP instead
# EXPO_PUBLIC_API_URL=http://192.168.x.x:8000
```

Then follow the [Mobile App Dev Setup](./app/DEV_SETUP.md) guide.

---

## Files Created

```
SIH2026/
├── docker-compose.yml           <- Orchestrates all 5 Docker services
├── .env.docker.example          <- Template: copy to .env.docker and fill secrets
├── .env.docker                  <- Your local secrets (git-ignored)
├── backend/
│   └── Dockerfile               <- Multi-stage Python 3.12 slim image
└── web/
    └── Dockerfile               <- Multi-stage Node 20 -> Nginx image
```
