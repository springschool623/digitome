'use client'

import { Account } from '@/types/account'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { useState } from 'react'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'
import { toast } from 'sonner'
import { deleteAccount } from '@/api/accounts'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const DeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xác nhận xóa</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể
            hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ActionsCell = ({
  row,
  hasPermission,
  onStatusChange,
}: {
  row: { original: Account }
  hasPermission: (permission: string) => boolean
  onStatusChange: (id: number, newStatus: string) => void
}) => {
  const account = row.original
  const currentUser = useUser()
  const canEdit = hasPermission('EDIT_CONTACTS')
  const canDelete = hasPermission('DELETE_CONTACTS')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Hide delete button if this is the current user's account
  const showDeleteButton = canDelete && currentUser?.id !== account.id

  const handleDelete = async () => {
    try {
      await deleteAccount(account.id)
      toast.success('Vô hiệu hóa tài khoản thành công!', {
        style: {
          backgroundColor: '#000',
          color: '#fff',
        },
        duration: 3000,
      })
      setIsDeleteDialogOpen(false)
      onStatusChange(account.id, 'suspended')
    } catch (error) {
      console.error('Lỗi khi vô hiệu hóa:', error)
      toast.error('Có lỗi xảy ra khi vô hiệu hóa tài khoản', {
        style: {
          backgroundColor: '#000',
          color: '#fff',
        },
        duration: 3000,
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
            size="icon"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          {canEdit && (
            <DropdownMenuItem asChild>
              <Link
                href={`/accounts/edit/${account.id}`}
                className="cursor-pointer"
              >
                Chỉnh sửa
              </Link>
            </DropdownMenuItem>
          )}
          {canDelete && showDeleteButton && <DropdownMenuSeparator />}
          {showDeleteButton && (
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
              Vô hiệu hóa
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isDeleteDialogOpen && (
        <DeleteDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </>
  )
}

export const accountColumns = (
  hasPermission: (permission: string) => boolean,
  handleStatusChange: (id: number, newStatus: string) => void
): ColumnDef<Account>[] => [
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
    accessorKey: 'mobile_no',
    header: 'Số điện thoại',
  },
  {
    accessorKey: 'password',
    header: 'Mật khẩu',
    cell: () => <span className="italic text-muted-foreground">••••••••</span>, // Ẩn mật khẩu
  },
  {
    accessorKey: 'role_name',
    header: 'Quyền',
    cell: ({ row }) => {
      const role = row.original.role_name
      return (
        <div className="flex gap-1 uppercase">
          <Badge
            key={role}
            variant="secondary"
            className="py-1 px-2 rounded-md bg-violet-500 text-white"
          >
            {role}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'updated_at',
    header: 'Cập nhật lúc',
    cell: ({ row }) => {
      const date = new Date(row.getValue('updated_at'))
      return date.toLocaleString('vi-VN')
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
      switch (status) {
        case 'active':
          colorClass = 'bg-green-500 text-white'
          break
        case 'suspended':
          colorClass = 'bg-red-500 text-white'
          break
        case 'inactive':
          colorClass = 'bg-gray-400 text-white'
          break
        default:
          colorClass = 'bg-gray-200 text-black'
      }
      return (
        <span className={`px-3 py-1 rounded-md capitalize ${colorClass}`}>
          {status}
        </span>
      )
    },
  },
  {
    id: 'actions',
    header: 'Hành động',
    cell: ({ row }) => (
      <ActionsCell
        row={row}
        hasPermission={hasPermission}
        onStatusChange={handleStatusChange}
      />
    ),
  },
]
