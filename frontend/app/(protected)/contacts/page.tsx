'use client'

import { useEffect, useMemo, useState } from 'react'
import { DataTable } from './data-table'
import { Button } from '@/components/ui/button'
import { RefreshCcw, Edit2, Check } from 'lucide-react'
import Header from '@/components/PageHeader'
import FilterDialog from '@/components/FilterDialog'
import FilterRow from '@/components/FilterRow'
import { Input } from '@/components/ui/input'
import InputExcel from '@/components/InputExcel'
import { getContacts } from '@/api/contacts'
import { contactColumns } from './columns'
import { Contact } from '@/types/contact'
import { usePermission } from '@/hooks/usePermission'
import { ContactProvider, useContact } from '@/contexts/ContactContext'
import { useRouter } from 'next/navigation'

const breadcrumbs = [
  { label: 'Dashboard', href: 'dashboard' },
  { label: 'Danh bạ điện thoại', href: 'contacts' },
  { label: 'Danh sách liên hệ' },
]

const filterFields = [
  'rank_id',
  'position_id',
  'department_id',
  'location_id',
] as const

const initialFilters = {
  rank_id: 0,
  position_id: 0,
  department_id: 0,
  location_id: 0,
}

function ContactsContent() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isInlineEditEnabled, setIsInlineEditEnabled] = useState(false)
  const { hasPermission } = usePermission()
  const router = useRouter()
  const { ranks, positions, departments, locations } = useContact()

  const fetchContacts = async () => {
    try {
      const data = await getContacts()
      setContacts(data)
    } catch (error) {
      console.error('Lỗi khi lấy danh bạ:', error)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const updateState =
    <T extends object>(setter: React.Dispatch<React.SetStateAction<T>>) =>
    (field: keyof T, value: string | number) =>
      setter((prev) => ({ ...prev, [field]: value }))

  const handleFilterChange = updateState(setFilters)

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
          c.rank_id,
          c.position_id,
          c.manager,
          c.department_id,
          c.location_id,
          c.military_postal_code,
          c.address,
          c.mobile_no,
        ]
          .filter(Boolean)
          .some((val) =>
            val.toString().toLowerCase().includes(search.toLowerCase())
          )
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

    return {
      rank_id: ranks
        .filter((r) => filtered.some((c) => c.rank_id === r.id))
        .map((r) => r.name),
      position_id: positions
        .filter((p) => filtered.some((c) => c.position_id === p.id))
        .map((p) => p.name),
      department_id: departments
        .filter((d) => filtered.some((c) => c.department_id === d.id))
        .map((d) => d.name),
      location_id: locations
        .filter((l) => filtered.some((c) => c.location_id === l.id))
        .map((l) => l.name),
    }
  }, [contacts, filters, ranks, positions, departments, locations])

  const filterRows = filterFields.map((field) => {
    const list =
      field === 'rank_id'
        ? ranks
        : field === 'position_id'
        ? positions
        : field === 'department_id'
        ? departments
        : locations

    return {
      label:
        field === 'rank_id'
          ? 'Cấp bậc:'
          : field === 'position_id'
          ? 'Chức vụ:'
          : field === 'department_id'
          ? 'Phòng/Ban:'
          : 'Đơn vị:',
      value: list.find((item) => item.id === filters[field])?.name || '',
      onChange: (val: string) => {
        const id = list.find((item) => item.name === val)?.id || 0
        handleFilterChange(field, id)
      },
      placeholder: `Lọc theo ${
        field === 'rank_id'
          ? 'cấp bậc'
          : field === 'position_id'
          ? 'chức vụ'
          : field === 'department_id'
          ? 'phòng/ban'
          : 'đơn vị'
      }`,
      options: validOptions[field], // đây vẫn là string[]
    }
  })

  const resetFilters = () => {
    setSearch('')
    setFilters(initialFilters)
  }

  const columns = useMemo(
    () =>
      contactColumns(
        handleUpdateContact,
        isInlineEditEnabled,
        hasPermission,
        {
          ranks,
          positions,
          departments,
          locations,
        },
        fetchContacts
      ),
    [
      isInlineEditEnabled,
      hasPermission,
      ranks,
      positions,
      departments,
      locations,
    ]
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
              variant={isInlineEditEnabled ? 'default' : 'outline'}
              onClick={() => setIsInlineEditEnabled(!isInlineEditEnabled)}
              className={
                isInlineEditEnabled
                  ? 'bg-green-700 text-white hover:bg-green-800'
                  : ''
              }
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
            <Button
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={() => router.push('/contacts/create')}
            >
              Thêm mới
            </Button>
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
                    rank_id: 0,
                    position_id: 0,
                    department_id: 0,
                    location_id: 0,
                    rank_name: row.rank_name || row['Cấp bậc'] || '',
                    position_name: row.position_name || row['Chức vụ'] || '',
                    department_name:
                      row.department_name || row['Phòng/Ban'] || '',
                    location_name: row.location_name || row['Đơn vị'] || '',
                    manager: row.manager || row['Quản lý'] || '',
                    address: row.address || row['Địa chỉ'] || '',
                    military_postal_code:
                      row.military_postal_code || row['Mã BĐQS'] || '',
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
