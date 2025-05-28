TRUNCATE TABLE departments RESTART IDENTITY CASCADE;

INSERT INTO Departments (id, name) VALUES
(1, 'Ban Tác Huấn'), (2, 'Ban Hậu Cần'), (3, 'Phòng Kỹ Thuật'), (4, 'Phòng Tài Chính'),
(5, 'Ban Chính Trị'), (6, 'Phòng Hành Chính'), (7, 'Ban Truyền Thông'), (8, 'Phòng Công Tác Đảng'),
(9, 'Ban Tình báo'), (10, 'Phòng CNTT');
