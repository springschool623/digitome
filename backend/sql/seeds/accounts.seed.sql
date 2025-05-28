TRUNCATE TABLE accounts RESTART IDENTITY CASCADE;

INSERT INTO Accounts (id, mobile_no, password, created_by, status, role_id)
VALUES
(1, '0901000010', 'admin12345', NULL, 'active', 1);

INSERT INTO Accounts (id, mobile_no, password, created_by, status, role_id)
VALUES
(2, '0901000001', 'matkhau123', 1, 'active', 2),
(3, '0901000002', 'matkhau123', 1, 'active', 2),
(4, '0901000005', 'matkhau123', 1, 'active', 3),
(5, '0901000008', 'matkhau123', 1, 'active', 4);
