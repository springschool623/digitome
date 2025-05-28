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
import { Account } from '@/types/account'
import { ColumnDef } from '@tanstack/react-table'
import { MoreVerticalIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { deleteAccount } from '@/api/accounts'
import { toast } from 'sonner'
import { useUser } from '@/hooks/useUser'
import Link from 'next/link'

const DeleteDialog = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}) => {
  // Cleanup pointer-events khi dialog đóng hoặc component unmount
  useEffect(() => {
    if (!isOpen) {
      document.body.style.pointerEvents = ''
    }
    return () => {
      document.body.style.pointerEvents = ''
    }
  }, [isOpen])

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          document.body.style.pointerEvents = ''
          onClose()
        }
      }}
    >
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
            <MoreVerticalIcon />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          {canEdit && (
            <DropdownMenuItem>
              <Link href={`/accounts/edit/${account.id}`}>Chỉnh sửa</Link>
            </DropdownMenuItem>
          )}
          {canEdit && showDeleteButton && <DropdownMenuSeparator />}
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
  onStatusChange: (id: number, newStatus: string) => void
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
    header: 'SĐT',
  },
  {
    accessorKey: 'password',
    header: 'Mật khẩu',
    cell: () => <span className="italic text-muted-foreground">••••••••</span>, // Ẩn mật khẩu
  },
  {
    accessorKey: 'role_name',
    header: 'Quyền',
    cell: ({ row }) => {
      const name = row.getValue('role_name') as string
      return <span className="uppercase">{name}</span>
    },
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
    header: 'Hành động',
    cell: ({ row }) => (
      <ActionsCell
        row={row}
        hasPermission={hasPermission}
        onStatusChange={onStatusChange}
      />
    ),
  },
]
