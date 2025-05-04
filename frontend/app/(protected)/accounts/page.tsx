'use client'

import { useEffect, useMemo, useState } from 'react'
import { columns, Account } from './columns'
import { DataTable } from './data-table'
import { SidebarInset } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'
import Header from '@/components/PageHeader'
import AddDialog from '@/components/AddDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createAccount, getAccounts } from '@/api/accounts'

const breadcrumbs = [
  { label: 'Dashboard', href: 'dashboard' },
  { label: 'Người dùng', href: 'users' },
  { label: 'Danh sách tài khoản' },
]

const initialNewAccount: Omit<Account, 'id'> = {
  mobile_phone: '',
  password: '',
  role_id: '',
  updated_at: '',
  created_by: '',
  status: '',
}

export default function AccountPage() {
  const [search, setSearch] = useState('')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [newAccount, setNewAccount] =
    useState<Omit<Account, 'id'>>(initialNewAccount)
  const [openAddDialog, setOpenAddDialog] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAccounts()
        setAccounts(data)
      } catch (error) {
        console.error('Lỗi khi lấy danh sách người dùng:', error)
      }
    }

    fetchData()
  }, [])

  const updateNewAccount = (field: keyof typeof newAccount, value: string) => {
    setNewAccount((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!newAccount.mobile_phone.trim() || !newAccount.password.trim()) {
      toast.error('Số điện thoại và mật khẩu là bắt buộc!', {
        style: { background: 'red', color: '#fff' },
        duration: 3000,
      })
      return
    }

    try {
      const data = await createAccount(newAccount)
      setAccounts((prev) => [...prev, data])
      setNewAccount(initialNewAccount)
      toast.success('Thêm người dùng thành công!', {
        style: { background: '#28a745', color: '#fff' },
        duration: 3000,
      })
      setOpenAddDialog(false)
    } catch (error) {
      console.error('Lỗi khi gửi dữ liệu:', error)
      toast.error('Đã xảy ra lỗi khi thêm người dùng!', {
        style: { background: 'red', color: '#fff' },
        duration: 3000,
      })
    }
  }

  const getFilteredAccounts = useMemo(() => {
    return accounts.filter((c) =>
      [c.mobile_phone, c.role_id, c.status, c.created_by, c.updated_at]
        .filter(Boolean)
        .some((val) => val.toLowerCase().includes(search.toLowerCase()))
    )
  }, [accounts, search])

  return (
    <SidebarInset>
      <Header breadcrumbs={breadcrumbs} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center justify-between my-4">
          <Input
            placeholder="Tìm kiếm người dùng..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-80"
          />

          <div className="flex items-center gap-4">
            <AddDialog
              title="Thêm người dùng mới"
              open={openAddDialog}
              onOpenChange={setOpenAddDialog}
              footer={
                <>
                  <Button
                    variant="outline"
                    onClick={() => setNewAccount(initialNewAccount)}
                  >
                    Làm mới
                    <RefreshCcw className="ml-2 h-4 w-4" />
                  </Button>
                  <Button
                    className="bg-green-700 text-white hover:bg-green-800"
                    onClick={handleSubmit}
                  >
                    Lưu
                  </Button>
                </>
              }
            >
              {(
                [
                  ['mobile_phone', 'Số điện thoại'],
                  ['password', 'Mật khẩu'],
                  ['role_id', 'Vai trò'],
                  ['updated_at', 'Cập nhật lúc'],
                  ['created_by', 'Tạo bởi'],
                  ['status', 'Trạng thái'],
                ] as const
              ).map(([field, label]) => (
                <div key={field} className="flex flex-col gap-2">
                  <Label htmlFor={field}>{label}</Label>
                  <Input
                    id={field}
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                    type={field === 'password' ? 'password' : 'text'}
                    value={newAccount[field]}
                    onChange={(e) => updateNewAccount(field, e.target.value)}
                  />
                </div>
              ))}
            </AddDialog>
          </div>
        </div>

        <DataTable columns={columns} data={getFilteredAccounts} />
      </div>
    </SidebarInset>
  )
}
