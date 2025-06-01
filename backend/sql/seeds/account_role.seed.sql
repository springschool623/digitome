TRUNCATE TABLE account_role RESTART IDENTITY CASCADE;

INSERT INTO account_role (account_id, role_id)
VALUES
(1, 1),
(2, 2),
(3, 2),
(4, 3),
(5, 4);

