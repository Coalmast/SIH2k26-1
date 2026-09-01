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
