import { pool } from '../db.js'

export const getAllRanks = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, 
             COUNT(c.id) as contact_count
      FROM ranks r
      LEFT JOIN contacts c ON r.id = c.rank_id
      GROUP BY r.id
      ORDER BY r.id ASC
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ranks' })
  }
}

export const getRank = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `
      SELECT r.*, 
             COUNT(c.id) as contact_count
      FROM ranks r
      LEFT JOIN contacts c ON r.id = c.rank_id
      WHERE r.id = $1
      GROUP BY r.id
    `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rank not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rank' })
  }
}

export const createRank = async (req, res) => {
  const { name } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO ranks (name) VALUES ($1) RETURNING *',
      [name]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Rank name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create rank' })
    }
  }
}

export const updateRank = async (req, res) => {
  const { id } = req.params
  const { name } = req.body

  try {
    const result = await pool.query(
      'UPDATE ranks SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rank not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Rank name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to update rank' })
    }
  }
}

export const deleteRank = async (req, res) => {
  const { id } = req.params

  try {
    // Check if rank is being used by any contacts
    const usageCheck = await pool.query(
      'SELECT COUNT(*) FROM contacts WHERE rank_id = $1',
      [id]
    )

    if (usageCheck.rows[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete rank that is being used by contacts',
      })
    }

    const result = await pool.query(
      'DELETE FROM ranks WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rank not found' })
    }

    res.json({ message: 'Rank deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete rank' })
  }
}
