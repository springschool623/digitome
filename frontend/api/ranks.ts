// Lấy thông tin cấp bậc
export const getRanks = async () => {
  try {
    const res = await fetch(`http://localhost:5000/api/ranks`)
    if (!res.ok) throw new Error('Failed to fetch contact')
    return await res.json()
  } catch (error) {
    console.error('Lỗi khi lấy thông tin cấp bậc:', error)
    throw error
  }
}
