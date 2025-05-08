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
import { MoreVerticalIcon, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { updateContact } from '@/api/contacts'
import { Contact } from '@/types/contact'

type EditableCellProps = {
  value: string
  row: { original: Contact }
  column: { id: string }
  onSave: (id: number, field: string, value: string) => Promise<void>
  onUpdate: (updatedContact: Contact) => void
  isEnabled: boolean
}

const EditableCell = ({ value, row, column, onSave, onUpdate, isEnabled }: EditableCellProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const updatedContact = { ...row.original, [column.id]: editValue }
      await onSave(row.original.id, column.id, editValue)
      onUpdate(updatedContact)
      setIsEditing(false)
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  if (!isEnabled) {
    return <div className="p-2">{value}</div>
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="h-8"
          disabled={isSaving}
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <div
      className="cursor-pointer hover:bg-muted/50 p-2 rounded-md"
      onClick={() => setIsEditing(true)}
    >
      {value}
    </div>
  )
}

export const contactColumns = (
  onUpdateContact: (updatedContact: Contact) => void,
  isInlineEditEnabled: boolean
): ColumnDef<Contact>[] => [
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
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue(column.id)}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original
          await updateContact(id, { ...contact, [field]: value })
          toast.success('Cập nhật thành công!')
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
      />
    ),
  },
  {
    accessorKey: 'position',
    header: 'Chức vụ',
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue(column.id)}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original
          await updateContact(id, { ...contact, [field]: value })
          toast.success('Cập nhật thành công!')
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
      />
    ),
  },
  {
    accessorKey: 'manager',
    header: 'Cán bộ quản lý',
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue(column.id)}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original
          await updateContact(id, { ...contact, [field]: value })
          toast.success('Cập nhật thành công!')
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
      />
    ),
  },
  {
    accessorKey: 'department',
    header: 'Phòng/Ban',
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue(column.id)}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original
          await updateContact(id, { ...contact, [field]: value })
          toast.success('Cập nhật thành công!')
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
      />
    ),
  },
  {
    accessorKey: 'location',
    header: 'Đơn vị',
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue(column.id)}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original
          await updateContact(id, { ...contact, [field]: value })
          toast.success('Cập nhật thành công!')
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
      />
    ),
  },
  {
    accessorKey: 'militaryPostalCode',
    header: 'Quân sự/Bưu điện',
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue(column.id)}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original
          await updateContact(id, { ...contact, [field]: value })
          toast.success('Cập nhật thành công!')
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
      />
    ),
  },
  {
    accessorKey: 'mobile',
    header: 'Di động',
    cell: ({ row, column }) => (
      <EditableCell
        value={row.getValue(column.id)}
        row={row}
        column={column}
        onSave={async (id, field, value) => {
          const contact = row.original
          await updateContact(id, { ...contact, [field]: value })
          toast.success('Cập nhật thành công!')
        }}
        onUpdate={onUpdateContact}
        isEnabled={isInlineEditEnabled}
      />
    ),
  },
  {
    id: 'actions',
    header: 'Hành động',
    cell: ({ row }) => {
      const router = useRouter()
      const contact = row.original

      return (
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
            <DropdownMenuItem onClick={() => router.push(`/contacts/${contact.id}`)}>
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem>Nhân bản</DropdownMenuItem>
            <DropdownMenuItem>Yêu thích</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Xóa</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
