CREATE TABLE IF NOT EXISTS Ranks (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
