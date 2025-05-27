CREATE TABLE IF NOT EXISTS Contacts (
  id SERIAL PRIMARY KEY,
  rank_id INTEGER REFERENCES Ranks(id),
  position_id INTEGER REFERENCES Positions(id),
  manager TEXT,
  department_id INTEGER REFERENCES Departments(id),
  location_id INTEGER REFERENCES Locations(id),
  address TEXT,
  military_postal_code VARCHAR(20),
  mobile_no VARCHAR(15) NOT NULL UNIQUE
);
