import { pool } from '../db.js'

export const getAllPositions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
             COUNT(c.id) as contact_count
      FROM positions p
      LEFT JOIN contacts c ON p.id = c.position_id
      GROUP BY p.id
      ORDER BY p.id ASC
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch positions' })
  }
}

export const getPosition = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `
      SELECT p.*, 
             COUNT(c.id) as contact_count
      FROM positions p
      LEFT JOIN contacts c ON p.id = c.position_id
      WHERE p.id = $1
      GROUP BY p.id
    `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Position not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch position' })
  }
}

export const createPosition = async (req, res) => {
  const { name } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO positions (name) VALUES ($1) RETURNING *',
      [name]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Position name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create position' })
    }
  }
}

export const updatePosition = async (req, res) => {
  const { id } = req.params
  const { name } = req.body

  try {
    const result = await pool.query(
      'UPDATE positions SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Position not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Position name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to update position' })
    }
  }
}

export const deletePosition = async (req, res) => {
  const { id } = req.params

  try {
    // Check if position is being used by any contacts
    const usageCheck = await pool.query(
      'SELECT COUNT(*) FROM contacts WHERE position_id = $1',
      [id]
    )

    if (usageCheck.rows[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete position that is being used by contacts',
      })
    }

    const result = await pool.query(
      'DELETE FROM positions WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Position not found' })
    }

    res.json({ message: 'Position deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete position' })
  }
}
