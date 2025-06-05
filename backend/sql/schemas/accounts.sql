CREATE TABLE IF NOT EXISTS Accounts (
  id SERIAL PRIMARY KEY,
  mobile_no VARCHAR(15) NOT NULL UNIQUE REFERENCES Contacts(mobile_no) ON DELETE CASCADE,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES Accounts(id),
  status account_status NOT NULL DEFAULT 'active',
  role_id INTEGER REFERENCES Roles(id)
);
