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
  Package,
  PieChart,
  Settings2,
  ShoppingBag,
  SquareTerminal,
  Truck,
  Users,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
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
      name: 'ECサイト運営',
      logo: GalleryVerticalEnd,
      plan: 'メインサイト',
    },
    {
      name: 'サブサイト',
      logo: AudioWaveform,
      plan: 'テスト環境',
    },
  ],
  navMain: [
    {
      title: 'ダッシュボード',
      url: '/',
      icon: SquareTerminal,
      isActive: true,
      // items: [],
    },
    {
      title: '商品管理',
      url: '/products',
      icon: Package,
      isActive: false,
      items: [
        {
          title: '商品一覧',
          url: '/products',
        },
        {
          title: '商品登録',
          url: '/products/create',
        },
        {
          title: 'カテゴリ管理',
          url: '/products/categories',
        },
        {
          title: 'サプライヤー管理',
          url: '/products/suppliers',
        },
      ],
    },
    {
      title: '注文管理',
      url: '/orders',
      icon: ShoppingBag,
      isActive: false,
      items: [
        {
          title: '注文一覧',
          url: '/orders',
        },
        {
          title: '注文検索',
          url: '/orders/search',
        },
        {
          title: 'ステータス管理',
          url: '/orders/status',
        },
      ],
    },
    {
      title: '配送管理',
      url: '/shipments',
      icon: Truck,
      isActive: false,
      items: [
        {
          title: '配送一覧',
          url: '/shipments',
        },
        {
          title: '配送準備',
          url: '/shipments/prepare',
        },
        {
          title: '追跡管理',
          url: '/shipments/tracking',
        },
      ],
    },
    {
      title: '顧客管理',
      url: '/customers',
      icon: Users,
      isActive: false,
      items: [
        {
          title: '顧客一覧',
          url: '/customers',
        },
        {
          title: '注文履歴',
          url: '/customers/orders',
        },
      ],
    },
    {
      title: '設定',
      url: '/settings',
      icon: Settings2,
      isActive: false,
      items: [
        {
          title: '一般設定',
          url: '/settings/general',
        },
        {
          title: '支払い方法',
          url: '/settings/payments',
        },
        {
          title: '配送設定',
          url: '/settings/delivery',
        },
        {
          title: 'サイト管理',
          url: '/settings/sites',
        },
      ],
    },
  ],
  projects: [
    {
      name: '売上分析',
      url: '/analytics',
      icon: PieChart,
    },
    {
      name: 'レポート',
      url: '/reports',
      icon: Frame,
    },
    {
      name: '在庫管理',
      url: '/inventory',
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
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
