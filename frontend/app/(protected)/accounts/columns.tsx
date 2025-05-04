'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ColumnDef } from '@tanstack/react-table'
import { MoreVerticalIcon } from 'lucide-react'

export type Account = {
  id: number
  mobile_phone: string
  password: string
  role_id: string
  updated_at: string
  created_by: string
  status: string
}

export const columns: ColumnDef<Account>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'mobile_phone',
    header: 'SĐT',
  },
  {
    accessorKey: 'password',
    header: 'Mật khẩu',
    cell: () => <span className="italic text-muted-foreground">••••••••</span>, // Ẩn mật khẩu
  },
  {
    accessorKey: 'name',
    header: 'Vai trò',
  },
  {
    accessorKey: 'updated_at',
    header: 'Cập nhật lúc',
    cell: ({ row }) => {
      const rawDate = row.getValue('updated_at') as string
      const date = new Date(rawDate)

      const formatTime = date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })

      const formatDate = date.toLocaleDateString('vi-VN')

      return <span>{`${formatTime} ${formatDate}`}</span>
    },
  },
  {
    accessorKey: 'created_by',
    header: 'Tạo bởi',
  },
  {
    accessorKey: 'status',
    header: 'Trạng thái',
    cell: ({ row }) => {
      const status = row.getValue('status') as string

      let colorClass = ''
      switch (status.toLowerCase()) {
        case 'active':
          colorClass = 'bg-green-600 text-green-50'
          break
        case 'inactive':
          colorClass = 'bg-gray-400 text-gray-50'
          break
        case 'suspended':
          colorClass = 'bg-red-700 text-red-50'
          break
      }

      const capitalizedStatus =
        status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()

      return (
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${colorClass}`}
        >
          {capitalizedStatus}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <MoreVerticalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
          <DropdownMenuItem>Nhân bản</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Vô hiệu hóa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
