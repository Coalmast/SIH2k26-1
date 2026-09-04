# ──────────────────────────────────────────────
#  Stage 1: Builder — install Python deps
# ──────────────────────────────────────────────
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build-time system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# ──────────────────────────────────────────────
#  Stage 2: Runtime
# ──────────────────────────────────────────────
FROM python:3.12-slim AS runtime

WORKDIR /app

# Runtime system deps only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY . .

# Expose FastAPI port
EXPOSE 8000

# Default command: run Uvicorn (can be overridden by docker-compose for the Celery worker)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
