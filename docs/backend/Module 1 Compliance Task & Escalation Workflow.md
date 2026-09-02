# Implementation Plan — Module 1: Compliance Task & Escalation Workflow

## Overview

This plan addresses all 9 gaps identified in the analysis, organized into
4 execution phases. Two features are implemented immediately in this session:
- **Smart Due Date Calculation** (fixes `generate_instances_for_period`)
- **Regulator Submission Tracking** (adds formal submission lifecycle)

---

## Phase 0 — Implement Now (This Session)

### Fix 1: Smart Due Date Calculation + All Recurrence Types

> **Root problem:** `generate_instances_for_period()` only handles `monthly`,
> hardcodes `due_date = last_day_of_month`, and ignores `grace_period_days`,
> `applicable_mine_types`, and `applicable_states`.

#### [MODIFY] [`compliance_service.py`](file:///c:/Coding/SIH2026/backend/services/compliance_service.py)

Replace `generate_instances_for_period()` with a complete multi-recurrence engine:

**Recurrence → Period window mapping:**

| Recurrence | Period Window | Due Date Formula |
|---|---|---|
| `daily` | same day | `period_end + grace_period_days` |
| `weekly` | Mon → Sun of the target week | `period_end + grace_period_days` |
| `fortnightly` | 1st→15th or 16th→EOM | `period_end + grace_period_days` |
| `monthly` | 1st → last day | `period_end + grace_period_days` |
| `quarterly` | Q1/Q2/Q3/Q4 | `period_end + grace_period_days` |
| `half_yearly` | Jan–Jun / Jul–Dec | `period_end + grace_period_days` |
| `annual` | Jan 1 → Dec 31 | `Dec 31 + grace_period_days` |
| `on_event` | skipped (triggered manually) | n/a |
| `one_time` | skipped (not recurring) | n/a |

**Mine + State filtering** added before any instance is generated.

---

### Fix 2: Regulator Submission Tracking

> **Root problem:** After `approved`, there is no formal record that the report
> was actually submitted to the regulatory authority.

#### [MODIFY] [`models/compliance.py`](file:///c:/Coding/SIH2026/backend/models/compliance.py)

Add to `ComplianceInstance`:
```python
submitted_to_authority_at     = Column(DateTime(timezone=True))
submission_reference_number   = Column(String(100))
submitted_to_authority_by     = Column(UUID(as_uuid=True))
```

Add new `InstanceStatus` value:
```python
authority_submitted = "authority_submitted"
```

#### [MODIFY] [`schemas/compliance.py`](file:///c:/Coding/SIH2026/backend/schemas/compliance.py)

Add to `ComplianceInstanceRead`:
```python
submitted_to_authority_at:   Optional[datetime]
submission_reference_number: Optional[str]
```

Add new request schema:
```python
class AuthoritySubmissionRequest(BaseModel):
    submission_reference_number: str
    notes: Optional[str]
```

#### [MODIFY] [`routers/compliance.py`](file:///c:/Coding/SIH2026/backend/routers/compliance.py)

Add endpoint:
```
POST /api/v1/compliance/instances/{id}/submit-to-authority
```

#### [MODIFY] [`services/compliance_service.py`](file:///c:/Coding/SIH2026/backend/services/compliance_service.py)

Add method `submit_to_authority()` that:
1. Validates instance is in `approved` state
2. Sets `submitted_to_authority_at`, `submission_reference_number`
3. Transitions status to `authority_submitted`
4. Triggers `send_statutory_report_email()` to the mine manager

---

## Phase 1 — Next Sprint (P0/P1 Gaps)

### Fix 3: Reminder Offsets from DB (not hardcoded)

#### [MODIFY] [`services/compliance_escalation_tasks.py`](file:///c:/Coding/SIH2026/backend/services/compliance_escalation_tasks.py)

- Load `requirement.reminder_offsets_days` via `selectinload` join
- Replace hardcoded `days_diff == -7` / `days_diff == -3` with:
  ```python
  if -days_diff in instance.requirement.reminder_offsets_days:
      # fire the appropriate reminder
  ```

---

### Fix 4: Auto-Assignment on Instance Creation

#### [MODIFY] [`services/compliance_service.py`](file:///c:/Coding/SIH2026/backend/services/compliance_service.py)

In `generate_instances_for_period()`, after creating each instance:
1. Call `_resolve_role_user_id(mine_id, req.responsible_role)` from `notification_service`
2. Set `instance.assigned_to = resolved_user_id`
3. Send `alert_compliance_officer()` notification: "New task assigned to you"

---

### Fix 5: Instance Deduplication Constraint (DB Migration)

#### [NEW] `backend/supabase/migrations/YYYYMMDD_compliance_dedup_constraint.sql`

```sql
ALTER TABLE compliance_instances
  ADD CONSTRAINT uq_instance_mine_req_period
  UNIQUE (mine_id, requirement_id, period_start);
```

This prevents race-condition duplicate generation as a DB-level safety net
in addition to the existing SELECT check in Python.

---

### Fix 6: Regulation Library CRUD Endpoints

#### [MODIFY] [`routers/compliance.py`](file:///c:/Coding/SIH2026/backend/routers/compliance.py)

Add admin-only endpoints:
```
POST   /api/v1/compliance/regulations          → create regulation
PATCH  /api/v1/compliance/regulations/{id}     → update regulation (bumps version)
DELETE /api/v1/compliance/regulations/{id}     → soft-delete (is_active=false)
GET    /api/v1/compliance/regulations/{id}     → get single regulation
```

When PATCH bumps `version`, trigger notifications to all officers with
pending instances linked to the old version.

---

## Phase 2 — Performance & Data Quality (P2 Gaps)

### Fix 7: Compliance Health Score Redis Cache

#### [MODIFY] [`services/compliance_service.py`](file:///c:/Coding/SIH2026/backend/services/compliance_service.py)

```python
CACHE_KEY = "compliance:health:{mine_id}"
TTL = 300  # 5 minutes

async def compute_health_score(db, mine_id):
    cached = await redis.get(CACHE_KEY.format(mine_id=mine_id))
    if cached:
        return ComplianceHealthScore.model_validate_json(cached)
    score = await _compute_from_db(db, mine_id)
    await redis.setex(CACHE_KEY.format(mine_id=mine_id), TTL, score.model_dump_json())
    return score
```

Cache is invalidated on any `compliance_instances` status change for that mine.

---

### Fix 8: Polling → Event-Driven (pg_cron)

> Replace Celery beat every-15-min polling with a targeted Supabase pg_cron job.

#### [NEW] `backend/supabase/migrations/YYYYMMDD_pgrcon_escalation.sql`

```sql
-- Fires daily at 06:00 UTC, only for mines that have due instances today
SELECT cron.schedule(
  'compliance-escalation-daily',
  '0 6 * * *',
  $$
    SELECT net.http_post(
      url := 'https://your-api.supabase.co/functions/v1/internal-escalation',
      headers := '{"Authorization": "Bearer SERVICE_KEY"}',
      body := '{}'
    );
  $$
);
```

The Supabase Edge Function calls `POST /internal/compliance/escalation-check`
which runs the same async logic but only for mines with instances due within
the next 30 days.

---

### Fix 9: Carry-Forward Rejection Context

#### [MODIFY] [`services/compliance_service.py`](file:///c:/Coding/SIH2026/backend/services/compliance_service.py)

In `generate_instances_for_period()`, when creating a new instance, check:

```python
prev_instance = (SELECT ... WHERE requirement_id=req.id AND mine_id=mine_id 
                  AND period_start < this_period_start
                  ORDER BY period_start DESC LIMIT 1)

if prev_instance and prev_instance.status == InstanceStatus.revision_requested:
    new_instance.notes = (
        f"[Carry-forward] Previous period ({prev_period}) was rejected: "
        f"{prev_instance.rejection_reason}"
    )
```

Requires a `notes` TEXT field added to `ComplianceInstance`.

---

## Phase 3 — Advanced Intelligence (P3)

### Predictive Breach Forecasting

A weekly Celery task that queries:
```sql
SELECT mine_id, requirement_id,
       COUNT(*) FILTER (WHERE status = 'breached') AS breach_count,
       COUNT(*) AS total_recent
FROM compliance_instances
WHERE created_at > NOW() - INTERVAL '6 months'
GROUP BY mine_id, requirement_id
HAVING COUNT(*) FILTER (WHERE status = 'breached') >= 3
```

If a mine has ≥3 breaches on the same requirement in 6 months:
- Reduce its `reminder_offsets_days` to `[45, 14, 3]` for next period
- Alert the subsidiary head with a predictive breach warning

---

### Regulation Change Notification

In `PATCH /regulations/{id}`, after incrementing `version`:
```python
pending_instances = SELECT ... WHERE requirement.regulation_id = reg.id
                    AND status IN (pending, in_progress, revision_requested)

for inst in pending_instances:
    await alert_compliance_officer(
        mine_id=inst.mine_id,
        title="Regulation Updated",
        body=f"The regulation governing task {inst.id} has been updated to v{new_version}."
    )
```

---

## DB Migration Required (Phase 0)

```sql
-- Add authority submission tracking to compliance_instances
ALTER TABLE compliance_instances
  ADD COLUMN IF NOT EXISTS submitted_to_authority_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submission_reference_number   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS submitted_to_authority_by     UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS notes                         TEXT;

-- Extend the instance_status enum
ALTER TYPE instance_status ADD VALUE IF NOT EXISTS 'authority_submitted';
```

---

## Verification Plan

### Automated
```bash
# After implementation — test instance generation for all recurrences
pytest backend/tests/test_compliance_service.py -k "test_generate_instances"

# Test smart due date with grace period
pytest backend/tests/test_compliance_service.py -k "test_due_date"

# Test authority submission endpoint
pytest backend/tests/test_compliance_router.py -k "test_submit_to_authority"
```

### Manual
1. Generate instances for a mine with `daily` + `monthly` + `annual` requirements → confirm all 3 appear
2. Verify `due_date` respects `grace_period_days = 5` for a monthly requirement (should be 5th of next month)
3. Approve an instance → call `POST /instances/{id}/submit-to-authority` → verify status = `authority_submitted`
4. Check email is sent via Resend to mine manager

---

## Execution Order (This Session)

- `[x]` DB migration SQL file
- `[ ]` `models/compliance.py` — add 3 columns + `authority_submitted` status  
- `[ ]` `schemas/compliance.py` — add `AuthoritySubmissionRequest` + extend `ComplianceInstanceRead`
- `[ ]` `services/compliance_service.py` — rewrite `generate_instances_for_period()` + add `submit_to_authority()`
- `[ ]` `routers/compliance.py` — add `POST /instances/{id}/submit-to-authority`





---


# Walkthrough: Module 1 Compliance Task & Escalation Workflow (Phase 0)

Phase 0 is fully implemented according to your approvals. Here is a summary of the changes and what they achieve.

## 1. Smart Due Date & Multi-Recurrence Engine

The instance generator in `generate_instances_for_period()` is completely rewritten. It now accurately computes periods for *all* supported recurrences based on the year and month requested.

- **`daily`**: Yields one instance per day of the month.
- **`weekly`**: Generates instances for each ISO week starting in the month.
- **`fortnightly`**: Generates 1st–15th and 16th–End of Month periods.
- **`monthly`**: Generates the 1st–End of Month period.
- **`quarterly` / `half_yearly` / `annual`**: Intelligently groups periods (e.g. quarterly will only generate a Q3 period when `month = 7`).

> [!TIP]
> The engine also correctly computes the `due_date` dynamically by adding `grace_period_days` (from the parent requirement) to the `period_end`. Previously this was hardcoded to `last_day_of_month`. It also strictly respects `applicable_mine_types` and `applicable_states`.

## 2. Regulator Submission Tracking

A formal submission loop was built out to track the final closure stage when the report is submitted to an authority (like DGMS).

1. Added `authority_submitted` state to `InstanceStatus` Enum.
2. Added schema/model fields for: `submitted_to_authority_at`, `submission_reference_number`, `submitted_to_authority_by`, and `notes`.
3. Created `POST /instances/{id}/submit-to-authority`. 
4. When invoked, it automatically sets the status, adds tracking info, and calls `send_statutory_report_email` via the centralized notification service to alert the Mine Manager.

## 3. Database Migration

The `backend/supabase/migrations` folder has a new migration script adding the exact needed schema updates:

```sql
ALTER TABLE compliance_instances
  ADD COLUMN IF NOT EXISTS submitted_to_authority_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submission_reference_number   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS submitted_to_authority_by     UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS notes                         TEXT;

ALTER TYPE instance_status ADD VALUE IF NOT EXISTS 'authority_submitted';
```

> [!IMPORTANT]
> Because Supabase runs locally via CLI for your environment, make sure to execute: `supabase db push` or equivalent to apply `20260901013000_compliance_authority_submission.sql`.

Phase 0 is complete. Let me know when you're ready to proceed to **Phase 1** (Reminder offsets, auto-assignment, and DB deduplication).
