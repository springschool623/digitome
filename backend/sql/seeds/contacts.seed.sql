TRUNCATE TABLE contacts RESTART IDENTITY CASCADE;

INSERT INTO Contacts (
  rank_id, position_id, name, department_id, location_id,
  address, military_phone_no, civilian_phone_no, mobile_no
) VALUES
(3, 1, 'Nguyễn Văn A', 1, 1, 'TP. Hồ Chí Minh', '999999-B', '37123445', '0901000001'),
(4, 2, 'Trần Văn B', 2, 2, 'TP. Hồ Chí Minh', '999999-A', '37123446', '0901000002'),
(5, 3, 'Lê Văn C', 3, 3, 'TP. Hồ Chí Minh', '', '', '0901000003'),
(5, 4, 'Phạm Văn D', 4, 4, 'TP. Hồ Chí Minh', '', '', '0901000004'),
(6, 5, 'Nguyễn Thị E', 5, 5, 'TP. Hồ Chí Minh', '', '', '0901000005'),
(7, 6, 'Đặng Văn F', 6, 6, 'TP. Hồ Chí Minh', '', '', '0901000006'),
(8, 7, 'Hoàng Văn G', 7, 7, 'TP. Hồ Chí Minh', '875533', '37123451', '0901000007'),
(9, 8, 'Lưu Thị H', 8, 8, 'TP. Hồ Chí Minh', '999111-A', '37123452', '0901000008'),
(10, 9, 'Phạm Quang I', 9, 9, 'TP. Hồ Chí Minh', '999111', '37123453', '0901000009'),
(11, 10, 'Nguyễn Văn J', 10, 10, 'TP. Hồ Chí Minh', '999131-B', '37123454', '0901000010');
