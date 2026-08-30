-- =============================================================================
-- SGCMP – Smart Governance & Compliance Monitoring Platform
-- Full Schema Migration  (Phase-1 MVP)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
CREATE TYPE org_type              AS ENUM ('ministry', 'psu');
CREATE TYPE mine_type_enum        AS ENUM ('opencast', 'underground', 'mixed');
CREATE TYPE mine_status_enum      AS ENUM ('active', 'temporarily_closed', 'abandoned');
CREATE TYPE compliance_category   AS ENUM ('safety', 'environment', 'production', 'labour');
CREATE TYPE recurrence_enum       AS ENUM ('daily', 'weekly', 'fortnightly', 'monthly', 'quarterly', 'half_yearly', 'annual', 'on_event', 'one_time');
CREATE TYPE authority_enum        AS ENUM ('dgms', 'moefcc', 'spcb', 'cco', 'labour_dept', 'district_magistrate', 'internal');
CREATE TYPE instance_status       AS ENUM ('pending', 'in_progress', 'submitted', 'revision_requested', 'approved', 'breached');
CREATE TYPE evidence_upload_method AS ENUM ('web_upload', 'mobile_capture', 'ocr_scan');
CREATE TYPE inspection_type_enum  AS ENUM ('dgms_annual_general', 'dgms_surprise', 'dgms_inquiry', 'internal_safety_committee', 'environmental_pcb', 'medical_fitness', 'electrical', 'explosives');
CREATE TYPE inspection_status     AS ENUM ('draft', 'in_progress', 'submitted', 'reviewed');
CREATE TYPE sync_status_enum      AS ENUM ('pending_sync', 'synced', 'sync_conflict');
CREATE TYPE obs_severity          AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE obs_status_enum       AS ENUM ('ok', 'non_compliant', 'observation_only');
CREATE TYPE violation_severity    AS ENUM ('minor', 'moderate', 'major', 'critical');
CREATE TYPE violation_status      AS ENUM ('reported', 'under_review', 'capa_assigned', 'in_progress', 'pending_verification', 'closed', 'dismissed', 'systemic_risk');
CREATE TYPE capa_status           AS ENUM ('assigned', 'in_progress', 'completed', 'pending_verification', 'verified_closed', 'overdue', 'escalated');
CREATE TYPE media_type_enum       AS ENUM ('photo', 'video', 'audio');
CREATE TYPE media_parent_type     AS ENUM ('observation', 'corrective_action', 'incident_report', 'safety_observation', 'contractor_document');
CREATE TYPE contractor_status     AS ENUM ('active', 'suspended', 'blacklisted', 'inactive');
CREATE TYPE risk_rating_enum      AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE contractor_doc_type   AS ENUM ('clra_license', 'esi_registration', 'epf_registration', 'safety_training_certificate', 'mine_safety_training', 'insurance_policy', 'work_order', 'labour_license', 'gst_certificate', 'pf_challan', 'esi_challan', 'other');
CREATE TYPE contractor_doc_status AS ENUM ('valid', 'expiring_soon', 'expired', 'under_review', 'rejected');
CREATE TYPE assignment_status     AS ENUM ('active', 'completed', 'terminated', 'expired', 'blocked');
CREATE TYPE incident_type_enum    AS ENUM ('roof_fall', 'gas_ignition', 'equipment_failure', 'personal_injury', 'near_miss', 'fire', 'inundation_risk', 'explosives_incident', 'electrical_incident', 'haulage_incident', 'fall_of_person', 'other');
CREATE TYPE severity_enum         AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE safety_obs_type       AS ENUM ('unsafe_act', 'unsafe_condition', 'positive_observation');
CREATE TYPE safety_obs_status     AS ENUM ('open', 'assigned', 'corrected', 'verified_closed');
CREATE TYPE alert_priority        AS ENUM ('critical', 'high', 'medium', 'low', 'info');
CREATE TYPE alert_status          AS ENUM ('pending', 'sent', 'delivered', 'read', 'acknowledged', 'failed');
CREATE TYPE escalation_status     AS ENUM ('active', 'reminded', 'overdue', 'escalated_level_1', 'escalated_level_2', 'completed', 'cancelled');
CREATE TYPE escalation_entity     AS ENUM ('compliance_instance', 'corrective_action', 'grievance', 'contractor_document');
CREATE TYPE ocr_status_enum       AS ENUM ('queued', 'processing', 'completed', 'failed', 'awaiting_review');
CREATE TYPE ocr_verify_status     AS ENUM ('auto_accepted', 'pending_review', 'human_verified', 'rejected');
CREATE TYPE env_param_enum        AS ENUM ('pm10', 'pm2_5', 'so2', 'nox', 'rspm', 'spm', 'noise_db', 'ph', 'bod', 'cod', 'tss', 'oil_grease', 'groundwater_level', 'green_cover_pct');
CREATE TYPE env_source_enum       AS ENUM ('manual', 'sensor_iot', 'ocr_extracted');
CREATE TYPE station_type_enum     AS ENUM ('caaqms_air', 'manual_air', 'water_effluent', 'water_groundwater', 'noise', 'dust_sampler');
CREATE TYPE anomaly_type_enum     AS ENUM ('production_anomaly', 'environmental_anomaly', 'attendance_anomaly', 'sensor_malfunction', 'billing_anomaly');
CREATE TYPE role_name_enum        AS ENUM ('field_officer', 'mine_manager', 'safety_officer', 'environmental_officer', 'compliance_officer', 'contractor_manager', 'subsidiary_admin', 'corporate_executive', 'regulator', 'system_admin');
CREATE TYPE scope_level_enum      AS ENUM ('mine', 'subsidiary', 'organization', 'jurisdiction');
CREATE TYPE responsible_role_enum AS ENUM ('mine_manager', 'safety_officer', 'environmental_officer', 'compliance_officer');
CREATE TYPE source_type_enum      AS ENUM ('violation', 'compliance_breach', 'incident');
CREATE TYPE doc_category_enum     AS ENUM ('dgms_inspection_memo', 'accident_register', 'attendance_muster', 'environmental_report', 'contractor_license', 'explosive_return', 'production_return', 'safety_committee_minutes', 'statutory_form', 'legacy_register', 'other');
CREATE TYPE risk_trend_enum       AS ENUM ('improving', 'stable', 'worsening');
CREATE TYPE shift_enum            AS ENUM ('A', 'B', 'C', 'general', 'daily_aggregate');

-- ---------------------------------------------------------------------------
-- HELPER: auto-update updated_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. FOUNDATIONAL ENTITIES
-- ============================================================================

CREATE TABLE organizations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT NOT NULL,
    type       org_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE subsidiaries (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    code            VARCHAR(10) NOT NULL UNIQUE,
    state           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE mines (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subsidiary_id    UUID NOT NULL REFERENCES subsidiaries(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    mine_type        mine_type_enum NOT NULL,
    status           mine_status_enum NOT NULL DEFAULT 'active',
    boundary_geojson JSONB,
    district         TEXT,
    state            TEXT,
    dgms_region      TEXT,
    ec_number        TEXT,
    coal_grade       TEXT,
    created_at       TIMESTAMPTZ DEFAULT now(),
    updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_subject   TEXT UNIQUE,
    full_name          TEXT NOT NULL,
    designation        TEXT,
    email              TEXT,
    mine_id            UUID REFERENCES mines(id) ON DELETE SET NULL,
    subsidiary_id      UUID REFERENCES subsidiaries(id) ON DELETE SET NULL,
    preferred_language TEXT DEFAULT 'en',
    is_active          BOOLEAN DEFAULT true,
    created_at         TIMESTAMPTZ DEFAULT now(),
    updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        role_name_enum NOT NULL UNIQUE,
    scope_level scope_level_enum NOT NULL,
    permissions JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================================
-- 2. STATUTORY COMPLIANCE MODULE
-- ============================================================================

CREATE TABLE regulations (
    id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code                          TEXT UNIQUE,
    title                         TEXT NOT NULL,
    statute                       TEXT,
    section_reference             TEXT,
    category                      compliance_category NOT NULL,
    description                   TEXT,
    authority                     authority_enum,
    consequence_of_non_compliance TEXT,
    version                       INTEGER NOT NULL DEFAULT 1,
    is_active                     BOOLEAN DEFAULT true,
    created_at                    TIMESTAMPTZ DEFAULT now(),
    updated_at                    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE compliance_requirements (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    regulation_id         UUID NOT NULL REFERENCES regulations(id) ON DELETE CASCADE,
    title                 TEXT NOT NULL,
    recurrence            recurrence_enum NOT NULL,
    grace_period_days     INTEGER DEFAULT 0,
    reminder_offsets_days INTEGER[] DEFAULT ARRAY[30,7,1],
    applicable_mine_types mine_type_enum[] NOT NULL,
    applicable_states     TEXT[],
    documents_required    TEXT[],
    responsible_role      responsible_role_enum,
    regulation_version    INTEGER,
    is_active             BOOLEAN DEFAULT true,
    created_at            TIMESTAMPTZ DEFAULT now(),
    updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE compliance_instances (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id     UUID NOT NULL REFERENCES compliance_requirements(id),
    mine_id            UUID NOT NULL REFERENCES mines(id),
    subsidiary_id      UUID REFERENCES subsidiaries(id),
    period_start       DATE NOT NULL,
    period_end         DATE NOT NULL,
    due_date           DATE NOT NULL,
    status             instance_status NOT NULL DEFAULT 'pending',
    is_late_submission BOOLEAN DEFAULT false,
    assigned_to        UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at       TIMESTAMPTZ,
    verified_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at        TIMESTAMPTZ,
    rejection_reason   TEXT,
    regulation_version INTEGER,
    created_at         TIMESTAMPTZ DEFAULT now(),
    updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE compliance_evidences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id     UUID NOT NULL REFERENCES compliance_instances(id) ON DELETE CASCADE,
    document_url    TEXT NOT NULL,
    file_name       TEXT,
    file_type       TEXT,
    file_size_bytes INTEGER,
    upload_method   evidence_upload_method NOT NULL,
    ocr_result_id   UUID,
    is_verified     BOOLEAN DEFAULT false,
    verified_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at     TIMESTAMPTZ,
    uploaded_by     UUID REFERENCES users(id) ON DELETE SET NULL,
    uploaded_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 3. INSPECTION & VIOLATION MANAGEMENT
-- ============================================================================

CREATE TABLE inspection_checklist_templates (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                  TEXT NOT NULL,
    inspection_type       inspection_type_enum NOT NULL,
    applicable_mine_types mine_type_enum[] NOT NULL,
    regulation_reference  TEXT,
    checklist_items       JSONB NOT NULL DEFAULT '[]',
    version               INTEGER NOT NULL DEFAULT 1,
    is_active             BOOLEAN DEFAULT true,
    created_at            TIMESTAMPTZ DEFAULT now(),
    updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE inspections (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id               UUID NOT NULL REFERENCES mines(id),
    subsidiary_id         UUID REFERENCES subsidiaries(id),
    conducted_by          UUID NOT NULL REFERENCES users(id),
    inspection_type       inspection_type_enum NOT NULL,
    checklist_template_id UUID REFERENCES inspection_checklist_templates(id) ON DELETE SET NULL,
    zone                  TEXT,
    geo_stamp             JSONB,
    started_at            TIMESTAMPTZ NOT NULL,
    completed_at          TIMESTAMPTZ,
    submitted_at          TIMESTAMPTZ,
    status                inspection_status NOT NULL DEFAULT 'draft',
    sync_status           sync_status_enum DEFAULT 'pending_sync',
    observation_count     INTEGER DEFAULT 0,
    violation_count       INTEGER DEFAULT 0,
    overall_remarks       TEXT,
    inspection_memo_url   TEXT,
    created_at            TIMESTAMPTZ DEFAULT now(),
    updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE observations (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id       UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
    checklist_item_id   TEXT,
    category            TEXT NOT NULL,
    description         TEXT NOT NULL,
    severity            obs_severity NOT NULL,
    status              obs_status_enum,
    geo_stamp           JSONB,
    voice_note_url      TEXT,
    voice_transcription TEXT,
    ai_category         TEXT,
    ai_confidence_score NUMERIC(5,4),
    violation_id        UUID,
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE violations (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observation_id       UUID NOT NULL REFERENCES observations(id),
    mine_id              UUID NOT NULL REFERENCES mines(id),
    subsidiary_id        UUID REFERENCES subsidiaries(id),
    statute_reference    TEXT,
    category             compliance_category,
    severity             violation_severity NOT NULL,
    description          TEXT,
    status               violation_status NOT NULL DEFAULT 'reported',
    corrective_action_id UUID,
    reported_by          UUID NOT NULL REFERENCES users(id),
    reported_at          TIMESTAMPTZ DEFAULT now(),
    dismissed_reason     TEXT,
    is_regulator_visible BOOLEAN DEFAULT false,
    recurrence_count     INTEGER DEFAULT 0,
    created_at           TIMESTAMPTZ DEFAULT now(),
    updated_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE corrective_actions (
    id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type            source_type_enum NOT NULL,
    source_id              UUID NOT NULL,
    mine_id                UUID NOT NULL REFERENCES mines(id),
    subsidiary_id          UUID REFERENCES subsidiaries(id),
    description            TEXT NOT NULL,
    preventive_measures    TEXT,
    assigned_to            UUID NOT NULL REFERENCES users(id),
    assigned_by            UUID NOT NULL REFERENCES users(id),
    due_date               DATE NOT NULL,
    status                 capa_status NOT NULL DEFAULT 'assigned',
    completion_notes       TEXT,
    completed_at           TIMESTAMPTZ,
    verified_by            UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at            TIMESTAMPTZ,
    escalation_workflow_id UUID,
    created_at             TIMESTAMPTZ DEFAULT now(),
    updated_at             TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE media_attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_type     media_parent_type NOT NULL,
    parent_id       UUID NOT NULL,
    media_type      media_type_enum NOT NULL,
    file_url        TEXT NOT NULL,
    thumbnail_url   TEXT,
    file_size_bytes INTEGER,
    mime_type       TEXT,
    geo_stamp       JSONB,
    sync_status     TEXT DEFAULT 'pending_upload',
    captured_by     UUID NOT NULL REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Wire forward-ref FKs
ALTER TABLE observations      ADD CONSTRAINT fk_obs_violation  FOREIGN KEY (violation_id)        REFERENCES violations(id)         ON DELETE SET NULL;
ALTER TABLE violations         ADD CONSTRAINT fk_vio_capa       FOREIGN KEY (corrective_action_id) REFERENCES corrective_actions(id) ON DELETE SET NULL;

-- ============================================================================
-- 4. STATUTORY REGISTERS (Digitized)
-- ============================================================================

CREATE TABLE monitoring_stations (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id        UUID NOT NULL REFERENCES mines(id),
    station_type   station_type_enum NOT NULL,
    name           TEXT NOT NULL,
    location       JSONB,
    is_iot_enabled BOOLEAN DEFAULT false,
    is_active      BOOLEAN DEFAULT true,
    created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE environment_readings (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id            UUID NOT NULL REFERENCES mines(id),
    station_id         UUID NOT NULL REFERENCES monitoring_stations(id),
    parameter          env_param_enum NOT NULL,
    value              NUMERIC NOT NULL,
    unit               TEXT NOT NULL,
    recorded_at        TIMESTAMPTZ NOT NULL,
    source             env_source_enum NOT NULL,
    ec_condition_ref   TEXT,
    prescribed_limit   NUMERIC,
    threshold_breached BOOLEAN DEFAULT false,
    breach_severity    TEXT,
    sensor_id          TEXT,
    recorded_by        UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at         TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE production_readings (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id            UUID NOT NULL REFERENCES mines(id),
    subsidiary_id      UUID REFERENCES subsidiaries(id),
    reporting_date     DATE NOT NULL,
    shift              shift_enum NOT NULL,
    quantity_tonnes    NUMERIC NOT NULL CHECK (quantity_tonnes >= 0),
    coal_grade         TEXT,
    seam_name          TEXT,
    source             TEXT NOT NULL,
    overburden_cum     NUMERIC,
    equipment_deployed JSONB,
    workforce_count    INTEGER,
    reported_by        UUID NOT NULL REFERENCES users(id),
    anomaly_flagged    BOOLEAN DEFAULT false,
    created_at         TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 5. CONTRACTOR ECOSYSTEM
-- ============================================================================

CREATE TABLE contractors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    registration_number TEXT NOT NULL UNIQUE,
    pan                 VARCHAR(10),
    gst_number          TEXT,
    contact_person      TEXT,
    contact_email       TEXT,
    address             TEXT,
    status              contractor_status NOT NULL DEFAULT 'active',
    blacklist_reason    TEXT,
    risk_rating         risk_rating_enum,
    trust_score         NUMERIC(5,2),
    onboarded_at        TIMESTAMPTZ DEFAULT now(),
    created_at          TIMESTAMPTZ DEFAULT now(),
    updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contractor_documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    doc_type      contractor_doc_type NOT NULL,
    document_url  TEXT NOT NULL,
    ocr_result_id UUID,
    valid_from    DATE NOT NULL,
    valid_until   DATE NOT NULL,
    status        contractor_doc_status NOT NULL DEFAULT 'valid',
    is_verified   BOOLEAN DEFAULT false,
    verified_by   UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at   TIMESTAMPTZ,
    uploaded_by   UUID NOT NULL REFERENCES users(id),
    uploaded_at   TIMESTAMPTZ DEFAULT now(),
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contractor_assignments (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id         UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    mine_id               UUID NOT NULL REFERENCES mines(id),
    subsidiary_id         UUID REFERENCES subsidiaries(id),
    work_order_number     TEXT NOT NULL UNIQUE,
    scope_of_work         TEXT NOT NULL,
    work_zone             TEXT,
    start_date            DATE NOT NULL,
    end_date              DATE NOT NULL,
    max_workers_permitted INTEGER,
    status                assignment_status NOT NULL DEFAULT 'active',
    blocked_reason        TEXT,
    performance_rating    NUMERIC(3,1),
    created_at            TIMESTAMPTZ DEFAULT now(),
    updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE contract_workers (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id         UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    name                  TEXT NOT NULL,
    worker_id_card_number TEXT NOT NULL,
    aadhaar_hash          TEXT,
    age                   INTEGER,
    skill_category        TEXT,
    designation           TEXT,
    training_certificates JSONB DEFAULT '[]',
    esi_number            TEXT,
    epf_number            TEXT,
    is_active             BOOLEAN DEFAULT true,
    created_at            TIMESTAMPTZ DEFAULT now(),
    updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 6. MOBILE FIELD REPORTING
-- ============================================================================

CREATE TABLE incident_reports (
    id                             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id                        UUID NOT NULL REFERENCES mines(id),
    subsidiary_id                  UUID REFERENCES subsidiaries(id),
    incident_type                  incident_type_enum NOT NULL,
    description                    TEXT NOT NULL,
    severity                       severity_enum NOT NULL,
    ai_suggested_severity          severity_enum,
    ai_suggested_category          TEXT,
    geo_stamp                      JSONB,
    zone                           TEXT,
    shift                          shift_enum,
    persons_involved               JSONB DEFAULT '[]',
    voice_note_url                 TEXT,
    voice_transcription            TEXT,
    immediate_actions_taken        TEXT,
    is_linked_to_accident_register BOOLEAN DEFAULT false,
    corrective_action_id           UUID REFERENCES corrective_actions(id) ON DELETE SET NULL,
    reported_by                    UUID NOT NULL REFERENCES users(id),
    reported_at                    TIMESTAMPTZ DEFAULT now(),
    sync_status                    TEXT DEFAULT 'pending_sync',
    created_at                     TIMESTAMPTZ DEFAULT now(),
    updated_at                     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE safety_observations (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id                 UUID NOT NULL REFERENCES mines(id),
    zone                    TEXT NOT NULL,
    observation_type        safety_obs_type NOT NULL,
    category                TEXT,
    description             TEXT NOT NULL,
    geo_stamp               JSONB,
    assigned_to             UUID REFERENCES users(id) ON DELETE SET NULL,
    status                  safety_obs_status NOT NULL DEFAULT 'open',
    corrected_at            TIMESTAMPTZ,
    correction_evidence_ids UUID[] DEFAULT ARRAY[]::UUID[],
    observed_by             UUID NOT NULL REFERENCES users(id),
    observed_at             TIMESTAMPTZ DEFAULT now(),
    sync_status             TEXT DEFAULT 'pending_sync',
    created_at              TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 8. ALERTS & ESCALATION WORKFLOWS
-- ============================================================================

CREATE TABLE alerts (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    priority             alert_priority NOT NULL,
    type                 TEXT NOT NULL,
    title                TEXT NOT NULL,
    message              TEXT NOT NULL,
    target_user_id       UUID NOT NULL REFERENCES users(id),
    target_role          TEXT,
    mine_id              UUID REFERENCES mines(id) ON DELETE SET NULL,
    entity_type          TEXT,
    entity_id            UUID,
    channels             TEXT[] NOT NULL,
    sla_response_minutes INTEGER,
    status               alert_status NOT NULL DEFAULT 'pending',
    sent_at              TIMESTAMPTZ,
    read_at              TIMESTAMPTZ,
    created_at           TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE escalation_workflow_instances (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    temporal_workflow_id TEXT,
    workflow_template_id UUID NOT NULL,
    entity_type          escalation_entity NOT NULL,
    entity_id            UUID NOT NULL,
    mine_id              UUID NOT NULL REFERENCES mines(id),
    subsidiary_id        UUID REFERENCES subsidiaries(id),
    due_date             DATE NOT NULL,
    current_level        INTEGER NOT NULL DEFAULT 0,
    current_assignee_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    status               escalation_status NOT NULL DEFAULT 'active',
    history              JSONB DEFAULT '[]',
    created_at           TIMESTAMPTZ DEFAULT now(),
    updated_at           TIMESTAMPTZ DEFAULT now()
);

-- Wire CAPA escalation FK now that escalation table exists
ALTER TABLE corrective_actions ADD CONSTRAINT fk_capa_escalation
    FOREIGN KEY (escalation_workflow_id) REFERENCES escalation_workflow_instances(id) ON DELETE SET NULL;

-- ============================================================================
-- 9. OCR & DOCUMENT DIGITIZATION
-- ============================================================================

CREATE TABLE document_uploads (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_url          TEXT NOT NULL,
    file_name         TEXT,
    file_type         TEXT,
    file_size_bytes   INTEGER,
    document_category doc_category_enum NOT NULL,
    source_entity_type TEXT,
    source_entity_id  UUID,
    mine_id           UUID REFERENCES mines(id) ON DELETE SET NULL,
    ocr_status        ocr_status_enum DEFAULT 'queued',
    ocr_result_id     UUID,
    uploaded_by       UUID NOT NULL REFERENCES users(id),
    uploaded_at       TIMESTAMPTZ DEFAULT now(),
    created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ocr_extraction_results (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id          UUID NOT NULL REFERENCES document_uploads(id) ON DELETE CASCADE,
    ocr_engine           TEXT NOT NULL,
    template_matched     TEXT,
    raw_text             TEXT,
    detected_language    TEXT,
    extracted_fields     JSONB NOT NULL DEFAULT '[]',
    overall_confidence   NUMERIC(5,4) NOT NULL,
    confidence_threshold NUMERIC(5,4) DEFAULT 0.85,
    verification_status  ocr_verify_status NOT NULL DEFAULT 'pending_review',
    verified_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at          TIMESTAMPTZ,
    processing_time_ms   INTEGER,
    created_at           TIMESTAMPTZ DEFAULT now()
);

-- Wire OCR forward-refs
ALTER TABLE document_uploads     ADD CONSTRAINT fk_du_ocr  FOREIGN KEY (ocr_result_id) REFERENCES ocr_extraction_results(id) ON DELETE SET NULL DEFERRABLE INITIALLY DEFERRED;
ALTER TABLE compliance_evidences ADD CONSTRAINT fk_ce_ocr  FOREIGN KEY (ocr_result_id) REFERENCES ocr_extraction_results(id) ON DELETE SET NULL;
ALTER TABLE contractor_documents ADD CONSTRAINT fk_cd_ocr  FOREIGN KEY (ocr_result_id) REFERENCES ocr_extraction_results(id) ON DELETE SET NULL;

-- ============================================================================
-- 10. AI / ANALYTICS LAYER
-- ============================================================================

CREATE TABLE mine_risk_scores (
    id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id                    UUID NOT NULL REFERENCES mines(id),
    subsidiary_id              UUID REFERENCES subsidiaries(id),
    score                      NUMERIC(5,2) NOT NULL,
    risk_level                 risk_rating_enum NOT NULL,
    contributing_factors       JSONB DEFAULT '[]',
    category_scores            JSONB DEFAULT '{}',
    trend                      risk_trend_enum,
    previous_score             NUMERIC(5,2),
    model_version              TEXT NOT NULL,
    computed_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    next_scheduled_computation TIMESTAMPTZ
);

CREATE TABLE anomaly_flags (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id                  UUID NOT NULL REFERENCES mines(id),
    subsidiary_id            UUID REFERENCES subsidiaries(id),
    anomaly_type             anomaly_type_enum NOT NULL,
    data_source              TEXT,
    severity                 severity_enum NOT NULL,
    description              TEXT NOT NULL,
    metric_name              TEXT,
    expected_value           NUMERIC,
    actual_value             NUMERIC,
    deviation_pct            NUMERIC,
    confidence               NUMERIC(5,4),
    contributing_data_points JSONB DEFAULT '[]',
    is_acknowledged          BOOLEAN DEFAULT false,
    acknowledged_by          UUID REFERENCES users(id) ON DELETE SET NULL,
    acknowledged_at          TIMESTAMPTZ,
    model_version            TEXT,
    detected_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at               TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX idx_mines_subsidiary        ON mines(subsidiary_id);
CREATE INDEX idx_users_mine              ON users(mine_id);
CREATE INDEX idx_reqs_regulation         ON compliance_requirements(regulation_id);
CREATE INDEX idx_ci_mine_due_status      ON compliance_instances(mine_id, due_date, status);
CREATE INDEX idx_ci_requirement          ON compliance_instances(requirement_id);
CREATE INDEX idx_ce_instance             ON compliance_evidences(instance_id);
CREATE INDEX idx_inspections_mine        ON inspections(mine_id, started_at);
CREATE INDEX idx_observations_inspection ON observations(inspection_id);
CREATE INDEX idx_violations_mine_status  ON violations(mine_id, status);
CREATE INDEX idx_capas_mine_status       ON corrective_actions(mine_id, status, due_date);
CREATE INDEX idx_alerts_user_status      ON alerts(target_user_id, status);
CREATE INDEX idx_env_readings_mine_time  ON environment_readings(mine_id, recorded_at);
CREATE INDEX idx_prod_mine_date          ON production_readings(mine_id, reporting_date);
CREATE INDEX idx_risk_scores_mine        ON mine_risk_scores(mine_id, computed_at DESC);
CREATE INDEX idx_anomalies_mine          ON anomaly_flags(mine_id, detected_at DESC);

-- ============================================================================
-- TRIGGERS (auto updated_at)
-- ============================================================================
CREATE TRIGGER trg_organizations_upd       BEFORE UPDATE ON organizations                  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_subsidiaries_upd        BEFORE UPDATE ON subsidiaries                   FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_mines_upd               BEFORE UPDATE ON mines                          FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_users_upd               BEFORE UPDATE ON users                          FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_regulations_upd         BEFORE UPDATE ON regulations                    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_requirements_upd        BEFORE UPDATE ON compliance_requirements         FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_instances_upd           BEFORE UPDATE ON compliance_instances            FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_inspections_upd         BEFORE UPDATE ON inspections                    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_observations_upd        BEFORE UPDATE ON observations                   FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_violations_upd          BEFORE UPDATE ON violations                     FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_capas_upd               BEFORE UPDATE ON corrective_actions             FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_contractors_upd         BEFORE UPDATE ON contractors                    FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_contractor_docs_upd     BEFORE UPDATE ON contractor_documents           FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_assignments_upd         BEFORE UPDATE ON contractor_assignments         FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_contract_workers_upd    BEFORE UPDATE ON contract_workers               FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_escalations_upd         BEFORE UPDATE ON escalation_workflow_instances  FOR EACH ROW EXECUTE FUNCTION update_modified_column();
CREATE TRIGGER trg_checklist_tpl_upd       BEFORE UPDATE ON inspection_checklist_templates FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE regulations                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements     ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_instances        ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_evidences        ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE observations                ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports            ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_observations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts                      ENABLE ROW LEVEL SECURITY;

-- Master data: read-only to all
CREATE POLICY "regulations_select_all"  ON regulations             FOR SELECT USING (true);
CREATE POLICY "requirements_select_all" ON compliance_requirements  FOR SELECT USING (true);

-- Operational tables: authenticated access (tighten per role in app layer)
CREATE POLICY "ci_authenticated"   ON compliance_instances  FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "ce_authenticated"   ON compliance_evidences  FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "insp_authenticated" ON inspections           FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "obs_authenticated"  ON observations          FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "vio_authenticated"  ON violations            FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "capa_authenticated" ON corrective_actions    FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "ir_authenticated"   ON incident_reports      FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "so_authenticated"   ON safety_observations   FOR ALL USING ((select auth.role()) = 'authenticated');
CREATE POLICY "alerts_own"         ON alerts                FOR SELECT USING (target_user_id = (select auth.uid()));

-- ============================================================================
-- SEED DATA – Regulations (from input.json)
-- ============================================================================
INSERT INTO regulations (code, title, statute, category, description, authority, version) VALUES
('REG-SAF-001',
 'Daily Ventilation and Air/Gas Quality Survey',
 'CMR 2017, Regulation 105',
 'safety',
 'Every underground coal mine must maintain adequate quantity and velocity of air at all working faces, roadways and return airways to dilute flammable and noxious gases and airborne dust. A competent ventilation official must measure and record air quantity, velocity and methane percentage in each working district at least once every shift, and any reading below the approved ventilation standard must be rectified before persons are permitted to work in that area.',
 'dgms', 1),
('REG-SAF-002',
 'Daily Inspection of Roof and Side Support',
 'CMR 2017, Regulation 100',
 'safety',
 'Before any person is permitted to work or travel in an underground working place, the roof and sides must be examined and tested by sounding, and adequately supported with props, roof bolts, steel arches or other approved systematic support in accordance with the support rules sanctioned for that mine.',
 'dgms', 1),
('REG-SAF-003',
 'Daily Testing for Firedamp and Noxious Gases',
 'CMR 2017, Regulation 116',
 'safety',
 'In every mine or part of a mine classified as gassy, a competent gas testing person must test the general body of air and the atmosphere at the face, goaf edges and return airways for methane and other noxious gases before the commencement of each shift and at prescribed intervals during the shift, recording every reading in the statutory Gas Testing Register.',
 'dgms', 1),
('REG-SAF-004',
 'Daily Verification of Explosives Stock and Shot-Firing Records',
 'CMR 2017, Regulation 175 read with Explosives Rules, 2008',
 'safety',
 'Explosives and detonators held in the mine magazine or explosives van must be physically verified against the Magazine Register at the start and end of each shift. All shot-firing must be carried out only by an authorized shotfirer, recorded in the Shot-Firing Register, with unused explosives returned to the magazine and reconciled on the same day.',
 'dgms', 1),
('REG-SAF-005',
 'Daily Pre-Operational Safety Check of HEMM and Trackless Machinery',
 'CMR 2017, Regulation 82 read with DGMS Technical Circular No. 07 of 2021',
 'safety',
 'Every dumper, excavator, dozer, drill and other heavy earth-moving or trackless machinery deployed in the mine must undergo a documented pre-operational safety check each shift, covering braking systems, reverse alarms, lighting, tyres and fire-fighting equipment, before being certified fit for operation by the operator and shift in-charge.',
 'dgms', 1),
('REG-ENV-001',
 'Daily Functional Check of Dust Suppression Systems',
 'CMR 2017, Regulation 222 read with Environment (Protection) Act, 1986',
 'environment',
 'Dust-generating points including crushers, screens, transfer points, drilling locations and haul roads must be fitted with functional water sprinkling, fogging or dry-fog suppression systems, operated at the prescribed frequency to keep respirable dust concentrations within permissible occupational and ambient limits.',
 'moefcc', 1),
('REG-ENV-002',
 'Monthly Ambient Air Quality Monitoring',
 'Environment (Protection) Act, 1986, Schedule VII',
 'environment',
 'The mine must monitor ambient air quality (PM10, PM2.5, SO2 and NOx) at all approved monitoring stations at the prescribed frequency and submit results to the State Pollution Control Board, ensuring concentrations remain within the National Ambient Air Quality Standards.',
 'spcb', 1),
('REG-ENV-003',
 'Monthly Mine Discharge Water Quality Testing',
 'Water (Prevention and Control of Pollution) Act, 1974 read with Environment (Protection) Rules, 1986',
 'environment',
 'Water discharged from mine pit sumps, settling ponds or effluent treatment plants into natural water bodies must be tested monthly for pH, total suspended solids, oil and grease and other notified parameters, and must satisfy the standards prescribed for inland surface water discharge before release.',
 'spcb', 1),
('REG-PRD-001',
 'Monthly Reconciliation of Excavation, Production and Dispatch',
 'CMR 2017, Regulation 190 read with Mineral Conservation and Development Rules, 2017',
 'production',
 'Coal and overburden excavated, raised and dispatched during the month must be reconciled against the daily output registers, weighbridge records and the capacity approved in the Mining Plan and Environmental Clearance, with any deviation reported to IBM, DGMS or the Coal Controller''s Organisation as applicable.',
 'cco', 1),
('REG-LAB-001',
 'Monthly Statutory Wages and Welfare Amenities Compliance Audit',
 'Mines Act, 1952, Sections 20-22 read with the Payment of Wages Act, 1936 and Mines Rules, 1955',
 'labour',
 'Wages must be disbursed to all mine workers within the statutory wage period without unauthorized deductions, and Provident Fund and ESI contributions deposited by the prescribed due date. Statutory welfare amenities such as drinking water, rest shelters, first-aid and creche facilities must be maintained in functional condition at all times.',
 'labour_dept', 1),
('REG-ENV-004',
 'Annual Environmental Statement (Form V) Submission',
 'Environment (Protection) Rules, 1986, Rule 14',
 'environment',
 'Every mine operating under a valid Consent to Operate must prepare and submit an Environmental Statement in Form V to the concerned State Pollution Control Board for the preceding financial year on or before the notified due date, accurately disclosing water and raw material consumption, pollution generated and abatement measures undertaken.',
 'spcb', 1),
('REG-SAF-006',
 'Annual Mine Safety Audit and DGMS Statistical Return',
 'Mines Act, 1952, Section 63 read with Mines Rules, 1955, Rule 29',
 'safety',
 'Every mine must undergo a comprehensive annual safety audit, internal or third-party as mandated by its risk category, covering all major hazard areas, and must file the Annual Return along with consolidated statistics of accidents, dangerous occurrences and safety performance with DGMS within the prescribed timeline.',
 'dgms', 1);

-- ============================================================================
-- SEED DATA – Compliance Requirements (derived from regulations)
-- ============================================================================
INSERT INTO compliance_requirements
    (regulation_id, title, recurrence, grace_period_days, reminder_offsets_days,
     applicable_mine_types, responsible_role)
SELECT
    r.id,
    r.title,
    CASE r.code
        WHEN 'REG-SAF-001' THEN 'daily'
        WHEN 'REG-SAF-002' THEN 'daily'
        WHEN 'REG-SAF-003' THEN 'daily'
        WHEN 'REG-SAF-004' THEN 'daily'
        WHEN 'REG-SAF-005' THEN 'daily'
        WHEN 'REG-ENV-001' THEN 'daily'
        WHEN 'REG-ENV-002' THEN 'monthly'
        WHEN 'REG-ENV-003' THEN 'monthly'
        WHEN 'REG-PRD-001' THEN 'monthly'
        WHEN 'REG-LAB-001' THEN 'monthly'
        WHEN 'REG-ENV-004' THEN 'annual'
        WHEN 'REG-SAF-006' THEN 'annual'
    END::recurrence_enum,
    CASE r.code
        WHEN 'REG-ENV-004' THEN 7
        WHEN 'REG-SAF-006' THEN 7
        ELSE 0
    END,
    CASE r.category
        WHEN 'safety'      THEN ARRAY[7,1]
        WHEN 'environment' THEN ARRAY[30,7,1]
        WHEN 'production'  THEN ARRAY[7,1]
        WHEN 'labour'      THEN ARRAY[7,1]
    END,
    ARRAY['opencast','underground','mixed']::mine_type_enum[],
    CASE r.category
        WHEN 'safety'      THEN 'safety_officer'
        WHEN 'environment' THEN 'environmental_officer'
        WHEN 'production'  THEN 'mine_manager'
        WHEN 'labour'      THEN 'compliance_officer'
    END::responsible_role_enum
FROM regulations r;

-- ============================================================================
-- SEED DATA – Inspection Checklist Templates (from input.json)
-- ============================================================================
INSERT INTO inspection_checklist_templates
    (name, inspection_type, applicable_mine_types, checklist_items, version)
VALUES

('Underground Ventilation and Gas Quality Field Survey',
 'internal_safety_committee',
 ARRAY['underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-SAF-001-01","category":"ventilation","checkpoint_text":"Is the quantity of air reaching the last open face at least 2.5 cubic metres per second, as per the approved ventilation standard?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-001-02","category":"ventilation","checkpoint_text":"Is the methane (CH4) concentration in the general body of air below 0.75%?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-001-03","category":"ventilation","checkpoint_text":"Is the air velocity at the mechanized working face at least 15 metres per minute?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-001-04","category":"ventilation","checkpoint_text":"Are auxiliary fans, ventilation ducting and brattices intact, undamaged and functioning correctly?","response_type":"yes_no_na","is_mandatory":true,"photo_required":true},
   {"item_id":"OBS-SAF-001-05","category":"ventilation","checkpoint_text":"Has the shift ventilation survey reading been recorded in the statutory Ventilation Register?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false}
 ]'::jsonb, 1),

('Roof and Side Support (Strata Control) Inspection Checklist',
 'internal_safety_committee',
 ARRAY['underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-SAF-002-01","category":"roof_support","checkpoint_text":"Have the roof and sides at the working place been sounded and tested by a competent person before work commenced?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-002-02","category":"roof_support","checkpoint_text":"Is systematic support (props, roof bolts or steel arches) installed strictly as per the approved support rules for the district?","response_type":"yes_no_na","is_mandatory":true,"photo_required":true},
   {"item_id":"OBS-SAF-002-03","category":"roof_support","checkpoint_text":"Is the roof bolt density at the face at least 0.8 bolts per square metre, as per the approved support design?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-002-04","category":"roof_support","checkpoint_text":"Are danger boards and barricades placed to restrict entry into areas of unsupported or loose roof?","response_type":"yes_no_na","is_mandatory":true,"photo_required":true}
 ]'::jsonb, 1),

('Firedamp and Noxious Gas Testing Checklist',
 'internal_safety_committee',
 ARRAY['underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-SAF-003-01","category":"ventilation","checkpoint_text":"Has gas testing been carried out at the working face at the start of the shift using an approved methanometer?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-003-02","category":"ventilation","checkpoint_text":"Is the methane percentage recorded at the working face below the statutory danger level of 1.25%?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-003-03","category":"ventilation","checkpoint_text":"Is the methane percentage in the return airway below 1.0%?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-003-04","category":"ventilation","checkpoint_text":"Has the gas testing person recorded all readings, with time and location, in the statutory Gas Testing Register?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-003-05","category":"electrical_safety","checkpoint_text":"Is the methanometer/gas detector currently within its calibration validity period?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false}
 ]'::jsonb, 1),

('Explosives Magazine and Shot-Firing Verification Checklist',
 'internal_safety_committee',
 ARRAY['opencast','underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-SAF-004-01","category":"blasting","checkpoint_text":"Does the physical stock of explosives and detonators in the magazine match the balance shown in the Magazine Register?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-004-02","category":"blasting","checkpoint_text":"Is the explosives van/magazine securely locked with access restricted to the authorized shotfirer only?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-004-03","category":"blasting","checkpoint_text":"Has every shot-firing operation during the shift been recorded in the Shot-Firing Register with the shotfirer signature?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-004-04","category":"blasting","checkpoint_text":"Is the quantity of explosives issued for the shift within the sanctioned daily limit of 50 kg?","response_type":"numeric_range","is_mandatory":true,"photo_required":false}
 ]'::jsonb, 1),

('HEMM Pre-Operational Safety Inspection Checklist',
 'internal_safety_committee',
 ARRAY['opencast','underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-SAF-005-01","category":"haulage","checkpoint_text":"Are the service brakes and parking brake of the machine functioning effectively?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-005-02","category":"haulage","checkpoint_text":"Is the reverse horn and flashing beacon light operational?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-005-03","category":"haulage","checkpoint_text":"Are the tyres and undercarriage free from visible damage, cuts or abnormal wear?","response_type":"yes_no_na","is_mandatory":true,"photo_required":true},
   {"item_id":"OBS-SAF-005-04","category":"fire_protection","checkpoint_text":"Is a charged fire extinguisher mounted onboard and within its inspection validity date?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-005-05","category":"haulage","checkpoint_text":"Has the operator verified a valid HEMM operating competency certificate before starting the shift?","response_type":"yes_no_na","is_mandatory":false,"photo_required":false}
 ]'::jsonb, 1),

('Dust Suppression System Functional Checklist',
 'environmental_pcb',
 ARRAY['opencast','underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-ENV-001-01","category":"general","checkpoint_text":"Are water sprinklers or fog cannons operational at the crusher, screening and transfer points?","response_type":"yes_no_na","is_mandatory":true,"photo_required":true},
   {"item_id":"OBS-ENV-001-02","category":"general","checkpoint_text":"Is the haul road being wet-suppressed at the prescribed frequency to control fugitive dust?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-ENV-001-03","category":"general","checkpoint_text":"Is the respirable dust (RPM) concentration at the drilling point within the permissible exposure limit of 3 mg/m3?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-ENV-001-04","category":"general","checkpoint_text":"Are workers deployed in dusty zones wearing the prescribed anti-dust respirators?","response_type":"yes_no_na","is_mandatory":true,"photo_required":true}
 ]'::jsonb, 1),

('Ambient Air Quality Monitoring Checklist',
 'environmental_pcb',
 ARRAY['opencast','underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-ENV-002-01","category":"general","checkpoint_text":"Is the 24-hour average PM10 concentration at the monitoring station within the permissible limit of 100 micrograms per cubic metre?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-ENV-002-02","category":"general","checkpoint_text":"Is the 24-hour average PM2.5 concentration within the permissible limit of 60 micrograms per cubic metre?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-ENV-002-03","category":"general","checkpoint_text":"Is the SO2 concentration within the permissible limit of 80 micrograms per cubic metre?","response_type":"numeric_range","is_mandatory":false,"photo_required":false},
   {"item_id":"OBS-ENV-002-04","category":"general","checkpoint_text":"Is the NOx concentration within the permissible limit of 80 micrograms per cubic metre?","response_type":"numeric_range","is_mandatory":false,"photo_required":false},
   {"item_id":"OBS-ENV-002-05","category":"general","checkpoint_text":"Has monitoring been conducted at all ambient air quality stations specified in the Environmental Clearance conditions?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false}
 ]'::jsonb, 1),

('Mine Discharge Water Quality Testing Checklist',
 'environmental_pcb',
 ARRAY['opencast','underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-ENV-003-01","category":"general","checkpoint_text":"Is the pH of the discharged mine water within the permissible range of 5.5 to 9.0?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-ENV-003-02","category":"general","checkpoint_text":"Is the Total Suspended Solids (TSS) level in the discharge within the permissible limit of 100 mg/l?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-ENV-003-03","category":"general","checkpoint_text":"Is the Oil and Grease content in the discharge within the permissible limit of 10 mg/l?","response_type":"numeric_range","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-ENV-003-04","category":"general","checkpoint_text":"Is a functional settling pond or effluent treatment plant in place before the final discharge point?","response_type":"yes_no_na","is_mandatory":true,"photo_required":true}
 ]'::jsonb, 1),

('Monthly Production and Dispatch Reconciliation Checklist',
 'internal_safety_committee',
 ARRAY['opencast','underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-PRD-001-01","category":"general","checkpoint_text":"Does the month actual coal production remain within the capacity sanctioned under the approved Mining Plan and Environmental Clearance?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-PRD-001-02","category":"general","checkpoint_text":"Is the Overburden-to-Coal stripping ratio for the month within the Mining Plan-approved range of 4.5:1 to 5.5:1?","response_type":"numeric_range","is_mandatory":false,"photo_required":false},
   {"item_id":"OBS-PRD-001-03","category":"general","checkpoint_text":"Has the daily output register been reconciled against weighbridge and dispatch records for the month?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-PRD-001-04","category":"general","checkpoint_text":"Has the monthly production return been submitted to IBM/DGMS/Coal Controller Organisation within the stipulated timeline?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false}
 ]'::jsonb, 1),

('Wages, PF/ESI and Welfare Amenities Compliance Checklist',
 'internal_safety_committee',
 ARRAY['opencast','underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-LAB-001-01","category":"general","checkpoint_text":"Have wages been paid to all workers within the statutory wage period without unauthorized deductions?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-LAB-001-02","category":"general","checkpoint_text":"Has the Provident Fund contribution for all eligible employees been deposited by the due date?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-LAB-001-03","category":"general","checkpoint_text":"Has the ESI contribution for all eligible employees been deposited by the due date?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-LAB-001-04","category":"general","checkpoint_text":"Are statutory welfare amenities (drinking water, rest shelters, first-aid, creche) available and in functional condition?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-LAB-001-05","category":"general","checkpoint_text":"Is the wage paid to every category of worker equal to or above the notified minimum wage rate?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false}
 ]'::jsonb, 1),

('Annual Environmental Statement (Form V) Compliance Checklist',
 'environmental_pcb',
 ARRAY['opencast','underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-ENV-004-01","category":"general","checkpoint_text":"Has the Environmental Statement in Form V been submitted to the State Pollution Control Board on or before the notified due date?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-ENV-004-02","category":"general","checkpoint_text":"Does the water and raw material consumption data reported in Form V match the actual production and utility records?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-ENV-004-03","category":"general","checkpoint_text":"Have the pollution abatement measures implemented during the year been accurately and completely disclosed?","response_type":"yes_no_na","is_mandatory":false,"photo_required":false},
   {"item_id":"OBS-ENV-004-04","category":"general","checkpoint_text":"Is the hazardous waste generation and disposal quantity reported in Form V consistent with the Hazardous Waste Manifest records?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false}
 ]'::jsonb, 1),

('Annual Safety Audit and Statutory Statistical Return Checklist',
 'dgms_annual_general',
 ARRAY['opencast','underground','mixed']::mine_type_enum[],
 '[
   {"item_id":"OBS-SAF-006-01","category":"general","checkpoint_text":"Has an internal or third-party safety audit been conducted covering all major hazard areas as mandated by DGMS risk-based norms?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-006-02","category":"general","checkpoint_text":"Have all reportable accidents and dangerous occurrences during the year been correctly included in the annual statistical return to DGMS?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-006-03","category":"general","checkpoint_text":"Has the Annual Return under the Mines Rules been filed with DGMS within the prescribed timeline?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-006-04","category":"general","checkpoint_text":"Have the corrective action recommendations from the previous year safety audit been closed out?","response_type":"yes_no_na","is_mandatory":true,"photo_required":false},
   {"item_id":"OBS-SAF-006-05","category":"general","checkpoint_text":"Has the Standard Operating Procedures register been updated to reflect any change in mining method or machinery during the year?","response_type":"yes_no_na","is_mandatory":false,"photo_required":false}
 ]'::jsonb, 1);

-- ============================================================================
-- SEED DATA – RBAC Roles
-- ============================================================================
INSERT INTO roles (name, scope_level, permissions) VALUES
('field_officer',        'mine',         '[{"resource":"inspection","actions":["create","read","update"]},{"resource":"safety_observation","actions":["create","read"]}]'),
('mine_manager',         'mine',         '[{"resource":"compliance_instance","actions":["create","read","update","approve"]},{"resource":"inspection","actions":["create","read","update","approve"]},{"resource":"violation","actions":["read","update"]},{"resource":"dashboard","actions":["read"]}]'),
('safety_officer',       'mine',         '[{"resource":"inspection","actions":["create","read","update"]},{"resource":"violation","actions":["create","read","update"]},{"resource":"compliance_instance","actions":["read","update"]}]'),
('environmental_officer','mine',         '[{"resource":"compliance_instance","actions":["read","update"]},{"resource":"dashboard","actions":["read"]}]'),
('compliance_officer',   'subsidiary',   '[{"resource":"compliance_instance","actions":["create","read","update","approve","escalate"]},{"resource":"report","actions":["read","export"]}]'),
('contractor_manager',   'mine',         '[{"resource":"contractor","actions":["create","read","update"]},{"resource":"contractor_document","actions":["create","read","update"]}]'),
('subsidiary_admin',     'subsidiary',   '[{"resource":"compliance_instance","actions":["create","read","update","approve","escalate","delete"]},{"resource":"contractor","actions":["create","read","update"]},{"resource":"dashboard","actions":["read","export"]}]'),
('corporate_executive',  'organization', '[{"resource":"dashboard","actions":["read","export"]},{"resource":"report","actions":["read","export"]}]'),
('regulator',            'jurisdiction', '[{"resource":"compliance_instance","actions":["read","export"]},{"resource":"violation","actions":["read"]},{"resource":"dashboard","actions":["read"]}]'),
('system_admin',         'organization', '[{"resource":"compliance_instance","actions":["create","read","update","delete","approve","escalate","export"]},{"resource":"contractor","actions":["create","read","update","delete"]},{"resource":"dashboard","actions":["read","export"]}]');

-- ============================================================================
-- SECURITY LINTER FIXES
-- ============================================================================
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text) FROM public, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.st_estimatedextent(text, text, text, boolean) FROM public, anon, authenticated;
