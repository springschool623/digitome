'use client'

import { Button } from '@/components/ui/button'
import * as XLSX from 'xlsx'
import { ContactExcelRow } from '@/lib/ContactExcelRow'
import React from 'react'
import { toast } from 'sonner' // hoặc react-toastify tùy bạn
import { useContact } from '@/contexts/ContactContext'

interface InputExcelProps {
  onImport: (data: ContactExcelRow[]) => void
}

export default function InputExcel({ onImport }: InputExcelProps) {
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })

        if (!workbook.SheetNames.length) {
          toast.error('Không tìm thấy sheet trong file Excel.', {
            style: {
              background: 'red', // Màu đỏ
              color: '#fff', // Chữ trắng
            },
            duration: 3000, // Toast sẽ hiển thị trong 3 giây
          })
          return
        }

        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        if (!jsonData.length) {
          toast.error('Không có dữ liệu nào trong file Excel.', {
            style: {
              background: 'red', // Màu đỏ
              color: '#fff', // Chữ trắng
            },
            duration: 3000, // Toast sẽ hiển thị trong 3 giây
          })
          return
        }

        const importedContacts = (jsonData as ContactExcelRow[]).map((row) => ({
          name: row.name || row['Họ tên'] || '',
          rank_name: row.rank_name || row['Cấp bậc'] || '',
          position_name: row.position_name || row['Chức vụ'] || '',
          department_name: row.department_name || row['Phòng/Ban'] || '',
          location_name: row.location_name || row['Đơn vị'] || '',
          manager: row.manager || row['Quản lý'] || '',
          military_postal_code:
            row.military_postal_code || row['Mã BĐQS'] || '',
          address: row.address || row['Địa chỉ'] || '',
          mobile_no: row.mobile_no || row['Số điện thoại'] || '',
        }))

        if (importedContacts.every((c) => !c.name)) {
          toast.error('Không có liên hệ nào hợp lệ (thiếu Họ tên).', {
            style: {
              background: 'red', // Màu đỏ
              color: '#fff', // Chữ trắng
            },
            duration: 3000, // Toast sẽ hiển thị trong 3 giây
          })
          return
        }

        // Add imported contacts to context
        addContacts(importedContacts)
        onImport(importedContacts)
        toast.success(`Nhập thành công ${importedContacts.length} liên hệ.`, {
          style: {
            background: '#28a745', // Màu xanh lá
            color: '#fff', // Chữ trắng
          },
          duration: 3000, // Toast sẽ hiển thị trong 3 giây
        })
      } catch (err) {
        console.error('Lỗi đọc file Excel:', err)
        toast.error(
          'Đã xảy ra lỗi khi đọc file. Vui lòng kiểm tra lại định dạng.',
          {
            style: {
              background: 'red', // Màu đỏ
              color: '#fff', // Chữ trắng
            },
            duration: 3000, // Toast sẽ hiển thị trong 3 giây
          }
        )
      }
    }

    reader.onerror = () => {
      toast.error('Không thể đọc file. Vui lòng thử lại.', {
        style: {
          background: 'red', // Màu đỏ
          color: '#fff', // Chữ trắng
        },
        duration: 3000, // Toast sẽ hiển thị trong 3 giây
      })
    }

    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="excel-upload">
        <Button variant="outline" asChild>
          <span>Import Excel</span>
        </Button>
      </label>
      <input
        id="excel-upload"
        type="file"
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleImportExcel}
      />
    </div>
  )
}
