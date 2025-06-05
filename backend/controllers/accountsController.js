import { pool } from '../db.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const SECRET_KEY = process.env.JWT_SECRET_KEY

// Lấy danh sách tất cả tài khoản
export const getAllAccounts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.mobile_no, a.role_id, r.role_name, a.updated_at, 
             a.created_by, a.status, c.name as created_by_name
      FROM accounts a 
      JOIN roles r ON a.role_id = r.id
      LEFT JOIN contacts c ON a.created_by = c.id
      ORDER BY a.id ASC 
    `)
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' })
  }
}

// Lấy thông tin một tài khoản
export const getAccount = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `
      SELECT a.*, r.role_name, c.name as created_by_name, a.role_id
      FROM accounts a 
      JOIN roles r ON a.role_id = r.id
      LEFT JOIN contacts c ON a.created_by = c.id
      WHERE a.id = $1
    `,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch account' })
  }
}

// Tạo tài khoản mới
export const createAccount = async (req, res) => {
  const { mobile_no, password, created_by } = req.body

  try {
    const result = await pool.query(
      `INSERT INTO accounts (mobile_no, password, created_by, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING *`,
      [mobile_no, password, created_by]
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Mobile number already exists' })
    } else if (error.code === '23503') {
      // foreign key violation
      res.status(400).json({ error: 'Invalid role or creator reference' })
    } else {
      res.status(500).json({ error: 'Failed to create account' })
    }
  }
}

// Cập nhật tài khoản
export const updateAccount = async (req, res) => {
  const { id } = req.params
  const { mobile_no, password, status } = req.body

  try {
    const result = await pool.query(
      `UPDATE accounts 
       SET mobile_no = $1, 
           password = $2, 
           status = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 
       RETURNING *`,
      [mobile_no, password, status, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    if (error.code === '23505') {
      // unique violation
      res.status(400).json({ error: 'Mobile number already exists' })
    } else if (error.code === '23503') {
      // foreign key violation
      res.status(400).json({ error: 'Invalid role reference' })
    } else {
      res.status(500).json({ error: 'Failed to update account' })
    }
  }
}

// Đăng nhập tài khoản
export const loginAccount = async (req, res) => {
  const { mobile_no, password } = req.body

  try {
    const result = await pool.query(
      `SELECT a.*, r.role_name, c.name
       FROM accounts a
       JOIN roles r ON a.role_id = r.id 
       JOIN contacts c ON a.mobile_no = c.mobile_no
       WHERE a.mobile_no = $1`,
      [mobile_no]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Số điện thoại không tồn tại' })
    }

    const user = result.rows[0]

    // Kiểm tra trạng thái tài khoản
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Tài khoản không hoạt động' })
    }

    // So sánh mật khẩu dạng thuần (nên mã hoá sau này)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Mật khẩu không chính xác' })
    }

    // Tạo token
    const token = jwt.sign(
      {
        id: user.id,
        mobile_no: user.mobile_no,
        role: user.role_name,
        user_name: user.name,
      },
      SECRET_KEY,
      { expiresIn: '1h' }
    )

    // Gửi token và thông tin user về frontend
    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        mobile_no: user.mobile_no,
        role: user.role_name,
        user_name: user.name,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Lỗi đăng nhập' })
  }
}

// Xóa mềm tài khoản (chuyển status sang 'suspend')
export const deleteAccount = async (req, res) => {
  const { id } = req.params

  try {
    const result = await pool.query(
      `UPDATE accounts SET status = 'suspended', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' })
    }

    res.json({ message: 'Tài khoản đã bị tạm ngưng', account: result.rows[0] })
  } catch (error) {
    console.error('Error suspending account:', error)
    res.status(500).json({ error: 'Failed to suspend account' })
  }
}

// Cập nhật trạng thái tài khoản
export const updateAccountStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  try {
    const result = await pool.query(
      `UPDATE accounts SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Account not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update account status' })
  }
}

export const updateAccountRole = async (req, res) => {
  const { id } = req.params
  const { roleId } = req.body

  try {
    const result = await pool.query(
      `UPDATE accounts SET role_id = $1 WHERE id = $2 RETURNING *`,
      [roleId, id]
    )
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role to account' })
  }
}
