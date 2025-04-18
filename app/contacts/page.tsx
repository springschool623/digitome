'use client'

import { useState } from 'react'
import { columns } from './columns'
import { DataTable } from './data-table'
import { contacts } from './data'
import { SidebarInset } from '@/components/ui/sidebar'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import Header from '@/components/PageHeader'
import { Label } from '@/components/ui/label'
import AddDialog from '@/components/AddDialog'

const breadcrumbs = [
  { label: 'Dashboard', href: 'dashboard' },
  { label: 'Danh bạ điện thoại', href: 'contacts' },
  { label: 'Danh sách liên hệ' }, // Không có href → là trang hiện tại
]

export default function ContactPage() {
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  const filteredContacts = contacts
    .filter((contact) =>
      [
        contact.rank,
        contact.position,
        contact.manager,
        contact.department,
        contact.location,
        contact.militaryPostalCode,
      ].some((field) => field.toLowerCase().includes(search.toLowerCase()))
    )
    .filter(
      (contact) =>
        locationFilter === '' ||
        locationFilter === 'all' ||
        contact.location === locationFilter
    )
    .filter(
      (contact) =>
        departmentFilter === '' ||
        departmentFilter === 'all' ||
        contact.department === departmentFilter
    )

  const validLocations = Array.from(
    new Set(
      (departmentFilter === '' || departmentFilter === 'all'
        ? contacts
        : contacts.filter((contact) => contact.department === departmentFilter)
      ).map((contact) => contact.location)
    )
  )

  const validDepartments = Array.from(
    new Set(
      (locationFilter === '' || locationFilter === 'all'
        ? contacts
        : contacts.filter((contact) => contact.location === locationFilter)
      )
        .map((contact) => contact.department)
        .filter(Boolean)
    )
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

            {/* Bộ lọc */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Bộ lọc nâng cao</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bộ lọc nâng cao</DialogTitle>
                </DialogHeader>

                <div className="w-full flex flex-col gap-4 py-4">
                  {[
                    {
                      label: 'Đơn vị:',
                      value: locationFilter,
                      onChange: setLocationFilter,
                      placeholder: 'Lọc theo đơn vị',
                      options: validLocations,
                    },
                    {
                      label: 'Phòng/Ban:',
                      value: departmentFilter,
                      onChange: setDepartmentFilter,
                      placeholder: 'Lọc theo phòng ban',
                      options: validDepartments,
                    },
                  ].map(({ label, value, onChange, placeholder, options }) => (
                    <div
                      key={label}
                      className="flex justify-between gap-4 py-4"
                    >
                      <Label>{label}</Label>
                      <Select value={value} onValueChange={onChange}>
                        <SelectTrigger className="w-2/3">
                          <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả</SelectItem>
                          {options.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <DialogFooter className="mt-4 flex justify-end">
                  <Button
                    onClick={() => {
                      setSearch('')
                      setLocationFilter('')
                      setDepartmentFilter('')
                    }}
                  >
                    Làm mới
                    <RefreshCcw className="ml-2 h-4 w-4" />
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Thêm bản ghi mới */}
          <AddDialog
            onReset={() => {
              setSearch('')
              setLocationFilter('')
              setDepartmentFilter('')
            }}
          />
        </div>

        <DataTable columns={columns} data={filteredContacts} />
      </div>
    </SidebarInset>
  )
}
