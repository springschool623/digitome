import { pool } from '../db.js'

export const getAllDepartments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, 
             COUNT(c.id) as contact_count
      FROM departments d
      LEFT JOIN contacts c ON d.id = c.department_id
      GROUP BY d.id
      ORDER BY d.id ASC
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch departments' })
  }
}

export const getDepartment = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `
      SELECT d.*, 
             COUNT(c.id) as contact_count
      FROM departments d
      LEFT JOIN contacts c ON d.id = c.department_id
      WHERE d.id = $1
      GROUP BY d.id
    `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch department' })
  }
}

export const createDepartment = async (req, res) => {
  const { name } = req.body

  try {
    const result = await pool.query(
      'INSERT INTO departments (name) VALUES ($1) RETURNING *',
      [name]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Department name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create department' })
    }
  }
}

export const updateDepartment = async (req, res) => {
  const { id } = req.params
  const { name } = req.body

  try {
    const result = await pool.query(
      'UPDATE departments SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Department name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to update department' })
    }
  }
}

export const deleteDepartment = async (req, res) => {
  const { id } = req.params

  try {
    // Check if department is being used by any contacts
    const usageCheck = await pool.query(
      'SELECT COUNT(*) FROM contacts WHERE department_id = $1',
      [id]
    )

    if (usageCheck.rows[0].count > 0) {
      return res.status(400).json({
        error: 'Cannot delete department that is being used by contacts',
      })
    }

    const result = await pool.query(
      'DELETE FROM departments WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Department not found' })
    }

    res.json({ message: 'Department deleted successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete department' })
  }
}
