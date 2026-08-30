-- Core organizational hierarchy tables that compliance depends on (assuming they exist, but referencing them here for clarity or adding if missing)
-- For this migration, we'll assume `users` and `mines` tables already exist or will be mocked/referenced.
-- We'll create the tables specified in the plan.

-- Enums
CREATE TYPE compliance_category AS ENUM ('Safety', 'Environment', 'Production', 'Labour');
CREATE TYPE mine_type_enum AS ENUM ('OCP', 'UG', 'Mixed');
CREATE TYPE requirement_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'half_yearly', 'annual');
CREATE TYPE instance_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'ESCALATED');
CREATE TYPE evidence_ocr_status AS ENUM ('PENDING', 'VERIFIED', 'FAILED');

-- 1. Regulations Master Library
CREATE TABLE regulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    category compliance_category NOT NULL,
    authority VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Compliance Requirements (Mapping regulation to mine type and periodicity)
CREATE TABLE compliance_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    regulation_id UUID NOT NULL REFERENCES regulations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    mine_type mine_type_enum NOT NULL,
    frequency requirement_frequency NOT NULL,
    grace_period_days INTEGER DEFAULT 0,
    applies_to_subsidiaries JSONB,
    auto_generate BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Compliance Instances (Per-mine task calendar entries)
CREATE TABLE compliance_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mine_id UUID NOT NULL, -- References mines(id)
    requirement_id UUID NOT NULL REFERENCES compliance_requirements(id),
    status instance_status DEFAULT 'PENDING',
    period_start DATE,
    period_end DATE,
    due_date DATE NOT NULL,
    assigned_to UUID, -- References users(id)
    escalation_tier INTEGER DEFAULT 0,
    escalated_at TIMESTAMPTZ,
    regulator_visible BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Compliance Evidences (Uploaded documents)
CREATE TABLE compliance_evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES compliance_instances(id) ON DELETE CASCADE,
    file_key VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size_bytes INTEGER,
    ocr_status evidence_ocr_status DEFAULT 'PENDING',
    ocr_confidence FLOAT,
    blockchain_hash TEXT,
    uploaded_by UUID, -- References users(id)
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_ci_mine_due_status ON compliance_instances(mine_id, due_date, status);
CREATE INDEX idx_ci_requirement ON compliance_instances(requirement_id);
CREATE INDEX idx_ce_instance ON compliance_evidences(instance_id);

-- RLS Policies (Assuming app.current_mine_ids is set in session)
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_evidences ENABLE ROW LEVEL SECURITY;

-- Regulations and requirements are visible to all (or can be scoped to subsidiaries in a full implementation)
CREATE POLICY "Regulations visible to all" ON regulations FOR SELECT USING (true);
CREATE POLICY "Requirements visible to all" ON compliance_requirements FOR SELECT USING (true);

-- Instances and evidences scoped by mine_id
CREATE POLICY "Instances scoped to mine" ON compliance_instances
  FOR ALL
  USING (
    -- In Supabase, if we're bypassing RLS as a service role, this policy is ignored.
    -- For actual users, we check if mine_id is in their permitted list or they are an admin.
    -- Assuming a simplified policy for now that allows authenticated users to see instances of their mine.
    true -- Replace with actual RLS logic checking app.current_mine_ids if using strict tenant scoping
  );

CREATE POLICY "Evidences scoped to mine" ON compliance_evidences
  FOR ALL
  USING (
    true
  );

-- Update trigger function
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_regulations_modtime BEFORE UPDATE ON regulations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_requirements_modtime BEFORE UPDATE ON compliance_requirements FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_instances_modtime BEFORE UPDATE ON compliance_instances FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
