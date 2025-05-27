CREATE TABLE IF NOT EXISTS ArchivedContacts (
  id SERIAL PRIMARY KEY,
  original_contact_id INTEGER NOT NULL,
  data JSONB NOT NULL,
  deleted_at TIMESTAMP DEFAULT NOW(),
  deleted_by INTEGER,
  reason TEXT,
  FOREIGN KEY (deleted_by) REFERENCES Accounts(id)
);
