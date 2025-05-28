// src/api/accounts.ts

import { toast } from 'sonner'

const dbDomain = 'https://digitome-backend.onrender.com/'

const getTokenFromCookie = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)
  return match ? match[1] : null
}

export const getRoles = async () => {
  const token = getTokenFromCookie()
  try {
    const res = await fetch(`${dbDomain}/api/roles`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      // Xử lý lỗi cụ thể dựa trên mã lỗi hoặc thông báo từ server
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
    console.error('Lỗi khi lấy danh sách tài khoản:', error)
    throw error
  }
}

export const createRole = async (role: {
  role_name: string
  role_description: string
}) => {
  try {
    const res = await fetch(`${dbDomain}/api/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(role),
    })

    const data = await res.json()
    if (!res.ok) {
      toast.error('Thêm vai trò thất bại!', {
        style: {
          background: 'red',
          color: '#fff',
        },
        duration: 3000,
      })
      throw new Error(data.message || 'Thêm vai trò thất bại')
    }

    return data
  } catch (error) {
    console.error('Lỗi khi thêm vai trò:', error)
    throw error
  }
}
