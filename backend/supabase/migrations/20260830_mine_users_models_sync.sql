-- =============================================================================
-- Seed Data — Organizations, Subsidiaries, Mines, Roles, Users
-- =============================================================================
-- UUID convention (all fixed/seed UUIDs):
--   Last segment encodes row number.  Format: 00000000-0000-0000-0000-<12-digit-seq>
--   e.g. -000000000001 = row 1 (CIL org)
--        -000000000002 = row 2 (WCL subsidiary) … etc.
-- =============================================================================

-- 1. Organization — Coal India Limited
INSERT INTO organizations (id, name, type)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Coal India Limited', 'psu')
ON CONFLICT DO NOTHING;

-- 2. Subsidiaries
INSERT INTO subsidiaries (id, organization_id, name, code, state)
VALUES
  -- WCL
  ('00000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000001',
   'Western Coalfields Limited', 'WCL', 'Maharashtra'),
  -- SECL
  ('00000000-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000001',
   'South Eastern Coalfields Limited', 'SECL', 'Chhattisgarh')
ON CONFLICT DO NOTHING;

-- 3. Mines
INSERT INTO mines (id, subsidiary_id, name, mine_type, status, district, state)
VALUES
  -- Umrer OCP (WCL)
  ('00000000-0000-0000-0000-000000000004',
   '00000000-0000-0000-0000-000000000002',
   'Umrer OCP', 'opencast', 'active', 'Nagpur', 'Maharashtra'),
  -- Sillewara UG (WCL)
  ('00000000-0000-0000-0000-000000000005',
   '00000000-0000-0000-0000-000000000002',
   'Sillewara UG', 'underground', 'active', 'Nagpur', 'Maharashtra'),
  -- Gevra OCP (SECL)
  ('00000000-0000-0000-0000-000000000006',
   '00000000-0000-0000-0000-000000000003',
   'Gevra OCP', 'opencast', 'active', 'Korba', 'Chhattisgarh')
ON CONFLICT DO NOTHING;

-- 4. Seed Users (linked to Supabase Auth via auth_provider_uid)
INSERT INTO users (id, auth_provider_uid, full_name, email, subsidiary_id, mine_id)
VALUES
  -- System Admin (org-wide)
  ('00000000-0000-0000-0000-000000000010',
   'auth-admin-001', 'System Admin', 'admin@coalindia.in', NULL, NULL),
  -- WCL Subsidiary Admin
  ('00000000-0000-0000-0000-000000000011',
   'auth-wcl-admin-001', 'WCL Admin', 'admin@wcl.in',
   '00000000-0000-0000-0000-000000000002', NULL),
  -- Mine Manager — Umrer OCP
  ('00000000-0000-0000-0000-000000000012',
   'auth-mgr-umrer-001', 'Rajesh Kumar', 'rajesh.k@wcl.in',
   '00000000-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;

-- 5. Assign Roles
INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000010', id FROM roles WHERE name = 'system_admin'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000011', id FROM roles WHERE name = 'subsidiary_admin'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000012', id FROM roles WHERE name = 'mine_manager'
ON CONFLICT DO NOTHING;
