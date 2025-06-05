'use client'

import * as React from 'react'
import {
  // AudioWaveform,
  // Bot,
  // Command,
  // GalleryVerticalEnd,
  Map,
  Phone,
  PieChart,
  // BookOpen,
  // Settings2,
} from 'lucide-react'
import Image from 'next/image'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { TeamSwitcher } from './team-switcher'
// import { NavProjects } from './nav-projects'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'BỘ TƯ LỆNH TPHCM',
      logo: Image,
      plan: 'Enterprise',
    },
  ],
  navMain: [
    {
      title: 'Danh mục chính',
      url: '#',
      icon: Phone,
      isActive: true,
      items: [
        {
          title: 'Danh bạ quân sự',
          url: '/contacts',
        },
        {
          title: 'Phân quyền',
          url: '/accounts',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Danh bạ Điện thoại',
      url: '#',
      icon: Phone,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart,
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
