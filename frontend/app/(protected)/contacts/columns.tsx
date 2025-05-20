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
import { MoreVerticalIcon, Check, X, MapPin } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { updateContact } from '@/api/contacts'
import { Contact } from '@/types/contact'
import { usePermission } from '@/hooks/usePermission'
import { AddressDialog } from '@/components/AddressDialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useContact } from '@/contexts/ContactContext'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const [open, setOpen] = useState(false)
  const { departments, locations, ranks } = useContact()

  const getOptions = () => {
    switch (column.id) {
      case 'department':
        return departments
      case 'location':
        return locations
      case 'rank':
        return ranks
      default:
        return []
    }
  }

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

  const handleAddressSave = async (newAddress: string) => {
    setEditValue(newAddress)
    setIsSaving(true)
    try {
      const updatedContact = { ...row.original, [column.id]: newAddress }
      await onSave(row.original.id, column.id, newAddress)
      onUpdate(updatedContact)
      setIsEditing(false)
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isEnabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="p-2 truncate">{value}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-[300px] break-words">{value}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  if (isEditing) {
    if (column.id === 'address') {
      return (
        <>
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
              className="h-8 w-8 shrink-0"
              onClick={() => setIsAddressDialogOpen(true)}
              disabled={isSaving}
            >
              <MapPin className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
          <AddressDialog
            isOpen={isAddressDialogOpen}
            onClose={() => setIsAddressDialogOpen(false)}
            onSave={handleAddressSave}
            initialAddress={editValue}
          />
        </>
      )
    }

    if (['department', 'location', 'rank'].includes(column.id)) {
      return (
        <div className="flex items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[200px] justify-between"
              >
                {editValue || "Chọn..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Tìm kiếm..." />
                <CommandEmpty>Không tìm thấy.</CommandEmpty>
                <CommandGroup>
                  {getOptions().map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      onSelect={(currentValue) => {
                        setEditValue(currentValue)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          editValue === option ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )
    }

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
          className="h-8 w-8 shrink-0"
          onClick={handleSave}
          disabled={isSaving}
        >
          <Check className="h-4 w-4 text-green-600" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 text-red-600" />
        </Button>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="cursor-pointer hover:bg-muted/50 p-2 rounded-md truncate"
            onClick={() => setIsEditing(true)}
          >
            {value}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-[300px] break-words">{value}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
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
    accessorKey: 'address',
    header: 'Địa chỉ',
    cell: ({ row, column }) => (
      <div className="max-w-[200px]">
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
      </div>
    ),
  },
  {
    accessorKey: 'military_postal_code',
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
    accessorKey: 'mobile_no',
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
      const { hasPermission } = usePermission()
      const canEdit = hasPermission('EDIT_CONTACTS')
      const canDelete = hasPermission('DELETE_CONTACTS')
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
            {canEdit && (
            <DropdownMenuItem onClick={() => router.push(`/contacts/edit/${contact.id}`)}>
              Chỉnh sửa
            </DropdownMenuItem>
            )}
            <DropdownMenuItem>Nhân bản</DropdownMenuItem>
            <DropdownMenuItem>Yêu thích</DropdownMenuItem>
            <DropdownMenuSeparator />
            {canDelete && (
            <DropdownMenuItem>Xóa</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
