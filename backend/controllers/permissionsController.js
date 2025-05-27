import { pool } from '../db.js'

export const getAllPermissions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', r.id,
                   'role_name', r.role_name
                 )
               ) FILTER (WHERE r.id IS NOT NULL),
               '[]'
             ) as roles
      FROM permissions p
      LEFT JOIN role_permission rp ON p.id = rp.permission_id
      LEFT JOIN roles r ON rp.role_id = r.id
      GROUP BY p.id
      ORDER BY p.id ASC
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permissions' })
  }
}

export const getPermission = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `
      SELECT p.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', r.id,
                   'role_name', r.role_name
                 )
               ) FILTER (WHERE r.id IS NOT NULL),
               '[]'
             ) as roles
      FROM permissions p
      LEFT JOIN role_permission rp ON p.id = rp.permission_id
      LEFT JOIN roles r ON rp.role_id = r.id
      WHERE p.id = $1
      GROUP BY p.id
    `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Permission not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permission' })
  }
}

export const createPermission = async (req, res) => {
  const { permission_code, permission_name, permission_category } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO permissions (permission_code, permission_name, permission_category)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [permission_code, permission_name, permission_category]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Permission code already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create permission' })
    }
  }
}

export const updatePermission = async (req, res) => {
  const { id } = req.params
  const { permission_code, permission_name, permission_category } = req.body

  try {
    const result = await pool.query(
      `UPDATE permissions 
       SET permission_code = $1, 
           permission_name = $2, 
           permission_category = $3
       WHERE id = $4 
       RETURNING *`,
      [permission_code, permission_name, permission_category, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Permission not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Permission code already exists' })
    } else {
      res.status(500).json({ error: 'Failed to update permission' })
    }
  }
}

export const deletePermission = async (req, res) => {
  const { id } = req.params

  try {
    // Start a transaction
    await pool.query('BEGIN')

    // Delete role permissions first
    await pool.query('DELETE FROM role_permission WHERE permission_id = $1', [
      id,
    ])

    // Then delete the permission
    const result = await pool.query(
      'DELETE FROM permissions WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK')
      return res.status(404).json({ message: 'Permission not found' })
    }

    // Commit transaction
    await pool.query('COMMIT')
    res.json({ message: 'Permission deleted successfully' })
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK')
    res.status(500).json({ error: 'Failed to delete permission' })
  }
}
