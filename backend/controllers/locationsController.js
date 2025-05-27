import { pool } from '../db.js'

export const getAllLocations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, 
             COUNT(c.id) as contact_count
      FROM locations l
      LEFT JOIN contacts c ON l.id = c.location_id
      GROUP BY l.id
      ORDER BY l.id ASC
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations' })
  }
}

export const getLocation = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `
      SELECT l.*, 
             COUNT(c.id) as contact_count
      FROM locations l
      LEFT JOIN contacts c ON l.id = c.location_id
      WHERE l.id = $1
      GROUP BY l.id
    `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch location' })
  }
}

export const createLocation = async (req, res) => {
  const { name } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO locations (name) VALUES ($1) RETURNING *',
      [name]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Location name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create location' })
    }
  }
}

export const updateLocation = async (req, res) => {
  const { id } = req.params
  const { name } = req.body

  try {
    const result = await pool.query(
      'UPDATE locations SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Location name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to update location' })
    }
  }
}

export const deleteLocation = async (req, res) => {
  const { id } = req.params

  try {
    // Check if location is being used by any contacts
    const usageCheck = await pool.query(
      'SELECT COUNT(*) FROM contacts WHERE location_id = $1',
      [id]
    )

    if (usageCheck.rows[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete location that is being used by contacts',
      })
    }

    const result = await pool.query(
      'DELETE FROM locations WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Location not found' })
    }

    res.json({ message: 'Location deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete location' })
  }
}
