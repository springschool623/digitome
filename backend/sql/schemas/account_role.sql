CREATE TABLE IF NOT EXISTS Account_Role (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES Accounts(id),
  role_id INTEGER NOT NULL REFERENCES Roles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES Accounts(id)
);