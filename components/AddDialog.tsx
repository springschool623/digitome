'use client'

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RefreshCcw } from 'lucide-react'

export default function AddDialog({ onReset }: { onReset?: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-700 text-white hover:bg-green-700 cursor-pointer">
          Thêm mới
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm liên hệ mới</DialogTitle>
        </DialogHeader>

        <div className="w-full flex flex-col gap-4 py-4">
          {/* Add form fields for new contact here */}
        </div>

        <DialogFooter className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onReset}>
            Làm mới
            <RefreshCcw className="ml-2 h-4 w-4" />
          </Button>
          <Button className="bg-green-700 text-white hover:bg-green-800">
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
