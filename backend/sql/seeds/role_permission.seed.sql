TRUNCATE TABLE role_permission RESTART IDENTITY CASCADE;
-- super_admin
INSERT INTO Role_Permission (status, role_id, permission_id) VALUES
('active', 1, 1), ('active', 1, 2), ('active', 1, 3),
('active', 1, 4), ('active', 1, 5), ('active', 1, 6),

-- data_entry
('active', 2, 1), ('active', 2, 2),

-- auditor
('active', 3, 1), ('active', 3, 5),

-- officer_account_manager
('active', 4, 1), ('active', 4, 4), ('active', 4, 6);
