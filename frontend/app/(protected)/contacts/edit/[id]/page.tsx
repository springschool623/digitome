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
import { Loader2, ArrowLeft, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Contact } from '@/types/contact'
import React from 'react'
import { useContact, ContactProvider } from '@/contexts/ContactContext'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddressDialog } from '@/components/AddressDialog'

const breadcrumbs = [
  { label: 'Dashboard', href: 'dashboard' },
  { label: 'Danh bạ điện thoại', href: 'contacts' },
  { label: 'Chỉnh sửa liên hệ' },
]

function EditContactContent({ id }: { id: string }) {
  const router = useRouter()
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false)
  const { departments, locations, ranks } = useContact()

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const data = await getContact(parseInt(id))
        setContact(data)
      } catch (error) {
        console.error('Lỗi khi lấy thông tin liên hệ:', error)
        toast.error('Không thể lấy thông tin liên hệ!')
      } finally {
        setLoading(false)
      }
    }

    fetchContact()
  }, [id])

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

  const handleAddressSave = (newAddress: string) => {
    if (contact) {
      setContact({ ...contact, address: newAddress })
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
      <div className="h-full flex items-center gap-4 p-4 pt-0">
        <div className="max-w-2xl mx-auto w-full">
          <Card>
            <CardHeader>
              <CardTitle className='text-xl'>Thông tin liên hệ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(
                    [
                      ['manager', 'Tên quản lý', true, 'input'],
                      ['rank', 'Cấp bậc', true, 'select'],
                      ['position', 'Chức vụ', false, 'input'],
                      ['department', 'Phòng/Ban', false, 'select'],
                      ['location', 'Đơn vị', false, 'select'],
                      ['military_postal_code', 'Mã BĐQS', false, 'input'],
                      ['mobile_no', 'Số điện thoại', true, 'input'],
                      ['address', 'Địa chỉ', false, 'address'],
                    ] as const
                  ).map(([field, label, required, type]) => (
                    <div key={field} className="flex flex-col gap-2">
                      <Label htmlFor={field}>
                        {label}
                        {required && <span className="text-destructive">*</span>}
                      </Label>
                      {type === 'select' ? (
                        <Popover open={open === field} onOpenChange={(isOpen) => setOpen(isOpen ? field : null)}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={open === field}
                              className="w-full justify-between"
                            >
                              {contact?.[field] || "Chọn..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Tìm kiếm..." />
                              <CommandEmpty>Không tìm thấy.</CommandEmpty>
                              <CommandGroup>
                                {(field === 'department' ? departments :
                                  field === 'location' ? locations :
                                  field === 'rank' ? ranks : []).map((option) => (
                                  <CommandItem
                                    key={option}
                                    value={option}
                                    onSelect={(currentValue) => {
                                      handleChange(field, currentValue)
                                      setOpen(null)
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        contact?.[field] === option ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {option}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      ) : type === 'address' ? (
                        <div className="flex gap-2">
                          <Input
                            id={field}
                            placeholder={`Nhập ${label.toLowerCase()}...`}
                            value={contact?.[field]}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className={required ? 'border-primary' : ''}
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setIsAddressDialogOpen(true)}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Input
                          id={field}
                          placeholder={`Nhập ${label.toLowerCase()}...`}
                          value={contact?.[field]}
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
      {contact && (
        <AddressDialog
          isOpen={isAddressDialogOpen}
          onClose={() => setIsAddressDialogOpen(false)}
          onSave={handleAddressSave}
          initialAddress={contact.address}
        />
      )}
    </SidebarInset>
  )
}

export default function EditContactPage(unwrappedProps: { params: Promise<{ id: string }> }) {
  const { id } = React.use(unwrappedProps.params)
  
  return (
    <ContactProvider>
      <EditContactContent id={id} />
    </ContactProvider>
  )
} 