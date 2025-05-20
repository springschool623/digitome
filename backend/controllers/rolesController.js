import { pool } from '../db.js'

export const getAllRoles = async (req, res) => {
    const result = await pool.query(
      'SELECT * FROM roles ORDER BY id ASC'
    )
    res.json(result.rows)
  }

export const createRole = async (req, res) => {
    const { role_name, role_description } = req.body
    const result = await pool.query(
      'INSERT INTO roles (role_name, role_description) VALUES ($1, $2) RETURNING *',
      [role_name, role_description]
    )
    res.status(201).json(result.rows[0])
  }

export const updateRole = async (req, res) => {
    const { id } = req.params
    const { role_name, role_description } = req.body
    const result = await pool.query(
      'UPDATE roles SET role_name = $1, role_description = $2 WHERE id = $3 RETURNING *',
      [role_name, role_description, id]
    )
    res.json(result.rows[0])
  }

export const deleteRole = async (req, res) => {
    const { id } = req.params
    await pool.query('DELETE FROM roles WHERE id = $1', [id])
    res.status(204).json({ message: 'Role deleted successfully' })
  } 
