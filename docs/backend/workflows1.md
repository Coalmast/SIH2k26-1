Viewed backend_spec.md:801-1280
Listed directory SIH2026
Listed directory backend
Searched for "compliance_instances"
Viewed scheduler.py:1-54
Viewed compliance.py:1-146
Listed directory services
Listed directory routers
Listed directory models
Searched for "anomaly"
Searched for "\bai\b"
Viewed inspection.py:1-218
Viewed compliance_escalation_tasks.py:1-69
Viewed escalation_tasks.py:1-77
Viewed compliance_service.py:1-194
Viewed inspection_service.py:1-249
Searched for "risk"
Viewed main.py:1-78
Viewed Untitled%20query%20365.sql:1-800

Based on the active backend codebase, here is the detailed breakdown of how these workflows are implemented, how the queues/reminders are handled, and the current state of the Anomaly & AI engines:

---

### 1. Compliance Task & Escalation Workflow
The scheduling, queueing, and reminder generation are split between **Celery Periodic Tasks** and the **Compliance Service**:

#### Where the schedule is generated:
*   **Monthly Automated Generation:** Defined in [`services/scheduler.py`](file:///c:/Coding/SIH2026/backend/services/scheduler.py#L7-L13). A Celery beat task named `generate_monthly_instances` is configured to run on the **1st of every month at 00:05 IST** (`crontab(minute=5, hour=0, day_of_month=1)`).
*   **On-Demand Fallback Generation:** Defined in [`services/compliance_service.py`](file:///c:/Coding/SIH2026/backend/services/compliance_service.py#L151-L193) via `ComplianceService.generate_instances_for_period`. This function fetches active `ComplianceRequirement` templates, checks if an instance already exists for that mine and month, and if not, generates a new `ComplianceInstance` with start, end, and due dates.

#### How it creates the queue and generates reminders:
*   **The Queue:** The queue is essentially a database polling mechanism. A Celery beat task runs **every 15 minutes** (`check-overdue-compliance-every-15min` in [`main.py`](file:///c:/Coding/SIH2026/backend/main.py#L29-L33)), which invokes [`services/compliance_escalation_tasks.py`](file:///c:/Coding/SIH2026/backend/services/compliance_escalation_tasks.py).
*   **Reminder and Escalation Timers:** 
    The task computes `days_diff = (now - due_date).days` for compliance instances that are not approved. It then routes alerts based on how close the deadline is:
    *   **T-7 days (Due in 1 week):** Dispatches warning to the **Compliance Officer**.
    *   **T-3 days (Due in 3 days):** Dispatches warning to the **Mine Manager**.
    *   **T+0 (Due date passed):** Automatically changes status to `breached` (overdue) and alerts both the **Mine Manager** and **Subsidiary Head**.
    *   **T+7 days overdue:** Dispatches Level-2 alert to the **Subsidiary Head**.
    *   **T+14 days overdue:** Dispatches critical escalation directly to the **Regulator**.

---

### 2. Inspection & CAPA (Corrective and Preventive Action) Workflow
This workflow is implemented in [`services/inspection_service.py`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py) and behaves as follows:

*   **Observation to Violation Promotion:** When an inspector records an observation (`add_observation()`), if the severity is marked as `high` or `critical`, the backend **automatically registers it as a `Violation`** in the database with a status of `reported` ([`inspection_service.py:L118-L133`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py#L118-L133)).
*   **Compliance Breach Trigger:** When the inspection is submitted (`submit_inspection()`), if any observations contained a `critical` violation, the backend **automatically inserts a new compliance breach** (`ComplianceInstance` with status `breached`) so corporate admins are immediately alerted ([`inspection_service.py:L74-L90`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py#L74-L90)).
*   **CAPA Assignment:** The Mine Manager/Safety Officer assigns a corrective action via `assign_capa()`, which sets the CAPA status to `assigned` and the violation's status to `capa_assigned` ([`inspection_service.py:L163-L187`](file:///c:/Coding/SIH2026/backend/services/inspection_service.py#L163-L187)).
*   **CAPA Escalation Queue:** A Celery beat task runs **every 15 minutes** (`check-overdue-capas-every-15min` in [`main.py`](file:///c:/Coding/SIH2026/backend/main.py#L25-L28)), which triggers [`services/escalation_tasks.py`](file:///c:/Coding/SIH2026/backend/services/escalation_tasks.py):
    *   **1 day overdue:** Sends reminder to the assigned officer.
    *   **3 days overdue:** Escalates notification to the **Mine Manager**.
    *   **7 days overdue:** Escalates notification to the **Subsidiary Head** and sets the parent violation to `is_regulator_visible = True` (making it visible on the regulator portal).
    *   **14 days overdue:** Direct critical alert to the **Regulator**.
*   **Verification and Closure:** Once the assigned officer marks it `completed` and uploads evidence, a supervisor verifies it via `verify_close_capa()`. When all linked CAPAs are closed, the parent `Violation` status transitions to `closed`. If the CAPA source was a compliance breach, it transitions the `ComplianceInstance` status from `breached` back to `in_progress` to allow standard review.

---

### 3. Detailed Anomaly Engine & AI Analytics Module
#### Current State in the Codebase: **Mocked/Not Yet Implemented**
If you look at the physical code structure (such as [`main.py`](file:///c:/Coding/SIH2026/backend/main.py#L58-L63) or the [`routers/`](file:///c:/Coding/SIH2026/backend/routers) directory), **the AI Engine and Anomaly Engine are currently missing from the Python backend logic.** 

The detailed calculations described in Section 9 of `backend_spec.md` (XGBoost models, Facebook Prophet forecasts, NLP classification) have **no actual Python implementation code** in the backend yet. 

However, **database support is already in place**:
*   The migration [`Untitled query 365.sql`](file:///c:/Coding/SIH2026/backend/supabase/snippets/Untitled%20query%20365.sql#L606-L626) defines the `anomaly_flags` table (to store expected vs. actual values, deviation percentages, and confidence scores) and the `mine_risk_scores` table (to store computed scores, trends, and contributing factors).
*   The `Observation` model in [`models/inspection.py`](file:///c:/Coding/SIH2026/backend/models/inspection.py#L146-L147) includes the columns `ai_category` and `ai_confidence_score` to store NLP inference results.

**What needs to be built:** The FastAPI backend needs a new router (`routers/ai.py`) and a compute service (`services/ai_service.py`) to connect these database tables to actual Python libraries (`scikit-learn`, `xgboost`, `prophet`, etc.) for calculating the risk scores and flagging anomalies.