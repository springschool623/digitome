// src/api/accounts.ts

import { toast } from 'sonner'

const getTokenFromCookie = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)
  return match ? match[1] : null
}

export const getAccounts = async () => {
  const token = getTokenFromCookie()
  try {
    const res = await fetch('http://localhost:5000/api/accounts', {
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

export const createAccount = async (account: {
  mobile_no: string
  password: string
  role_id: string
  updated_at: string
  created_by: string
  status: string
}) => {
  try {
    const res = await fetch('http://localhost:5000/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    })

    const data = await res.json()
    if (!res.ok) {
      toast.error('Thêm tài khoản thất bại!', {
        style: {
          background: 'red',
          color: '#fff',
        },
        duration: 3000,
      })
      throw new Error(data.message || 'Thêm tài khoản thất bại')
    }

    return data
  } catch (error) {
    console.error('Lỗi khi thêm tài khoản:', error)
    throw error
  }
}

export const deleteAccount = async (id: number) => {
  const token = getTokenFromCookie()

  try {
    const res = await fetch(`http://localhost:5000/api/accounts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // ✅ Thêm token nếu có middleware auth ở backend
      },
    })

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.message || 'Xóa tài khoản thất bại!', {
        style: { background: 'red', color: '#fff' },
        duration: 3000,
      })
      throw new Error(data.message || 'Xóa tài khoản thất bại')
    }

    toast.success('Tài khoản đã bị tạm ngưng!', {
      style: { background: 'green', color: '#fff' },
      duration: 3000,
    })

    return data
  } catch (error) {
    console.error('Lỗi khi xóa tài khoản:', error)
    throw error
  }
}
