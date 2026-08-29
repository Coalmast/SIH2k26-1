# JSON Schemas — SGCMP (Smart Governance & Compliance Monitoring Platform)

> **Scope**: Schemas are scoped strictly to the **7 Phase-1 MVP features** from the [Product Brief](file:///c:/Coding/SIH2026/Product%20Brief.md):
>
> 1. Statutory compliance tracking (safety, environment, production, labour)
> 2. Real-time inspection, observation, violation, and corrective-action logging
> 3. Geo-tagged, time-stamped mobile field reporting with offline-first support
> 4. Role-based dashboards (mine official / corporate / regulator view)
> 5. Automated alerts, reminders, and escalation workflows
> 6. OCR-based digitization of existing paper compliance records
> 7. AI/analytics layer: risk scoring, recurring-violation detection, anomaly flagging

---

## Table of Contents

1. [Foundational Entities](#1-foundational-entities)
   - 1.1 [Organization](#11-organization)
   - 1.2 [Subsidiary](#12-subsidiary)
   - 1.3 [Mine](#13-mine)
   - 1.4 [User](#14-user)
   - 1.5 [Role & Permission](#15-role--permission)
   - 1.6 [GeoStamp (Shared Embeddable)](#16-geostamp-shared-embeddable)
2. [Statutory Compliance Module](#2-statutory-compliance-module)
   - 2.1 [Regulation Library (Master)](#21-regulation-library-master)
   - 2.2 [Compliance Requirement](#22-compliance-requirement)
   - 2.3 [Compliance Instance](#23-compliance-instance)
   - 2.4 [Compliance Evidence](#24-compliance-evidence)
3. [Inspection & Violation Management](#3-inspection--violation-management)
   - 3.1 [Inspection](#31-inspection)
   - 3.2 [Inspection Checklist Template](#32-inspection-checklist-template)
   - 3.3 [Observation](#33-observation)
   - 3.4 [Violation](#34-violation)
   - 3.5 [Corrective Action (CAPA)](#35-corrective-action-capa)
   - 3.6 [Media Attachment](#36-media-attachment)
4. [Statutory Registers (Digitized)](#4-statutory-registers-digitized)
   - 4.1 [Accident / Dangerous Occurrence Register](#41-accident--dangerous-occurrence-register)
   - 4.2 [Safety Committee Meeting Record](#42-safety-committee-meeting-record)
   - 4.3 [Explosive Register Entry](#43-explosive-register-entry)
   - 4.4 [Overman / Official Report](#44-overman--official-report)
   - 4.5 [Environmental Monitoring Log](#45-environmental-monitoring-log)
   - 4.6 [Production Register Entry](#46-production-register-entry)
   - 4.7 [Attendance / Muster Roll Entry](#47-attendance--muster-roll-entry)
5. [Contractor Ecosystem](#5-contractor-ecosystem)
   - 5.1 [Contractor](#51-contractor)
   - 5.2 [Contractor Document](#52-contractor-document)
   - 5.3 [Contractor Assignment (Work Order)](#53-contractor-assignment-work-order)
   - 5.4 [Contract Worker](#54-contract-worker)
   - 5.5 [Workforce Deployment Record](#55-workforce-deployment-record)
6. [Mobile Field Reporting](#6-mobile-field-reporting)
   - 6.1 [Field Report (Generic)](#61-field-report-generic)
   - 6.2 [Incident / Near-Miss Report](#62-incident--near-miss-report)
   - 6.3 [Safety Observation (STOP Card)](#63-safety-observation-stop-card)
   - 6.4 [Offline Sync Envelope](#64-offline-sync-envelope)
7. [Dashboard & Aggregation](#7-dashboard--aggregation)
   - 7.1 [Dashboard Summary (Mine-Level)](#71-dashboard-summary-mine-level)
   - 7.2 [Compliance Health Snapshot](#72-compliance-health-snapshot)
   - 7.3 [Risk Heatmap Entry](#73-risk-heatmap-entry)
8. [Alerts, Reminders & Escalation Workflows](#8-alerts-reminders--escalation-workflows)
   - 8.1 [Alert / Notification](#81-alert--notification)
   - 8.2 [Escalation Workflow Instance](#82-escalation-workflow-instance)
   - 8.3 [Approval Workflow Instance](#83-approval-workflow-instance)
   - 8.4 [Workflow Template (Configurable)](#84-workflow-template-configurable)
9. [OCR & Document Digitization](#9-ocr--document-digitization)
   - 9.1 [Document Upload](#91-document-upload)
   - 9.2 [OCR Extraction Result](#92-ocr-extraction-result)
   - 9.3 [OCR Review Queue Item](#93-ocr-review-queue-item)
10. [AI / Analytics Layer](#10-ai--analytics-layer)
    - 10.1 [Mine Risk Score](#101-mine-risk-score)
    - 10.2 [Contractor Risk Score](#102-contractor-risk-score)
    - 10.3 [Anomaly Flag](#103-anomaly-flag)
    - 10.4 [Recurring Violation Cluster](#104-recurring-violation-cluster)
11. [Audit Trail Entry](#11-audit-trail-entry)

---

## 1. Foundational Entities

These schemas define the organizational hierarchy and identity model underpinning every other schema. All compliance-relevant records carry `mine_id` and derivable `subsidiary_id` for row-level security enforcement.

> **Reference**: [LLD §5 Domain Model & Multi-Tenancy](file:///c:/Coding/SIH2026/LLD.md), [PRD §10.4 Entity Relationship](file:///c:/Coding/SIH2026/PRD.md)

---

### 1.1 Organization

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/organization.schema.json",
  "title": "Organization",
  "description": "Top-level entity — Ministry or PSU (e.g., Coal India Limited). Ref: LLD §5.1 Tenancy Hierarchy.",
  "type": "object",
  "required": ["id", "name", "type", "created_at"],
  "properties": {
    "id":         { "type": "string", "format": "uuid" },
    "name":       { "type": "string", "examples": ["Coal India Limited"] },
    "type":       { "type": "string", "enum": ["ministry", "psu"], "description": "Ministry of Coal or Public Sector Undertaking." },
    "created_at": { "type": "string", "format": "date-time" },
    "updated_at": { "type": "string", "format": "date-time" }
  }
}
```

---

### 1.2 Subsidiary

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/subsidiary.schema.json",
  "title": "Subsidiary",
  "description": "CIL subsidiary (ECL, BCCL, CCL, NCL, WCL, SECL, MCL, NEC, CMPDI). Each subsidiary = a tenant. Ref: Brainstorm §1.1, LLD §5.1.",
  "type": "object",
  "required": ["id", "organization_id", "name", "code"],
  "properties": {
    "id":              { "type": "string", "format": "uuid" },
    "organization_id": { "type": "string", "format": "uuid", "description": "FK → Organization" },
    "name":            { "type": "string", "examples": ["Eastern Coalfields Limited"] },
    "code":            { "type": "string", "examples": ["ECL", "BCCL", "CCL"], "minLength": 2, "maxLength": 10 },
    "state":           { "type": "string", "examples": ["West Bengal", "Jharkhand"] },
    "created_at":      { "type": "string", "format": "date-time" },
    "updated_at":      { "type": "string", "format": "date-time" }
  }
}
```

---

### 1.3 Mine

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/mine.schema.json",
  "title": "Mine",
  "description": "Individual mine site. Boundary stored as PostGIS polygon for geo-fencing. Ref: LLD §5.1, Brainstorm §1.1 (300+ active mines).",
  "type": "object",
  "required": ["id", "subsidiary_id", "name", "mine_type", "status"],
  "properties": {
    "id":              { "type": "string", "format": "uuid" },
    "subsidiary_id":   { "type": "string", "format": "uuid", "description": "FK → Subsidiary" },
    "name":            { "type": "string", "examples": ["Rajmahal OCP", "Jhanjra UG Mine"] },
    "mine_type":       { "type": "string", "enum": ["opencast", "underground", "mixed"], "description": "Determines applicable checklist templates and regulations." },
    "status":          { "type": "string", "enum": ["active", "temporarily_closed", "abandoned"], "description": "Per CMR 2017 Form 1-A/1-C/1-D." },
    "boundary_geojson": {
      "type": "object",
      "description": "GeoJSON Polygon defining mine boundary (PostGIS). Used for geo-fence validation of field reports.",
      "properties": {
        "type":        { "const": "Polygon" },
        "coordinates": { "type": "array", "items": { "type": "array", "items": { "type": "array", "items": { "type": "number" }, "minItems": 2, "maxItems": 3 } } }
      }
    },
    "district":        { "type": "string" },
    "state":           { "type": "string" },
    "dgms_region":     { "type": "string", "description": "DGMS regional office jurisdiction." },
    "ec_number":       { "type": "string", "description": "Environment Clearance reference number (MoEFCC)." },
    "coal_grade":      { "type": "string", "examples": ["G-4", "G-10"] },
    "created_at":      { "type": "string", "format": "date-time" },
    "updated_at":      { "type": "string", "format": "date-time" }
  }
}
```

---

### 1.4 User

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/user.schema.json",
  "title": "User",
  "description": "Platform user — linked to Keycloak subject for SSO. Scoped to a mine (field) or subsidiary/org (corporate). Ref: LLD §5.2, §6.1.",
  "type": "object",
  "required": ["id", "keycloak_subject", "full_name", "designation", "role_ids"],
  "properties": {
    "id":                  { "type": "string", "format": "uuid" },
    "keycloak_subject":    { "type": "string", "description": "Keycloak OIDC subject claim." },
    "full_name":           { "type": "string" },
    "designation":         { "type": "string", "examples": ["Mine Manager", "Safety Officer", "Mining Sirdar", "Environmental Officer"] },
    "email":               { "type": "string", "format": "email" },
    "phone":               { "type": "string", "description": "Encrypted at rest (PII). Used for SMS alerts." },
    "mine_id":             { "type": ["string", "null"], "format": "uuid", "description": "FK → Mine. Null for corporate/regulator roles." },
    "subsidiary_id":       { "type": ["string", "null"], "format": "uuid", "description": "FK → Subsidiary. Derived from mine_id or set directly for subsidiary-level roles." },
    "role_ids":            { "type": "array", "items": { "type": "string", "format": "uuid" }, "minItems": 1 },
    "preferred_language":  { "type": "string", "enum": ["en", "hi", "bn", "or", "te", "mr", "cg"], "default": "en" },
    "is_active":           { "type": "boolean", "default": true },
    "created_at":          { "type": "string", "format": "date-time" },
    "updated_at":          { "type": "string", "format": "date-time" }
  }
}
```

---

### 1.5 Role & Permission

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/role.schema.json",
  "title": "Role",
  "description": "RBAC role. Scoped access enforced at API Gateway + service layer. Ref: LLD §5.2, §6.1.",
  "type": "object",
  "required": ["id", "name", "scope_level", "permissions"],
  "properties": {
    "id":          { "type": "string", "format": "uuid" },
    "name":        { "type": "string", "enum": ["field_officer", "mine_manager", "safety_officer", "environmental_officer", "compliance_officer", "contractor_manager", "subsidiary_admin", "corporate_executive", "regulator", "system_admin"] },
    "scope_level": { "type": "string", "enum": ["mine", "subsidiary", "organization", "jurisdiction"], "description": "Data visibility boundary." },
    "permissions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["resource", "actions"],
        "properties": {
          "resource": { "type": "string", "examples": ["compliance_instance", "inspection", "violation", "contractor", "dashboard", "report"] },
          "actions":  { "type": "array", "items": { "type": "string", "enum": ["create", "read", "update", "delete", "approve", "escalate", "export"] } }
        }
      }
    }
  }
}
```

---

### 1.6 GeoStamp (Shared Embeddable)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/geostamp.schema.json",
  "title": "GeoStamp",
  "description": "Embedded in every field-captured entity. Captured on-device at creation time — not re-derived server-side. Ref: LLD §7.5.2. Records with accuracy >50m are flagged 'low_confidence_location'.",
  "type": "object",
  "required": ["latitude", "longitude", "accuracy_meters", "captured_at", "device_id"],
  "properties": {
    "latitude":             { "type": "number", "minimum": -90, "maximum": 90 },
    "longitude":            { "type": "number", "minimum": -180, "maximum": 180 },
    "altitude_meters":      { "type": ["number", "null"] },
    "accuracy_meters":      { "type": "number", "minimum": 0, "description": "GPS horizontal accuracy. >50m triggers low_confidence_location flag." },
    "captured_at":          { "type": "string", "format": "date-time", "description": "Device-local timestamp at capture." },
    "device_id":            { "type": "string", "description": "Unique device identifier for audit trail." },
    "low_confidence_location": { "type": "boolean", "default": false },
    "location_mismatch":    { "type": "boolean", "default": false, "description": "Set server-side if geo_stamp falls outside assigned mine boundary. Ref: LLD §7.9.3." }
  }
}
```

---

## 2. Statutory Compliance Module

Digitizes the compliance calendar and tracking lifecycle. Every statutory obligation (safety, environment, production, labour) is modeled as a **Requirement** (master rule) that auto-generates **Instances** (due tasks) per mine.

> **Regulatory References**:
> - Mines Act, 1952 (Sec 58 — Annual Returns; Sec 23 — Accident Reporting)
> - Coal Mines Regulations (CMR), 2017 (Forms 1-A to 7, Reg 3–9, 28, 117, 167)
> - Environment (Protection) Act, 1986 + EIA Notification 2006 (EC Conditions)
> - Contract Labour (Regulation & Abolition) Act, 1970 (CLRA)
> - Factories Act, 1948 (where applicable)
>
> **Data Sources**: [Brainstorm §5 Module 1](file:///c:/Coding/SIH2026/Brainstrom1.md), [LLD §7.2](file:///c:/Coding/SIH2026/LLD.md), [PRD §7.1](file:///c:/Coding/SIH2026/PRD.md)

---

### 2.1 Regulation Library (Master)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/regulation.schema.json",
  "title": "Regulation",
  "description": "Master regulation entry. Pre-seeded from Mines Act 1952, CMR 2017, EP Act 1986, CLRA 1970, Factories Act 1948. Versioned — never mutated in place. Ref: LLD §7.2.4.",
  "type": "object",
  "required": ["id", "title", "statute", "section_reference", "category", "version"],
  "properties": {
    "id":                { "type": "string", "format": "uuid" },
    "title":             { "type": "string", "examples": ["Annual Returns Submission", "Accident Report (Fatal)", "EC Condition — Air Quality Monitoring"] },
    "statute":           { "type": "string", "examples": ["Mines Act 1952", "CMR 2017", "EP Act 1986", "CLRA 1970", "Factories Act 1948"] },
    "section_reference": { "type": "string", "examples": ["Sec 58", "Reg 4 (Form 3)", "Reg 8 (Form 4-A)", "Reg 167", "EC Condition #23"] },
    "category":          { "type": "string", "enum": ["safety", "environment", "production", "labour"], "description": "Maps to problem statement scope areas." },
    "description":       { "type": "string", "description": "Plain-language description of the obligation." },
    "authority":         { "type": "string", "enum": ["dgms", "moefcc", "spcb", "cco", "labour_dept", "district_magistrate", "internal"], "description": "Regulatory body to whom filings are submitted." },
    "consequence_of_non_compliance": { "type": "string", "examples": ["Show cause notice", "Mine stoppage order", "Prosecution under Sec 72"] },
    "version":           { "type": "integer", "minimum": 1, "description": "Incremented on any rule update. Historical instances reference their generation version." },
    "is_active":         { "type": "boolean", "default": true },
    "created_at":        { "type": "string", "format": "date-time" },
    "updated_at":        { "type": "string", "format": "date-time" }
  }
}
```

---

### 2.2 Compliance Requirement

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/compliance_requirement.schema.json",
  "title": "ComplianceRequirement",
  "description": "A specific obligation mapped to a mine type/state. The recurrence engine auto-generates ComplianceInstances per mine at each boundary. Ref: LLD §7.2.1, Brainstorm §5 Module 1 Compliance Library.",
  "type": "object",
  "required": ["id", "regulation_id", "title", "recurrence", "grace_period_days", "applicable_mine_types"],
  "properties": {
    "id":                   { "type": "string", "format": "uuid" },
    "regulation_id":        { "type": "string", "format": "uuid", "description": "FK → Regulation" },
    "title":                { "type": "string", "examples": ["Monthly Safety Committee Report", "Daily Production Return (Form I)", "Quarterly EC Compliance Report"] },
    "recurrence":           { "type": "string", "enum": ["daily", "weekly", "fortnightly", "monthly", "quarterly", "half_yearly", "annual", "on_event", "one_time"], "description": "Filing periodicity." },
    "grace_period_days":    { "type": "integer", "minimum": 0, "default": 0, "description": "Days after due date before status transitions to 'breached'." },
    "reminder_offsets_days": {
      "type": "array",
      "items": { "type": "integer" },
      "default": [30, 7, 1],
      "description": "Days before due date to send reminders. Ref: Brainstorm §5 Module 1 (T-30, T-7, T-1)."
    },
    "applicable_mine_types": {
      "type": "array",
      "items": { "type": "string", "enum": ["opencast", "underground", "mixed"] },
      "minItems": 1
    },
    "applicable_states":    { "type": ["array", "null"], "items": { "type": "string" }, "description": "Null = applicable in all states." },
    "documents_required":   { "type": "array", "items": { "type": "string" }, "description": "List of expected supporting documents.", "examples": [["Form 3 Annual Return", "Safety Committee Minutes"]] },
    "responsible_role":     { "type": "string", "enum": ["mine_manager", "safety_officer", "environmental_officer", "compliance_officer"], "description": "Default role assigned." },
    "regulation_version":   { "type": "integer", "description": "Snapshot of regulation version at creation." },
    "is_active":            { "type": "boolean", "default": true },
    "created_at":           { "type": "string", "format": "date-time" },
    "updated_at":           { "type": "string", "format": "date-time" }
  }
}
```

---

### 2.3 Compliance Instance

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/compliance_instance.schema.json",
  "title": "ComplianceInstance",
  "description": "A specific due-task for a specific mine for a specific compliance period. Auto-generated by the recurrence engine (Temporal workflow). Lifecycle: Pending → Submitted → Approved → [Breached]. Ref: LLD §7.2.2.",
  "type": "object",
  "required": ["id", "requirement_id", "mine_id", "due_date", "status", "period_start", "period_end"],
  "properties": {
    "id":                { "type": "string", "format": "uuid" },
    "requirement_id":    { "type": "string", "format": "uuid", "description": "FK → ComplianceRequirement" },
    "mine_id":           { "type": "string", "format": "uuid", "description": "FK → Mine" },
    "subsidiary_id":     { "type": "string", "format": "uuid", "description": "Denormalized from mine for RLS." },
    "period_start":      { "type": "string", "format": "date", "description": "Compliance period start." },
    "period_end":        { "type": "string", "format": "date", "description": "Compliance period end." },
    "due_date":          { "type": "string", "format": "date" },
    "status": {
      "type": "string",
      "enum": ["pending", "in_progress", "submitted", "revision_requested", "approved", "breached"],
      "description": "Lifecycle state. Ref: LLD §7.2.2 state diagram."
    },
    "is_late_submission": { "type": "boolean", "default": false, "description": "Permanently flagged if submitted after grace period. Feeds AI risk model — cannot be cleared. Ref: LLD §7.2.4." },
    "assigned_to":       { "type": "string", "format": "uuid", "description": "FK → User responsible." },
    "submitted_by":      { "type": ["string", "null"], "format": "uuid" },
    "submitted_at":      { "type": ["string", "null"], "format": "date-time" },
    "verified_by":       { "type": ["string", "null"], "format": "uuid" },
    "verified_at":       { "type": ["string", "null"], "format": "date-time" },
    "rejection_reason":  { "type": ["string", "null"] },
    "evidence_ids":      { "type": "array", "items": { "type": "string", "format": "uuid" }, "description": "FK → ComplianceEvidence[]" },
    "corrective_action_id": { "type": ["string", "null"], "format": "uuid", "description": "FK → CorrectiveAction, if breach triggers one." },
    "escalation_workflow_id": { "type": ["string", "null"], "format": "uuid", "description": "FK → EscalationWorkflowInstance, if escalated." },
    "compliance_score_impact": { "type": ["number", "null"], "description": "Points deducted from mine's compliance score." },
    "regulation_version": { "type": "integer", "description": "Version of the regulation at instance generation time." },
    "audit_hash":        { "type": ["string", "null"], "description": "SHA-256 hash anchored to blockchain ledger." },
    "created_at":        { "type": "string", "format": "date-time" },
    "updated_at":        { "type": "string", "format": "date-time" }
  }
}
```

---

### 2.4 Compliance Evidence

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/compliance_evidence.schema.json",
  "title": "ComplianceEvidence",
  "description": "Supporting document/evidence attached to a compliance instance. May be OCR-extracted from scanned statutory form. Ref: LLD §7.2.1.",
  "type": "object",
  "required": ["id", "instance_id", "document_url", "upload_method"],
  "properties": {
    "id":               { "type": "string", "format": "uuid" },
    "instance_id":      { "type": "string", "format": "uuid", "description": "FK → ComplianceInstance" },
    "document_url":     { "type": "string", "format": "uri", "description": "MinIO/S3 object reference to the uploaded file." },
    "file_name":        { "type": "string" },
    "file_type":        { "type": "string", "examples": ["application/pdf", "image/jpeg", "image/png"] },
    "file_size_bytes":  { "type": "integer" },
    "upload_method":    { "type": "string", "enum": ["web_upload", "mobile_capture", "ocr_scan"], "description": "Provenance of the evidence." },
    "ocr_result_id":    { "type": ["string", "null"], "format": "uuid", "description": "FK → OCRExtractionResult, if digitized via OCR pipeline." },
    "is_verified":      { "type": "boolean", "default": false, "description": "Human confirmation required before feeding statutory instance. Ref: LLD §7.8." },
    "verified_by":      { "type": ["string", "null"], "format": "uuid" },
    "verified_at":      { "type": ["string", "null"], "format": "date-time" },
    "uploaded_by":      { "type": "string", "format": "uuid" },
    "uploaded_at":      { "type": "string", "format": "date-time" }
  }
}
```

---

## 3. Inspection & Violation Management

End-to-end digitization of the DGMS inspection cycle: mobile capture → observation logging → violation flagging → corrective action → closure.

> **Regulatory References**:
> - CMR 2017 Reg 117 (Form 6 — Pointing out contraventions)
> - DGMS inspection types: Annual General, Surprise, Inquiry-based, Internal Safety Committee
> - CMR 2017 Reg 167 (Safety Committee meetings)
>
> **Data Sources**: [Brainstorm §5 Module 2](file:///c:/Coding/SIH2026/Brainstrom1.md), [LLD §7.3](file:///c:/Coding/SIH2026/LLD.md), [PRD §7.2](file:///c:/Coding/SIH2026/PRD.md)

---

### 3.1 Inspection

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/inspection.schema.json",
  "title": "Inspection",
  "description": "A field inspection conducted at a mine. Captured on mobile (offline-capable), geo-tagged at start. Ref: LLD §7.3.1, §7.3.2.",
  "type": "object",
  "required": ["id", "mine_id", "conducted_by", "inspection_type", "geo_stamp", "started_at", "status"],
  "properties": {
    "id":               { "type": "string", "format": "uuid", "description": "Client-generated UUID for idempotent sync." },
    "mine_id":          { "type": "string", "format": "uuid", "description": "FK → Mine" },
    "subsidiary_id":    { "type": "string", "format": "uuid", "description": "Denormalized for RLS." },
    "conducted_by":     { "type": "string", "format": "uuid", "description": "FK → User (inspector)." },
    "inspection_type": {
      "type": "string",
      "enum": ["dgms_annual_general", "dgms_surprise", "dgms_inquiry", "internal_safety_committee", "environmental_pcb", "medical_fitness", "electrical", "explosives"],
      "description": "Per Brainstorm §5 Module 2 inspection types."
    },
    "checklist_template_id": { "type": ["string", "null"], "format": "uuid", "description": "FK → InspectionChecklistTemplate." },
    "zone":             { "type": "string", "examples": ["Pit A", "Shaft 2", "Workshop", "Magazine", "Coal Handling Plant"], "description": "Mine section inspected." },
    "geo_stamp":        { "$ref": "sgcmp/geostamp.schema.json" },
    "started_at":       { "type": "string", "format": "date-time" },
    "completed_at":     { "type": ["string", "null"], "format": "date-time" },
    "submitted_at":     { "type": ["string", "null"], "format": "date-time" },
    "status": {
      "type": "string",
      "enum": ["draft", "in_progress", "submitted", "reviewed"],
      "description": "Draft = partially captured on mobile; Submitted = synced to server."
    },
    "sync_status":      { "type": "string", "enum": ["pending_sync", "synced", "sync_conflict"], "default": "pending_sync" },
    "observation_count": { "type": "integer", "default": 0, "description": "Denormalized count for dashboard queries." },
    "violation_count":   { "type": "integer", "default": 0 },
    "overall_remarks":   { "type": ["string", "null"] },
    "digital_signature_hash": { "type": ["string", "null"], "description": "SHA-256 of the inspector's digital signature on the memo." },
    "inspection_memo_url":    { "type": ["string", "null"], "format": "uri", "description": "Auto-generated PDF of the formal inspection memo." },
    "audit_hash":        { "type": ["string", "null"] },
    "created_at":        { "type": "string", "format": "date-time" },
    "updated_at":        { "type": "string", "format": "date-time" }
  }
}
```

---

### 3.2 Inspection Checklist Template

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/inspection_checklist_template.schema.json",
  "title": "InspectionChecklistTemplate",
  "description": "Configurable checklist template — dynamically rendered on mobile per mine type and inspection type. Admin-managed. Ref: PRD §7.2 FR-2.1, Brainstorm §5 Module 2.",
  "type": "object",
  "required": ["id", "name", "inspection_type", "applicable_mine_types", "checklist_items"],
  "properties": {
    "id":                    { "type": "string", "format": "uuid" },
    "name":                  { "type": "string", "examples": ["Underground Mine Safety Checklist — CMR 2017"] },
    "inspection_type":       { "type": "string", "enum": ["dgms_annual_general", "dgms_surprise", "internal_safety_committee", "environmental_pcb", "electrical", "explosives"] },
    "applicable_mine_types": { "type": "array", "items": { "type": "string", "enum": ["opencast", "underground", "mixed"] } },
    "regulation_reference":  { "type": "string", "examples": ["CMR 2017 Part V — Safety Provisions"] },
    "checklist_items": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["item_id", "category", "checkpoint_text"],
        "properties": {
          "item_id":          { "type": "string" },
          "category":         { "type": "string", "examples": ["ventilation", "roof_support", "electrical_safety", "fire_protection", "ppe_compliance", "haulage", "blasting"] },
          "checkpoint_text":  { "type": "string", "examples": ["Are all ventilation fans operational as per approved ventilation plan?"] },
          "regulation_ref":   { "type": "string", "examples": ["CMR 2017 Reg 130"] },
          "response_type":    { "type": "string", "enum": ["ok_noncompliant_observation", "yes_no_na", "numeric_range", "text"] },
          "is_mandatory":     { "type": "boolean", "default": true },
          "photo_required":   { "type": "boolean", "default": false }
        }
      }
    },
    "version":               { "type": "integer", "minimum": 1 },
    "is_active":             { "type": "boolean", "default": true },
    "created_at":            { "type": "string", "format": "date-time" },
    "updated_at":            { "type": "string", "format": "date-time" }
  }
}
```

---

### 3.3 Observation

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/observation.schema.json",
  "title": "Observation",
  "description": "Individual observation within an inspection. Geo-tagged independently. Severity >= medium auto-creates a Violation draft. Ref: LLD §7.3.1, §7.3.2 flowchart.",
  "type": "object",
  "required": ["id", "inspection_id", "category", "description", "severity", "geo_stamp"],
  "properties": {
    "id":               { "type": "string", "format": "uuid" },
    "inspection_id":    { "type": "string", "format": "uuid", "description": "FK → Inspection" },
    "checklist_item_id": { "type": ["string", "null"], "description": "Reference to specific checklist item, if applicable." },
    "category": {
      "type": "string",
      "enum": ["safety", "environment", "equipment", "labour", "ventilation", "electrical", "blasting", "haulage", "general"],
      "description": "Observation domain category."
    },
    "description":      { "type": "string", "description": "Free-text description of the observation." },
    "severity": {
      "type": "string",
      "enum": ["low", "medium", "high", "critical"],
      "description": "Medium+ auto-triggers Violation creation. Ref: LLD §7.3.2."
    },
    "status":           { "type": "string", "enum": ["ok", "non_compliant", "observation_only"], "description": "Checklist response status." },
    "geo_stamp":        { "$ref": "sgcmp/geostamp.schema.json" },
    "media_attachment_ids": { "type": "array", "items": { "type": "string", "format": "uuid" }, "description": "FK → MediaAttachment[]" },
    "voice_note_url":   { "type": ["string", "null"], "format": "uri", "description": "Transcribed via speech-to-text (Whisper/Bhashini)." },
    "voice_transcription": { "type": ["string", "null"] },
    "ai_category":      { "type": ["string", "null"], "description": "AI-assigned category from NLP classifier." },
    "ai_confidence_score": { "type": ["number", "null"], "minimum": 0, "maximum": 1 },
    "violation_id":     { "type": ["string", "null"], "format": "uuid", "description": "FK → Violation, if this observation flagged one." },
    "created_at":       { "type": "string", "format": "date-time" },
    "updated_at":       { "type": "string", "format": "date-time" }
  }
}
```

---

### 3.4 Violation

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/violation.schema.json",
  "title": "Violation",
  "description": "A regulatory violation flagged from an observation. Lifecycle: Reported → UnderReview → CAPA_Assigned → InProgress → PendingVerification → Closed / Dismissed. Ref: PRD §10.7 state machine, LLD §7.3.1.",
  "type": "object",
  "required": ["id", "observation_id", "mine_id", "severity", "status"],
  "properties": {
    "id":                { "type": "string", "format": "uuid" },
    "observation_id":    { "type": "string", "format": "uuid", "description": "FK → Observation" },
    "mine_id":           { "type": "string", "format": "uuid" },
    "subsidiary_id":     { "type": "string", "format": "uuid" },
    "statute_reference": { "type": "string", "examples": ["CMR 2017 Reg 117", "Mines Act 1952 Sec 19"], "description": "Specific regulation contravened." },
    "category":          { "type": "string", "enum": ["safety", "environment", "equipment", "labour"] },
    "severity":          { "type": "string", "enum": ["minor", "moderate", "major", "critical"] },
    "description":       { "type": "string" },
    "status": {
      "type": "string",
      "enum": ["reported", "under_review", "capa_assigned", "in_progress", "pending_verification", "closed", "dismissed", "systemic_risk"],
      "description": "Per PRD §10.7 state machine. 'systemic_risk' = AI-flagged as recurring. Ref: Brainstorm §5 Module 2."
    },
    "corrective_action_id": { "type": ["string", "null"], "format": "uuid", "description": "FK → CorrectiveAction" },
    "reported_by":       { "type": "string", "format": "uuid" },
    "reported_at":       { "type": "string", "format": "date-time" },
    "dismissed_reason":  { "type": ["string", "null"] },
    "is_regulator_visible": { "type": "boolean", "default": false, "description": "True for serious violations — visible on regulator portal." },
    "recurrence_count":  { "type": "integer", "default": 0, "description": "AI-computed: how many times this violation type has recurred at this mine." },
    "audit_hash":        { "type": ["string", "null"] },
    "created_at":        { "type": "string", "format": "date-time" },
    "updated_at":        { "type": "string", "format": "date-time" }
  }
}
```

---

### 3.5 Corrective Action (CAPA)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/corrective_action.schema.json",
  "title": "CorrectiveAction",
  "description": "Corrective and Preventive Action. Triggered by a Violation or a breached ComplianceInstance. Tracked via Temporal workflow with escalation. Ref: LLD §7.3.5, Brainstorm §5 Module 2.",
  "type": "object",
  "required": ["id", "source_type", "source_id", "mine_id", "description", "assigned_to", "due_date", "status"],
  "properties": {
    "id":              { "type": "string", "format": "uuid" },
    "source_type":     { "type": "string", "enum": ["violation", "compliance_breach", "incident"], "description": "What triggered this CAPA." },
    "source_id":       { "type": "string", "format": "uuid", "description": "FK → Violation or ComplianceInstance or IncidentReport." },
    "mine_id":         { "type": "string", "format": "uuid" },
    "subsidiary_id":   { "type": "string", "format": "uuid" },
    "description":     { "type": "string", "description": "Description of the corrective action required." },
    "preventive_measures": { "type": ["string", "null"], "description": "Preventive action to avoid recurrence." },
    "assigned_to":     { "type": "string", "format": "uuid", "description": "FK → User" },
    "assigned_by":     { "type": "string", "format": "uuid", "description": "FK → User (typically Mine Manager)." },
    "due_date":        { "type": "string", "format": "date", "description": "Typically 7 days for DGMS observations. Ref: Brainstorm §5 Module 2." },
    "status": {
      "type": "string",
      "enum": ["assigned", "in_progress", "completed", "pending_verification", "verified_closed", "overdue", "escalated"],
      "description": "Lifecycle state. Ref: LLD §7.3.5 Temporal workflow."
    },
    "completion_evidence_ids": { "type": "array", "items": { "type": "string", "format": "uuid" }, "description": "FK → MediaAttachment[] — proof of correction." },
    "completion_notes":   { "type": ["string", "null"] },
    "completed_at":       { "type": ["string", "null"], "format": "date-time" },
    "verified_by":        { "type": ["string", "null"], "format": "uuid" },
    "verified_at":        { "type": ["string", "null"], "format": "date-time" },
    "escalation_workflow_id": { "type": ["string", "null"], "format": "uuid", "description": "FK → EscalationWorkflowInstance." },
    "audit_hash":         { "type": ["string", "null"] },
    "created_at":         { "type": "string", "format": "date-time" },
    "updated_at":         { "type": "string", "format": "date-time" }
  }
}
```

---

### 3.6 Media Attachment

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/media_attachment.schema.json",
  "title": "MediaAttachment",
  "description": "Photo/video evidence attached to observations, corrective actions, or incident reports. Captured via react-native-vision-camera. Ref: LLD §7.5.",
  "type": "object",
  "required": ["id", "parent_type", "parent_id", "media_type", "file_url", "geo_stamp"],
  "properties": {
    "id":           { "type": "string", "format": "uuid" },
    "parent_type":  { "type": "string", "enum": ["observation", "corrective_action", "incident_report", "safety_observation", "contractor_document"] },
    "parent_id":    { "type": "string", "format": "uuid" },
    "media_type":   { "type": "string", "enum": ["photo", "video", "audio"] },
    "file_url":     { "type": "string", "format": "uri", "description": "MinIO/S3 object URL." },
    "thumbnail_url": { "type": ["string", "null"], "format": "uri" },
    "file_size_bytes": { "type": "integer" },
    "mime_type":    { "type": "string", "examples": ["image/jpeg", "video/mp4", "audio/webm"] },
    "geo_stamp":    { "$ref": "sgcmp/geostamp.schema.json" },
    "sync_status":  { "type": "string", "enum": ["pending_upload", "uploading", "uploaded"], "default": "pending_upload" },
    "captured_by":  { "type": "string", "format": "uuid" },
    "created_at":   { "type": "string", "format": "date-time" }
  }
}
```

---

## 4. Statutory Registers (Digitized)

Digital versions of physical registers mandated by law. Currently maintained as paper carbon copies in mine offices — these schemas represent their structured digital equivalents.

> **Regulatory References**:
> - CMR 2017 Form 4-A (Accident Notice), Reg 8
> - CMR 2017 Reg 167 (Safety Committee)
> - Explosive Substances Act / Explosive Rules
> - Mines Act 1952 Sec 23 (Accident Register)
> - CMR 2017 Reg 28 (Manager's Charge Report / Overman Report)
> - EP Act 1986 + EC Conditions (Environmental Monitoring)
> - Coal Controller's Organisation Form I/II (Production)
> - Mines Act / CMR (Attendance — Form B)
>
> **Data Sources**: [Brainstorm §1.2 Layer 1–4](file:///c:/Coding/SIH2026/Brainstrom1.md), [PRD §7.4–7.5](file:///c:/Coding/SIH2026/PRD.md)

---

### 4.1 Accident / Dangerous Occurrence Register

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/accident_register_entry.schema.json",
  "title": "AccidentRegisterEntry",
  "description": "Digital equivalent of the mandatory Accident Register (Mines Act 1952 Sec 23). Includes both CMR 2017 Form 4-A (initial notice) and Form 4-B (person details). Must be reported to DGMS within 24h for fatal/serious; within 1h for initial alert.",
  "type": "object",
  "required": ["id", "mine_id", "occurrence_type", "severity", "date_of_occurrence", "time_of_occurrence", "location_in_mine", "description", "reported_by", "dgms_notification_status"],
  "properties": {
    "id":                   { "type": "string", "format": "uuid" },
    "mine_id":              { "type": "string", "format": "uuid" },
    "subsidiary_id":        { "type": "string", "format": "uuid" },
    "register_serial_no":   { "type": "string", "description": "Sequential register number per mine per year." },
    "occurrence_type": {
      "type": "string",
      "enum": ["fatal_accident", "serious_bodily_injury", "minor_injury", "dangerous_occurrence", "near_miss"],
      "description": "Per Mines Act 1952 Sec 23 classification."
    },
    "dangerous_occurrence_subtype": {
      "type": ["string", "null"],
      "enum": [null, "roof_fall", "gas_ignition", "fire", "inundation", "explosion", "equipment_failure", "electrical_accident", "haulage_accident", "fall_of_person", "other"],
      "description": "Detailed subtype per DGMS reporting taxonomy."
    },
    "severity":             { "type": "string", "enum": ["fatal", "serious", "reportable", "non_reportable"] },
    "date_of_occurrence":   { "type": "string", "format": "date" },
    "time_of_occurrence":   { "type": "string", "format": "time" },
    "shift":                { "type": "string", "enum": ["A", "B", "C", "general"] },
    "location_in_mine":     { "type": "string", "examples": ["Pit 3, Level -120m, Face No 4"] },
    "geo_stamp":            { "$ref": "sgcmp/geostamp.schema.json" },
    "description":          { "type": "string", "description": "Narrative description of the occurrence." },
    "immediate_cause":      { "type": ["string", "null"] },
    "root_cause_analysis":  { "type": ["string", "null"] },
    "persons_affected": {
      "type": "array",
      "description": "Per CMR 2017 Form 4-B — details of each affected person.",
      "items": {
        "type": "object",
        "required": ["name", "employee_type", "nature_of_injury"],
        "properties": {
          "name":              { "type": "string" },
          "employee_id":       { "type": ["string", "null"] },
          "employee_type":     { "type": "string", "enum": ["regular", "contract"] },
          "contractor_id":     { "type": ["string", "null"], "format": "uuid" },
          "age":               { "type": ["integer", "null"] },
          "designation":       { "type": ["string", "null"] },
          "nature_of_injury":  { "type": "string", "examples": ["Fracture of right arm", "Burns — 40% body", "Fatal — head injury"] },
          "body_part_affected": { "type": ["string", "null"] },
          "return_to_duty_date": { "type": ["string", "null"], "format": "date", "description": "Per CMR 2017 Form 4-C." },
          "outcome":           { "type": "string", "enum": ["recovered", "permanent_disability", "fatal", "under_treatment"] }
        }
      }
    },
    "dgms_notification_status": {
      "type": "string",
      "enum": ["pending", "initial_alert_sent", "form_4a_submitted", "form_4b_submitted", "form_4c_submitted", "inquiry_initiated"],
      "description": "Tracks DGMS notification lifecycle."
    },
    "dgms_notified_at":     { "type": ["string", "null"], "format": "date-time" },
    "reported_by":          { "type": "string", "format": "uuid" },
    "reported_at":          { "type": "string", "format": "date-time" },
    "corrective_action_id": { "type": ["string", "null"], "format": "uuid" },
    "media_attachment_ids":  { "type": "array", "items": { "type": "string", "format": "uuid" } },
    "audit_hash":           { "type": ["string", "null"] },
    "created_at":           { "type": "string", "format": "date-time" },
    "updated_at":           { "type": "string", "format": "date-time" }
  }
}
```

---

### 4.2 Safety Committee Meeting Record

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/safety_committee_record.schema.json",
  "title": "SafetyCommitteeMeetingRecord",
  "description": "Digital register of monthly Safety Committee meetings. Mandatory per CMR 2017 Reg 167. Ref: Brainstorm §5 Module 1 Compliance Library.",
  "type": "object",
  "required": ["id", "mine_id", "meeting_date", "meeting_type", "attendees", "agenda_items"],
  "properties": {
    "id":            { "type": "string", "format": "uuid" },
    "mine_id":       { "type": "string", "format": "uuid" },
    "subsidiary_id": { "type": "string", "format": "uuid" },
    "meeting_date":  { "type": "string", "format": "date" },
    "meeting_type":  { "type": "string", "enum": ["monthly_regular", "emergency", "special"] },
    "chaired_by":    { "type": "string", "format": "uuid", "description": "FK → User (Mine Manager typically)." },
    "attendees": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "user_id":     { "type": "string", "format": "uuid" },
          "name":        { "type": "string" },
          "designation": { "type": "string" },
          "present":     { "type": "boolean" }
        }
      }
    },
    "agenda_items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "item_no":     { "type": "integer" },
          "topic":       { "type": "string" },
          "discussion":  { "type": "string" },
          "decision":    { "type": "string" },
          "action_owner_id": { "type": ["string", "null"], "format": "uuid" },
          "target_date": { "type": ["string", "null"], "format": "date" }
        }
      }
    },
    "previous_meeting_action_status": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "action_from_meeting_id": { "type": "string", "format": "uuid" },
          "status": { "type": "string", "enum": ["completed", "in_progress", "pending", "dropped"] }
        }
      }
    },
    "minutes_document_url": { "type": ["string", "null"], "format": "uri" },
    "compliance_instance_id": { "type": ["string", "null"], "format": "uuid", "description": "FK → ComplianceInstance if this meeting satisfies a compliance requirement." },
    "created_at":    { "type": "string", "format": "date-time" },
    "updated_at":    { "type": "string", "format": "date-time" }
  }
}
```

---

### 4.3 Explosive Register Entry

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/explosive_register_entry.schema.json",
  "title": "ExplosiveRegisterEntry",
  "description": "Explosive indent, receipt, usage, and balance register. Mandatory per Explosive Rules + CMR 2017. Monthly returns submitted to District Magistrate. Ref: Brainstorm §5 Module 1.",
  "type": "object",
  "required": ["id", "mine_id", "entry_date", "entry_type", "explosive_type", "quantity_kg"],
  "properties": {
    "id":              { "type": "string", "format": "uuid" },
    "mine_id":         { "type": "string", "format": "uuid" },
    "entry_date":      { "type": "string", "format": "date" },
    "entry_type":      { "type": "string", "enum": ["indent", "receipt", "issue", "usage", "return", "destroyed"] },
    "explosive_type":  { "type": "string", "examples": ["Permitted Explosive — Class 2", "Detonators — Electric", "Safety Fuse", "ANFO"] },
    "quantity_kg":     { "type": "number", "minimum": 0 },
    "quantity_units":  { "type": ["integer", "null"], "description": "For detonators counted by units." },
    "balance_after":   { "type": "number", "description": "Running balance in magazine." },
    "magazine_id":     { "type": "string", "description": "Magazine/store identifier." },
    "indent_number":   { "type": ["string", "null"] },
    "issued_to":       { "type": ["string", "null"], "description": "Name/designation of blasting crew member." },
    "purpose":         { "type": ["string", "null"], "examples": ["OB Bench Blasting — Pit 2"] },
    "authorized_by":   { "type": "string", "format": "uuid" },
    "recorded_by":     { "type": "string", "format": "uuid" },
    "created_at":      { "type": "string", "format": "date-time" }
  }
}
```

---

### 4.4 Overman / Official Report

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/overman_report.schema.json",
  "title": "OvermanOfficialReport",
  "description": "Shift report by Mining Sirdar / Overman / Safety Officer. Mandatory per CMR 2017 Reg 28. Currently written in logbooks — this is the digital equivalent. Ref: Brainstorm §1.2 Layer 1.",
  "type": "object",
  "required": ["id", "mine_id", "report_date", "shift", "reported_by", "zone", "observations"],
  "properties": {
    "id":           { "type": "string", "format": "uuid" },
    "mine_id":      { "type": "string", "format": "uuid" },
    "report_date":  { "type": "string", "format": "date" },
    "shift":        { "type": "string", "enum": ["A", "B", "C"] },
    "reported_by":  { "type": "string", "format": "uuid", "description": "FK → User (Mining Sirdar / Overman)." },
    "zone":         { "type": "string", "examples": ["District 4, Face 2, Level -180m"] },
    "geo_stamp":    { "$ref": "sgcmp/geostamp.schema.json" },
    "manpower_deployed": { "type": "integer", "description": "Workers deployed in the section during the shift." },
    "observations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "area":        { "type": "string" },
          "observation": { "type": "string" },
          "status":      { "type": "string", "enum": ["normal", "attention_required", "danger"] },
          "action_taken": { "type": ["string", "null"] }
        }
      }
    },
    "ventilation_readings": {
      "type": ["array", "null"],
      "description": "For underground mines — mandatory ventilation survey data.",
      "items": {
        "type": "object",
        "properties": {
          "station":     { "type": "string" },
          "air_velocity_mps": { "type": "number" },
          "methane_pct": { "type": "number" },
          "co2_pct":     { "type": "number" }
        }
      }
    },
    "equipment_status":  { "type": ["string", "null"] },
    "handover_notes":    { "type": ["string", "null"], "description": "Notes to next shift overman." },
    "sync_status":       { "type": "string", "enum": ["pending_sync", "synced"], "default": "pending_sync" },
    "created_at":        { "type": "string", "format": "date-time" }
  }
}
```

---

### 4.5 Environmental Monitoring Log

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/environment_reading.schema.json",
  "title": "EnvironmentReading",
  "description": "Environmental monitoring data point — air quality, water quality, noise. Links to EC condition tracking. Ingested from manual entry, OCR of log sheets, or IoT sensors. Stored in TimescaleDB. Ref: Brainstorm §5 Module 3, LLD §7.13.",
  "type": "object",
  "required": ["id", "mine_id", "station_id", "parameter", "value", "unit", "recorded_at", "source"],
  "properties": {
    "id":              { "type": "string", "format": "uuid" },
    "mine_id":         { "type": "string", "format": "uuid" },
    "station_id":      { "type": "string", "format": "uuid", "description": "FK → MonitoringStation" },
    "parameter": {
      "type": "string",
      "enum": ["pm10", "pm2_5", "so2", "nox", "rspm", "spm", "noise_db", "ph", "bod", "cod", "tss", "oil_grease", "groundwater_level", "green_cover_pct"],
      "description": "Per MoEFCC EC conditions + SPCB Consent requirements."
    },
    "value":           { "type": "number" },
    "unit":            { "type": "string", "examples": ["ug/m3", "dB(A)", "mg/L", "m", "%"] },
    "recorded_at":     { "type": "string", "format": "date-time" },
    "source":          { "type": "string", "enum": ["manual", "sensor_iot", "ocr_extracted"], "description": "Provenance of reading." },
    "ec_condition_ref": { "type": ["string", "null"], "description": "Which specific EC condition this reading monitors (e.g., 'EC Condition #23 — Ambient Air Quality')." },
    "prescribed_limit": { "type": ["number", "null"], "description": "Regulatory threshold for this parameter." },
    "threshold_breached": { "type": "boolean", "default": false },
    "breach_severity":  { "type": ["string", "null"], "enum": [null, "amber", "red"], "description": "Amber = approaching limit; Red = exceeded limit." },
    "sensor_id":        { "type": ["string", "null"], "description": "IoT sensor hardware identifier, if applicable." },
    "recorded_by":      { "type": ["string", "null"], "format": "uuid", "description": "FK → User, for manual entries." },
    "created_at":       { "type": "string", "format": "date-time" }
  }
}
```

**Monitoring Station (supporting schema)**:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/monitoring_station.schema.json",
  "title": "MonitoringStation",
  "description": "Physical monitoring point — CAAQMS, water sampling point, noise station. Ref: Brainstorm §5 Module 3.",
  "type": "object",
  "required": ["id", "mine_id", "station_type", "name", "location"],
  "properties": {
    "id":            { "type": "string", "format": "uuid" },
    "mine_id":       { "type": "string", "format": "uuid" },
    "station_type":  { "type": "string", "enum": ["caaqms_air", "manual_air", "water_effluent", "water_groundwater", "noise", "dust_sampler"] },
    "name":          { "type": "string", "examples": ["CAAQMS-01 NE Boundary", "ETP Outlet Sampling Point"] },
    "location": {
      "type": "object",
      "properties": {
        "type": { "const": "Point" },
        "coordinates": { "type": "array", "items": { "type": "number" }, "minItems": 2, "maxItems": 3 }
      }
    },
    "is_iot_enabled": { "type": "boolean", "default": false },
    "is_active":     { "type": "boolean", "default": true },
    "created_at":    { "type": "string", "format": "date-time" }
  }
}
```

---

### 4.6 Production Register Entry

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/production_reading.schema.json",
  "title": "ProductionReading",
  "description": "Shift-wise production data. Reported to Coal Controller's Organisation via Form I (Daily). Stored in TimescaleDB. Ref: Brainstorm §1.2 Layer 4, LLD §7.13.",
  "type": "object",
  "required": ["id", "mine_id", "reporting_date", "shift", "quantity_tonnes", "source"],
  "properties": {
    "id":               { "type": "string", "format": "uuid" },
    "mine_id":          { "type": "string", "format": "uuid" },
    "subsidiary_id":    { "type": "string", "format": "uuid" },
    "reporting_date":   { "type": "string", "format": "date" },
    "shift":            { "type": "string", "enum": ["A", "B", "C", "daily_aggregate"] },
    "quantity_tonnes":  { "type": "number", "minimum": 0 },
    "coal_grade":       { "type": ["string", "null"], "examples": ["G-4", "G-10"] },
    "seam_name":        { "type": ["string", "null"] },
    "source":           { "type": "string", "enum": ["manual", "sensor", "ocr_extracted"], "description": "Data provenance." },
    "overburden_cum":   { "type": ["number", "null"], "description": "Overburden removed in cubic meters (for opencast)." },
    "equipment_deployed": {
      "type": ["array", "null"],
      "items": {
        "type": "object",
        "properties": {
          "equipment_type": { "type": "string", "examples": ["Shovel", "Dumper", "Dozer", "Drill"] },
          "count":          { "type": "integer" },
          "utilization_pct": { "type": ["number", "null"] }
        }
      }
    },
    "workforce_count":  { "type": ["integer", "null"], "description": "Total workers deployed for this shift." },
    "reported_by":      { "type": "string", "format": "uuid" },
    "anomaly_flagged":  { "type": "boolean", "default": false, "description": "AI-flagged if inconsistent with workforce/equipment data. Ref: Brainstorm §5 Module 7 Model 4." },
    "created_at":       { "type": "string", "format": "date-time" }
  }
}
```

---

### 4.7 Attendance / Muster Roll Entry

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/attendance_record.schema.json",
  "title": "AttendanceRecord",
  "description": "Worker attendance — geo-fenced QR/biometric capture. Digital equivalent of Form B (Attendance Register) under Mines Act + CLRA Form XVI (Muster Roll). Ref: LLD §7.5.3, Brainstorm §5 Module 5.",
  "type": "object",
  "required": ["id", "mine_id", "worker_type", "worker_identifier", "attendance_date", "shift", "check_in_geo_stamp"],
  "properties": {
    "id":                { "type": "string", "format": "uuid" },
    "mine_id":           { "type": "string", "format": "uuid" },
    "worker_type":       { "type": "string", "enum": ["regular_employee", "contract_worker"] },
    "worker_identifier": { "type": "string", "description": "Employee ID or Contract Worker ID. PII fields encrypted at rest." },
    "contractor_id":     { "type": ["string", "null"], "format": "uuid", "description": "FK → Contractor, if contract_worker." },
    "attendance_date":   { "type": "string", "format": "date" },
    "shift":             { "type": "string", "enum": ["A", "B", "C", "general"] },
    "check_in_geo_stamp":  { "$ref": "sgcmp/geostamp.schema.json" },
    "check_out_geo_stamp": { "oneOf": [{ "$ref": "sgcmp/geostamp.schema.json" }, { "type": "null" }] },
    "check_in_method":   { "type": "string", "enum": ["qr_code", "biometric", "manual_entry"], "description": "Capture method." },
    "hours_worked":      { "type": ["number", "null"], "description": "Auto-calculated from check-in/check-out." },
    "is_within_geofence": { "type": "boolean", "description": "Server-validated: check-in location within mine boundary polygon." },
    "sync_status":       { "type": "string", "enum": ["pending_sync", "synced"], "default": "pending_sync" },
    "recorded_by":       { "type": "string", "format": "uuid" },
    "created_at":        { "type": "string", "format": "date-time" }
  }
}
```

---

## 5. Contractor Ecosystem

End-to-end lifecycle management of contractors, their documents, work orders, workers, and deployment.

> **Regulatory References**:
> - Contract Labour (Regulation & Abolition) Act, 1970 (CLRA Forms I, IV, V, XII–XXV)
> - ESI Act, 1948 (Contractor ESI registration)
> - EPF Act, 1952 (Contractor EPF registration)
> - Mines Vocational Training Rules (Worker training certificates)
>
> **Data Sources**: [Brainstorm §5 Module 4](file:///c:/Coding/SIH2026/Brainstrom1.md), [LLD §7.6](file:///c:/Coding/SIH2026/LLD.md), [PRD §7.3](file:///c:/Coding/SIH2026/PRD.md)

---

### 5.1 Contractor

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/contractor.schema.json",
  "title": "Contractor",
  "description": "Registered contractor entity. Each mine may have 50–200 active contractors. Ref: Brainstorm §1.2 Layer 5, LLD §7.6.1.",
  "type": "object",
  "required": ["id", "name", "registration_number", "status"],
  "properties": {
    "id":                  { "type": "string", "format": "uuid" },
    "name":                { "type": "string" },
    "registration_number": { "type": "string", "description": "Government registration / CLRA Form I registration number." },
    "pan":                 { "type": "string", "pattern": "^[A-Z]{5}[0-9]{4}[A-Z]{1}$" },
    "gst_number":          { "type": ["string", "null"] },
    "contact_person":      { "type": "string" },
    "contact_phone":       { "type": "string", "description": "Encrypted at rest." },
    "contact_email":       { "type": ["string", "null"], "format": "email" },
    "address":             { "type": "string" },
    "status":              { "type": "string", "enum": ["active", "suspended", "blacklisted", "inactive"] },
    "blacklist_reason":    { "type": ["string", "null"], "description": "Reason code if blacklisted. Ref: Brainstorm §5 Module 4." },
    "risk_rating": {
      "type": ["string", "null"],
      "enum": [null, "low", "medium", "high", "critical"],
      "description": "AI-computed from safety record, document compliance, past violations. Ref: Brainstorm §11.4 Contractor Trust Score."
    },
    "trust_score":         { "type": ["number", "null"], "minimum": 0, "maximum": 100, "description": "AI-computed 0–100 Contractor Trust Score. Ref: Brainstorm §11.4." },
    "onboarded_at":        { "type": "string", "format": "date-time" },
    "created_at":          { "type": "string", "format": "date-time" },
    "updated_at":          { "type": "string", "format": "date-time" }
  }
}
```

---

### 5.2 Contractor Document

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/contractor_document.schema.json",
  "title": "ContractorDocument",
  "description": "Statutory compliance documents uploaded by contractors. Expiry tracked with auto-alerts at T-60, T-30 days. Ref: LLD §7.6.1, §7.6.3.",
  "type": "object",
  "required": ["id", "contractor_id", "doc_type", "valid_from", "valid_until", "status", "document_url"],
  "properties": {
    "id":              { "type": "string", "format": "uuid" },
    "contractor_id":   { "type": "string", "format": "uuid", "description": "FK → Contractor" },
    "doc_type": {
      "type": "string",
      "enum": [
        "clra_license", "esi_registration", "epf_registration",
        "safety_training_certificate", "mine_safety_training",
        "insurance_policy", "work_order", "labour_license",
        "gst_certificate", "pf_challan", "esi_challan", "other"
      ],
      "description": "Document type per CLRA 1970, ESI Act, EPF Act requirements."
    },
    "document_url":    { "type": "string", "format": "uri", "description": "MinIO/S3 reference." },
    "ocr_result_id":   { "type": ["string", "null"], "format": "uuid", "description": "FK → OCRExtractionResult, if digitized." },
    "valid_from":      { "type": "string", "format": "date" },
    "valid_until":     { "type": "string", "format": "date" },
    "status": {
      "type": "string",
      "enum": ["valid", "expiring_soon", "expired", "under_review", "rejected"],
      "description": "Auto-transitions: valid → expiring_soon (T-30 days) → expired. Ref: LLD §7.6.3."
    },
    "is_verified":     { "type": "boolean", "default": false },
    "verified_by":     { "type": ["string", "null"], "format": "uuid" },
    "verified_at":     { "type": ["string", "null"], "format": "date-time" },
    "uploaded_by":     { "type": "string", "format": "uuid" },
    "uploaded_at":     { "type": "string", "format": "date-time" },
    "created_at":      { "type": "string", "format": "date-time" },
    "updated_at":      { "type": "string", "format": "date-time" }
  }
}
```

---

### 5.3 Contractor Assignment (Work Order)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/contractor_assignment.schema.json",
  "title": "ContractorAssignment",
  "description": "Work order linking a contractor to a specific mine and scope. Cannot be created/renewed if contractor has expired CLRA license. Ref: LLD §7.6.1, Brainstorm §5 Module 4.",
  "type": "object",
  "required": ["id", "contractor_id", "mine_id", "work_order_number", "scope_of_work", "start_date", "end_date", "status"],
  "properties": {
    "id":                 { "type": "string", "format": "uuid" },
    "contractor_id":      { "type": "string", "format": "uuid", "description": "FK → Contractor" },
    "mine_id":            { "type": "string", "format": "uuid", "description": "FK → Mine" },
    "subsidiary_id":      { "type": "string", "format": "uuid" },
    "work_order_number":  { "type": "string" },
    "scope_of_work":      { "type": "string", "examples": ["OB Removal — Pit 3 East Extension", "Coal Transportation", "Drill Maintenance"] },
    "work_zone":          { "type": ["string", "null"], "description": "Specific mine zone where work is authorized." },
    "start_date":         { "type": "string", "format": "date" },
    "end_date":           { "type": "string", "format": "date" },
    "contract_value":     { "type": ["number", "null"], "description": "In INR." },
    "max_workers_permitted": { "type": ["integer", "null"] },
    "status":             { "type": "string", "enum": ["active", "completed", "terminated", "expired", "blocked"] },
    "blocked_reason":     { "type": ["string", "null"], "description": "E.g., 'CLRA license expired', 'Safety violation — work suspended'." },
    "performance_rating": { "type": ["number", "null"], "minimum": 0, "maximum": 5 },
    "created_at":         { "type": "string", "format": "date-time" },
    "updated_at":         { "type": "string", "format": "date-time" }
  }
}
```

---

### 5.4 Contract Worker

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/contract_worker.schema.json",
  "title": "ContractWorker",
  "description": "Individual contract worker deployed by a contractor. Per CLRA Form XIII (Register of Workmen) and Form XIV (Employment Card). Training certificate tracking per Mines Vocational Training Rules. Ref: Brainstorm §5 Module 4.",
  "type": "object",
  "required": ["id", "contractor_id", "name", "worker_id_card_number"],
  "properties": {
    "id":                    { "type": "string", "format": "uuid" },
    "contractor_id":         { "type": "string", "format": "uuid", "description": "FK → Contractor" },
    "name":                  { "type": "string" },
    "worker_id_card_number": { "type": "string", "description": "Per CLRA Form XIV. Encrypted at rest." },
    "aadhaar_hash":          { "type": ["string", "null"], "description": "Tokenized Aadhaar for identity verification. Never stored in plaintext. Ref: LLD §6.8." },
    "age":                   { "type": ["integer", "null"] },
    "skill_category":        { "type": ["string", "null"], "examples": ["skilled", "semi-skilled", "unskilled"] },
    "designation":           { "type": ["string", "null"], "examples": ["Drill Operator", "Helper", "Driver"] },
    "training_certificates": {
      "type": "array",
      "description": "Mandatory training certs per Mines Vocational Training Rules. Workers in gassy mines need specific certifications.",
      "items": {
        "type": "object",
        "properties": {
          "certificate_type": { "type": "string", "examples": ["Initial Training", "Refresher Training", "Gassy Mine — Deg II", "First Aid"] },
          "issued_date":      { "type": "string", "format": "date" },
          "valid_until":      { "type": "string", "format": "date" },
          "certificate_url":  { "type": ["string", "null"], "format": "uri" }
        }
      }
    },
    "esi_number":            { "type": ["string", "null"] },
    "epf_number":            { "type": ["string", "null"] },
    "is_active":             { "type": "boolean", "default": true },
    "created_at":            { "type": "string", "format": "date-time" },
    "updated_at":            { "type": "string", "format": "date-time" }
  }
}
```

---

### 5.5 Workforce Deployment Record

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/workforce_deployment_record.schema.json",
  "title": "WorkforceDeploymentRecord",
  "description": "Daily contractor workforce deployment report — headcount by assignment. Used for bill verification: 'Cannot process bill for 500 worker-days if only 400 verified.' Ref: Brainstorm §5 Module 4.",
  "type": "object",
  "required": ["id", "assignment_id", "reporting_date", "headcount_deployed"],
  "properties": {
    "id":                  { "type": "string", "format": "uuid" },
    "assignment_id":       { "type": "string", "format": "uuid", "description": "FK → ContractorAssignment" },
    "contractor_id":       { "type": "string", "format": "uuid" },
    "mine_id":             { "type": "string", "format": "uuid" },
    "reporting_date":      { "type": "string", "format": "date" },
    "headcount_deployed":  { "type": "integer", "minimum": 0 },
    "verified_headcount":  { "type": ["integer", "null"], "description": "Cross-checked against attendance records." },
    "headcount_mismatch":  { "type": "boolean", "default": false, "description": "Flagged if deployed != verified." },
    "reported_by":         { "type": "string", "format": "uuid" },
    "created_at":          { "type": "string", "format": "date-time" }
  }
}
```

---

## 6. Mobile Field Reporting

Schemas for the offline-first mobile app. All entities embed `GeoStamp` and support offline queue + sync.

> **Data Sources**: [Brainstorm §5 Module 5](file:///c:/Coding/SIH2026/Brainstrom1.md), [LLD §7.5](file:///c:/Coding/SIH2026/LLD.md), [PRD §7.2 FR-2.6](file:///c:/Coding/SIH2026/PRD.md)

---

### 6.1 Field Report (Generic)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/field_report.schema.json",
  "title": "FieldReport",
  "description": "Generic field report submitted via mobile app. Supports dynamic form builder (admin-created forms). Ref: Brainstorm §5 Module 5 'Survey & Inspection Forms'.",
  "type": "object",
  "required": ["id", "mine_id", "report_type", "form_template_id", "geo_stamp", "submitted_by", "sync_status"],
  "properties": {
    "id":               { "type": "string", "format": "uuid", "description": "Client-generated UUID." },
    "mine_id":          { "type": "string", "format": "uuid" },
    "report_type":      { "type": "string", "examples": ["safety_walkthrough", "environmental_spot_check", "equipment_inspection", "custom"] },
    "form_template_id": { "type": "string", "format": "uuid", "description": "FK → dynamic form template (admin-configured)." },
    "geo_stamp":        { "$ref": "sgcmp/geostamp.schema.json" },
    "form_responses": {
      "type": "array",
      "description": "Key-value pairs of field responses matching the form template.",
      "items": {
        "type": "object",
        "properties": {
          "field_id":    { "type": "string" },
          "field_label": { "type": "string" },
          "value":       { "description": "String, number, boolean, or array depending on field type." },
          "field_type":  { "type": "string", "enum": ["text", "number", "boolean", "select", "multi_select", "date", "photo", "gps"] }
        }
      }
    },
    "media_attachment_ids": { "type": "array", "items": { "type": "string", "format": "uuid" } },
    "submitted_by":     { "type": "string", "format": "uuid" },
    "submitted_at":     { "type": "string", "format": "date-time" },
    "sync_status":      { "type": "string", "enum": ["pending_sync", "synced", "sync_conflict"], "default": "pending_sync" },
    "created_at":       { "type": "string", "format": "date-time" }
  }
}
```

---

### 6.2 Incident / Near-Miss Report

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/incident_report.schema.json",
  "title": "IncidentReport",
  "description": "Field-level incident or near-miss report captured via mobile. Auto-notifies Mine Manager + Safety Officer. Severity auto-suggested by AI NLP classifier. Ref: Brainstorm §5 Module 5, PRD §7.2 FR-2.6.",
  "type": "object",
  "required": ["id", "mine_id", "incident_type", "description", "severity", "geo_stamp", "reported_by"],
  "properties": {
    "id":              { "type": "string", "format": "uuid", "description": "Client-generated UUID." },
    "mine_id":         { "type": "string", "format": "uuid" },
    "subsidiary_id":   { "type": "string", "format": "uuid" },
    "incident_type": {
      "type": "string",
      "enum": ["roof_fall", "gas_ignition", "equipment_failure", "personal_injury", "near_miss", "fire", "inundation_risk", "explosives_incident", "electrical_incident", "haulage_incident", "fall_of_person", "other"],
      "description": "Per Brainstorm §5 Module 5 taxonomy."
    },
    "description":     { "type": "string" },
    "severity": {
      "type": "string",
      "enum": ["low", "medium", "high", "critical"],
      "description": "Initial field assessment. AI may suggest adjustment."
    },
    "ai_suggested_severity": { "type": ["string", "null"], "enum": [null, "low", "medium", "high", "critical"] },
    "ai_suggested_category": { "type": ["string", "null"], "description": "NLP-classified root cause category. Ref: Brainstorm §5 Module 7 Model 6." },
    "geo_stamp":       { "$ref": "sgcmp/geostamp.schema.json" },
    "zone":            { "type": "string" },
    "shift":           { "type": "string", "enum": ["A", "B", "C", "general"] },
    "persons_involved": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name":           { "type": "string" },
          "employee_type":  { "type": "string", "enum": ["regular", "contract"] },
          "role_in_incident": { "type": "string", "examples": ["injured_party", "witness", "first_responder"] }
        }
      }
    },
    "media_attachment_ids": { "type": "array", "items": { "type": "string", "format": "uuid" } },
    "voice_note_url":  { "type": ["string", "null"], "format": "uri" },
    "voice_transcription": { "type": ["string", "null"] },
    "immediate_actions_taken": { "type": ["string", "null"] },
    "is_linked_to_accident_register": { "type": "boolean", "default": false, "description": "True if this triggered a formal AccidentRegisterEntry." },
    "accident_register_entry_id":     { "type": ["string", "null"], "format": "uuid" },
    "corrective_action_id": { "type": ["string", "null"], "format": "uuid" },
    "reported_by":     { "type": "string", "format": "uuid" },
    "reported_at":     { "type": "string", "format": "date-time" },
    "sync_status":     { "type": "string", "enum": ["pending_sync", "synced"], "default": "pending_sync" },
    "created_at":      { "type": "string", "format": "date-time" },
    "updated_at":      { "type": "string", "format": "date-time" }
  }
}
```

---

### 6.3 Safety Observation (STOP Card)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/safety_observation.schema.json",
  "title": "SafetyObservation",
  "description": "Quick 3-tap safety observation: Zone -> Unsafe Act/Condition -> Photo. STOP Card equivalent. Closed-loop: observer notified when corrected. Ref: Brainstorm §5 Module 5.",
  "type": "object",
  "required": ["id", "mine_id", "zone", "observation_type", "description", "geo_stamp", "observed_by"],
  "properties": {
    "id":               { "type": "string", "format": "uuid" },
    "mine_id":          { "type": "string", "format": "uuid" },
    "zone":             { "type": "string" },
    "observation_type": { "type": "string", "enum": ["unsafe_act", "unsafe_condition", "positive_observation"] },
    "category":         { "type": "string", "enum": ["ppe_violation", "housekeeping", "equipment_guard", "fall_protection", "fire_safety", "traffic_management", "ventilation", "other"] },
    "description":      { "type": "string" },
    "geo_stamp":        { "$ref": "sgcmp/geostamp.schema.json" },
    "media_attachment_ids": { "type": "array", "items": { "type": "string", "format": "uuid" } },
    "assigned_to":      { "type": ["string", "null"], "format": "uuid", "description": "Person responsible for correction." },
    "status":           { "type": "string", "enum": ["open", "assigned", "corrected", "verified_closed"], "default": "open" },
    "corrected_at":     { "type": ["string", "null"], "format": "date-time" },
    "correction_evidence_ids": { "type": "array", "items": { "type": "string", "format": "uuid" } },
    "observed_by":      { "type": "string", "format": "uuid" },
    "observed_at":      { "type": "string", "format": "date-time" },
    "sync_status":      { "type": "string", "enum": ["pending_sync", "synced"], "default": "pending_sync" },
    "created_at":       { "type": "string", "format": "date-time" }
  }
}
```

---

### 6.4 Offline Sync Envelope

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/sync_envelope.schema.json",
  "title": "SyncEnvelope",
  "description": "Wrapper for batched offline-sync pushes from mobile. Idempotent via client-generated UUIDs. Ref: LLD §6.3, §7.5.",
  "type": "object",
  "required": ["sync_id", "device_id", "user_id", "last_synced_at", "records"],
  "properties": {
    "sync_id":         { "type": "string", "format": "uuid", "description": "Unique sync batch ID." },
    "device_id":       { "type": "string" },
    "user_id":         { "type": "string", "format": "uuid" },
    "app_version":     { "type": "string" },
    "last_synced_at":  { "type": "string", "format": "date-time", "description": "Checkpoint for delta-sync pull." },
    "records": {
      "type": "array",
      "description": "Array of records to push, each with entity type and payload.",
      "items": {
        "type": "object",
        "required": ["entity_type", "operation", "record_id", "payload"],
        "properties": {
          "entity_type": { "type": "string", "enum": ["inspection", "observation", "incident_report", "safety_observation", "attendance_record", "field_report", "overman_report"] },
          "operation":   { "type": "string", "enum": ["create", "update"] },
          "record_id":   { "type": "string", "format": "uuid", "description": "Client-generated, serves as idempotency key." },
          "payload":     { "type": "object", "description": "Full entity payload conforming to the respective schema." },
          "client_timestamp": { "type": "string", "format": "date-time" }
        }
      }
    },
    "media_references": {
      "type": "array",
      "description": "Media files queued for separate chunked upload (decoupled from record sync).",
      "items": {
        "type": "object",
        "properties": {
          "media_id":      { "type": "string", "format": "uuid" },
          "parent_record_id": { "type": "string", "format": "uuid" },
          "upload_status": { "type": "string", "enum": ["pending", "uploading", "completed"] }
        }
      }
    }
  }
}
```

---

## 7. Dashboard & Aggregation

Read-model schemas for the role-based dashboard. These are **composed/materialized** views — not separate tables — assembled from domain services via GraphQL Federation or cached rollups in Redis.

> **Data Sources**: [LLD §7.1](file:///c:/Coding/SIH2026/LLD.md), [Brainstorm §5 Module 11](file:///c:/Coding/SIH2026/Brainstrom1.md), [PRD §7.7](file:///c:/Coding/SIH2026/PRD.md)

---

### 7.1 Dashboard Summary (Mine-Level)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/dashboard_summary.schema.json",
  "title": "DashboardSummary",
  "description": "Aggregated mine-level dashboard response. Composed via GraphQL Federation. Ref: LLD §7.1.3.",
  "type": "object",
  "required": ["mine_id", "generated_at"],
  "properties": {
    "mine_id":       { "type": "string", "format": "uuid" },
    "mine_name":     { "type": "string" },
    "subsidiary_id": { "type": "string", "format": "uuid" },
    "generated_at":  { "type": "string", "format": "date-time" },
    "compliance_health": {
      "type": "object",
      "description": "Compliance score breakdown. Ref: §7.2 schema below."
    },
    "open_violations_count":    { "type": "integer" },
    "overdue_violations_count": { "type": "integer" },
    "open_corrective_actions":  { "type": "integer" },
    "overdue_corrective_actions": { "type": "integer" },
    "risk_score":    { "type": "number", "minimum": 0, "maximum": 100 },
    "risk_trend":    { "type": "string", "enum": ["improving", "stable", "worsening"] },
    "recent_alerts": {
      "type": "array",
      "maxItems": 10,
      "items": { "type": "object", "description": "Alert object per §8.1 schema." }
    },
    "production_today_tonnes":  { "type": ["number", "null"] },
    "production_target_tonnes": { "type": ["number", "null"] },
    "active_contractors":       { "type": "integer" },
    "contractor_compliance_pct": { "type": ["number", "null"] },
    "active_incidents_count":   { "type": "integer" },
    "pending_inspections":      { "type": "integer" },
    "environmental_status": {
      "type": "object",
      "properties": {
        "green_count": { "type": "integer" },
        "amber_count": { "type": "integer" },
        "red_count":   { "type": "integer" }
      }
    }
  }
}
```

---

### 7.2 Compliance Health Snapshot

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/compliance_health_snapshot.schema.json",
  "title": "ComplianceHealthSnapshot",
  "description": "Compliance score breakdown per mine. Score 0–100 with trend. Ref: Brainstorm §5 Module 1.",
  "type": "object",
  "properties": {
    "overall_score":       { "type": "number", "minimum": 0, "maximum": 100 },
    "score_trend":         { "type": "string", "enum": ["improving", "stable", "declining"] },
    "score_change":        { "type": "number", "description": "Change from previous period." },
    "category_breakdown": {
      "type": "object",
      "properties": {
        "safety":      { "type": "object", "properties": { "score": { "type": "number" }, "pending": { "type": "integer" }, "overdue": { "type": "integer" } } },
        "environment": { "type": "object", "properties": { "score": { "type": "number" }, "pending": { "type": "integer" }, "overdue": { "type": "integer" } } },
        "production":  { "type": "object", "properties": { "score": { "type": "number" }, "pending": { "type": "integer" }, "overdue": { "type": "integer" } } },
        "labour":      { "type": "object", "properties": { "score": { "type": "number" }, "pending": { "type": "integer" }, "overdue": { "type": "integer" } } }
      }
    },
    "upcoming_deadlines": {
      "type": "array",
      "maxItems": 5,
      "items": {
        "type": "object",
        "properties": {
          "instance_id":       { "type": "string", "format": "uuid" },
          "requirement_title": { "type": "string" },
          "due_date":          { "type": "string", "format": "date" },
          "days_remaining":    { "type": "integer" }
        }
      }
    }
  }
}
```

---

### 7.3 Risk Heatmap Entry

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/risk_heatmap_entry.schema.json",
  "title": "RiskHeatmapEntry",
  "description": "Entry for the cross-mine risk heatmap (corporate dashboard). Ref: Brainstorm §5 Module 11 — CMD/Director HQ dashboard.",
  "type": "object",
  "properties": {
    "mine_id":        { "type": "string", "format": "uuid" },
    "mine_name":      { "type": "string" },
    "subsidiary_code": { "type": "string" },
    "risk_score":     { "type": "number", "minimum": 0, "maximum": 100 },
    "risk_level":     { "type": "string", "enum": ["low", "medium", "high", "critical"] },
    "top_risk_factors": {
      "type": "array",
      "maxItems": 5,
      "items": {
        "type": "object",
        "properties": {
          "factor":       { "type": "string", "examples": ["Recurring ventilation violations", "High CAPA overdue rate", "Contractor document non-compliance"] },
          "contribution_pct": { "type": "number" }
        }
      }
    },
    "latitude":       { "type": "number" },
    "longitude":      { "type": "number" },
    "computed_at":     { "type": "string", "format": "date-time" }
  }
}
```

---

## 8. Alerts, Reminders & Escalation Workflows

Schemas for the automated workflow engine (Temporal.io-backed). Drives reminders, escalations, and digital approvals across all modules.

> **Data Sources**: [Brainstorm §5 Module 8](file:///c:/Coding/SIH2026/Brainstrom1.md), [LLD §7.7](file:///c:/Coding/SIH2026/LLD.md), [PRD §7.8](file:///c:/Coding/SIH2026/PRD.md)

---

### 8.1 Alert / Notification

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/alert.schema.json",
  "title": "Alert",
  "description": "Notification dispatched via FCM push, SMS, email, or in-app. Generated by domain events on Kafka. Ref: Brainstorm §5 Module 8 Alert Taxonomy.",
  "type": "object",
  "required": ["id", "priority", "type", "title", "message", "target_user_id", "channels", "status"],
  "properties": {
    "id":              { "type": "string", "format": "uuid" },
    "priority": {
      "type": "string",
      "enum": ["critical", "high", "medium", "low", "info"],
      "description": "Per Brainstorm §5 Module 8 taxonomy: CRITICAL (5min SLA), HIGH (1hr), MEDIUM (24hr), LOW (72hr), INFO (daily)."
    },
    "type": {
      "type": "string",
      "enum": [
        "compliance_due_soon", "compliance_breached", "compliance_reminder",
        "violation_reported", "capa_assigned", "capa_overdue", "capa_escalated",
        "inspection_scheduled", "inspection_observation_open",
        "contractor_license_expiring", "contractor_license_expired",
        "incident_reported", "incident_critical",
        "environmental_threshold_amber", "environmental_threshold_breach",
        "risk_score_alert", "anomaly_detected",
        "approval_pending", "approval_escalated",
        "production_anomaly", "daily_summary"
      ]
    },
    "title":           { "type": "string" },
    "message":         { "type": "string" },
    "target_user_id":  { "type": "string", "format": "uuid" },
    "target_role":     { "type": ["string", "null"], "description": "Role-based broadcast if no specific user." },
    "mine_id":         { "type": ["string", "null"], "format": "uuid" },
    "entity_type":     { "type": ["string", "null"], "description": "Type of entity that triggered the alert." },
    "entity_id":       { "type": ["string", "null"], "format": "uuid", "description": "ID of the triggering entity for deep-link." },
    "channels": {
      "type": "array",
      "items": { "type": "string", "enum": ["push_fcm", "sms", "email", "whatsapp", "in_app"] },
      "minItems": 1,
      "description": "Delivery channels. Per Brainstorm §5 Module 8: CRITICAL = SMS+Call+App+Email."
    },
    "sla_response_minutes": { "type": ["integer", "null"], "description": "Expected response time based on priority." },
    "status":          { "type": "string", "enum": ["pending", "sent", "delivered", "read", "acknowledged", "failed"] },
    "sent_at":         { "type": ["string", "null"], "format": "date-time" },
    "read_at":         { "type": ["string", "null"], "format": "date-time" },
    "created_at":      { "type": "string", "format": "date-time" }
  }
}
```

---

### 8.2 Escalation Workflow Instance

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/escalation_workflow.schema.json",
  "title": "EscalationWorkflowInstance",
  "description": "Durable Temporal workflow tracking an escalation ladder. Generic — used by compliance, CAPA, grievances. Ref: LLD §7.7.2 state diagram.",
  "type": "object",
  "required": ["id", "workflow_template_id", "entity_type", "entity_id", "mine_id", "due_date", "current_level", "status"],
  "properties": {
    "id":                    { "type": "string", "format": "uuid" },
    "temporal_workflow_id":  { "type": "string", "description": "Temporal.io workflow run ID." },
    "workflow_template_id":  { "type": "string", "format": "uuid", "description": "FK → WorkflowTemplate — data-driven escalation config." },
    "entity_type":           { "type": "string", "enum": ["compliance_instance", "corrective_action", "grievance", "contractor_document"] },
    "entity_id":             { "type": "string", "format": "uuid" },
    "mine_id":               { "type": "string", "format": "uuid" },
    "subsidiary_id":         { "type": "string", "format": "uuid" },
    "due_date":              { "type": "string", "format": "date" },
    "current_level":         { "type": "integer", "minimum": 0, "description": "Current escalation tier (0 = initial assignment)." },
    "current_assignee_id":   { "type": "string", "format": "uuid" },
    "status": {
      "type": "string",
      "enum": ["active", "reminded", "overdue", "escalated_level_1", "escalated_level_2", "completed", "cancelled"],
      "description": "Per LLD §7.7.2 state diagram."
    },
    "history": {
      "type": "array",
      "description": "Audit trail of every timer, reminder, escalation, and human action.",
      "items": {
        "type": "object",
        "properties": {
          "timestamp":  { "type": "string", "format": "date-time" },
          "event_type": { "type": "string", "enum": ["reminder_sent", "escalated", "signal_received", "completed", "cancelled"] },
          "level":      { "type": "integer" },
          "actor_id":   { "type": ["string", "null"], "format": "uuid" },
          "details":    { "type": "string" }
        }
      }
    },
    "created_at":            { "type": "string", "format": "date-time" },
    "updated_at":            { "type": "string", "format": "date-time" }
  }
}
```

---

### 8.3 Approval Workflow Instance

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/approval_workflow.schema.json",
  "title": "ApprovalWorkflowInstance",
  "description": "Digital sign-off workflow for compliance verification, CAPA closure, statutory report submission. Multi-level approval chain. Ref: LLD §7.7.3, Brainstorm §5 Module 8.",
  "type": "object",
  "required": ["id", "entity_type", "entity_id", "requester_id", "approval_chain", "current_step", "status"],
  "properties": {
    "id":               { "type": "string", "format": "uuid" },
    "temporal_workflow_id": { "type": "string" },
    "entity_type":      { "type": "string", "enum": ["compliance_instance", "corrective_action", "statutory_report", "contractor_assignment"] },
    "entity_id":        { "type": "string", "format": "uuid" },
    "requester_id":     { "type": "string", "format": "uuid" },
    "approval_chain": {
      "type": "array",
      "description": "Ordered list of approval steps.",
      "items": {
        "type": "object",
        "properties": {
          "step":          { "type": "integer" },
          "approver_role": { "type": "string" },
          "approver_id":   { "type": ["string", "null"], "format": "uuid" },
          "status":        { "type": "string", "enum": ["pending", "approved", "rejected", "skipped"] },
          "decision_at":   { "type": ["string", "null"], "format": "date-time" },
          "comment":       { "type": ["string", "null"] },
          "signature_hash": { "type": ["string", "null"], "description": "Digital signature hash." }
        }
      }
    },
    "current_step":     { "type": "integer" },
    "status":           { "type": "string", "enum": ["in_progress", "approved", "rejected", "cancelled", "escalated"] },
    "sla_deadline":     { "type": ["string", "null"], "format": "date-time" },
    "created_at":       { "type": "string", "format": "date-time" },
    "updated_at":       { "type": "string", "format": "date-time" }
  }
}
```

---

### 8.4 Workflow Template (Configurable)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/workflow_template.schema.json",
  "title": "WorkflowTemplate",
  "description": "Data-driven escalation ladder configuration. Per subsidiary/category — not hardcoded. Ref: LLD §7.7 'escalation ladder configuration is data-driven'.",
  "type": "object",
  "required": ["id", "name", "entity_type", "escalation_levels"],
  "properties": {
    "id":           { "type": "string", "format": "uuid" },
    "name":         { "type": "string", "examples": ["DGMS Safety Violation Escalation", "Monthly Compliance Filing Reminder", "Contractor License Expiry Alert"] },
    "entity_type":  { "type": "string", "enum": ["compliance_instance", "corrective_action", "grievance", "contractor_document"] },
    "category":     { "type": ["string", "null"], "enum": [null, "safety", "environment", "production", "labour"] },
    "subsidiary_id": { "type": ["string", "null"], "format": "uuid", "description": "Null = applies to all subsidiaries." },
    "reminder_offsets_days": {
      "type": "array",
      "items": { "type": "integer" },
      "examples": [[14, 7, 1]],
      "description": "Days before due date for reminder notifications."
    },
    "escalation_levels": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["level", "target_role", "trigger_after_hours"],
        "properties": {
          "level":              { "type": "integer" },
          "target_role":        { "type": "string", "examples": ["mine_manager", "subsidiary_admin", "corporate_executive", "regulator"] },
          "trigger_after_hours": { "type": "integer", "description": "Hours after due date / previous escalation." },
          "notification_channels": { "type": "array", "items": { "type": "string", "enum": ["push_fcm", "sms", "email", "whatsapp", "in_app"] } }
        }
      }
    },
    "is_active":    { "type": "boolean", "default": true },
    "created_at":   { "type": "string", "format": "date-time" },
    "updated_at":   { "type": "string", "format": "date-time" }
  }
}
```

---

## 9. OCR & Document Digitization

Pipeline schemas for converting scanned/photographed paper records into structured data.

> **Data Sources**: [Brainstorm §5 Module 10](file:///c:/Coding/SIH2026/Brainstrom1.md), [LLD §7.8](file:///c:/Coding/SIH2026/LLD.md), [PRD §7.10](file:///c:/Coding/SIH2026/PRD.md)

---

### 9.1 Document Upload

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/document_upload.schema.json",
  "title": "DocumentUpload",
  "description": "Raw document uploaded for OCR processing. Triggers async OCR pipeline via Kafka DocumentUploaded event. Ref: LLD §7.8.1 pipeline diagram.",
  "type": "object",
  "required": ["id", "file_url", "document_category", "uploaded_by"],
  "properties": {
    "id":                { "type": "string", "format": "uuid" },
    "file_url":          { "type": "string", "format": "uri", "description": "MinIO/S3 raw file reference." },
    "file_name":         { "type": "string" },
    "file_type":         { "type": "string", "examples": ["application/pdf", "image/jpeg", "image/png", "image/tiff"] },
    "file_size_bytes":   { "type": "integer" },
    "document_category": {
      "type": "string",
      "enum": [
        "dgms_inspection_memo", "accident_register", "attendance_muster",
        "environmental_report", "contractor_license", "explosive_return",
        "production_return", "safety_committee_minutes", "statutory_form",
        "legacy_register", "other"
      ],
      "description": "Determines which OCR template to apply. Ref: LLD §7.8 — template-based extraction for known forms."
    },
    "source_entity_type": { "type": ["string", "null"], "enum": [null, "compliance_instance", "contractor_document", "inspection"] },
    "source_entity_id":   { "type": ["string", "null"], "format": "uuid" },
    "mine_id":            { "type": ["string", "null"], "format": "uuid" },
    "ocr_status":         { "type": "string", "enum": ["queued", "processing", "completed", "failed", "awaiting_review"], "default": "queued" },
    "ocr_result_id":      { "type": ["string", "null"], "format": "uuid", "description": "FK → OCRExtractionResult after processing." },
    "uploaded_by":        { "type": "string", "format": "uuid" },
    "uploaded_at":        { "type": "string", "format": "date-time" },
    "created_at":         { "type": "string", "format": "date-time" }
  }
}
```

---

### 9.2 OCR Extraction Result

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/ocr_extraction_result.schema.json",
  "title": "OCRExtractionResult",
  "description": "Structured fields extracted from a scanned document via OCR + NLP entity extraction. Every field carries a confidence score. Human confirmation mandatory before statutory use. Ref: LLD §7.8.1, §7.8.2.",
  "type": "object",
  "required": ["id", "document_id", "ocr_engine", "extracted_fields", "overall_confidence", "verification_status"],
  "properties": {
    "id":                { "type": "string", "format": "uuid" },
    "document_id":       { "type": "string", "format": "uuid", "description": "FK → DocumentUpload" },
    "ocr_engine":        { "type": "string", "examples": ["tesseract_5", "paddleocr", "indicocr"], "description": "Engine used for extraction." },
    "template_matched":  { "type": ["string", "null"], "description": "If a known statutory form template was matched (higher accuracy)." },
    "raw_text":          { "type": "string", "description": "Full OCR text output." },
    "detected_language":  { "type": "string", "examples": ["en", "hi", "bn"] },
    "extracted_fields": {
      "type": "array",
      "description": "Structured fields extracted. Each field is editable by human reviewer.",
      "items": {
        "type": "object",
        "required": ["field_name", "field_value", "confidence"],
        "properties": {
          "field_name":  { "type": "string", "examples": ["date", "mine_name", "regulation_section", "violation_type", "permit_number", "signatory_name", "expiry_date"] },
          "field_value": { "type": "string" },
          "confidence":  { "type": "number", "minimum": 0, "maximum": 1, "description": "OCR confidence score." },
          "bounding_box": {
            "type": ["object", "null"],
            "description": "Pixel coordinates of the field in the source document.",
            "properties": {
              "x": { "type": "number" }, "y": { "type": "number" },
              "width": { "type": "number" }, "height": { "type": "number" }
            }
          },
          "human_corrected_value": { "type": ["string", "null"], "description": "If reviewer corrected the AI extraction." }
        }
      }
    },
    "overall_confidence": { "type": "number", "minimum": 0, "maximum": 1 },
    "confidence_threshold": { "type": "number", "default": 0.85, "description": "Below this -> routed to manual review queue." },
    "verification_status": {
      "type": "string",
      "enum": ["auto_accepted", "pending_review", "human_verified", "rejected"],
      "description": "auto_accepted only if ALL fields above threshold. Otherwise pending_review."
    },
    "verified_by":       { "type": ["string", "null"], "format": "uuid" },
    "verified_at":       { "type": ["string", "null"], "format": "date-time" },
    "processing_time_ms": { "type": "integer" },
    "created_at":        { "type": "string", "format": "date-time" }
  }
}
```

---

### 9.3 OCR Review Queue Item

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/ocr_review_queue_item.schema.json",
  "title": "OCRReviewQueueItem",
  "description": "Items routed for human review — low-confidence OCR extractions. Ref: LLD §7.8.1 pipeline — 'Route to manual review queue'.",
  "type": "object",
  "required": ["id", "ocr_result_id", "document_id", "priority", "status"],
  "properties": {
    "id":              { "type": "string", "format": "uuid" },
    "ocr_result_id":   { "type": "string", "format": "uuid", "description": "FK → OCRExtractionResult" },
    "document_id":     { "type": "string", "format": "uuid", "description": "FK → DocumentUpload" },
    "mine_id":         { "type": ["string", "null"], "format": "uuid" },
    "document_category": { "type": "string" },
    "low_confidence_fields": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Field names that fell below confidence threshold."
    },
    "priority":        { "type": "string", "enum": ["high", "medium", "low"], "description": "Based on document category urgency." },
    "assigned_to":     { "type": ["string", "null"], "format": "uuid" },
    "status":          { "type": "string", "enum": ["pending", "in_review", "completed", "rejected"] },
    "created_at":      { "type": "string", "format": "date-time" },
    "completed_at":    { "type": ["string", "null"], "format": "date-time" }
  }
}
```

---

## 10. AI / Analytics Layer

Output schemas from the AI/ML risk engine. All scores are **explainable** — they return top contributing features alongside the score. Human-in-the-loop: flags only surface to dashboards and notifications, never trigger autonomous statutory actions.

> **Data Sources**: [Brainstorm §5 Module 7](file:///c:/Coding/SIH2026/Brainstrom1.md), [LLD §7.4](file:///c:/Coding/SIH2026/LLD.md), [PRD §7.6](file:///c:/Coding/SIH2026/PRD.md)

---

### 10.1 Mine Risk Score

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/mine_risk_score.schema.json",
  "title": "MineRiskScore",
  "description": "AI-computed risk score for a mine (0–100). Gradient Boosted Trees model retrained weekly. Ref: Brainstorm §5 Module 7 Model 1, LLD §7.4.",
  "type": "object",
  "required": ["id", "mine_id", "score", "risk_level", "computed_at", "model_version"],
  "properties": {
    "id":             { "type": "string", "format": "uuid" },
    "mine_id":        { "type": "string", "format": "uuid" },
    "subsidiary_id":  { "type": "string", "format": "uuid" },
    "score":          { "type": "number", "minimum": 0, "maximum": 100 },
    "risk_level":     { "type": "string", "enum": ["low", "medium", "high", "critical"] },
    "contributing_factors": {
      "type": "array",
      "description": "Top factors with their contribution weight — mandatory for explainability. Ref: LLD §7.4.2.",
      "items": {
        "type": "object",
        "required": ["factor", "weight", "description"],
        "properties": {
          "factor":      { "type": "string", "examples": ["violation_frequency_90d", "capa_closure_lateness", "contractor_compliance_pct", "environmental_breaches_30d", "production_pressure_index"] },
          "weight":      { "type": "number", "description": "Feature importance weight." },
          "description": { "type": "string", "examples": ["12 violations in last 90 days — 3x above subsidiary average."] },
          "value":       { "type": "number", "description": "Current feature value." }
        }
      }
    },
    "category_scores": {
      "type": "object",
      "description": "Breakdown by compliance category.",
      "properties": {
        "safety":      { "type": "number" },
        "environment": { "type": "number" },
        "production":  { "type": "number" },
        "labour":      { "type": "number" }
      }
    },
    "trend":          { "type": "string", "enum": ["improving", "stable", "worsening"] },
    "previous_score": { "type": ["number", "null"] },
    "model_version":  { "type": "string", "description": "MLflow model version used." },
    "computed_at":    { "type": "string", "format": "date-time" },
    "next_scheduled_computation": { "type": ["string", "null"], "format": "date-time" }
  }
}
```

---

### 10.2 Contractor Risk Score

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/contractor_risk_score.schema.json",
  "title": "ContractorRiskScore",
  "description": "AI-computed contractor compliance risk. Feeds the 0–100 Contractor Trust Score. Ref: Brainstorm §11.4, §5 Module 7 Model 5.",
  "type": "object",
  "required": ["id", "contractor_id", "trust_score", "risk_rating", "computed_at"],
  "properties": {
    "id":             { "type": "string", "format": "uuid" },
    "contractor_id":  { "type": "string", "format": "uuid" },
    "trust_score":    { "type": "number", "minimum": 0, "maximum": 100, "description": "0–100 Contractor Trust Score." },
    "risk_rating":    { "type": "string", "enum": ["low", "medium", "high", "critical"] },
    "factors": {
      "type": "object",
      "properties": {
        "safety_violation_score":    { "type": "number", "description": "Based on historical violations linked to this contractor's workers." },
        "document_compliance_rate":  { "type": "number", "description": "% of documents valid and not expired." },
        "worker_welfare_score":      { "type": "number", "description": "ESI/EPF compliance, wages timeliness." },
        "attendance_anomaly_score":  { "type": "number", "description": "Deviation from historical attendance norms. Ref: Brainstorm §5 Module 7 Model 5." },
        "project_quality_rating":    { "type": ["number", "null"] },
        "billing_anomaly_score":     { "type": ["number", "null"], "description": "Flag if billing inconsistent with verified attendance." }
      }
    },
    "anomaly_flags": {
      "type": "array",
      "items": { "type": "string" },
      "examples": [["Attendance deviation +40% from historical norm", "Workers clocked at 2 sites simultaneously"]]
    },
    "model_version":  { "type": "string" },
    "computed_at":    { "type": "string", "format": "date-time" }
  }
}
```

---

### 10.3 Anomaly Flag

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/anomaly_flag.schema.json",
  "title": "AnomalyFlag",
  "description": "AI-detected anomaly in production, environmental, or attendance data. Isolation Forest / time-series model output. Ref: Brainstorm §5 Module 7 Models 2, 4, 5; LLD §7.4.",
  "type": "object",
  "required": ["id", "mine_id", "anomaly_type", "data_source", "severity", "description", "detected_at"],
  "properties": {
    "id":            { "type": "string", "format": "uuid" },
    "mine_id":       { "type": "string", "format": "uuid" },
    "subsidiary_id": { "type": "string", "format": "uuid" },
    "anomaly_type": {
      "type": "string",
      "enum": ["production_anomaly", "environmental_anomaly", "attendance_anomaly", "sensor_malfunction", "billing_anomaly"],
      "description": "Category of anomaly detected."
    },
    "data_source":   { "type": "string", "examples": ["production_reading", "environment_reading", "attendance_record", "contractor_billing"] },
    "severity":      { "type": "string", "enum": ["low", "medium", "high", "critical"] },
    "description":   { "type": "string", "description": "Human-readable explanation of the anomaly." },
    "metric_name":   { "type": "string", "examples": ["daily_production_tonnes", "pm10_reading", "contractor_headcount"] },
    "expected_value": { "type": "number" },
    "actual_value":  { "type": "number" },
    "deviation_pct": { "type": "number" },
    "confidence":    { "type": "number", "minimum": 0, "maximum": 1 },
    "contributing_data_points": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "timestamp": { "type": "string", "format": "date-time" },
          "value":     { "type": "number" }
        }
      }
    },
    "is_acknowledged": { "type": "boolean", "default": false, "description": "Human must acknowledge before it clears from dashboard." },
    "acknowledged_by": { "type": ["string", "null"], "format": "uuid" },
    "acknowledged_at": { "type": ["string", "null"], "format": "date-time" },
    "model_version":   { "type": "string" },
    "detected_at":     { "type": "string", "format": "date-time" },
    "created_at":      { "type": "string", "format": "date-time" }
  }
}
```

---

### 10.4 Recurring Violation Cluster

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/recurring_violation_cluster.schema.json",
  "title": "RecurringViolationCluster",
  "description": "AI-detected systemic/recurring violation pattern. NLP clustering (BERT embeddings) on observation text. 'This observation has appeared 5+ times in 18 months without resolution — SYSTEMIC RISK.' Ref: Brainstorm §5 Module 7 Model 2, LLD §7.4.",
  "type": "object",
  "required": ["id", "mine_id", "cluster_label", "violation_ids", "occurrence_count", "first_detected", "last_detected"],
  "properties": {
    "id":               { "type": "string", "format": "uuid" },
    "mine_id":          { "type": "string", "format": "uuid" },
    "subsidiary_id":    { "type": "string", "format": "uuid" },
    "cluster_label":    { "type": "string", "examples": ["Inadequate roof support in District 4", "Repeated PPE violations at Coal Handling Plant", "Recurring effluent discharge non-compliance"] },
    "category":         { "type": "string", "enum": ["safety", "environment", "equipment", "labour"] },
    "violation_ids": {
      "type": "array",
      "items": { "type": "string", "format": "uuid" },
      "description": "FK → Violation[] composing this cluster."
    },
    "occurrence_count": { "type": "integer", "minimum": 2 },
    "time_span_months": { "type": "number", "description": "Months between first and last occurrence." },
    "first_detected":   { "type": "string", "format": "date" },
    "last_detected":    { "type": "string", "format": "date" },
    "is_resolved":      { "type": "boolean", "default": false },
    "recommended_action": { "type": ["string", "null"], "description": "AI-suggested systemic fix." },
    "risk_contribution": { "type": "number", "description": "How much this cluster contributes to the mine's risk score." },
    "model_version":    { "type": "string" },
    "computed_at":      { "type": "string", "format": "date-time" }
  }
}
```

---

## 11. Audit Trail Entry

Immutable audit log entry. Every compliance-relevant mutation emits an `AuditEvent` to the Audit & Blockchain Gateway. Hash-anchored to Hyperledger Fabric for tamper-evidence.

> **Data Sources**: [LLD §7.10](file:///c:/Coding/SIH2026/LLD.md), [PRD §21](file:///c:/Coding/SIH2026/PRD.md)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "sgcmp/audit_trail_entry.schema.json",
  "title": "AuditTrailEntry",
  "description": "Immutable audit log. Full record stays in PostgreSQL; SHA-256 hash anchored to Hyperledger Fabric. Ref: LLD §7.10.1.",
  "type": "object",
  "required": ["id", "entity_type", "entity_id", "action", "actor_id", "timestamp", "payload_hash"],
  "properties": {
    "id":              { "type": "string", "format": "uuid" },
    "entity_type":     { "type": "string", "examples": ["compliance_instance", "inspection", "violation", "corrective_action", "contractor_document", "production_reading", "incident_report"] },
    "entity_id":       { "type": "string", "format": "uuid" },
    "action":          { "type": "string", "enum": ["create", "update", "submit", "approve", "reject", "escalate", "close", "delete"] },
    "actor_id":        { "type": "string", "format": "uuid", "description": "User who performed the action." },
    "actor_role":      { "type": "string" },
    "mine_id":         { "type": ["string", "null"], "format": "uuid" },
    "subsidiary_id":   { "type": ["string", "null"], "format": "uuid" },
    "timestamp":       { "type": "string", "format": "date-time" },
    "geo_stamp":       { "oneOf": [{ "$ref": "sgcmp/geostamp.schema.json" }, { "type": "null" }], "description": "Geo-location if field-captured action." },
    "payload_hash":    { "type": "string", "description": "SHA-256 hash of the entity payload at this point in time." },
    "previous_hash":   { "type": ["string", "null"], "description": "Hash chain linking to previous audit entry for this entity." },
    "before_snapshot": { "type": ["object", "null"], "description": "Entity state before the action (for updates)." },
    "after_snapshot":  { "type": ["object", "null"], "description": "Entity state after the action." },
    "blockchain_tx_id": { "type": ["string", "null"], "description": "Hyperledger Fabric transaction ID, set after anchoring." },
    "blockchain_block_ref": { "type": ["string", "null"], "description": "Block reference on the ledger." },
    "ip_address":      { "type": ["string", "null"] },
    "user_agent":      { "type": ["string", "null"] }
  }
}
```

---

## Data Reference Summary

| Schema | Primary Regulatory Reference | Data Source Documents |
|--------|-------------------------------|---------------------|
| Regulation Library | Mines Act 1952, CMR 2017, EP Act 1986, CLRA 1970, Factories Act 1948 | Brainstorm §5 Mod 1, LLD §7.2 |
| Compliance Requirement/Instance | CMR 2017 Reg 4 (Form 3), Reg 167; Mines Act Sec 58; EC conditions | PRD §7.1, Product Brief §5.1 |
| Inspection/Observation/Violation | CMR 2017 Reg 117 (Form 6), DGMS inspection types | Brainstorm §5 Mod 2, LLD §7.3 |
| Corrective Action (CAPA) | CMR 2017 Reg 117 (7-day corrective action deadline) | LLD §7.3.5 |
| Accident Register | Mines Act 1952 Sec 23, CMR 2017 Form 4-A/4-B/4-C, Reg 8 | Brainstorm §1.2 Layer 1 |
| Safety Committee Record | CMR 2017 Reg 167 | Brainstorm §5 Mod 1 |
| Explosive Register | Explosive Substances Act, CMR 2017 | Brainstorm §5 Mod 1 |
| Overman Report | CMR 2017 Reg 28 | Brainstorm §1.2 Layer 1 |
| Environmental Monitoring | EP Act 1986, EIA Notification 2006, SPCB CTO conditions | Brainstorm §5 Mod 3, LLD §7.13 |
| Production Register | Coal Controller's Organisation Form I/II | Brainstorm §1.2 Layer 4, LLD §7.13 |
| Attendance / Muster Roll | Mines Act Form B, CLRA Form XVI/XVIII | Brainstorm §5 Mod 5, LLD §7.5.3 |
| Contractor & Documents | CLRA 1970 Forms I, IV, V, XII–XXV; ESI Act; EPF Act | Brainstorm §5 Mod 4, LLD §7.6 |
| Contract Worker | CLRA Form XIII (Register), Form XIV (Employment Card) | Brainstorm §5 Mod 4 |
| Incident / Near-Miss Report | Mines Act Sec 23, CMR 2017 Reg 8 | Brainstorm §5 Mod 5, PRD §7.2 FR-2.6 |
| Alerts & Escalation | DGMS SLA norms, CIL internal escalation policy | Brainstorm §5 Mod 8, LLD §7.7 |
| OCR Pipeline | Physical statutory registers digitization | Brainstorm §5 Mod 10, LLD §7.8 |
| AI Risk Scores | Compliance Risk Predictor (XGBoost), Anomaly Detection (Isolation Forest) | Brainstorm §5 Mod 7, LLD §7.4 |
| Audit Trail | Hyperledger Fabric permissioned ledger | LLD §7.10, PRD §21 |

---

*Document Version: 1.0 | Generated: August 2026 | Scoped to Phase-1 MVP Features*
