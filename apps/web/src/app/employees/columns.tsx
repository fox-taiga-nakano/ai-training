'use client';

import { Badge, badgeVariants } from '@repo/components/badge';
import { Button } from '@repo/components/button';
import { Checkbox } from '@repo/components/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { type VariantProps } from 'class-variance-authority';
import { ArrowUpDown } from 'lucide-react';

/**
 * 社員データの型定義
 */
export type Employee = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'suspended' | 'invited';
  role: 'admin' | 'manager' | 'cashier' | 'superadmin';
};

// ステータスに応じたバリアントマッピング
const statusVariants = {
  active: 'default', // 緑色 (デフォルト)
  inactive: 'secondary', // グレー
  suspended: 'destructive', // 赤色
  invited: 'outline', // 青色
};

// ステータスラベル
const statusLabels = {
  active: '有効',
  inactive: '無効',
  suspended: '停止中',
  invited: '招待中',
};
/**
 * ステータスに応じたバッジコンポーネント
 */
function StatusBadge({ status }: { status: Employee['status'] }) {
  return (
    <Badge
      variant={
        statusVariants[status] as VariantProps<typeof badgeVariants>['variant']
      }
    >
      {statusLabels[status]}
    </Badge>
  );
}

// 役割に応じたバリアントマッピング
const roleVariants = {
  admin: 'default', // 管理者
  manager: 'secondary', // マネージャー
  cashier: 'outline', // キャッシャー
  superadmin: 'destructive', // 特権管理者
};

// 役割ラベル
const roleLabels = {
  admin: '管理者',
  manager: 'マネージャー',
  cashier: 'キャッシャー',
  superadmin: '特権管理者',
};

/**
 * 役割に応じたバッジコンポーネント
 */
function RoleBadge({ role }: { role: Employee['role'] }) {
  return (
    <Badge
      variant={
        roleVariants[role] as VariantProps<typeof badgeVariants>['variant']
      }
    >
      {roleLabels[role]}
    </Badge>
  );
}

/**
 * カラム定義
 *
 * TanStack Tableで使用するカラム定義を行います。
 * 各カラムの表示方法やソート方法などを定義します。
 */
export const columns: ColumnDef<Employee>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: '名前',
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.name}</div>
        <div className="text-sm text-gray-500">{row.original.username}</div>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        メールアドレス
        <ArrowUpDown />
      </Button>
    ),
  },
  {
    accessorKey: 'phone',
    header: '電話番号',
  },
  {
    accessorKey: 'status',
    header: 'ステータス',
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'role',
    header: '役割',
    cell: ({ row }) => <RoleBadge role={row.original.role} />,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: () => {
      return (
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            編集
          </Button>
          <Button variant="destructive" size="sm">
            削除
          </Button>
        </div>
      );
    },
  },
];

/**
 * サンプル社員データ
 */
export const data: Employee[] = [
  {
    id: '1',
    name: '山田 太郎',
    username: 'yamada_taro',
    email: 'taro.yamada@example.com',
    phone: '+81-90-1234-5678',
    status: 'active',
    role: 'admin',
  },
  {
    id: '2',
    name: '佐藤 花子',
    username: 'sato_hanako',
    email: 'hanako.sato@example.com',
    phone: '+81-80-8765-4321',
    status: 'active',
    role: 'manager',
  },
  {
    id: '3',
    name: '鈴木 一郎',
    username: 'suzuki_ichiro',
    email: 'ichiro.suzuki@example.com',
    phone: '+81-70-2345-6789',
    status: 'inactive',
    role: 'cashier',
  },
  {
    id: '4',
    name: '高橋 次郎',
    username: 'takahashi_jiro',
    email: 'jiro.takahashi@example.com',
    phone: '+81-90-3456-7890',
    status: 'suspended',
    role: 'cashier',
  },
  {
    id: '5',
    name: '田中 三郎',
    username: 'tanaka_saburo',
    email: 'saburo.tanaka@example.com',
    phone: '+81-80-4567-8901',
    status: 'invited',
    role: 'superadmin',
  },
  {
    id: '6',
    name: '伊藤 四郎',
    username: 'ito_shiro',
    email: 'shiro.ito@example.com',
    phone: '+81-70-5678-9012',
    status: 'active',
    role: 'admin',
  },
  {
    id: '7',
    name: '渡辺 五郎',
    username: 'watanabe_goro',
    email: 'goro.watanabe@example.com',
    phone: '+81-90-6789-0123',
    status: 'inactive',
    role: 'manager',
  },
  {
    id: '8',
    name: '小林 六郎',
    username: 'kobayashi_rokuro',
    email: 'rokuro.kobayashi@example.com',
    phone: '+81-80-7890-1234',
    status: 'active',
    role: 'cashier',
  },
  {
    id: '9',
    name: '加藤 七子',
    username: 'kato_nanako',
    email: 'nanako.kato@example.com',
    phone: '+81-70-8901-2345',
    status: 'suspended',
    role: 'superadmin',
  },
  {
    id: '10',
    name: '吉田 八郎',
    username: 'yoshida_hachiro',
    email: 'hachiro.yoshida@example.com',
    phone: '+81-90-9012-3456',
    status: 'invited',
    role: 'admin',
  },
];
