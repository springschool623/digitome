// components/Header.tsx
import React from 'react'
import { SidebarTrigger } from './ui/sidebar'
import { Separator } from '@radix-ui/react-separator'
import { Crumb, DynamicBreadcrumb } from './DynamicBreadCrumb'

type HeaderProps = {
  breadcrumbs: Crumb[]
}

const Header = ({ breadcrumbs }: HeaderProps) => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <DynamicBreadcrumb items={breadcrumbs} />
      </div>
    </header>
  )
}

export default Header
