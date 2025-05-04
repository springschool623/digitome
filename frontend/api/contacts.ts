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
