'use client'

import { useState } from 'react'
import { columns } from './columns'
import { DataTable } from './data-table'
import { contacts } from './data'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

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
      [contact.location, contact.mobile, contact.militaryPostalCode].some(
        (field) => field.toLowerCase().includes(search.toLowerCase())
      )
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
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-1/3"
            />
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-1/4">
                <SelectValue placeholder="Lọc theo cơ quan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {validLocations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={departmentFilter}
              onValueChange={setDepartmentFilter}
            >
              <SelectTrigger className="w-1/4">
                <SelectValue placeholder="Lọc theo phòng ban" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {validDepartments.map((department) => (
                  <SelectItem key={department} value={department}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                setSearch('')
                setLocationFilter('')
                setDepartmentFilter('')
              }}
              className="ml-2"
            >
              Làm mới
              <RefreshCcw className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <DataTable columns={columns} data={filteredContacts} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
