'use client'

import * as React from 'react'
import {
  AudioWaveform,
  // Bot,
  Command,
  GalleryVerticalEnd,
  Map,
  Phone,
  PieChart,
  // BookOpen,
  // Settings2,
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
// import { NavProjects } from './nav-projects'
import { TeamSwitcher } from './team-switcher'

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: Command,
      plan: 'Free',
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
        // {
        //   title: 'Starred',
        //   url: '#',
        // },
        // {
        //   title: 'Settings',
        //   url: '#',
        // },
      ],
    },
    // {
    //   title: 'Chức năng phụ',
    //   url: '#',
    //   icon: Bot,
    //   items: [
    //     {
    //       title: 'Phân quyền',
    //       url: '/accounts',
    //     },
    //     // {
    //     //   title: 'Explorer',
    //     //   url: '#',
    //     // },
    //     // {
    //     //   title: 'Quantum',
    //     //   url: '#',
    //     // },
    //   ],
    // },
    // {
    //   title: 'Documentation',
    //   url: '#',
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: 'Introduction',
    //       url: '#',
    //     },
    //     {
    //       title: 'Get Started',
    //       url: '#',
    //     },
    //     {
    //       title: 'Tutorials',
    //       url: '#',
    //     },
    //     {
    //       title: 'Changelog',
    //       url: '#',
    //     },
    //   ],
    // },
    // {
    //   title: 'Settings',
    //   url: '#',
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: 'General',
    //       url: '#',
    //     },
    //     {
    //       title: 'Team',
    //       url: '#',
    //     },
    //     {
    //       title: 'Billing',
    //       url: '#',
    //     },
    //     {
    //       title: 'Limits',
    //       url: '#',
    //     },
    //   ],
    // },
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
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
