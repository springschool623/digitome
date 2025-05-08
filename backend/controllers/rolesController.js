import { pool } from '../db.js'

export const getAllRoles = async (req, res) => {
    const result = await pool.query(
      'SELECT * FROM roles ORDER BY id ASC'
    )
    res.json(result.rows)
  }

export const createRole = async (req, res) => {
    const { name, description } = req.body
    const result = await pool.query(
      'INSERT INTO roles (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    )
    res.status(201).json(result.rows[0])
  }

export const updateRole = async (req, res) => {
    const { id } = req.params
    const { name, description } = req.body
    const result = await pool.query(
      'UPDATE roles SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, id]
    )
    res.json(result.rows[0])
  }

export const deleteRole = async (req, res) => {
    const { id } = req.params
    await pool.query('DELETE FROM roles WHERE id = $1', [id])
    res.status(204).json({ message: 'Role deleted successfully' })
  } 
