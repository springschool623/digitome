'use client'

import { useEffect, useMemo, useState } from 'react'
import { DataTable } from './data-table'
import { SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { RefreshCcw, Edit2, Check } from 'lucide-react'
import Header from '@/components/PageHeader'
import AddDialog from '@/components/AddDialog'
import FilterDialog from '@/components/FilterDialog'
import FilterRow from '@/components/FilterRow'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import InputExcel from '@/components/InputExcel'
import { toast } from 'sonner'
import { getContacts, createContact } from '@/api/contacts'
import { contactColumns } from './columns'
import { Contact } from '@/types/contact'

const breadcrumbs = [
  { label: 'Dashboard', href: 'dashboard' },
  { label: 'Danh bạ điện thoại', href: 'contacts' },
  { label: 'Danh sách liên hệ' },
]

const filterFields = ['rank', 'position', 'department', 'location'] as const

const initialNewContact: Omit<Contact, 'id'> = {
  rank: '',
  position: '',
  manager: '',
  department: '',
  location: '',
  militaryPostalCode: '',
  mobile: '',
}
const initialFilters = { rank: '', position: '', department: '', location: '' }

export default function ContactPage() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [newContact, setNewContact] =
    useState<Omit<Contact, 'id'>>(initialNewContact)
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [isInlineEditEnabled, setIsInlineEditEnabled] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getContacts()
        setContacts(data)
      } catch (error) {
        console.error('Lỗi khi lấy danh bạ:', error)
      }
    }

    fetchData()
  }, [])

  const updateState =
    <T extends object>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (field: keyof T, value: string) =>
      setter((prev) => ({ ...prev, [field]: value }))

  const handleFilterChange = updateState(setFilters)
  const handleNewContactChange = updateState(setNewContact)

  const handleSubmit = async () => {
    // Kiểm tra giá trị bắt buộc
    if (!newContact.manager.trim() || !newContact.rank.trim()) {
      toast.error('Tên quản lý và cấp bậc là bắt buộc!', {
        style: {
          background: 'red',
          color: '#fff',
        },
        duration: 3000,
      })
      return { error: 'Tên quản lý và cấp bậc là bắt buộc' }
    }

    try {
      const data = await createContact(newContact)
      setContacts((prev) => [...prev, data])
      setNewContact(initialNewContact)
      toast.success('Thêm liên hệ thành công!', {
        style: {
          background: '#28a745', // Màu xanh lá
          color: '#fff', // Chữ trắng
        },
        duration: 3000, // Toast sẽ hiển thị trong 3 giây
      })
      setOpenAddDialog(false) // 👉 ĐÓNG FORM
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu:', error)
      toast.error('Đã xảy ra lỗi khi gửi dữ liệu!', {
        style: {
          background: 'red', // Màu đỏ
          color: '#fff', // Chữ trắng
        },
        duration: 3000, // Toast sẽ hiển thị trong 3 giây
      })
    }
  }

  const handleUpdateContact = (updatedContact: Contact) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === updatedContact.id ? updatedContact : contact
      )
    )
  }

  const getFilteredContacts = useMemo(() => {
    return contacts
      .filter((c) =>
        [
          c.rank,
          c.position,
          c.manager,
          c.department,
          c.location,
          c.militaryPostalCode,
        ]
          .filter(Boolean)
          .some((val) => val.toLowerCase().includes(search.toLowerCase()))
      )
      .filter((c) =>
        filterFields.every(
          (field) => !filters[field] || filters[field] === c[field]
        )
      )
  }, [contacts, filters, search])

  const validOptions = useMemo(() => {
    const filtered = contacts.filter((c) =>
      filterFields.every(
        (field) => !filters[field] || filters[field] === c[field]
      )
    )
    return filterFields.reduce((acc, field) => {
      acc[field] = Array.from(
        new Set(filtered.map((c) => c[field]).filter(Boolean))
      )
      return acc
    }, {} as Record<(typeof filterFields)[number], string[]>)
  }, [contacts, filters])

  const filterRows = filterFields.map((field) => ({
    label:
      field === 'rank'
        ? 'Cấp bậc:'
        : field === 'position'
        ? 'Chức vụ:'
        : field === 'department'
        ? 'Phòng/Ban:'
        : 'Đơn vị:',
    value: filters[field],
    onChange: (val: string) => handleFilterChange(field, val),
    placeholder: `Lọc theo ${field}`,
    options: validOptions[field],
  }))

  const resetFilters = () => {
    setSearch('')
    setFilters(initialFilters)
  }

  const columns = useMemo(
    () => contactColumns(handleUpdateContact, isInlineEditEnabled),
    [isInlineEditEnabled]
  )

  return (
    <SidebarInset>
      <Header breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between my-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FilterDialog
              footer={
                <Button variant="outline" onClick={resetFilters}>
                  Làm mới
                  <RefreshCcw className="ml-2 h-4 w-4" />
                </Button>
              }
            >
              {filterRows.map((props) => (
                <FilterRow key={props.label} {...props} />
              ))}
            </FilterDialog>
            <Button
              variant={isInlineEditEnabled ? "default" : "outline"}
              onClick={() => setIsInlineEditEnabled(!isInlineEditEnabled)}
              className={isInlineEditEnabled ? "bg-green-700 text-white hover:bg-green-800" : ""}
            >
              {isInlineEditEnabled ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Inline Edit
                </>
              ) : (
                <>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Inline Edit
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <AddDialog
              title="Thêm liên hệ mới"
              open={openAddDialog}
              onOpenChange={setOpenAddDialog}
              footer={
                <>
                  <Button
                    variant="outline"
                    onClick={() => setNewContact(initialNewContact)}
                  >
                    Làm mới
                    <RefreshCcw className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    className="bg-green-700 text-white hover:bg-green-800"
                    onClick={handleSubmit}
                  >
                    Lưu
                  </Button>
                </>
              }
            >
              {(
                [
                  ['manager', 'Tên quản lý'],
                  ['rank', 'Cấp bậc'],
                  ['position', 'Chức vụ'],
                  ['department', 'Phòng/Ban'],
                  ['location', 'Đơn vị'],
                  ['militaryPostalCode', 'Mã BĐQS'],
                  ['mobile', 'Số điện thoại'],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="flex flex-col gap-2">
                  <Label htmlFor={field}>{label}</Label>
                  <Input
                    id={field}
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                    value={newContact[field]}
                    onChange={(e) =>
                      handleNewContactChange(
                        field as keyof typeof newContact,
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}
            </AddDialog>

            <InputExcel
              onImport={(rows) => {
                setContacts((prev) => {
                  const maxId = prev.reduce(
                    (max, contact) => Math.max(max, contact.id),
                    0
                  )

                  const mapped = rows.map((row, i) => ({
                    id: maxId + i + 1,
                    name: row.name || row['Họ tên'] || '',
                    rank: row.rank || row['Cấp bậc'] || '',
                    position: row.position || row['Chức vụ'] || '',
                    department: row.department || row['Phòng/Ban'] || '',
                    location: row.location || row['Đơn vị'] || '',
                    manager: row.manager || row['Quản lý'] || '',
                    militaryPostalCode:
                      row.militaryPostalCode || row['Mã BĐQS'] || '',
                    mobile: row.mobile || row['Số điện thoại'] || '',
                  }))

                  return [...prev, ...mapped]
                })
              }}
            />
          </div>
        </div>

        <DataTable columns={columns} data={getFilteredContacts} />
      </div>
    </SidebarInset>
  )
}
