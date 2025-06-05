'use client';

import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@repo/ui/components/sidebar';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';

// This is sample data.
export const data = {
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
      title: '社員管理',
      url: '/employees',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: '社員一覧',
          url: '/employees',
        },
        {
          title: '部署管理',
          url: '/employees/departments',
        },
        {
          title: '権限設定',
          url: '/employees/permissions',
        },
      ],
    },
    {
      title: 'Playground',
      url: '/playground',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'History',
          url: '/playground/history',
        },
        {
          title: 'Starred',
          url: '/playground/starred',
        },
        {
          title: 'Settings',
          url: '/playground/settings',
        },
      ],
    },
    {
      title: 'Models',
      url: '/models',
      icon: Bot,
      isActive: true,
      items: [
        {
          title: 'Genesis',
          url: '/models/genesis',
        },
        {
          title: 'Explorer',
          url: '/models/explorer',
        },
        {
          title: 'Quantum',
          url: '/models/quantum',
        },
      ],
    },
    {
      title: 'Documentation',
      url: '/docs',
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: 'Introduction',
          url: '/docs/introduction',
        },
        {
          title: 'Get Started',
          url: '/docs/get-started',
        },
        {
          title: 'Tutorials',
          url: '/docs/tutorials',
        },
        {
          title: 'Changelog',
          url: '/docs/changelog',
        },
      ],
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings2,
      isActive: true,
      items: [
        {
          title: 'General',
          url: '/settings/general',
        },
        {
          title: 'Team',
          url: '/settings/team',
        },
        {
          title: 'Billing',
          url: '/settings/billing',
        },
        {
          title: 'Limits',
          url: '/settings/limits',
        },
      ],
    },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame,
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
};

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
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
