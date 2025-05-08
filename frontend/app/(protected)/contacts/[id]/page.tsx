'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SidebarInset } from '@/components/ui/sidebar'
import Header from '@/components/PageHeader'
import { toast } from 'sonner'
import { getContact, updateContact } from '@/api/contacts'
import type { Contact } from '../columns'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const breadcrumbs = [
  { label: 'Dashboard', href: 'dashboard' },
  { label: 'Danh bạ điện thoại', href: 'contacts' },
  { label: 'Chỉnh sửa liên hệ' },
]

export default function EditContactPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const data = await getContact(parseInt(params.id))
        setContact(data)
      } catch (error) {
        console.error('Lỗi khi lấy thông tin liên hệ:', error)
        toast.error('Không thể lấy thông tin liên hệ!')
      } finally {
        setLoading(false)
      }
    }

    fetchContact()
  }, [params.id])

  const handleChange = (field: keyof Contact, value: string) => {
    if (contact) {
      setContact({ ...contact, [field]: value })
    }
  }

  const handleSubmit = async () => {
    if (!contact) return

    // Kiểm tra giá trị bắt buộc
    if (!contact.manager.trim() || !contact.rank.trim()) {
      toast.error('Tên quản lý và cấp bậc là bắt buộc!', {
        style: {
          background: 'red',
          color: '#fff',
        },
        duration: 3000,
      })
      return
    }

    setSaving(true)
    try {
      await updateContact(contact.id, contact)
      toast.success('Cập nhật liên hệ thành công!', {
        style: {
          background: '#28a745',
          color: '#fff',
        },
        duration: 3000,
      })
      router.push('/contacts')
    } catch (error) {
      console.error('Lỗi khi cập nhật liên hệ:', error)
      toast.error('Đã xảy ra lỗi khi cập nhật liên hệ!', {
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
            <p className="text-muted-foreground">Đang tải thông tin liên hệ...</p>
          </div>
        </div>
      </SidebarInset>
    )
  }

  if (!contact) {
    return (
      <SidebarInset>
        <Header breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <p className="text-destructive text-lg">Không tìm thấy liên hệ</p>
            <Button
              variant="outline"
              onClick={() => router.push('/contacts')}
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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="max-w-2xl mx-auto w-full">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(
                    [
                      ['manager', 'Tên quản lý', true],
                      ['rank', 'Cấp bậc', true],
                      ['position', 'Chức vụ', false],
                      ['department', 'Phòng/Ban', false],
                      ['location', 'Đơn vị', false],
                      ['militaryPostalCode', 'Mã BĐQS', false],
                      ['mobile', 'Số điện thoại', false],
                    ] as const
                  ).map(([field, label, required]) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label htmlFor={field}>
                        {label}
                        {required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      <Input
                        id={field}
                        placeholder={`Nhập ${label.toLowerCase()}...`}
                        value={contact[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className={required ? 'border-primary' : ''}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/contacts')}
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