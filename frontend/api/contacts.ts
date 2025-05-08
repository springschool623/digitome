// src/api/contacts.ts

import { toast } from 'sonner'

export const getContacts = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/contacts')
    if (!res.ok) throw new Error('Failed to fetch contacts')
    return await res.json()
  } catch (error) {
    console.error('Lỗi khi lấy danh bạ:', error)
    throw error
  }
}

export const getContact = async (id: number) => {
  try {
    const res = await fetch(`http://localhost:5000/api/contacts/${id}`)
    if (!res.ok) throw new Error('Failed to fetch contact')
    return await res.json()
  } catch (error) {
    console.error('Lỗi khi lấy thông tin liên hệ:', error)
    throw error
  }
}

export const createContact = async (contact: {
  rank: string
  position: string
  manager: string
  department: string
  location: string
  militaryPostalCode: string
  mobile: string
}) => {
  try {
    const res = await fetch('http://localhost:5000/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...contact,
        militaryportalcode: contact.militaryPostalCode, // chú ý tên field backend yêu cầu
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      toast.error('Thêm liên hệ thất bại!', {
        style: {
          background: 'red', // Màu đỏ
          color: '#fff', // Chữ trắng
        },
        duration: 3000, // Toast sẽ hiển thị trong 3 giây
      })
      throw new Error(data.message || 'Thêm liên hệ thất bại')
    }
    return data
  } catch (error) {
    console.error('Lỗi khi thêm liên hệ:', error)
    throw error
  }
}

export const updateContact = async (
  id: number,
  contact: {
    rank: string
    position: string
    manager: string
    department: string
    location: string
    militaryPostalCode: string
    mobile: string
  }
) => {
  try {
    const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...contact,
        militaryportalcode: contact.militaryPostalCode, // chú ý tên field backend yêu cầu
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      toast.error('Cập nhật liên hệ thất bại!', {
        style: {
          background: 'red',
          color: '#fff',
        },
        duration: 3000,
      })
      throw new Error(data.message || 'Cập nhật liên hệ thất bại')
    }
    return data
  } catch (error) {
    console.error('Lỗi khi cập nhật liên hệ:', error)
    throw error
  }
}
