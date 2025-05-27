CREATE TABLE IF NOT EXISTS Logs (
  id SERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES Accounts(id),
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id INTEGER,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
