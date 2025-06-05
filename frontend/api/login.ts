// src/api/login.ts

import { toast } from 'sonner'

export interface LoginResponse {
  user: {
    id: number
    mobile_no: string
    role: string
    user_name: string
  }
  token: string
}

export const login = async (
  mobile_no: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_DB_DOMAIN}/api/accounts/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_no, password }),
      }
    )

    const data = await response.json()
    console.log(data)

    if (response.status === 401) {
      toast.error(data.error || 'Thông tin đăng nhập không đúng!', {
        style: { background: '#dc2626', color: '#fff' },
        duration: 3000,
      })
      throw new Error(data.error || 'Unauthorized')
    }

    if (response.status === 403) {
      toast.error(data.error || 'Tài khoản hiện không hoạt động!', {
        style: { background: '#dc2626', color: '#fff' },
        duration: 3000,
      })
      throw new Error(data.error || 'Forbidden')
    }

    if (response.status === 500) {
      toast.error('Lỗi máy chủ, vui lòng thử lại sau!', {
        style: { background: '#dc2626', color: '#fff' },
        duration: 3000,
      })
      throw new Error('Internal Server Error')
    }

    if (!response.ok) {
      toast.error(data.error || 'Đăng nhập thất bại!', {
        style: { background: '#dc2626', color: '#fff' },
        duration: 3000,
      })
      throw new Error(data.error || 'Unknown error')
    }

    toast.success('Đăng nhập thành công!', {
      style: { background: 'oklch(44.8% 0.119 151.328)', color: '#fff' },
      duration: 3000,
    })

    return data
  } catch (error) {
    // toast.error('Không thể kết nối đến máy chủ!', {
    //   style: { background: '#dc2626', color: '#fff' },
    //   duration: 3000,
    // })
    console.error('Login API error:', error)
    throw error
  }
}
