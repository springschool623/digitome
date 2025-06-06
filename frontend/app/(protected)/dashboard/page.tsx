'use client'
import Header from '@/components/PageHeader'
import { SidebarInset } from '@/components/ui/sidebar'
import { useUser } from '@/hooks/useUser'

const breadcrumbs = [{ label: 'Dashboard', href: 'dashboard' }]

export default function Page() {
  const user = useUser()

  return (
    <SidebarInset>
      <Header breadcrumbs={breadcrumbs} />

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        <div>{user ? user.role : 'No user found'}</div>
      </div>
    </SidebarInset>
  )
}
