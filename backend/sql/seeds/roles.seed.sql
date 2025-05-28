TRUNCATE TABLE roles RESTART IDENTITY CASCADE;
INSERT INTO Roles (id, role_name, role_description) VALUES
(1, 'super_admin', 'Toàn quyền quản lý hệ thống, phân quyền và dữ liệu'),
(2, 'data_entry', 'Nhập liệu và cập nhật thông tin quân nhân'),
(3, 'auditor', 'Chỉ được xem dữ liệu để kiểm tra và rà soát'),
(4, 'officer_account_manager', 'Quản lý tài khoản sĩ quan, cấp quyền phù hợp');
