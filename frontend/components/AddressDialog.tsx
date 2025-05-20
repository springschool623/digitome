'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { provinces, districts, wards } from 'vietnam-provinces'

interface AddressDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (address: string) => void
  initialAddress?: string
}

export function AddressDialog({ isOpen, onClose, onSave, initialAddress = '' }: AddressDialogProps) {
  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedWard, setSelectedWard] = useState('')
  const [street, setStreet] = useState('')

  const handleSave = () => {
    const province = provinces.find(p => p.code === selectedProvince)?.name || ''
    const district = districts.find(d => d.code === selectedDistrict)?.name || ''
    const ward = wards.find(w => w.code === selectedWard)?.name || ''
    
    const fullAddress = [street, ward, district, province]
      .filter(Boolean)
      .join(', ')
    
    onSave(fullAddress)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chọn địa chỉ</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label>Tỉnh/Thành phố</label>
            <Select value={selectedProvince} onValueChange={setSelectedProvince}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn tỉnh/thành phố" />
              </SelectTrigger>
              <SelectContent>
                {provinces.map((province) => (
                  <SelectItem key={province.code} value={province.code}>
                    {province.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label>Quận/Huyện</label>
            <Select 
              value={selectedDistrict} 
              onValueChange={setSelectedDistrict}
              disabled={!selectedProvince}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn quận/huyện" />
              </SelectTrigger>
              <SelectContent>
                {districts
                  .filter(district => district.province_code === selectedProvince)
                  .map((district) => (
                    <SelectItem key={district.code} value={district.code}>
                      {district.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label>Phường/Xã</label>
            <Select 
              value={selectedWard} 
              onValueChange={setSelectedWard}
              disabled={!selectedDistrict}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn phường/xã" />
              </SelectTrigger>
              <SelectContent>
                {wards
                  .filter(ward => ward.district_code === selectedDistrict)
                  .map((ward) => (
                    <SelectItem key={ward.code} value={ward.code}>
                      {ward.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <label>Số nhà, tên đường</label>
            <Input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Nhập số nhà, tên đường"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 