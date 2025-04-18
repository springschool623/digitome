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

export type Contact = {
  id: number
  rank: string
  position: string
  manager: string
  department: string
  location: string
  militaryPostalCode: string
  mobile: string
}

export const columns: ColumnDef<Contact>[] = [
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
    header: 'STT',
  },
  {
    accessorKey: 'rank',
    header: 'Cấp bậc',
  },
  {
    accessorKey: 'position',
    header: 'Chức vụ',
  },
  {
    accessorKey: 'manager',
    header: 'Cán bộ quản lý',
  },
  {
    accessorKey: 'department',
    header: 'Phòng/Ban',
  },
  {
    accessorKey: 'location',
    header: 'Đơn vị',
  },
  {
    accessorKey: 'militaryPostalCode',
    header: 'Quân sự/Bưu điện',
  },
  {
    accessorKey: 'mobile',
    header: 'Di động',
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
          <DropdownMenuItem>Yêu thích</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Xóa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
