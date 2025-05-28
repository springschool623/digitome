import { Permission } from '@/types/permission'
import { toast } from 'sonner'

const getTokenFromCookie = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)
  return match ? match[1] : null
}

export const getPermissions = async (): Promise<Permission[]> => {
  const token = getTokenFromCookie()
  try {
    const res = await fetch(`${process.env.DB_Domain}/api/permissions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      let errorMessage = 'Lỗi không xác định'

      if (res.status === 401) {
        errorMessage = 'Bạn chưa đăng nhập hoặc token không hợp lệ.'
      } else if (res.status === 403) {
        errorMessage = data?.error || 'Bạn không có quyền truy cập dữ liệu này.'
      } else if (res.status === 500) {
        errorMessage = 'Lỗi máy chủ, vui lòng thử lại sau.'
      }
      toast.error(errorMessage, {
        style: { background: '#dc2626', color: '#fff' },
        duration: 3000,
      })
      throw new Error(errorMessage)
    }

    return data
  } catch (error) {
    console.error('Lỗi khi lấy danh sách quyền:', error)
    throw error
  }
}
