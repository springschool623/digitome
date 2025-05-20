'use client'

import { useEffect, useMemo, useState } from 'react'
import { DataTable } from './data-table'
import { SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { RefreshCcw, Edit2, Check, MapPin } from 'lucide-react'
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
import { usePermission } from '@/hooks/usePermission'
import { ContactProvider, useContact } from '@/contexts/ContactContext'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check as CheckIcon, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddressDialog } from '@/components/AddressDialog'

const breadcrumbs = [
  { label: 'Dashboard', href: 'dashboard' },
  { label: 'Danh bạ điện thoại', href: 'contacts' },
  { label: 'Danh sách liên hệ' },
]

const filterFields = ['rank', 'position', 'department', 'location'] as const

const initialFilters = { rank: '', position: '', department: '', location: '' }

function ContactsContent() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [openAddDialog, setOpenAddDialog] = useState(false)
  const [isInlineEditEnabled, setIsInlineEditEnabled] = useState(false)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [formData, setFormData] = useState<FormData>(new FormData())
  const { hasPermission } = usePermission()
  const { departments, locations, ranks } = useContact()

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

  const handleSubmit = async (newContact: Omit<Contact, 'id'>) => {
    // Kiểm tra giá trị bắt buộc
    if (!newContact.manager.trim() || !newContact.rank.trim()) {
      toast.error('Tên quản lý và cấp bậc là bắt buộc!', {
        style: {
          background: 'red',
          color: '#fff',
        },
        duration: 3000,
      })
      return
    }

    try {
      // Lấy id của liên hệ mới
      const data = await createContact(newContact)
      setContacts((prev) => [...prev, data])
      toast.success('Thêm liên hệ thành công!', {
        style: {
          background: '#28a745',
          color: '#fff',
        },
        duration: 3000,
      })
      setOpenAddDialog(false)
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu:', error)
      toast.error('Đã xảy ra lỗi khi gửi dữ liệu!', {
        style: {
          background: 'red',
          color: '#fff',
        },
        duration: 3000,
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
          c.military_postal_code,
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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Header breadcrumbs={breadcrumbs} />
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
          {hasPermission('EDIT_CONTACTS') && (
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
          )}
        </div>

        <div className="flex items-center gap-4">
          {hasPermission('EDIT_CONTACTS') && (
            <AddDialog
              title="Thêm liên hệ mới"
              open={openAddDialog}
              onOpenChange={setOpenAddDialog}
              footer={
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpenAddDialog(false)
                      setFormData(new FormData())
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    className="bg-green-700 text-white hover:bg-green-800"
                    onClick={() => {
                      const form = document.querySelector('form')
                      if (form) {
                        const newFormData = new FormData(form)
                        setFormData(newFormData)
                        const contact = {
                          manager: newFormData.get('manager') as string,
                          rank: newFormData.get('rank') as string,
                          position: newFormData.get('position') as string,
                          department: newFormData.get('department') as string,
                          location: newFormData.get('location') as string,
                          address: newFormData.get('address') as string,
                          military_postal_code: newFormData.get('military_postal_code') as string,
                          mobile_no: newFormData.get('mobile_no') as string,
                        }
                        handleSubmit(contact)
                      }
                    }}
                  >
                    Lưu
                  </Button>
                </>
              }
            >
              <form className="space-y-4">
                {(
                  [
                    ['manager', 'Tên quản lý', true, 'input'],
                    ['rank', 'Cấp bậc', true, 'select'],
                    ['position', 'Chức vụ', false, 'input'],
                    ['department', 'Phòng/Ban', false, 'select'],
                    ['location', 'Đơn vị', false, 'select'],
                    ['military_postal_code', 'Mã BĐQS', false, 'input'],
                    ['mobile_no', 'Số điện thoại', true, 'input'],
                    ['address', 'Địa chỉ', false, 'address'],
                  ] as const
                ).map(([field, label, required, type]) => (
                  <div key={field} className="flex flex-col gap-2">
                    <Label htmlFor={field}>
                      {label}
                      {required && <span className="text-destructive">*</span>}
                    </Label>
                    {type === 'select' ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {(formData.get(field)?.toString() || "Chọn...")}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Tìm kiếm..." />
                            <CommandEmpty>Không tìm thấy.</CommandEmpty>
                            <CommandGroup>
                              {(field === 'department' ? departments :
                                field === 'location' ? locations :
                                field === 'rank' ? ranks : []).map((option: string) => (
                                <CommandItem
                                  key={option}
                                  value={option}
                                  onSelect={(currentValue) => {
                                    const input = document.createElement('input')
                                    input.type = 'hidden'
                                    input.name = field
                                    input.value = currentValue
                                    const form = document.querySelector('form')
                                    if (form) {
                                      form.appendChild(input)
                                      const newFormData = new FormData(form)
                                      setFormData(newFormData)
                                    }
                                  }}
                                >
                                  <CheckIcon
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      formData.get(field) === option ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {option}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    ) : type === 'address' ? (
                      <div className="flex gap-2">
                        <Input
                          id={field}
                          name={field}
                          placeholder={`Nhập ${label.toLowerCase()}...`}
                          className={required ? 'border-primary' : ''}
                        />
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setIsAddressDialogOpen(true)}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Input
                        id={field}
                        name={field}
                        placeholder={`Nhập ${label.toLowerCase()}...`}
                        className={required ? 'border-primary' : ''}
                      />
                    )}
                  </div>
                ))}
              </form>
              <AddressDialog
                isOpen={isAddressDialogOpen}
                onClose={() => setIsAddressDialogOpen(false)}
                onSave={(address) => {
                  const input = document.querySelector(`input[name="address"]`) as HTMLInputElement
                  if (input) {
                    input.value = address
                    const form = document.querySelector('form')
                    if (form) {
                      const newFormData = new FormData(form)
                      setFormData(newFormData)
                    }
                  }
                }}
              />
            </AddDialog>
          )}
          {hasPermission('IMPORT_CONTACTS') && (
            <InputExcel
              onImport={(rows) => {
                setContacts((prev) => {
                  const maxId = prev.reduce(
                    (max, contact) => Math.max(max, contact.id),
                    0
                  )
                  const mapped: Contact[] = rows.map((row, i) => ({
                    id: maxId + i + 1,
                    rank: row.rank || row['Cấp bậc'] || '',
                    position: row.position || row['Chức vụ'] || '',
                    manager: row.manager || row['Quản lý'] || '',
                    department: row.department || row['Phòng/Ban'] || '',
                    location: row.location || row['Đơn vị'] || '',
                    address: row.address || row['Địa chỉ'] || '',
                    military_postal_code: row.military_postal_code || row['Mã BĐQS'] || '',
                    mobile_no: row.mobile_no || row['Số điện thoại'] || '',
                  }))
                  return [...prev, ...mapped]
                })
              }}
            />
          )}
        </div>
      </div>

      <DataTable columns={columns} data={getFilteredContacts} />
    </div>
  )
}

export default function ContactsPage() {
  return (
    <ContactProvider>
      <ContactsContent />
    </ContactProvider>
  )
}
