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
import { Role } from '@/types/role'
import { ColumnDef } from '@tanstack/react-table'
import { Edit, MoreVerticalIcon, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useEffect, useState } from 'react'
import { getPermissions } from '@/api/permissions'
import { Label } from '@/components/ui/label'
import { Permission } from '@/types/permission'
import { usePermission } from '@/hooks/usePermission'

export const accountColumns: ColumnDef<Account>[] = [
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
    cell: () => {
      const { hasPermission } = usePermission()
      const canEdit = hasPermission('EDIT_ACCOUNTS')
      const canDelete = hasPermission('DELETE_ACCOUNTS')
  
      if (!canEdit && !canDelete) return null
  
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
            {canEdit && <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>}
            {canEdit && canDelete && <DropdownMenuSeparator />}
            {canDelete && <DropdownMenuItem>Vô hiệu hóa</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  }
  
]

export const roleColumns: ColumnDef<Role>[] = [
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
    accessorKey: 'role_name',
    header: 'Tên quyền',
    cell: ({ row }) => {
      const name = row.getValue('role_name') as string
      return <span className="uppercase">{name}</span>
    },
  },
  {
    accessorKey: 'role_description',
    header: 'Mô tả',
  },
  {
    id: 'actions',
    header: 'Hành động',
    cell: ({ row }) => {
      const name = row.getValue('role_name') as string
      const [permissions, setPermissions] = useState<Permission[]>([])
      const [selectedPermissions, setSelectedPermissions] = useState<number[]>([])
      const { hasPermission } = usePermission()
      const canEdit = hasPermission('EDIT_ROLES')
      const canAssignPermissions = hasPermission('ASSIGN_ROLES')


      useEffect(() => {
        const fetchPermissions = async () => {
          try {
            const data = await getPermissions()
            setPermissions(data)
          } catch (error) {
            console.error('Error fetching permissions:', error)
          }
        }
        fetchPermissions()
      }, [])

      const handlePermissionChange = (permissionId: number) => {
        setSelectedPermissions(prev => 
          prev.includes(permissionId)
            ? prev.filter(id => id !== permissionId)
            : [...prev, permissionId]
        )
      }

      // Group permissions by category
      const groupedPermissions = permissions.reduce((acc, permission) => {
        const category = permission.permission_category
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(permission)
        return acc
      }, {} as Record<string, Permission[]>)

      return (
        <div className="flex items-center gap-2">            
        {canEdit && (
          <Button variant="outline" size="sm" className='bg-yellow-500 text-white hover:text-white hover:bg-yellow-600'>
            <Edit/>
            <span>Sửa</span>
          </Button>
          )}
          <Dialog>
            {canAssignPermissions && (
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus/>
                <span>Chức năng</span>
              </Button>
            </DialogTrigger>
            )}
            <DialogContent className="max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className='font-bold border-b pb-4'>Cập nhật chức năng cho quyền: <span className='uppercase'>{name}</span></DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-6">
                {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                  <div key={category} className="flex flex-col gap-2">
                    <h3 className="font-semibold text-lg">{category}</h3>
                    <div className="flex flex-col gap-2">
                      {categoryPermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`permission-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionChange(permission.id)}
                          />
                          <div className="flex flex-col gap-1">
                            <Label htmlFor={`permission-${permission.id}`} className="flex flex-col">
                              <span className="text-sm text-muted-foreground">{permission.permission_name}</span>
                            </Label>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <DialogFooter className='mt-2 flex justify-end'>
                <Button variant="outline" type="button" onClick={() => setSelectedPermissions([])}>Làm mới</Button>
                <Button type="submit">Cập nhật</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )
    },
  },
]