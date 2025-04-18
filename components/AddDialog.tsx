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
import { ReactNode } from 'react'

interface AddDialogProps {
  title: string
  triggerLabel?: string
  onReset?: () => void
  onSubmit?: () => void
  children?: ReactNode // nội dung form tuỳ biến
  footer?: ReactNode // hiển thị nút làm mới và lưu
}

export default function AddDialog({
  title,
  triggerLabel = 'Thêm mới',
  children,
  footer,
}: AddDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-700 text-white hover:bg-green-700 cursor-pointer">
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="w-full flex flex-col gap-4 py-4">{children}</div>

        {footer && (
          <DialogFooter className="mt-4 flex justify-end">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}
