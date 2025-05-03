import { pool } from '../db.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const SECRET_KEY = process.env.JWT_SECRET_KEY

// Lấy danh sách tất cả tài khoản
export const getAllAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, mobile_phone, user_role, created_at FROM military_account ORDER BY id ASC'
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' })
  }
}

// Đăng nhập tài khoản
export const loginAccount = async (req, res) => {
  const { mobile_phone, password } = req.body

  try {
    const result = await pool.query(
      'SELECT * FROM military_account WHERE mobile_phone = $1',
      [mobile_phone]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Số điện thoại không tồn tại' })
    }

    const user = result.rows[0]

    // So sánh mật khẩu dạng thuần (nên mã hoá sau này)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Mật khẩu không chính xác' })
    }

    // Tạo token
    const token = jwt.sign(
      {
        id: user.id,
        mobile_phone: user.mobile_phone,
        user_role: user.user_role,
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
        mobile_phone: user.mobile_phone,
        user_role: user.user_role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Lỗi đăng nhập' })
  }
}
