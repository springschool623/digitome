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

interface FilterDialogProps {
  title?: string
  triggerLabel?: string
  children: ReactNode
  footer?: ReactNode
}

export default function FilterDialog({
  title = 'Bộ lọc nâng cao',
  triggerLabel = 'Bộ lọc nâng cao',
  children,
  footer,
}: FilterDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerLabel}</Button>
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
