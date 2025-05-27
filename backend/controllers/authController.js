export const getCurrentUser = async (req, res) => {
  try {
    // req.user được set bởi auth middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Lấy thông tin chi tiết của user từ database
    const result = await pool.query(
      `
      SELECT a.id, a.mobile_no, a.created_at, a.updated_at, a.status,
             r.role_name, r.role_description
      FROM accounts a
      LEFT JOIN roles r ON a.role_id = r.id
      WHERE a.id = $1
    `,
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    const user = result.rows[0]
    // Không trả về password
    delete user.password

    res.json(user)
  } catch (error) {
    console.error('Error getting current user:', error)
    res.status(500).json({ message: 'Internal server error' })
  }
}
