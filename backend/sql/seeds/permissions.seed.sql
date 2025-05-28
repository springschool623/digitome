TRUNCATE TABLE permissions RESTART IDENTITY CASCADE;
INSERT INTO Permissions (id, permission_code, permission_name, permission_category)
VALUES
(1, 'VIEW_CONTACTS', 'Xem thông tin liên lạc', 'Dữ liệu'),
(2, 'EDIT_CONTACTS', 'Chỉnh sửa thông tin liên lạc', 'Dữ liệu'),
(3, 'DELETE_CONTACTS', 'Xóa thông tin liên lạc', 'Dữ liệu'),
(4, 'MANAGE_ACCOUNTS', 'Quản lý tài khoản người dùng', 'Hệ thống'),
(5, 'VIEW_LOGS', 'Xem lịch sử thao tác', 'Kiểm tra'),
(6, 'ASSIGN_ROLES', 'Phân quyền tài khoản', 'Hệ thống');
