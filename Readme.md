# Services Setup & Execution Guide

This repository contains three main services: Web, Backend, and Mobile App. Follow the instructions below to set up and run each service locally.

## Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **Docker & Docker Compose**
- **Supabase CLI**

---

## 1. Supabase (Local Infrastructure)

The project relies on Supabase for the database, authentication, and storage. 

### Start Local Supabase
```bash
supabase start
```
*This will spin up the local PostgreSQL database, GoTrue, PostgREST, and Realtime services using Docker.*

### Stop Local Supabase
```bash
supabase stop
```

---

## 2. Web Portal (React + Vite)

### Setup
Navigate to the `web` directory and install the dependencies:

**Using npm:**
```bash
cd web
npm install
```

**Using pnpm:**
```bash
cd web
pnpm install
```

### Environment Variables
Copy the example environment file and update it with your credentials (use the values provided by `supabase start`):
```bash
cp .env.example .env
```

### Run
Start the Vite development server:

**Using npm:**
```bash
npm run dev
```

**Using pnpm:**
```bash
pnpm dev
```

---

## 3. Backend API (FastAPI)

### Setup
Navigate to the `backend` directory and set up a Python virtual environment:
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate
# Activate virtual environment (macOS/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables
Create a `.env` file in the `backend` directory with the necessary database and Redis credentials based on the FastAPI configuration.

### Run
Start the Uvicorn ASGI server:
```bash
uvicorn main:app --reload
```
To run background tasks with Celery (requires Redis):
```bash
celery -A your_celery_module worker --loglevel=info
```

---

## 4. Mobile App (React Native + Expo)

### Setup
Navigate to the `app` directory and install the dependencies:

**Using npm:**
```bash
cd app
npm install
```

**Using pnpm:**
```bash
cd app
pnpm install
```

### Environment Variables
Create a `.env.local` file in the `app` directory and provide the necessary API and Supabase URLs.

### Run
Start the Expo development server:

**Using npm:**
```bash
npx expo start
```

**Using pnpm:**
```bash
pnpm dlx expo start
```

---

## 5. Docker (Full Stack)

If you prefer to run the Web, Backend, and required infrastructure (like Redis) entirely through Docker, you can use the provided Docker Compose configuration from the root of the project.

### Build and Start All Services
```bash
docker-compose up --build
```

### Stop All Services
```bash
docker-compose down
```
