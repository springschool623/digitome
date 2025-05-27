import { pool } from '../db.js'

export const getAllRoles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', p.id,
                   'permission_code', p.permission_code,
                   'permission_name', p.permission_name,
                   'permission_category', p.permission_category
                 )
               ) FILTER (WHERE p.id IS NOT NULL),
               '[]'
             ) as permissions
      FROM roles r
      LEFT JOIN role_permission rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      GROUP BY r.id
      ORDER BY r.id ASC
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch roles' })
  }
}

export const getRole = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `
      SELECT r.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', p.id,
                   'permission_code', p.permission_code,
                   'permission_name', p.permission_name,
                   'permission_category', p.permission_category
                 )
               ) FILTER (WHERE p.id IS NOT NULL),
               '[]'
             ) as permissions
      FROM roles r
      LEFT JOIN role_permission rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE r.id = $1
      GROUP BY r.id
    `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Role not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch role' })
  }
}

export const createRole = async (req, res) => {
  const { role_name, role_description, permissions } = req.body

  try {
    // Start a transaction
    await pool.query('BEGIN')

    // Insert role
    const roleResult = await pool.query(
      'INSERT INTO roles (role_name, role_description) VALUES ($1, $2) RETURNING *',
      [role_name, role_description]
    )

    // If permissions are provided, insert them
    if (permissions && permissions.length > 0) {
      const roleId = roleResult.rows[0].id
      const values = permissions
        .map((permissionId) => `(${roleId}, ${permissionId})`)
        .join(',')
      await pool.query(
        `INSERT INTO role_permission (role_id, permission_id) VALUES ${values}`
      )
    }

    // Commit transaction
    await pool.query('COMMIT')

    // Get the complete role with permissions
    const completeRole = await pool.query(
      `
      SELECT r.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', p.id,
                   'permission_code', p.permission_code,
                   'permission_name', p.permission_name,
                   'permission_category', p.permission_category
                 )
               ) FILTER (WHERE p.id IS NOT NULL),
               '[]'
             ) as permissions
      FROM roles r
      LEFT JOIN role_permission rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE r.id = $1
      GROUP BY r.id
    `,
      [roleResult.rows[0].id]
    )

    res.status(201).json(completeRole.rows[0])
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK')

    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Role name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to create role' })
    }
  }
}

export const updateRole = async (req, res) => {
  const { id } = req.params
  const { role_name, role_description, permissions } = req.body

  try {
    // Start a transaction
    await pool.query('BEGIN')

    // Update role
    const roleResult = await pool.query(
      'UPDATE roles SET role_name = $1, role_description = $2 WHERE id = $3 RETURNING *',
      [role_name, role_description, id]
    )

    if (roleResult.rows.length === 0) {
      await pool.query('ROLLBACK')
      return res.status(404).json({ message: 'Role not found' })
    }

    // If permissions are provided, update them
    if (permissions) {
      // Delete existing permissions
      await pool.query('DELETE FROM role_permission WHERE role_id = $1', [id])

      // Insert new permissions
      if (permissions.length > 0) {
        const values = permissions
          .map((permissionId) => `(${id}, ${permissionId})`)
          .join(',')
        await pool.query(
          `INSERT INTO role_permission (role_id, permission_id) VALUES ${values}`
        )
      }
    }

    // Commit transaction
    await pool.query('COMMIT')

    // Get the complete role with permissions
    const completeRole = await pool.query(
      `
      SELECT r.*, 
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', p.id,
                   'permission_code', p.permission_code,
                   'permission_name', p.permission_name,
                   'permission_category', p.permission_category
                 )
               ) FILTER (WHERE p.id IS NOT NULL),
               '[]'
             ) as permissions
      FROM roles r
      LEFT JOIN role_permission rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE r.id = $1
      GROUP BY r.id
    `,
      [id]
    )

    res.json(completeRole.rows[0])
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK')

    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Role name already exists' })
    } else {
      res.status(500).json({ error: 'Failed to update role' })
    }
  }
}

export const deleteRole = async (req, res) => {
  const { id } = req.params

  try {
    // Start a transaction
    await pool.query('BEGIN')

    // Delete role permissions first
    await pool.query('DELETE FROM role_permission WHERE role_id = $1', [id])

    // Then delete the role
    const result = await pool.query(
      'DELETE FROM roles WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK')
      return res.status(404).json({ message: 'Role not found' })
    }

    // Commit transaction
    await pool.query('COMMIT')
    res.json({ message: 'Role deleted successfully' })
  } catch (error) {
    // Rollback transaction on error
    await pool.query('ROLLBACK')
    res.status(500).json({ error: 'Failed to delete role' })
  }
}
