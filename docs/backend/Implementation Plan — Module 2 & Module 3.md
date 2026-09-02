# Implementation Plan — Module 2 & Module 3

---

## MODULE 2 — Inspection & CAPA Workflow

### Current State Summary

| Component | Status |
|---|---|
| `InspectionService` | Partially implemented — core create/observe/submit flow works |
| Violation auto-promotion | ✅ Works for `high`/`critical` severity |
| CAPA assign → close → verify | ✅ Basic flow works |
| `observation_count` / `violation_count` on `Inspection` | ❌ Always 0 — never updated |
| `pending_verification` violation state | ❌ Never reached — skipped in code |
| Near-miss / incident flow | ❌ No router, no service, no endpoints |
| Checklist completion progress | ❌ No `completion_pct` computed anywhere |
| Root Cause Analysis field | ❌ `root_cause` not in model or schema |
| CAPA evidence enforcement on closure | ❌ `verify_close_capa()` requires no attached media |
| Voice transcription trigger | ❌ Column exists, nothing calls STT service |
| AI category inference | ❌ Columns exist, no NLP classifier called |
| `recurrence_count` increment | ❌ Never incremented on new violations |
| Geo-fence validation | ❌ No PostGIS `ST_Contains` check |
| CAPA re-assignment | ❌ No endpoint |
| Severity-based CAPA `due_date` defaults | ❌ No auto-default logic |

---

## Phase 0 — Implement Now (High Impact, Low Complexity)

### Fix 1: Root Cause Analysis Field

> Adds `root_cause` to `CorrectiveAction`. Standard in DGMS Form 4-A/4-B. Also feeds the AI clustering model in Module 3.

#### [MODIFY] [`models/inspection.py`](file:///c:/Coding/SIH2026/backend/models/inspection.py)

Add to `CorrectiveAction`:
```python
root_cause = Column(String)
```

#### [MODIFY] [`schemas/inspection.py`](file:///c:/Coding/SIH2026/backend/schemas/inspection.py)

Add to `CAPACreate` and `CAPAUpdate`:
```python
root_cause: Optional[str] = None
```

Add to `CAPARead`:
```python
root_cause: Optional[str] = None
```

#### [MODIFY] [`services/inspection_service.py`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py)

In `assign_capa()`, set `capa.root_cause = dto.root_cause`.

---

### Fix 2: Checklist Completion Progress

> Tracks which checklist items from the JSONB template have been answered in the current inspection. Returns `completion_pct` — used to block incomplete inspection submission.

#### How it works

The `ChecklistTemplate.checklist_items` JSONB is an array of items, each with an `id` field.
The `Observation.checklist_item_id` references one of those item IDs.

Completion = `(unique checklist_item_ids answered) / (total checklist items in template)`

#### [MODIFY] [`schemas/inspection.py`](file:///c:/Coding/SIH2026/backend/schemas/inspection.py)

Add to `InspectionRead`:
```python
completion_pct: float = 0.0   # 0.0–100.0
checklist_items_total: int = 0
checklist_items_answered: int = 0
```

#### [MODIFY] [`services/inspection_service.py`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py)

Add `_compute_checklist_progress(inspection, template)` helper:
```python
@staticmethod
def _compute_checklist_progress(inspection: Inspection, template: ChecklistTemplate) -> dict:
    total = len(template.checklist_items) if template else 0
    answered = len({obs.checklist_item_id for obs in inspection.observations
                    if obs.checklist_item_id})
    pct = round((answered / total) * 100, 1) if total > 0 else 0.0
    return {"total": total, "answered": answered, "pct": pct}
```

Call it in `get_inspection_detail()` and attach to the returned Inspection object.

#### [MODIFY] [`services/inspection_service.py`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py)

In `submit_inspection()`, block if `completion_pct < 80`:
```python
progress = InspectionService._compute_checklist_progress(inspection, template)
if progress["pct"] < 80:
    raise ValueError(
        f"Cannot submit: only {progress['pct']}% of checklist items answered. "
        f"Minimum required: 80%. Missing: {progress['total'] - progress['answered']} items."
    )
```

---

### Fix 3: Severity-Based CAPA Due Date Defaults

> When no `due_date` is provided in `CAPACreate`, auto-assign based on violation severity.

#### [MODIFY] [`services/inspection_service.py`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py)

In `assign_capa()`:
```python
from datetime import timedelta

SLA_DAYS = {
    ViolationSeverity.critical: 1,
    ViolationSeverity.major:    7,
    ViolationSeverity.moderate: 21,
    ViolationSeverity.minor:    30,
}
due_date = dto.due_date or (date.today() + timedelta(days=SLA_DAYS.get(violation.severity, 30)))
```

#### [MODIFY] [`schemas/inspection.py`](file:///c:/Coding/SIH2026/backend/schemas/inspection.py)

Make `due_date` optional in `CAPACreate`:
```python
due_date: Optional[date] = None
```

---

### Fix 4: `observation_count` / `violation_count` Auto-Update

> Counter columns on `Inspection` are always 0. Fix with an atomic SQL update on every `add_observation()` call.

#### [MODIFY] [`services/inspection_service.py`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py)

After creating the Observation in `add_observation()`:
```python
from sqlalchemy import update

await db.execute(
    update(Inspection)
    .where(Inspection.id == inspection_id)
    .values(observation_count=Inspection.observation_count + 1)
)
# If violation was created:
if violation:
    await db.execute(
        update(Inspection)
        .where(Inspection.id == inspection_id)
        .values(violation_count=Inspection.violation_count + 1)
    )
```

---

### Fix 5: Violation → `pending_verification` State

> Currently, violations jump from `in_progress` → `closed`. The `pending_verification` intermediate state is skipped entirely. This fix inserts it into the CAPA closure workflow.

#### [MODIFY] [`services/inspection_service.py`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py)

In `update_capa()`, when status transitions to `CapaStatus.completed`:
```python
# Set violation to pending_verification instead of directly closing it
if capa.source_type == SourceTypeEnum.violation:
    violation = await InspectionService.get_violation_detail(db, capa.source_id)
    if violation:
        violation.status = ViolationStatus.pending_verification
```

In `verify_close_capa()`, require at least one `MediaAttachment` linked to the CAPA:
```python
from sqlalchemy import select
from models.inspection import MediaAttachment, MediaParentType

media_count_result = await db.execute(
    select(func.count(MediaAttachment.id)).where(
        MediaAttachment.parent_id == capa_id,
        MediaAttachment.parent_type == MediaParentType.corrective_action
    )
)
media_count = media_count_result.scalar_one()
if media_count == 0:
    raise ValueError("Evidence upload required before closing CAPA.")
```

---

## Phase 1 — Next Sprint

### Fix 6: `recurrence_count` Increment + Systemic Risk Detection

> When a new violation is created for the same `zone + statute_reference`, increment `recurrence_count` and check if ≥ 3 violations in 18 months triggers `systemic_risk`.

#### [MODIFY] [`services/inspection_service.py`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py)

Add `_check_and_update_recurrence(db, violation)` called inside `add_observation()`:

```python
from datetime import timedelta
from sqlalchemy import select, func

@staticmethod
async def _check_and_update_recurrence(db: AsyncSession, new_violation: Violation):
    cutoff = datetime.now(timezone.utc) - timedelta(days=548)  # 18 months
    result = await db.execute(
        select(func.count(Violation.id)).where(
            Violation.mine_id == new_violation.mine_id,
            Violation.statute_reference == new_violation.statute_reference,
            Violation.reported_at >= cutoff,
            Violation.status != ViolationStatus.dismissed
        )
    )
    count = result.scalar_one()
    new_violation.recurrence_count = count
    if count >= 3:
        new_violation.status = ViolationStatus.systemic_risk
```

---

### Fix 7: CAPA Re-assignment Endpoint

#### [MODIFY] [`routers/inspection.py`](file:///c:/Coding/SIH2026/backend/routers/inspection.py)

Add:
```
POST /api/v1/inspections/corrective-actions/{id}/reassign
Body: { assigned_to: UUID, reason: str }
```

Service logs old assignee + reason in `completion_notes` before overwriting `assigned_to`.

---

### Fix 8: Near-Miss / Incident Router

#### [NEW] [`routers/incidents.py`](file:///c:/Coding/SIH2026/backend/routers/incidents.py)

```
POST /api/v1/incidents              → Report a near-miss / incident
GET  /api/v1/incidents/{id}         → Get incident detail
POST /api/v1/incidents/{id}/capa    → Assign CAPA to an incident
POST /api/v1/incidents/{id}/close   → Close incident with root cause analysis
```

This unblocks the Form 4-A (Accident Report), Form 4-B (Dangerous Occurrence), and Form 4-C (Near-Miss Report) flows defined in backend_spec §8.

---

## DB Migration Required (Module 2 Phase 0)

```sql
-- Add root_cause to corrective_actions
ALTER TABLE corrective_actions
  ADD COLUMN IF NOT EXISTS root_cause TEXT;
```

---

---

## MODULE 3 — Anomaly Engine & AI Analytics

### Current State Summary

The entire AI/Analytics module is **database schema only**. Tables `mine_risk_scores`, `anomaly_flags`, and `model_feedback` exist but **zero Python logic** exists. Every component below is a greenfield build.

---

## Architecture Overview

```
Data Events (DB INSERT/UPDATE)
        │
        ├─ Supabase Webhook → POST /internal/ai/score/{mine_id}
        │       ↓
        │   ai_service.py:compute_mine_risk_score()
        │       └─ XGBoost model → write mine_risk_scores
        │
        ├─ Celery Beat (daily) → ai_service.py:run_environment_anomaly_detection()
        │       └─ Prophet forecast → write anomaly_flags
        │
        ├─ On observation.save → ai_service.py:classify_observation_text()
        │       └─ TF-IDF+LightGBM → write obs.ai_category, obs.ai_confidence_score
        │
        └─ On CAPA.verify_close → ai_service.py:run_recurrence_cluster_check()
                └─ Systemic cluster query → write violation.status=systemic_risk
```

---

## Phase 0 — Implement Now

### Feature 1: AI Service Skeleton + Risk Score Engine

#### [NEW] [`services/ai_service.py`](file:///c:/Coding/SIH2026/backend/services/ai_service.py)

```python
class AIService:
    @staticmethod
    async def compute_mine_risk_score(db, mine_id) -> MineRiskScoreResult: ...
    
    @staticmethod
    async def classify_observation(observation_text: str) -> ClassificationResult: ...
    
    @staticmethod
    async def detect_environment_anomaly(db, station_id) -> AnomalyResult: ...
    
    @staticmethod
    async def run_recurrence_cluster_check(db, mine_id, statute_ref) -> bool: ...
```

**Risk Score Inputs (13 features from existing DB data):**

| Feature | Source Table | Column |
|---|---|---|
| Compliance breach rate (30d) | `compliance_instances` | `status = breached` |
| Open critical violations count | `violations` | `severity = critical AND status != closed` |
| CAPA overdue rate | `corrective_actions` | `status = overdue` |
| Days since last inspection | `inspections` | `submitted_at` |
| Open systemic risk violations | `violations` | `status = systemic_risk` |
| CH4 threshold breaches (7d) | `environment_readings` | `threshold_breached` |
| PM10 threshold breaches (30d) | `environment_readings` | `threshold_breached` |
| Production variance from plan | `production_readings` | `quantity_tonnes` |
| Contractor doc expiry % | `contractor_documents` | `expiry_date` |
| Recurrence violations (90d) | `violations` | `recurrence_count > 0` |
| Near-miss count (90d) | `incident_reports` | `type = near_miss` |
| CAPA closure rate | `corrective_actions` | `status = verified_closed / total` |
| Penalty amount pending | `compliance_instances` | (sum of `penalty_amount` if column exists) |

**Output:** Score 0–100 (higher = more risk). Written to `mine_risk_scores`.

#### [NEW] [`routers/ai.py`](file:///c:/Coding/SIH2026/backend/routers/ai.py)

```
POST   /api/v1/ai/score/mine/{id}           → Trigger risk score recomputation
GET    /api/v1/ai/score/mine/{id}           → Get latest risk score + contributing_factors
GET    /api/v1/ai/anomalies                 → List anomaly flags (filterable)
PATCH  /api/v1/ai/anomalies/{id}/acknowledge → Acknowledge an anomaly
GET    /api/v1/ai/score/mine/{id}/history   → Score trend over time
```

---

### Feature 2: Explainable AI (XAI) Output

> Every risk score must explain *why* it changed. The `mine_risk_scores.contributing_factors` JSONB column already exists for this.

#### XAI Data Structure (written to DB)

```json
{
  "contributing_factors": [
    { "factor": "open_critical_violations", "value": 3, "weight": 0.25, "impact": "+12 pts", "direction": "negative" },
    { "factor": "compliance_breach_rate",   "value": 0.33, "weight": 0.20, "impact": "+8 pts",  "direction": "negative" },
    { "factor": "capa_closure_rate",        "value": 0.85, "weight": 0.15, "impact": "-4 pts",  "direction": "positive" }
  ],
  "score_delta": "+16",
  "score_trend": "worsening",
  "computed_at": "2026-09-01T01:00:00Z",
  "model_version": "v1.2.0"
}
```

#### [MODIFY] [`schemas/`]  — New `ai.py` schema file

```python
class ContributingFactor(BaseModel):
    factor: str
    value: float
    weight: float
    impact: str
    direction: Literal["positive", "negative", "neutral"]

class MineRiskScoreRead(BaseModel):
    mine_id: uuid.UUID
    score: float
    score_trend: Literal["improving", "worsening", "stable"]
    contributing_factors: List[ContributingFactor]
    model_version: str
    computed_at: datetime
```

The API response for `GET /ai/score/mine/{id}` returns this full schema, including human-readable impact strings. The frontend renders these as a ranked factor breakdown card.

---

### Feature 3: Confidence Thresholding for NLP Classifier

> When the AI classifies an observation's category/severity, low-confidence predictions must NOT be auto-applied. They must require officer confirmation.

#### Threshold Rules

| `ai_confidence_score` | Action |
|---|---|
| ≥ 0.85 | Auto-apply: set `ai_category`, mark `ai_auto_applied = True` |
| 0.60–0.84 | Store suggestion, mark `ai_auto_applied = False`, notify officer |
| < 0.60 | Store suggestion, mark `ai_status = "uncertain"`, require human override |

#### [MODIFY] [`models/inspection.py`](file:///c:/Coding/SIH2026/backend/models/inspection.py)

Add to `Observation`:
```python
ai_auto_applied   = Column(Boolean, default=False)
ai_status         = Column(String(20))  # "auto_applied" | "pending_review" | "uncertain" | "overridden"
```

#### [MODIFY] [`services/ai_service.py`](file:///c:/Coding/SIH2026/backend/services/ai_service.py)

```python
AI_AUTO_APPLY_THRESHOLD  = 0.85
AI_UNCERTAIN_THRESHOLD   = 0.60

@staticmethod
async def classify_observation(db: AsyncSession, observation: Observation) -> None:
    result = await _call_nlp_classifier(observation.description)
    observation.ai_category = result.category
    observation.ai_confidence_score = result.confidence
    
    if result.confidence >= AI_AUTO_APPLY_THRESHOLD:
        observation.ai_status = "auto_applied"
        observation.ai_auto_applied = True
    elif result.confidence >= AI_UNCERTAIN_THRESHOLD:
        observation.ai_status = "pending_review"
        observation.ai_auto_applied = False
        # Notify officer to confirm suggestion
        await alert_compliance_officer(
            mine_id=str(observation.inspection.mine_id),
            title="AI Classification Needs Review",
            body=f"Observation '{observation.description[:60]}...' was classified as "
                 f"'{result.category}' with {result.confidence:.0%} confidence. Please confirm."
        )
    else:
        observation.ai_status = "uncertain"
        observation.ai_auto_applied = False
```

#### [NEW] Endpoint — Officer AI Override

```
POST /api/v1/inspections/observations/{id}/ai-override
Body: { confirmed_category: str, confirmed_severity: str }
```

When an officer overrides, log to `model_feedback` table for retraining:
```python
feedback = ModelFeedback(
    observation_id=obs.id,
    original_ai_category=obs.ai_category,
    original_ai_confidence=obs.ai_confidence_score,
    corrected_category=dto.confirmed_category,
    corrected_by=actor_id,
    corrected_at=datetime.now(timezone.utc)
)
db.add(feedback)
```

---

## Phase 1 — Next Sprint (AI Module)

### Feature 4: Environmental Anomaly Detection (Prophet Forecast)

#### [MODIFY] [`services/ai_service.py`](file:///c:/Coding/SIH2026/backend/services/ai_service.py)

Daily Celery task for each active CAAQMS station:

```python
@celery.task(name="ai.run_environment_anomaly_detection")
async def run_environment_anomaly_detection():
    # Fetch last 90 days of environment_readings per station per parameter
    # Fit Prophet model on time-series
    # Forecast next 8 hours
    # If forecasted_value > threshold:
    #   - Create anomaly_flag in DB
    #   - Alert Environmental Officer via notification_service
```

### Feature 5: Production Variance Anomaly

Daily Celery task per mine:
```python
# Z-score check: if production_quantity > 2.5 std deviations from 30-day rolling avg
# → create anomaly_flag(type=production_variance)
```

### Feature 6: Contractor Trust Score

On document upload or expiry event:
```
trust_score = (
    doc_validity_score   * 0.40 +   # % docs valid and non-expired
    safety_record_score  * 0.30 +   # 1 - (violations / total_working_days)
    capa_closure_rate    * 0.20 +   # verified_closed / total_capas
    billing_score        * 0.10     # % invoices cleared without dispute
)
```

Written to `contractors.trust_score` (column to add in migration).

---

## Phase 2 — Advanced Intelligence

### Feature 7: CH4 Real-Time Safety Alert (Synchronous)

In the overman-report submission endpoint:
```python
if reading.ch4_percent >= 1.25:
    # Call synchronously — NOT in background
    await alert_critical_gas(mine_id, station_label, reading.ch4_percent, db=db)
```

### Feature 8: AI Feedback Loop + Model Versioning

Weekly Celery task:
1. Export `model_feedback` records created since last training run
2. Append to training dataset
3. Retrain LightGBM classifier
4. If validation accuracy > previous version: bump `model_version`, write to MLflow

### Feature 9: Cross-Mine Benchmarking

On every risk score computation:
```python
subsidiary_avg = SELECT AVG(score) FROM mine_risk_scores WHERE subsidiary_id = mine.subsidiary_id
national_avg   = SELECT AVG(score) FROM mine_risk_scores

response["benchmark"] = {
    "subsidiary_rank": "23% above subsidiary average",
    "national_rank": "41% above CIL national average"
}
```

---

## DB Migrations Required (Both Modules)

```sql
-- Module 2: Root Cause Analysis
ALTER TABLE corrective_actions
  ADD COLUMN IF NOT EXISTS root_cause TEXT;

-- Module 3: AI confidence thresholding fields on observations  
ALTER TABLE observations
  ADD COLUMN IF NOT EXISTS ai_auto_applied BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_status       VARCHAR(20);

-- Module 3: Model feedback table (new)
CREATE TABLE IF NOT EXISTS model_feedback (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  observation_id         UUID REFERENCES observations(id) ON DELETE CASCADE,
  original_ai_category   TEXT,
  original_ai_confidence NUMERIC(5,4),
  corrected_category     TEXT,
  corrected_by           UUID REFERENCES users(id),
  corrected_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_in_training       BOOLEAN DEFAULT FALSE
);

-- Module 3: Contractor trust score
ALTER TABLE contractors
  ADD COLUMN IF NOT EXISTS trust_score NUMERIC(5,2);
```

---

## Execution Order (Phase 0 - This Session)

### Module 2
- `[ ]` DB migration SQL
- `[ ]` `models/inspection.py` — add `root_cause` to `CorrectiveAction`
- `[ ]` `schemas/inspection.py` — update `CAPACreate`, `CAPAUpdate`, `CAPARead` + checklist progress on `InspectionRead`
- `[ ]` `services/inspection_service.py` — add completion progress, severity-based CAPA due dates, counter updates, `pending_verification` state, evidence check on CAPA closure
- `[ ]` `routers/inspection.py` — wire completeness check on submit

### Module 3
- `[ ]` DB migration SQL for AI fields
- `[ ]` `models/inspection.py` — add `ai_auto_applied`, `ai_status` to `Observation`
- `[ ]` `services/ai_service.py` — create skeleton + `classify_observation()` with thresholding
- `[ ]` `routers/ai.py` — create router with risk score + anomaly endpoints
- `[ ]` `routers/inspection.py` — add `POST /observations/{id}/ai-override` endpoint

---

## Verification Plan

### Automated
```bash
pytest backend/tests/test_inspection_service.py -k "test_checklist_progress"
pytest backend/tests/test_inspection_service.py -k "test_capa_due_date_defaults"
pytest backend/tests/test_inspection_service.py -k "test_evidence_required_for_capa_close"
pytest backend/tests/test_ai_service.py         -k "test_confidence_thresholding"
pytest backend/tests/test_ai_service.py         -k "test_xai_contributing_factors"
```

### Manual
1. Create an inspection with 5-item template → add 3 observations → try to submit → expect 60% error
2. Assign a CAPA to a `critical` violation → verify `due_date` defaults to tomorrow
3. Complete a CAPA without uploading evidence → call `POST /verify` → expect 400 "evidence required"
4. Call `POST /ai/score/mine/{id}` → verify `contributing_factors` array is populated
5. Save an observation with description → verify `ai_status` and `ai_confidence_score` are set
