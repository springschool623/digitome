// src/api/accounts.ts

import { Account } from '@/types/account'
import { toast } from 'sonner'

const getTokenFromCookie = (): string | null => {
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/)
  return match ? match[1] : null
}

export const getAccounts = async () => {
  const token = getTokenFromCookie()
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DB_DOMAIN}/api/accounts`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await res.json()
    console.log(data)

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

export const createAccount = async (account: Account) => {
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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DB_DOMAIN}/api/accounts/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ✅ Thêm token nếu có middleware auth ở backend
        },
      }
    )

    const data = await res.json()

    if (!res.ok) {
      toast.error(data.message || 'Vô hiệu hóa tài khoản thất bại!', {
        style: { background: 'red', color: '#fff' },
        duration: 3000,
      })
      throw new Error(data.message || 'Vô hiệu hóa tài khoản thất bại')
    }

    toast.success('Tài khoản đã bị vô hiệu hóa!', {
      style: { background: 'oklch(44.8% 0.119 151.328)', color: '#fff' },
      duration: 3000,
    })

    return data
  } catch (error) {
    console.error('Lỗi khi vô hiệu hóa tài khoản:', error)
    throw error
  }
}

export const getAccount = async (id: number) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DB_DOMAIN}/api/accounts/${id}`
    )
    if (!res.ok) throw new Error('Failed to fetch account')
    return await res.json()
  } catch (error) {
    console.error('Lỗi khi lấy thông tin tài khoản:', error)
    throw error
  }
}

export const updateAccount = async (id: number, account: Account) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DB_DOMAIN}/api/accounts/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(account),
      }
    )
    if (!res.ok) throw new Error('Failed to update account')
    return await res.json()
  } catch (error) {
    console.error('Lỗi khi cập nhật tài khoản:', error)
    throw error
  }
}

export const updateAccountRole = async (accountId: number, roleId: number) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_DB_DOMAIN}/api/accounts/${accountId}/role`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleId }),
      }
    )

    if (!res.ok) throw new Error('Failed to update account roles')
    return await res.json()
  } catch (error) {
    console.error('Lỗi khi cập nhật quyền tài khoản:', error)
    throw error
  }
}
