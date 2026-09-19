# Testing Compliance Workflow 1 — Quick Start Guide

**What do you actually do?** This guide walks through the entire compliance workflow with practical steps.

---

## Quick Summary: What You're Testing

The Workflow 1 lifecycle has 6 phases. You'll test each one sequentially:

| Phase | What Happens | Who | Where |
|-------|--------------|-----|-------|
| 1️⃣ **Regulation Seeding** | Admin loads master regulations (Mines Act, CMR, etc.) once | System Admin | Web Dashboard |
| 2️⃣ **Auto Task Generation** | System creates compliance tasks for each mine + regulation combo | Automated | Backend (Database) |
| 3️⃣ **Task Visibility** | Managers/Officers see tasks on their dashboards | Any Role | Web/Mobile Dashboard |
| 4️⃣ **Evidence Submission** | Field Officer uploads PDF/photo or manual entry | Field Officer | Mobile App |
| 5️⃣ **Review & Approval** | Compliance Officer reviews and approves/rejects evidence | Compliance Officer | Web Dashboard |
| 6️⃣ **Breach Escalation** | If due date passes, alerts escalate (T+0d, +3d, +7d, +14d) | Automated | Notifications |

---

## Prerequisites: Setup

### 1. Backend Server Running
```bash
cd backend
python main.py
```
You should see:
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2. Database Seeded with Regulations
The seed script should already populate regulations. If not:
```bash
cd backend
python seed.py
```

### 3. Test User IDs (hardcoded in seed)
```
SYSTEM_ADMIN = "00000000-0000-0000-0000-000000000010"
MINE_MANAGER = "00000000-0000-0000-0000-000000000011"
COMPLIANCE_OFFICER = "00000000-0000-0000-0000-000000000012"
FIELD_OFFICER = "00000000-0000-0000-0000-000000000013"
TEST MINE = "00000000-0000-0000-0000-000000000004"
```

---

## Testing Each Phase

### ✅ Phase 1: Regulation Library Seeding

**Goal:** Verify that master regulations are available in the system.

#### Option A: Run API Test
```bash
cd backend
pytest test_compliance_workflow.py::TestPhase1_RegulationSeeding::test_1_1_list_regulations -v -s
```

Expected output:
```
✓ Found 6 regulations
  Regulations: ['MINES_ACT_1952', 'CMR_2017', 'MMR_1961', 'EP_ACT_1986', 'CLRA_1970', 'FACTORIES_ACT']
```

#### Option B: Manual Web Check (if web dashboard is ready)
1. Log in as System Admin
2. Go to **Settings → Compliance → Master Regulations**
3. Should see a table with these regulations:
   - Mines Act 1952
   - CMR 2017
   - MMR 1961
   - EP Act 1986
   - CLRA 1970
   - Factories Act

#### Option C: Direct Database Check
```sql
-- In Supabase SQL Editor
SELECT code, title, category, authority FROM regulations;
-- Should return 6+ rows
```

---

### ✅ Phase 2: Auto Task Generation

**Goal:** Verify that compliance_instances were created for the mine.

#### Option A: Run API Test
```bash
pytest test_compliance_workflow.py::TestPhase2_AutoTaskGeneration::test_2_1_list_pending_instances -v -s
```

Expected output:
```
✓ Found 12 pending compliance instances
  Sample: a1b2c3d4-..., Due: 2026-09-20
```

#### Option B: Direct Database Check
```sql
-- In Supabase SQL Editor
SELECT id, requirement_id, mine_id, due_date, status 
FROM compliance_instances 
WHERE mine_id = '00000000-0000-0000-0000-000000000004'
ORDER BY due_date;

-- Should see multiple rows with status='pending'
-- Due dates should span across different periods (daily/weekly/monthly/annual)
```

#### What to verify:
- [ ] Each regulation should have at least 1 instance per mine per period
- [ ] Status should be `pending` initially
- [ ] `assigned_to` field should match the responsible role for that regulation
- [ ] `due_date` should be set correctly based on recurrence:
  - Daily: due_date = today
  - Weekly: due_date = next week
  - Monthly: due_date = next month 1st
  - Quarterly: due_date = next quarter
  - Annual: due_date = next year same date

---

### ✅ Phase 3: Task Visibility

**Goal:** Different user roles see the right tasks on their dashboards.

#### Option A: Test via API
```bash
pytest test_compliance_workflow.py::TestPhase3_TaskVisibility -v -s
```

#### Option B: Manual Testing Through Web/Mobile

**As Mine Manager:**
1. Log in with MINE_MANAGER credentials
2. Go to **Compliance → Calendar**
3. You should see:
   - Upcoming tasks (next 30 days) - blue color
   - Overdue tasks (past due date) - red color
   - Approved tasks (completed) - green color
4. Try filtering by month: `?month=2026-09`
5. Try filtering by status: "pending", "submitted", "approved", "breached"

**As Field Officer (Mobile):**
1. Log in with FIELD_OFFICER credentials
2. On Home screen, find "Pending Compliance Tasks" section
3. Tap any task to see details
4. Verify you can see:
   - Task title (regulation name)
   - Due date
   - Instructions for evidence submission

---

### ✅ Phase 4: Evidence Submission

**Goal:** Verify that evidence can be uploaded and is linked to the instance.

#### How to Test:

**Step 1: Get an instance to submit evidence for**
```bash
pytest test_compliance_workflow.py::TestPhase4_EvidenceSubmission::test_4_1_list_in_progress_instances -v -s
```

**Step 2: Manually transition instance to "in_progress" (prerequisite)**

In Supabase SQL Editor:
```sql
UPDATE compliance_instances 
SET status = 'in_progress' 
WHERE mine_id = '00000000-0000-0000-0000-000000000004'
LIMIT 1
RETURNING id;
```
Note the returned instance ID.

**Step 3: Submit Evidence via API**

Create a test script `test_submit_evidence.py`:
```python
import httpx
from jose import jwt

BASE_URL = "http://127.0.0.1:8000/api/v1"
JWT_SECRET = "super-secret-jwt-token-with-at-least-32-characters-long"
FIELD_OFFICER_ID = "00000000-0000-0000-0000-000000000013"
INSTANCE_ID = "a1b2c3d4-..."  # From Step 2

def generate_token(user_id: str) -> str:
    return jwt.encode({"sub": user_id}, JWT_SECRET, algorithm="HS256")

# Create a test PDF file
with open("test_compliance.pdf", "wb") as f:
    f.write(b"PDF test content")

token = generate_token(FIELD_OFFICER_ID)
headers = {"Authorization": f"Bearer {token}"}

with httpx.Client(base_url=BASE_URL, headers=headers, timeout=30.0) as client:
    with open("test_compliance.pdf", "rb") as f:
        files = {"files": (f.name, f, "application/pdf")}
        data = {"notes": "This is compliance evidence for Q3 2026"}
        
        resp = client.post(
            f"/compliance/instances/{INSTANCE_ID}/submit",
            files=files,
            data=data
        )
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.json()}")
```

Run it:
```bash
cd backend
python test_submit_evidence.py
```

**Step 4: Verify in Database**
```sql
SELECT id, instance_id, document_url, upload_method, uploaded_at 
FROM compliance_evidences 
WHERE instance_id = 'a1b2c3d4-...';
-- Should see 1 row
```

#### What to verify:
- [ ] File uploaded to Supabase Storage
- [ ] Evidence record created with document_url
- [ ] upload_method = 'web_upload' (or 'mobile_capture' if via mobile)
- [ ] Instance status should still be 'submitted' (or change after upload)

---

### ✅ Phase 5: Review & Approval

**Goal:** Compliance Officer approves evidence and instance moves to "approved" status.

#### Step 1: Find a submitted instance
```sql
SELECT id, mine_id, due_date, status 
FROM compliance_instances 
WHERE status = 'submitted'
LIMIT 1;
```

#### Step 2: Approve via API

Create `test_approve_instance.py`:
```python
import httpx
from jose import jwt

BASE_URL = "http://127.0.0.1:8000/api/v1"
JWT_SECRET = "super-secret-jwt-token-with-at-least-32-characters-long"
COMPLIANCE_OFFICER_ID = "00000000-0000-0000-0000-000000000012"
INSTANCE_ID = "a1b2c3d4-..."  # From above

def generate_token(user_id: str) -> str:
    return jwt.encode({"sub": user_id}, JWT_SECRET, algorithm="HS256")

token = generate_token(COMPLIANCE_OFFICER_ID)
headers = {"Authorization": f"Bearer {token}"}

with httpx.Client(base_url=BASE_URL, headers=headers, timeout=30.0) as client:
    resp = client.post(
        f"/compliance/instances/{INSTANCE_ID}/approve",
        json={"comments": "Verified and approved"}
    )
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.json()}")
```

#### Step 3: Verify Status Changed
```sql
SELECT id, status, verified_by, verified_at 
FROM compliance_instances 
WHERE id = 'a1b2c3d4-...';
-- Should show:
--   status = 'approved'
--   verified_by = '00000000-0000-0000-0000-000000000012' (compliance officer ID)
--   verified_at = NOW()
```

#### Step 4: Verify Audit Trail
```sql
SELECT entity_id, action, actor_id, created_at, changes 
FROM audit_logs 
WHERE entity_id = 'a1b2c3d4-...'
ORDER BY created_at DESC
LIMIT 5;
-- Should see an entry with action = 'approve'
```

#### Alternative: Test Rejection
```python
resp = client.post(
    f"/compliance/instances/{INSTANCE_ID}/reject",
    json={"rejection_reason": "Incomplete documentation. Please resubmit with all signed forms."}
)
```

Then verify:
```sql
SELECT status, rejection_reason 
FROM compliance_instances 
WHERE id = 'a1b2c3d4-...';
-- Should show status = 'revision_requested' or 'in_progress'
-- rejection_reason should be populated
```

---

### ✅ Phase 6: Breach Escalation

**Goal:** Verify that overdue instances trigger escalation alerts at T+0d, T+3d, T+7d, T+14d.

#### How to Test:

**Step 1: Create a "past-due" instance**

```sql
-- Find or create an instance with past due date
UPDATE compliance_instances 
SET due_date = NOW() - INTERVAL '1 day', 
    status = 'pending'  -- Still pending (not approved)
WHERE mine_id = '00000000-0000-0000-0000-000000000004'
  AND status != 'approved'
LIMIT 1
RETURNING id;
```

Note the instance ID.

**Step 2: Trigger the Escalation Job**

The backend should have a scheduled task that runs every 15 minutes to check for breached instances. Two options:

**Option A: Manual Trigger (if endpoint exists)**
```bash
curl -X POST http://127.0.0.1:8000/api/v1/admin/compliance/escalate
```

**Option B: Wait 15 minutes** and check results, OR...

**Option C: Run Test Manually**
```bash
pytest test_compliance_workflow.py::TestPhase6_BreachEscalation -v -s
```

**Step 3: Verify Status Changed to BREACHED**
```sql
SELECT id, status, due_date, updated_at 
FROM compliance_instances 
WHERE id = 'a1b2c3d4-...';
-- Should show status = 'breached'
```

**Step 4: Verify Escalation Records Created**
```sql
SELECT recipient_role, alert_level, escalation_day, created_at 
FROM compliance_escalation_tasks 
WHERE instance_id = 'a1b2c3d4-...'
ORDER BY created_at;

-- You should see records for:
--   - T+0d (immediate) → Mine Manager
--   - T+3d (3 days later) → Subsidiary Admin
--   - T+7d (7 days later) → Make regulator_visible
--   - T+14d (14 days later) → Regulatory authority
```

**Step 5: Verify Notifications Queued**
```sql
SELECT notification_type, recipient_id, status, created_at 
FROM notifications 
WHERE related_instance_id = 'a1b2c3d4-...'
ORDER BY created_at DESC
LIMIT 10;

-- Should see notifications with:
--   - recipient_id = mine manager for T+0d
--   - recipient_id = subsidiary admin for T+3d
--   - status = 'pending' or 'sent' (depending on queue processing)
```

**Step 6: Simulate Time Passage (Advanced)**

To test the full escalation ladder without waiting 14 days, you can:

1. Create multiple instances with different due dates:
   ```sql
   -- Instance breached 1 day ago (should be at T+0 and T+1)
   INSERT INTO compliance_instances (...) 
   VALUES (..., due_date = NOW() - INTERVAL '1 day', ...)
   
   -- Instance breached 4 days ago (should be at T+3)
   INSERT INTO compliance_instances (...) 
   VALUES (..., due_date = NOW() - INTERVAL '4 days', ...)
   
   -- Instance breached 8 days ago (should be at T+7 - regulator visible)
   INSERT INTO compliance_instances (...) 
   VALUES (..., due_date = NOW() - INTERVAL '8 days', ...)
   
   -- Instance breached 15 days ago (should be at T+14 - authority alert)
   INSERT INTO compliance_instances (...) 
   VALUES (..., due_date = NOW() - INTERVAL '15 days', ...)
   ```

2. Run escalation check:
   ```bash
   curl -X POST http://127.0.0.1:8000/api/v1/admin/compliance/escalate
   ```

3. Verify each gets the right escalation level

---

## Test Execution Order

Run all tests end-to-end:

```bash
cd backend

# Phase 1: Regulations are seeded
pytest test_compliance_workflow.py::TestPhase1_RegulationSeeding -v -s

# Phase 2: Instances exist
pytest test_compliance_workflow.py::TestPhase2_AutoTaskGeneration -v -s

# Phase 3: Visibility
pytest test_compliance_workflow.py::TestPhase3_TaskVisibility -v -s

# Phase 4: Evidence submission (requires manual setup)
pytest test_compliance_workflow.py::TestPhase4_EvidenceSubmission -v -s

# Phase 5: Approval workflow
pytest test_compliance_workflow.py::TestPhase5_ReviewAndApproval -v -s

# Phase 6: Escalation
pytest test_compliance_workflow.py::TestPhase6_BreachEscalation -v -s
```

Or run all at once:
```bash
pytest test_compliance_workflow.py -v -s
```

---

## Troubleshooting

### "No pending instances found"
**Problem:** Phase 2 test returns 0 instances  
**Cause:** Compliance requirements/instances weren't auto-generated  
**Fix:**
```bash
# Manually trigger generation for test mine
python -c "
import asyncio
from database import SessionLocal
from services.compliance_service import ComplianceService
from uuid import UUID

mine_id = UUID('00000000-0000-0000-0000-000000000004')

async def gen():
    async with SessionLocal() as db:
        await ComplianceService.generate_instances_for_mine(db, mine_id)
        print('✓ Generated instances')

asyncio.run(gen())
"
```

### "Instance not found" errors
**Problem:** API returns 404 when accessing instance  
**Cause:** Instance ID is wrong or doesn't exist  
**Fix:** Use the exact ID from database query, copy/paste carefully

### Evidence not uploading
**Problem:** POST /compliance/instances/{id}/submit returns 400 or 500  
**Cause:** Multipart form encoding issue  
**Fix:**
```python
# Use this format:
files = {"files": ("filename.pdf", open("file.pdf", "rb"), "application/pdf")}
data = {"notes": "text"}
# NOT: json={"files": ...}
```

### Escalation not triggering
**Problem:** Instance remains in 'pending' even though due_date is past  
**Cause:** Escalation job hasn't run  
**Fix:**
```bash
# Check if scheduler is running
curl http://127.0.0.1:8000/api/v1/health

# Manually trigger escalation
curl -X POST http://127.0.0.1:8000/api/v1/admin/compliance/escalate
```

---

## Success Criteria

**Phase 1:** ✅ Regulations visible  
**Phase 2:** ✅ Instances created for mine  
**Phase 3:** ✅ Different roles see correct filtered tasks  
**Phase 4:** ✅ Evidence file uploaded and stored  
**Phase 5:** ✅ Approval changes status to "approved" and creates audit entry  
**Phase 6:** ✅ Breached instances trigger escalation alerts at correct times  

If all 6 phases pass, **Workflow 1 is working correctly!**

---

## Database Schema (For Reference)

Tables involved:
```
regulations
  ├─ id, code, title, category, authority, ...
  
compliance_requirements
  ├─ id, regulation_id, title, recurrence, applicable_mine_types, ...
  
compliance_instances
  ├─ id, requirement_id, mine_id, due_date, status, assigned_to, ...
  
compliance_evidences
  ├─ id, instance_id, document_url, upload_method, ...
  
audit_logs
  ├─ id, entity_id, action, actor_id, created_at, changes, ...
  
notifications
  ├─ id, recipient_id, related_instance_id, notification_type, ...
  
compliance_escalation_tasks
  ├─ id, instance_id, escalation_day, alert_level, recipient_role, ...
```

