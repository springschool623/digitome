// Lấy thông tin đơn vị
export const getLocations = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DB_DOMAIN}/api/locations`
    )
    if (!res.ok) throw new Error('Failed to fetch locations')
    return await res.json()
  } catch (error) {
    console.error('Lỗi khi lấy thông tin đơn vị:', error)
    throw error
  }
}
