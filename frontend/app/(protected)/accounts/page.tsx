'use client'

import { useEffect, useMemo, useState } from 'react'
import { accountColumns } from './columns'
import { roleColumns } from './roleColumns'
import { DataTable } from './data-table'
import { SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Plus, RefreshCcw } from 'lucide-react'
import Header from '@/components/PageHeader'
import AddDialog from '@/components/AddDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { getAccounts } from '@/api/accounts'
import { Account } from '@/types/account'
import { Role } from '@/types/role'
import { getRoles, createRole } from '@/api/roles'
import { TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tabs } from '@/components/ui/tabs'
import { usePermission } from '@/hooks/usePermission'

const breadcrumbs = [
  { label: 'Dashboard', href: 'dashboard' },
  { label: 'Danh mục chính' },
  { label: 'Danh sách tài khoản' },
]

const initialNewRole: Omit<Role, 'id'> = {
  role_name: '',
  role_description: '',
}

export default function AccountPage() {
  const { hasPermission } = usePermission()
  const [search, setSearch] = useState('')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [newRole, setNewRole] = useState<Omit<Role, 'id'>>(initialNewRole)
  const [openAddRoleDialog, setOpenAddRoleDialog] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const accounts_data = await getAccounts()
        const roles_data = await getRoles()
        setAccounts(accounts_data)
        setRoles(roles_data)
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error)
      }
    }

    fetchData()
  }, [])

  const updateNewRole = (field: keyof typeof newRole, value: string) => {
    setNewRole((prev) => ({ ...prev, [field]: value }))
  }

  const handleStatusChange = (id: number, newStatus: string) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, status: newStatus } : acc))
    )
  }

  const handleCreateRole = async () => {
    if (!newRole.role_name.trim()) {
      toast.error('Tên quyền là bắt buộc!', {
        style: { background: 'red', color: '#fff' },
        duration: 3000,
      })
      return
    }

    try {
      const data = await createRole(newRole)
      setRoles((prev) => [...prev, data])
      setNewRole(initialNewRole)
      toast.success('Thêm quyền thành công!', {
        style: { background: '#28a745', color: '#fff' },
        duration: 3000,
      })
      setOpenAddRoleDialog(false)
    } catch (error) {
      console.error('Lỗi khi thêm quyền:', error)
      toast.error('Đã xảy ra lỗi khi thêm quyền!', {
        style: { background: 'red', color: '#fff' },
        duration: 3000,
      })
    }
  }

  const getFilteredAccounts = useMemo(() => {
    return accounts.filter((c) =>
      [c.mobile_no, c.status, c.created_by_name, c.updated_at]
        .filter(Boolean)
        .map(String)
        .some((val) => val.toLowerCase().includes(search.toLowerCase()))
    )
  }, [accounts, search])

  return (
    <SidebarInset>
      <Header breadcrumbs={breadcrumbs} />
      <Tabs defaultValue="accounts">
        <TabsList className="px-4">
          <TabsTrigger value="accounts">Tài Khoản</TabsTrigger>
          <TabsTrigger value="roles">Phân Quyền</TabsTrigger>
        </TabsList>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="flex items-center justify-between mt-2">
            <Input
              placeholder="Tìm kiếm người dùng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-80"
            />
            <div className="flex gap-2">
              {hasPermission('ASSIGN_ROLES') && accounts[0] && (
                <Button
                  variant="outline"
                  className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                >
                  <Plus />
                  Cấp quyền tài khoản
                </Button>
              )}
              {hasPermission('CREATE_ROLES') && (
                <AddDialog
                  title="Thêm quyền mới"
                  open={openAddRoleDialog}
                  onOpenChange={setOpenAddRoleDialog}
                  footer={
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setNewRole(initialNewRole)}
                      >
                        Làm mới
                        <RefreshCcw className="ml-2 h-4 w-4" />
                      </Button>
                      <Button
                        className="bg-green-500 text-white hover:bg-green-600"
                        onClick={handleCreateRole}
                      >
                        Lưu
                      </Button>
                    </>
                  }
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Tên quyền</Label>
                      <Input
                        id="name"
                        placeholder="Nhập tên quyền..."
                        value={newRole.role_name}
                        onChange={(e) =>
                          updateNewRole('role_name', e.target.value)
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="description">Mô tả</Label>
                      <Input
                        id="description"
                        placeholder="Nhập mô tả..."
                        value={newRole.role_description}
                        onChange={(e) =>
                          updateNewRole('role_description', e.target.value)
                        }
                      />
                    </div>
                  </div>
                </AddDialog>
              )}
            </div>
          </div>
          <TabsContent value="accounts">
            {hasPermission('VIEW_ACCOUNTS') ? (
              <DataTable
                columns={accountColumns(hasPermission, handleStatusChange)}
                data={getFilteredAccounts}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Bạn không có quyền xem danh sách tài khoản
              </div>
            )}
          </TabsContent>
          <TabsContent value="roles">
            {hasPermission('VIEW_ROLES') ? (
              <DataTable columns={roleColumns} data={roles} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Bạn không có quyền xem danh sách quyền
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </SidebarInset>
  )
}
