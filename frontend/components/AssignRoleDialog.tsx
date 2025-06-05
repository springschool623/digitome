import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getAccounts } from '@/api/accounts'
import { getRoles } from '@/api/roles'
import { updateAccountRole } from '@/api/accounts'
import { Account } from '@/types/account'
import { Role } from '@/types/role'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AssignRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export default function AssignRoleDialog({
  open,
  onOpenChange,
  onSuccess,
}: AssignRoleDialogProps) {
  const [searchPhone, setSearchPhone] = useState('')
  const [foundAccount, setFoundAccount] = useState<Account | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<string>('')

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await getRoles()
        setRoles(rolesData)
      } catch (error) {
        console.error('Error fetching roles:', error)
        toast.error('Không thể lấy danh sách quyền')
      }
    }
    fetchRoles()
  }, [])

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchPhone('')
      setFoundAccount(null)
      setSelectedRole('')
    }
  }, [open])

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      toast.error('Vui lòng nhập số điện thoại')
      return
    }

    try {
      const accounts = await getAccounts()
      const account = accounts.find(
        (acc: Account) => acc.mobile_no === searchPhone
      )

      if (account) {
        setFoundAccount(account)
        setSelectedRole(account.role_id ? account.role_id.toString() : '')
      } else {
        toast.error('Không tìm thấy tài khoản với số điện thoại này')
        setFoundAccount(null)
        setSelectedRole('')
      }
    } catch (error) {
      console.error('Error searching account:', error)
      toast.error('Lỗi khi tìm kiếm tài khoản')
    }
  }

  const handleAssignRole = async () => {
    if (!foundAccount || !selectedRole) {
      toast.error('Vui lòng chọn quyền cho tài khoản')
      return
    }

    try {
      await updateAccountRole(foundAccount.id, parseInt(selectedRole))
      toast.success('Cập nhật quyền thành công')
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error assigning roles:', error)
      toast.error('Lỗi khi cập nhật quyền')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cấp quyền tài khoản</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                placeholder="Nhập số điện thoại..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
              <Button onClick={handleSearch}>Tìm kiếm</Button>
            </div>
          </div>

          {foundAccount && (
            <div className="space-y-4">
              <div className="text-sm">
                <p className="font-medium">Thông tin tài khoản:</p>
                <p>Số điện thoại: {foundAccount.mobile_no}</p>
                <p>Quyền hiện tại: {foundAccount.role_name || 'Chưa có'}</p>
              </div>

              <div className="space-y-2">
                <Label>Chọn quyền</Label>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <RadioGroup
                    value={selectedRole}
                    onValueChange={setSelectedRole}
                    className="space-y-2"
                  >
                    {roles.map((role) => (
                      <div
                        key={role.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={role.id.toString()}
                          id={`role-${role.id}`}
                        />
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {role.role_name}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </ScrollArea>
              </div>

              <Button
                className="w-full bg-blue-500 text-white hover:bg-blue-600"
                onClick={() => {
                  handleAssignRole()
                }}
              >
                Cập nhật quyền
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
