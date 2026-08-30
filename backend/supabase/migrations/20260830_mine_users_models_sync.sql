-- Seed Data Migration to populate mines, subsidiaries, and users

-- 1. Create Organization (CIL)
INSERT INTO organizations (id, name, type)
VALUES ('00000000-0000-0000-0000-000000000001', 'Coal India Limited', 'psu')
ON CONFLICT DO NOTHING;

-- 2. Create Subsidiaries
INSERT INTO subsidiaries (id, organization_id, name, code, state)
VALUES 
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Western Coalfields Limited', 'WCL', 'Maharashtra'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'South Eastern Coalfields Limited', 'SECL', 'Chhattisgarh')
ON CONFLICT DO NOTHING;

-- 3. Create Mines
INSERT INTO mines (id, subsidiary_id, name, mine_type, status, district, state)
VALUES 
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Umrer OCP', 'opencast', 'active', 'Nagpur', 'Maharashtra'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'Sillewara UG', 'underground', 'active', 'Nagpur', 'Maharashtra'),
('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'Gevra OCP', 'opencast', 'active', 'Korba', 'Chhattisgarh')
ON CONFLICT DO NOTHING;

-- 4. Create Roles
INSERT INTO roles (id, name, scope_level, permissions)
VALUES 
('00000000-0000-0000-0000-000000000007', 'system_admin', 'organization', '["*"]'),
('00000000-0000-0000-0000-000000000008', 'subsidiary_admin', 'subsidiary', '["read:mine", "write:mine", "read:user"]'),
('00000000-0000-0000-0000-000000000009', 'mine_manager', 'mine', '["read:mine", "write:compliance", "read:compliance"]')
ON CONFLICT (name) DO NOTHING;

-- 5. Create Users
INSERT INTO users (id, keycloak_subject, full_name, email, subsidiary_id, mine_id)
VALUES 
('00000000-0000-0000-0000-000000000010', 'admin-sub-1', 'System Admin', 'admin@coalindia.in', NULL, NULL),
('00000000-0000-0000-0000-000000000011', 'sub-admin-1', 'WCL Admin', 'admin@wcl.in', '00000000-0000-0000-0000-000000000002', NULL),
('00000000-0000-0000-0000-000000000012', 'mgr-umrer-1', 'Rajesh Kumar', 'rajesh.k@wcl.in', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004')
ON CONFLICT (id) DO NOTHING;

-- 6. Assign Roles
INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000010', id FROM roles WHERE name = 'system_admin'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000011', id FROM roles WHERE name = 'subsidiary_admin'
ON CONFLICT DO NOTHING;

INSERT INTO user_roles (user_id, role_id)
SELECT '00000000-0000-0000-0000-000000000012', id FROM roles WHERE name = 'mine_manager'
ON CONFLICT DO NOTHING;
