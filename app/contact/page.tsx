'use client'
import { AppSidebar } from '@/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'

const tableHeaders = [
  'STT',
  'Vị trí đặt máy',
  'Cơ quan',
  'Phòng ban',
  'Quân sự bưu điện',
  'Di động',
]

const contacts = [
  {
    position: 'Tư lệnh',
    manager: 'Đ/c Nguyễn Văn A',
    department: '',
    location: 'Bộ Tư Lệnh Thành Phố',
    militaryPostalCode: '123456',
    mobile: '0987 654 321',
  },
  {
    position: 'Chính ủy',
    manager: 'Đ/c Phan Văn B',
    department: '',
    location: 'Bộ Tư Lệnh Thành Phố',
    militaryPostalCode: '654321',
    mobile: '0912 345 678',
  },
  {
    position: '',
    manager: 'Đ/c Nguyễn Trung C',
    department: 'Ban Tác huấn',
    location: 'Phòng Tham Mưu',
    militaryPostalCode: '987654',
    mobile: '0903 456 789',
  },
  {
    position: 'Trường bắn Phú Mỹ Hưng',
    manager: 'Nguyễn Thanh Trọng',
    department: 'Ban Tác huấn',
    location: 'Phòng Tham Mưu',
    militaryPostalCode: '456789',
    mobile: '0923 567 890',
  },
  {
    position: 'Chủ nhiệm',
    manager: 'Đ/c Trần Văn D',
    department: '',
    location: 'Phòng Chính Trị',
    militaryPostalCode: '789123',
    mobile: '0965 678 901',
  },
]

export default function Page() {
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  // Lọc danh sách hiển thị dựa trên lựa chọn hiện tại
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

  // Lấy danh sách cơ quan hợp lệ dựa trên bộ lọc mã quân sự
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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex items-center gap-4 mb-4">
            <Input
              placeholder="Tìm kiếm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-1/3"
            />

            {/* Bộ lọc cơ quan */}
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

            {/* Bộ lọc phòng ban */}
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

            {/* Nút làm mới bộ lọc */}
            <Button
              onClick={() => {
                setSearch('')
                setLocationFilter('')
                setDepartmentFilter('')
              }}
              className="ml-2"
            >
              Làm mới
              <RefreshCcw />
            </Button>
          </div>
          <Table>
            <TableCaption>Danh sách liên hệ nội bộ.</TableCaption>
            <TableHeader>
              <TableRow>
                {tableHeaders.map((header, index) => (
                  <TableHead key={index}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContacts.map((contact, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">
                    {contact.position}
                    {contact.manager && (
                      <span className="block mt-[4px] font-normal">
                        {contact.manager}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{contact.location}</TableCell>
                  <TableCell>{contact.department}</TableCell>
                  <TableCell>{contact.militaryPostalCode}</TableCell>
                  <TableCell>{contact.mobile}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={tableHeaders.length}>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
