CREATE TABLE IF NOT EXISTS Contacts (
  id SERIAL PRIMARY KEY,
  rank_id INTEGER REFERENCES Ranks(id),
  position_id INTEGER REFERENCES Positions(id),
  name TEXT,
  department_id INTEGER REFERENCES Departments(id),
  location_id INTEGER REFERENCES Locations(id),
  address TEXT,
  civilian_phone_no VARCHAR(15) NULL,
  military_phone_no VARCHAR(15) NULL,
  mobile_no VARCHAR(15) NOT NULL UNIQUE
);
