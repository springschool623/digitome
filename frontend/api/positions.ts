// Lấy thông tin chức vụ
export const getPositions = async () => {
  try {
    const res = await fetch(`${dbDomain}/api/positions`)
    if (!res.ok) throw new Error('Failed to fetch positions')
    return await res.json()
  } catch (error) {
    console.error('Lỗi khi lấy thông tin chức vụ:', error)
    throw error
  }
}

const dbDomain = 'https://digitome-backend.onrender.com/'
