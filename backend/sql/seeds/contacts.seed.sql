TRUNCATE TABLE contacts RESTART IDENTITY CASCADE;

INSERT INTO Contacts (
  rank_id, position_id, manager, department_id, location_id,
  address, military_postal_code, mobile_no
) VALUES
(1, 1, 'Nguyễn Văn A', 1, 1, 'TP. Hồ Chí Minh', 'QS001', '0901000001'),
(2, 2, 'Trần Văn B', 2, 2, 'TP. Biên Hòa', 'QS002', '0901000002'),
(3, 3, 'Lê Văn C', 3, 3, 'TP. Cần Thơ', 'QS003', '0901000003'),
(4, 4, 'Phạm Văn D', 4, 4, 'TP. Vĩnh Long', 'QS004', '0901000004'),
(5, 5, 'Nguyễn Thị E', 5, 5, 'TP. Hà Nội', 'QS005', '0901000005'),
(6, 6, 'Đặng Văn F', 6, 6, 'TP. Lạng Sơn', 'QS006', '0901000006'),
(7, 7, 'Hoàng Văn G', 7, 7, 'TP. Hải Phòng', 'QS007', '0901000007'),
(8, 8, 'Lưu Thị H', 8, 8, 'TP. Đà Nẵng', 'QS008', '0901000008'),
(9, 9, 'Phạm Quang I', 9, 9, 'TP. Nha Trang', 'QS009', '0901000009'),
(10, 10, 'Nguyễn Văn J', 10, 10, 'TP. Huế', 'QS010', '0901000010');
