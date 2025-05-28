// Lấy thông tin phòng/ban
export const getDepartments = async () => {
  try {
    const res = await fetch(`${process.env.DB_Domain}/api/departments`)
    if (!res.ok) throw new Error('Failed to fetch departments')
    return await res.json()
  } catch (error) {
    console.error('Lỗi khi lấy thông tin phòng/ban:', error)
    throw error
  }
}
