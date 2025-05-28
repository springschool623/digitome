-- Cập nhật sequence cho bảng ranks
SELECT setval('ranks_id_seq', (SELECT COALESCE(MAX(id), 1) FROM ranks));

-- Cập nhật sequence cho bảng positions
SELECT setval('positions_id_seq', (SELECT COALESCE(MAX(id), 1) FROM positions));

-- Cập nhật sequence cho bảng departments
SELECT setval('departments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM departments));

-- Cập nhật sequence cho bảng locations
SELECT setval('locations_id_seq', (SELECT COALESCE(MAX(id), 1) FROM locations));

-- Thêm nếu cần:
SELECT setval('contacts_id_seq', (SELECT COALESCE(MAX(id), 1) FROM contacts));
