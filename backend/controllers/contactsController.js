import { pool } from '../db.js'

export const getAllContacts = async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM military_contacts ORDER BY id ASC'
  )
  res.json(result.rows)
}

export const createContact = async (req, res) => {
  const {
    rank,
    position,
    manager,
    department,
    location,
    militarypostalcode,
    mobile,
  } = req.body
  const result = await pool.query(
    'INSERT INTO military_contacts (rank, position, manager, department, location, militarypostalcode, mobile) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [rank, position, manager, department, location, militarypostalcode, mobile]
  )
  res.status(201).json(result.rows[0])
}

export const updateContact = async (req, res) => {
  const { id } = req.params
  const {
    rank,
    position,
    manager,
    department,
    location,
    militarypostalcode,
    mobile,
  } = req.body

  const result = await pool.query(
    `UPDATE military_contacts 
     SET rank = $1, 
         position = $2, 
         manager = $3, 
         department = $4, 
         location = $5, 
         militarypostalcode = $6, 
         mobile = $7
     WHERE id = $8 
     RETURNING *`,
    [
      rank,
      position,
      manager,
      department,
      location,
      militarypostalcode,
      mobile,
      id,
    ]
  )

  res.json(result.rows[0])
}

export const deleteContact = async (req, res) => {
  const { id } = req.params
  await pool.query('DELETE FROM contacts WHERE id=$1', [id])
  res.json({ message: 'Deleted' })
}
