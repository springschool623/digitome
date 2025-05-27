import { pool } from '../db.js'

export const getAllContacts = async (req, res) => {
  const result = await pool.query(`
    SELECT c.*, 
           r.name as rank_name,
           p.name as position_name,
           d.name as department_name,
           l.name as location_name
    FROM contacts c
    LEFT JOIN ranks r ON c.rank_id = r.id
    LEFT JOIN positions p ON c.position_id = p.id
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN locations l ON c.location_id = l.id
    ORDER BY c.id ASC
  `)
  res.json(result.rows)
}

export const getContact = async (req, res) => {
  const { id } = req.params
  const result = await pool.query(
    `
    SELECT c.*, 
           r.name as rank_name,
           p.name as position_name,
           d.name as department_name,
           l.name as location_name
    FROM contacts c
    LEFT JOIN ranks r ON c.rank_id = r.id
    LEFT JOIN positions p ON c.position_id = p.id
    LEFT JOIN departments d ON c.department_id = d.id
    LEFT JOIN locations l ON c.location_id = l.id
    WHERE c.id = $1
  `,
    [id]
  )

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Contact not found' })
  }

  res.json(result.rows[0])
}

export const createContact = async (req, res) => {
  const {
    rank_id,
    position_id,
    manager,
    department_id,
    location_id,
    address,
    military_postal_code,
    mobile_no,
  } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO contacts (
        rank_id, position_id, manager, department_id, location_id, 
        address, military_postal_code, mobile_no
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`,
      [
        rank_id,
        position_id,
        manager,
        department_id,
        location_id,
        address,
        military_postal_code,
        mobile_no,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23503') {
      // foreign key violation
      res.status(400).json({
        message:
          'Invalid reference data (rank, position, department or location)',
      })
    } else {
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export const updateContact = async (req, res) => {
  const { id } = req.params
  const {
    rank_id,
    position_id,
    manager,
    department_id,
    location_id,
    address,
    military_postal_code,
    mobile_no,
  } = req.body

  try {
    const result = await pool.query(
      `UPDATE contacts 
       SET rank_id = $1, 
           position_id = $2, 
           manager = $3, 
           department_id = $4, 
           location_id = $5, 
           address = $6,
           military_postal_code = $7, 
           mobile_no = $8
       WHERE id = $9 
       RETURNING *`,
      [
        rank_id,
        position_id,
        manager,
        department_id,
        location_id,
        address,
        military_postal_code,
        mobile_no,
        id,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contact not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23503') {
      // foreign key violation
      res.status(400).json({
        message:
          'Invalid reference data (rank, position, department or location)',
      })
    } else {
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}

export const deleteContact = async (req, res) => {
  const { id } = req.params
  const { reason } = req.body
  const actorId = req.user?.id // Assuming you have user info in request from auth middleware

  try {
    console.log('Actor Id:', actorId)

    // Start a transaction
    await pool.query('BEGIN')

    // 1. Get the contact data before deletion
    const contactResult = await pool.query(
      `
      SELECT c.*, 
             r.name as rank_name,
             p.name as position_name,
             d.name as department_name,
             l.name as location_name
      FROM contacts c
      LEFT JOIN ranks r ON c.rank_id = r.id
      LEFT JOIN positions p ON c.position_id = p.id
      LEFT JOIN departments d ON c.department_id = d.id
      LEFT JOIN locations l ON c.location_id = l.id
      WHERE c.id = $1
    `,
      [id]
    )

    if (contactResult.rows.length === 0) {
      await pool.query('ROLLBACK')
      return res.status(404).json({ message: 'Contact not found' })
    }

    const contactData = contactResult.rows[0]

    // 2. Insert into ArchivedContacts
    await pool.query(
      `INSERT INTO ArchivedContacts 
       (original_contact_id, data, deleted_by, reason) 
       VALUES ($1, $2, $3, $4)`,
      [id, contactData, actorId, reason]
    )

    // 3. Delete from Contacts
    await pool.query('DELETE FROM contacts WHERE id = $1', [id])

    // 4. Log the deletion
    await pool.query(
      `INSERT INTO Logs 
       (actor_id, action, target_table, target_id, data) 
       VALUES ($1, $2, $3, $4, $5)`,
      [actorId, 'DELETE_CONTACT', 'contacts', id, contactData]
    )

    // Commit the transaction
    await pool.query('COMMIT')

    res.json({ message: 'Xóa liên hệ thành công' })
  } catch (error) {
    // Rollback in case of error
    await pool.query('ROLLBACK')
    console.error('Error deleting contact:', error)
    res
      .status(500)
      .json({ message: 'Internal server error', error: error.message })
  }
}
