'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SidebarInset } from '@/components/ui/sidebar'
import Header from '@/components/PageHeader'
import { toast } from 'sonner'
import { getAccount, updateAccount } from '@/api/accounts'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Account } from '@/types/account'
import React from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRoles } from '@/api/roles'

const breadcrumbs = [
  { label: 'Dashboard', href: 'dashboard' },
  { label: 'Quản lý tài khoản', href: 'accounts' },
  { label: 'Chỉnh sửa tài khoản' },
]

function EditAccountContent({ id }: { id: string }) {
  const router = useRouter()
  const [account, setAccount] = useState<Account | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [openSelect, setOpenSelect] = useState<string | null>(null)
  const [roles, setRoles] = useState<{ id: number; role_name: string }[]>([])
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({
    role_name: '',
    status_name: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [accountData, rolesData] = await Promise.all([
          getAccount(parseInt(id)),
          getRoles(),
        ])

        if (!accountData) {
          throw new Error('Account not found')
        }

        setAccount(accountData)
        setRoles(rolesData)
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error)
        toast.error('Không thể lấy thông tin tài khoản!')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Add new effect to update displayNames when account is loaded
  useEffect(() => {
    if (account) {
      const newDisplayNames: Record<string, string> = {}

      // Update role name
      const role = roles.find((r) => r.id === Number(account.role_id))
      if (role) newDisplayNames.role_name = role.role_name

      // Update status name
      const statusMap: Record<string, string> = {
        active: 'Hoạt động',
        inactive: 'Không hoạt động',
        suspended: 'Tạm ngưng',
      }
      newDisplayNames.status_name = statusMap[account.status] || account.status

      setDisplayNames(newDisplayNames)
    }
  }, [account, roles])

  const handleChange = (field: keyof Account, value: string | number) => {
    if (account) {
      setAccount({ ...account, [field]: value })
    }
  }

  const handleSubmit = async () => {
    if (!account) return

    // Kiểm tra giá trị bắt buộc
    if (!account.mobile_no.trim() || !account.role_id) {
      toast.error('Số điện thoại và quyền là bắt buộc!', {
        style: {
          background: 'red',
          color: '#fff',
        },
        duration: 3000,
      })
      return
    }

    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(account.mobile_no)) {
      toast.error(
        'Số điện thoại không hợp lệ! Vui lòng nhập số điện thoại 10-11 số.',
        {
          style: {
            background: 'red',
            color: '#fff',
          },
          duration: 3000,
        }
      )
      return
    }

    setSaving(true)
    try {
      // TODO: Implement updateAccount API call
      await updateAccount(account.id, account)

      toast.success('Cập nhật tài khoản thành công!', {
        style: {
          background: '#28a745',
          color: '#fff',
        },
        duration: 3000,
      })
      router.push('/accounts')
    } catch (error) {
      console.error('Lỗi khi cập nhật tài khoản:', error)
      toast.error('Đã xảy ra lỗi khi cập nhật tài khoản!', {
        style: {
          background: 'red',
          color: '#fff',
        },
        duration: 3000,
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Đang tải thông tin tài khoản...
            </p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  if (!account) {
    return (
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <p className="text-destructive text-lg">Không tìm thấy tài khoản</p>
            <Button
              variant="outline"
              onClick={() => router.push('/accounts')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </div>
        </div>
      </SidebarInset>
    )
  }

  return (
    <SidebarInset>
      <Header breadcrumbs={breadcrumbs} />
      <div className="h-full flex items-center gap-4 p-4 pt-0">
        <div className="max-w-2xl mx-auto w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Thông tin tài khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(
                    [
                      ['mobile_no', 'Số điện thoại', true, 'input'],
                      ['password', 'Mật khẩu', true, 'input'],
                      ['role_id', 'Quyền', true, 'select'],
                      ['status', 'Trạng thái', true, 'select'],
                    ] as const
                  ).map(([field, label, required, type]) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label htmlFor={field}>
                        {label}
                        {required && (
                          <span className="text-destructive">*</span>
                        )}
                      </Label>
                      {type === 'select' ? (
                        <Popover
                          open={openSelect === field}
                          onOpenChange={(isOpen) =>
                            setOpenSelect(isOpen ? field : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openSelect === field}
                              className={cn('w-full justify-between')}
                            >
                              {displayNames[
                                `${
                                  field.split('_')[0]
                                }_name` as keyof typeof displayNames
                              ] || 'Chọn...'}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Tìm kiếm..." />
                              <CommandEmpty>Không tìm thấy.</CommandEmpty>
                              <CommandGroup>
                                {(field === 'role_id'
                                  ? roles
                                  : field === 'status'
                                  ? [
                                      { id: 'active', role_name: 'Hoạt động' },
                                      {
                                        id: 'inactive',
                                        role_name: 'Không hoạt động',
                                      },
                                      {
                                        id: 'suspended',
                                        role_name: 'Tạm ngưng',
                                      },
                                    ]
                                  : []
                                ).map((option) => (
                                  <CommandItem
                                    key={option.id}
                                    value={option.role_name}
                                    onSelect={(currentValue) => {
                                      const selectedOption = (
                                        field === 'role_id'
                                          ? roles
                                          : field === 'status'
                                          ? [
                                              {
                                                id: 'active',
                                                role_name: 'Hoạt động',
                                              },
                                              {
                                                id: 'inactive',
                                                role_name: 'Không hoạt động',
                                              },
                                              {
                                                id: 'suspended',
                                                role_name: 'Tạm ngưng',
                                              },
                                            ]
                                          : []
                                      ).find(
                                        (item) =>
                                          item.role_name === currentValue
                                      )

                                      if (selectedOption) {
                                        handleChange(field, selectedOption.id)
                                        setDisplayNames((prev) => ({
                                          ...prev,
                                          [`${field.split('_')[0]}_name`]:
                                            selectedOption.role_name,
                                        }))
                                      }
                                      setOpenSelect(null)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        displayNames[
                                          `${field.split('_')[0]}_name`
                                        ] === option.role_name
                                          ? 'opacity-100'
                                          : 'opacity-0'
                                      )}
                                    />
                                    {option.role_name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input
                          id={field}
                          type={field === 'password' ? 'password' : 'text'}
                          placeholder={`Nhập ${label.toLowerCase()}...`}
                          value={account?.[field]}
                          onChange={(e) => handleChange(field, e.target.value)}
                          className={required ? 'border-primary' : ''}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/accounts')}
                    className="gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                  </Button>
                  <Button
                    className="bg-green-700 text-white hover:bg-green-800 gap-2"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      'Lưu thay đổi'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarInset>
  )
}

export default function EditAccountPage(unwrappedProps: {
  params: Promise<{ id: string }>
}) {
  const { id } = React.use(unwrappedProps.params)

  return <EditAccountContent id={id} />
}
