import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const SECRET_KEY = process.env.JWT_SECRET_KEY

export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ error: 'Không có token' })
    }

    const token = authHeader.split(' ')[1]

    try {
      const decoded = jwt.verify(token, SECRET_KEY)
      if (!allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ error: 'Không đủ quyền truy cập' })
      }

      req.user = decoded
      next()
    } catch (err) {
      return res.status(401).json({ error: 'Token không hợp lệ' })
    }
  }
}
