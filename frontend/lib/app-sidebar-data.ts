// app-sidebar-data.ts

import {
  AudioWaveform,
  Bot,
  Command,
  GalleryVerticalEnd,
  Map,
  Phone,
  PieChart,
} from 'lucide-react'

export const sidebarData = {
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
      title: 'Danh bạ Điện thoại',
      url: '#',
      icon: Phone,
      isActive: true,
      items: [
        {
          title: 'Danh mục chính',
          url: '/contacts',
        },
        {
          title: 'Starred',
          url: '#',
        },
        {
          title: 'Settings',
          url: '#',
        },
      ],
    },
    {
      title: 'Chức năng phụ',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Phân quyền',
          url: '/accounts',
        },
        {
          title: 'Explorer',
          url: '#',
        },
        {
          title: 'Quantum',
          url: '#',
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
