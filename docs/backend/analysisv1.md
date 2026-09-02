# Module Analysis: Gaps, Optimizations & Enhancements
## Reference: ps.md + workflows.md → Current Backend (Modules 1, 2, 3)

---

## MODULE 1 — Compliance Task & Escalation Workflow

### 🔴 What's Missing (vs. ps.md & workflows.md)

| Gap | Source Requirement | Current State |
|-----|--------------------|---------------|
| **Non-monthly recurrences not generated** | `compliance_requirements.recurrence` supports `daily`, `weekly`, `fortnightly`, `quarterly`, `half_yearly`, `annual`, `on_event` | `generate_instances_for_period()` only generates instances where `recurrence.name == "monthly"`. Daily safety checks (REG-SAF-001 through REG-SAF-005) are **never auto-generated**. |
| **No reminder_offsets_days logic** | `compliance_requirements.reminder_offsets_days = [30, 7, 1]` — per-regulation customizable reminders | `compliance_escalation_tasks.py` hardcodes T-7 and T-3, ignoring per-regulation offsets. |
| **Health Score not cached or broadcast** | ps.md: "Real-time monitoring" | Computed on-demand only. No push to dashboard when status changes. |
| **No auto-assignment of instances** | `compliance_requirements.responsible_role` exists | Generated instances have `assigned_to = NULL`. No officer is ever notified of a new pending task. |
| **No mine-type filtering** | `applicable_mine_types` on requirements | `generate_instances_for_period()` ignores this. Underground-only regulations are generated for opencast mines. |
| **State-based filtering ignored** | `applicable_states TEXT[]` on requirements | Never queried. A mine in Jharkhand gets requirements meant only for Odisha. |
| **No calendar API implemented** | `backend_spec.md §4.1` defines `GET /compliance/mines/{id}/calendar` | Endpoint listed in spec but not in `routers/compliance.py`. |
| **No Regulation Library CRUD** | Admin needs to add/update regulations | No admin endpoint for `regulations` table. Currently seed-only. |
| **Escalation instances never created** | `escalation_workflow_instances` table exists | Escalation task only `print()`s mock text. Never INSERTs into `alerts` or `escalation_workflow_instances`. |

### 🟡 Optimization Opportunities

1. **Polling → Event-Driven:** Celery beat running every 15 min for 300+ mines is expensive. Replace with a `pg_cron` Supabase Webhook that fires **only on due-date match**. Cuts unnecessary DB scans by 95%.
2. **Batch generation is single-threaded:** Monthly generator loops all requirements sequentially. At scale, parallelize with `celery.group()` — one subtask per mine.
3. **Health score repeated SQL:** `compute_health_score()` re-runs the aggregation SQL every call. Cache with Redis key `compliance:health:{mine_id}` (5 min TTL) as already designed in spec.

### 💡 Suggestions & Addons

- **Smart Due Date Calculation:** Stop hardcoding `due_date = last_day_of_month`. Use: `due_date = period_end + timedelta(days=grace_period_days)` from the requirement.
- **Instance Deduplication Guard:** Add a DB-level unique constraint `UNIQUE(mine_id, requirement_id, period_start)` to prevent race-condition duplicates.
- **Carry-forward Context:** If a monthly task is `revision_requested`, the next month's instance should reference the previous period's `rejection_reason` as context for the officer.
- **Regulator Submission Tracking:** After `approved`, no step marks the report as formally submitted. Add `submitted_to_authority_at TIMESTAMPTZ` and `submission_reference_number TEXT` fields.

### 🚀 Advanced Features

- **Predictive Breach Detection:** Query "Mine X has missed 3 of the last 6 instances of this requirement." Pre-escalate by shrinking the reminder window before the next deadline.
- **Regulation Change Management:** When `regulation.version` increments, notify all officers with a pending instance linked to that regulation: "The governing law for this task has been updated."

---

## MODULE 2 — Inspection & CAPA Workflow

### 🔴 What's Missing (vs. ps.md & workflows.md)

| Gap | Source Requirement | Current State |
|-----|--------------------|---------------|
| **No Near-Miss / Incident separate flow** | workflows.md + ps.md: "Near-miss and incident reporting with root cause analysis" | `incident_reports` table exists. But no `routers/incidents.py` or service exists. Form 4-A/4-B/4-C generation (defined in spec) is unimplemented. |
| **Voice note transcription never triggered** | `observations.voice_transcription` column exists | Nothing calls a speech-to-text service to populate this field on upload. |
| **AI category inference never triggered** | `observations.ai_category`, `ai_confidence_score` columns exist | No NLP classifier is called when an observation is saved. |
| **`recurrence_count` never incremented** | `violations.recurrence_count` exists. ps.md: "identify recurring compliance failures" | New violations for the same `zone + statute_reference` don't increment this count. `systemic_risk` status is never set. |
| **No geo-fence validation on sync push** | `backend_spec.md §5.2`: "Geo-fence validation via PostGIS `ST_Contains`" | `add_observation()` accepts `geo_stamp` but never validates against the mine's `boundary_geojson`. |
| **CAPA closure requires no evidence** | workflows.md: "uploads new evidence (status: Pending Verification)" | `verify_close_capa()` transitions directly to `verified_closed` without checking for linked `media_attachments`. |
| **`pending_verification` state never reached** | `ViolationStatus` enum has this state | Code jumps `in_progress` → `closed`. This intermediate state is skipped. |
| **No scheduled future inspection** | `POST /inspections` should "schedule" an inspection | Creates inspection immediately in `draft`. No concept of a future scheduled date with an assigned inspector. |
| **`safety_observations` has no router** | Separate table for quick field hazard flags | No `routers/safety_observations.py`. Can only be submitted via sync push, not via web UI. |

### 🟡 Optimization Opportunities

1. **Promotion threshold too strict:** Only `high` or `critical` severity auto-creates a violation. The checklist `status = non_compliant` should also trigger promotion regardless of severity (a low-severity non-compliance is still a violation).
2. **CAPA `due_date` has no default:** Add severity-based auto-defaults: `critical` → 24 hrs, `major` → 7 days, `minor` → 30 days.
3. **Counter denormalization never updated:** `observation_count` and `violation_count` on `inspections` are always 0. Use a DB trigger or update them in `add_observation()` for accurate dashboard summaries.

### 💡 Suggestions & Addons

- **Checklist Completion Progress:** Track which `checklist_items` (from JSONB template) are covered vs. pending in the current inspection session. Expose as `completion_pct` on the Inspection object.
- **Duplicate Observation Warning:** If two observations share the same `checklist_item_id` within the same inspection, warn before creating a duplicate.
- **CAPA Re-assignment Endpoint:** Provide `POST /corrective-actions/{id}/reassign` for when the assigned officer is unavailable. Log the reassignment chain in an audit field.
- **Root Cause Analysis Field:** Add `root_cause TEXT` to `CorrectiveAction`. Standard in DGMS reports and feeds the AI clustering model.

### 🚀 Advanced Features

- **Recurring Violation Clustering (Systemic Risk):** After every CAPA closure, run a background check: "Has the same `zone + statute_reference` been violated ≥ 3 times in 18 months?" If yes, auto-set `violation_status = systemic_risk` and create a mine-level systemic audit recommendation.
- **Inspection Completeness Score:** Before an inspector can submit, compute `(items answered / total checklist items) × 100`. Block submission if < 80% with a list of skipped critical items.
- **Digital Inspection Memo Auto-generation:** On `submit_inspection`, auto-generate a PDF memo from submitted observations using WeasyPrint and store as `inspection_memo_url`. Eliminates the paper memo.

---

## MODULE 3 — Anomaly Engine & AI Analytics

### 🔴 What's Missing (Critical — Nothing Implemented in Code)

The entire AI module is **database schema only**. Every component below needs to be built from scratch:

| Missing Component | Where it Should Live | What it Should Do |
|---|---|---|
| **Mine Risk Score computation** | `services/ai_service.py` + `POST /ai/score/mine/{id}` | XGBoost on 13 feature inputs → writes to `mine_risk_scores` |
| **AI router** | `routers/ai.py` | On-demand risk score, anomaly list, incident classification endpoints |
| **Environmental Anomaly Detection** | `services/ai_service.py` + Celery task | Prophet forecast on `environment_readings` time-series per station |
| **Production Anomaly Detection** | Same service | Z-score or IQR on `production_readings.quantity_tonnes` vs rolling average |
| **Incident NLP Classification** | Webhook handler on `incident_reports INSERT` | TF-IDF + LightGBM → writes `ai_suggested_severity`, `ai_suggested_category` |
| **Recurring Violation Cluster Detection** | Weekly Celery task | Group violations by `(zone, statute_reference)` → systemic cluster flags |
| **Contractor Trust Score** | On doc upload / expiry event | Weighted formula: docs(40%) + safety(30%) + CAPA rate(20%) + billing(10%) |
| **Anomaly acknowledgement endpoint** | `PATCH /ai/anomalies/{id}/acknowledge` | `anomaly_flags.is_acknowledged` can never be set without this endpoint |
| **AI model versioning** | `mine_risk_scores.model_version` | No MLflow tracking wired yet |

### 🟡 Data Flow Gaps (Cross-Module)

These are systemic gaps where the output of one module should feed the next but currently does not:

```
[Inspection submitted]
       ↓
  Violation created                    ← This works ✅
       ↓
  Risk Score recomputed                ← MISSING ❌  (Webhook should trigger ai_service)
       ↓
  Dashboard alert pushed               ← MISSING ❌  (No Supabase Realtime broadcast)
       ↓
  Regulator visibility set             ← Partial ✅  (only if CAPA is 7 days overdue)

[Environment reading submitted, threshold_breached=true]
       ↓
  Immediate CRITICAL alert             ← MISSING ❌  (No webhook handler for env INSERT)
       ↓
  Anomaly flag created                 ← MISSING ❌  (ai_service not built)
       ↓
  Environmental Officer notified       ← MISSING ❌

[Production reading submitted]
       ↓
  Anomaly check triggered              ← MISSING ❌
       ↓
  Variance vs. approved mining plan    ← MISSING ❌  (No production target table seeded)
```

### 💡 Suggestions & Addons (AI Module)

- **Explainable AI (XAI) Output:** Every risk score should produce human-readable `contributing_factors`: *"Score worsened +8 pts due to 3 critical violations in the last 30 days."* Schema already supports this.
- **Confidence Thresholding:** For NLP incident classification, if `ai_confidence_score < 0.6`, do not auto-apply the suggestion. Mark it "uncertain" and require officer confirmation.
- **Feedback Loop for Model Retraining:** When an officer overrides an AI suggestion, log the correction to a `model_feedback` table. These labeled corrections retrain the next model version.
- **Cross-Mine Benchmarking:** Output: *"Mine X risk score is 23% above subsidiary average and 41% above CIL national average."* This is a high-impact insight for the Corporate Dashboard.

### 🚀 Advanced Features (AI Module)

- **Predictive Compliance Breach Forecasting:** Use historical `compliance_instances` statuses per mine to forecast which tasks will likely breach in the next 30 days, even while currently `in_progress`.
- **CH4 Gas Reading Real-Time Safety Alert:** The `check_gas_readings()` function (already designed in backend_spec §10.4) must be wired into the overman report submission endpoint **synchronously** — not as a background task. Safety cannot wait.
- **Environmental Forecast (Prophet):** Run an 8-hour ahead PM10 forecast per CAAQMS station every hour. Alert the Environmental Officer **before** the breach, directly satisfying the PS requirement: *"AI/analytics to identify high-risk areas before an incident."*

---

## SMOOTH DATA FLOW — End-to-End Annotated Map

```
FIELD INSPECTOR (Mobile, Offline)
  → Observation captured with geo-stamp + photo
  → Stored in WatermelonDB locally
  → On connectivity: POST /sync/push         [✅ Spec defined | ❌ Endpoint not built yet]
        ↓
SYNC ENDPOINT (FastAPI)
  → Geo-fence validation (PostGIS)            [❌ Missing from add_observation()]
  → Insert observation + auto-create Violation [✅ Implemented]
        ↓  (Supabase Webhook: violations INSERT)
WEBHOOK HANDLER (/internal/webhook)
  → Notify assigned officer                   [❌ Only print() mocks]
  → Trigger AI risk score recomputation       [❌ ai_service not built]
        ↓
AI SERVICE (ai_service.py)
  → Compute XGBoost risk score                [❌ Not built]
  → Write to mine_risk_scores                 [❌ Not wired]
        ↓  (Supabase Webhook: mine_risk_scores INSERT)
REALTIME PUSH
  → Supabase Realtime → Web Dashboard         [❌ Broadcast not configured]
  → Mine Manager sees live risk alert         [❌ Not connected]
        ↓
CELERY BEAT (Every 15 min)
  → Check CAPA overdue                        [✅ Logic correct | ❌ No real alerts]
  → Check compliance overdue                  [✅ Logic correct | ❌ No real alerts]
        ↓
ESCALATION
  → INSERT into alerts table                  [❌ Never done — only print()]
  → INSERT into escalation_workflow_instances [❌ Never done]
  → Send FCM push / SMS (Firebase SDK)        [❌ Not wired]
```

---

## Summary Priority Matrix

| Priority | Module | Action Required |
|----------|--------|-----------------|
| 🔴 **P0** | Compliance | Fix `generate_instances_for_period` to handle all recurrence types (`daily`, `weekly`, `annual`, etc.) |
| 🔴 **P0** | Compliance | Wire escalation tasks to INSERT into `alerts` table instead of `print()` |
| 🔴 **P0** | Inspection | Build `routers/incidents.py` + service for near-miss/accident flow + Form 4-A/4-B/4-C |
| 🔴 **P0** | AI | Build `routers/ai.py` + `services/ai_service.py` (risk score + anomaly detection) |
| 🟠 **P1** | Compliance | Respect `reminder_offsets_days` from each `compliance_requirement` record |
| 🟠 **P1** | Compliance | Filter instance generation by `applicable_mine_types` and `applicable_states` |
| 🟠 **P1** | Inspection | Add geo-fence validation (PostGIS `ST_Contains`) in sync push |
| 🟠 **P1** | Inspection | Enforce evidence upload check before CAPA can transition to `verified_closed` |
| 🟡 **P2** | Inspection | DB trigger to keep `observation_count` / `violation_count` accurate on inspection |
| 🟡 **P2** | Compliance | Redis-cache compliance health score (5 min TTL) |
| 🟡 **P2** | AI | Wire CH4 gas reading alert synchronously in overman report endpoint |
| 🟡 **P2** | Inspection | Implement `pending_verification` state in violation/CAPA transition logic |
| 🟢 **P3** | Compliance | Predictive breach forecasting using historical instance patterns |
| 🟢 **P3** | AI | Officer correction feedback loop → `model_feedback` table for retraining |
| 🟢 **P3** | Inspection | Auto-generate PDF inspection memo on `submit_inspection` |
| 🟢 **P3** | AI | Cross-mine risk benchmarking (mine vs. subsidiary vs. CIL national avg) |
