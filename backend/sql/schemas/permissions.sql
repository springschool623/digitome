CREATE TABLE IF NOT EXISTS Permissions (
  id SERIAL PRIMARY KEY,
  permission_code VARCHAR(100) NOT NULL UNIQUE,
  permission_name TEXT NOT NULL,
  permission_category TEXT
);
