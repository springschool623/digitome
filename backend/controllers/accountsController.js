import { pool } from '../db.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const SECRET_KEY = process.env.JWT_SECRET_KEY

// Lấy danh sách tất cả tài khoản
export const getAllAccounts = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT ma.id, mobile_no, role_name, updated_at, created_by, status FROM accounts ma JOIN roles r ON ma.role_id = r.id ORDER BY id ASC'
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch accounts' })
  }
}

// Đăng nhập tài khoản
export const loginAccount = async (req, res) => {
  const { mobile_no, password } = req.body

  try {
    const result = await pool.query(
      `SELECT ma.*, role_name 
   FROM accounts ma 
   JOIN roles r ON ma.role_id = r.id 
   WHERE ma.mobile_no = $1`,
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

    // console.log('User logged in:', user)

    // Tạo token
    const token = jwt.sign(
      {
        id: user.id,
        mobile_no: user.mobile_no,
        role: user.role_name, // dùng role_name thay vì user_role
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
        role: user.role_name, // dùng đúng tên đã mã hóa
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Lỗi đăng nhập' })
  }
}
