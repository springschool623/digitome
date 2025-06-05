import { AppSidebar } from '@/components/app-sidebar'
import { AppBanner } from '@/components/app-banner'
// import { LogPanel } from '@/components/LogPanel'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <AppBanner />
        {children}
        {/* <LogPanel /> */}
      </div>
    </>
  )
}
