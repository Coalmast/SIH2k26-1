-- =============================================================================
-- Phase 2 Schema Additions
-- =============================================================================

-- Root-cause analysis field on corrective actions
ALTER TABLE corrective_actions
  ADD COLUMN IF NOT EXISTS root_cause TEXT;

-- Gemini AI classification status fields on observations
--   ai_auto_applied: true  → Gemini classified and auto-applied (confidence ≥ threshold)
--   ai_status:       'pending' | 'auto_applied' | 'overridden'
ALTER TABLE observations
  ADD COLUMN IF NOT EXISTS ai_auto_applied BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS ai_status       VARCHAR(20);
