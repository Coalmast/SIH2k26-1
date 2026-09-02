-- Add authority submission tracking to compliance_instances
ALTER TABLE compliance_instances
  ADD COLUMN IF NOT EXISTS submitted_to_authority_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS submission_reference_number   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS submitted_to_authority_by     UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS notes                         TEXT;

-- Extend the instance_status enum
ALTER TYPE instance_status ADD VALUE IF NOT EXISTS 'authority_submitted';
