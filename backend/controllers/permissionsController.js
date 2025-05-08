import { pool } from '../db.js'

export const getAllPermissions = async (req, res) => {
    const result = await pool.query(
      'SELECT * FROM permissions ORDER BY id ASC'
    )
    res.json(result.rows)
  }