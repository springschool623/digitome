CREATE TABLE IF NOT EXISTS Role_Permission (
  id SERIAL PRIMARY KEY,
  role_id INTEGER NOT NULL REFERENCES Roles(id),
  permission_id INTEGER NOT NULL REFERENCES Permissions(id),
  status permission_status NOT NULL DEFAULT 'active',
  UNIQUE(role_id, permission_id)
);
