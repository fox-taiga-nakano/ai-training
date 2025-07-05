'use client';

import { useState } from 'react';

import type {
  BaseEntity,
  DetailSection,
  FormField,
  RelatedData,
  StatisticCard,
  TableAction,
  TableColumn,
} from '@/types/management';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Edit, Mail, Plus, ShoppingBag, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import type { CreateUserDto, UpdateUserDto, User } from '@/lib/api/types';

import {
  EntityDetailSheet,
  EntityFormDialog,
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';
import {
  useCreateUser,
  useDeleteUser,
  useUpdateUser,
  useUserOrders,
  useUsers,
} from '@/hooks/api/use-users';
import { useConfirmModal } from '@/hooks/useConfirmModal';

// ユーザーの型定義は @/lib/api/types からインポート

// 注文履歴の型定義
interface OrderHistory {
  id: number;
  orderNumber: string;
  totalAmount: number;
  orderDate: string;
  orderStatus: string;
}

// バリデーションスキーマ
const userSchema = z.object({
  name: z
    .string()
    .min(1, '名前は必須です')
    .max(100, '名前は100文字以内で入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
});

type UserFormData = z.infer<typeof userSchema>;

export default function CustomersPage() {
  // ローカル状態
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // APIフックの使用
  const {
    users,
    isLoading: isUsersLoading,
    revalidate: revalidateUsers,
  } = useUsers();
  const { createUser } = useCreateUser();
  const { updateUser } = useUpdateUser();
  const { deleteUser } = useDeleteUser();
  const { orders: userOrders, isLoading: isOrdersLoading } = useUserOrders(
    selectedUser?.id || 0
  );

  // ローディング状態の統合
  const isLoading = isUsersLoading || isOperationLoading;

  // 統計計算
  const totalOrders = users.reduce(
    (sum, user) => sum + (user._count?.orders || 0),
    0
  );
  const avgOrdersPerUser =
    users.length > 0 ? Math.round(totalOrders / users.length) : 0;
  const activeUsers = users.filter(
    (user) => (user._count?.orders || 0) > 0
  ).length;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総顧客数',
      value: users.length,
      description: '登録されている顧客',
      icon: Users,
    },
    {
      title: '総注文数',
      value: totalOrders,
      description: '全顧客の注文数',
      icon: ShoppingBag,
    },
    {
      title: '平均注文数',
      value: avgOrdersPerUser,
      description: '顧客あたりの注文数',
      icon: ShoppingBag,
    },
    {
      title: 'アクティブ顧客',
      value: activeUsers,
      description: '注文履歴のある顧客',
      icon: Users,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<User>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => <span className="font-mono">#{value}</span>,
    },
    {
      key: 'name',
      label: '名前',
      className: 'font-medium',
    },
    {
      key: 'email',
      label: 'メールアドレス',
      render: (value) => (
        <div className="flex items-center">
          <Mail className="text-muted-foreground mr-2 h-4 w-4" />
          {value}
        </div>
      ),
    },
    {
      key: '_count.orders',
      label: '注文数',
      render: (_, row) => (
        <Badge variant={row._count?.orders ? 'default' : 'secondary'}>
          {row._count?.orders || 0}件
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: '登録日',
    },
    {
      key: 'lastOrderAt',
      label: '最終注文日',
      render: (value) => value || '未注文',
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<User>[] = [
    {
      label: '詳細を見る',
      onClick: openDetailSheet,
    },
    {
      label: '編集',
      icon: Edit,
      onClick: openEditDialog,
    },
    {
      label: '削除',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleDelete,
    },
  ];

  // フォームフィールドの設定
  const formFields: FormField[] = [
    {
      name: 'name',
      label: '名前',
      type: 'text',
      placeholder: '例：田中太郎',
      required: true,
    },
    {
      name: 'email',
      label: 'メールアドレス',
      type: 'email',
      placeholder: '例：tanaka@example.com',
      required: true,
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<User>[] = [
    {
      title: '基本情報',
      fields: [
        {
          label: '顧客ID',
          key: 'id',
          formatter: (value) => <span className="font-mono">#{value}</span>,
        },
        { label: '名前', key: 'name' },
        { label: 'メールアドレス', key: 'email' },
        {
          label: '注文数',
          key: '_count.orders',
          formatter: (_, row) => `${row._count?.orders || 0}件`,
        },
        { label: '登録日', key: 'createdAt' },
        {
          label: '最終注文日',
          key: 'lastOrderAt',
          formatter: (value) => value || '未注文',
        },
      ],
    },
  ];

  // 関連データ設定
  const relatedData: RelatedData[] = [
    {
      title: '注文履歴',
      description: '最近の注文履歴を表示します',
      data: userOrders,
      columns: [
        { key: 'orderNumber', label: '注文番号' },
        { key: 'orderDate', label: '注文日' },
        {
          key: 'totalAmount',
          label: '金額',
          render: (value) => `¥${value.toLocaleString()}`,
        },
        {
          key: 'orderStatus',
          label: 'ステータス',
          render: (value) => getOrderStatusBadge(value),
        },
      ],
      emptyMessage: '注文履歴がありません',
    },
  ];

  // 削除確認モーダル
  const confirmDelete = useConfirmModal({
    type: 'delete',
    title: '顧客を削除しますか？',
    onConfirm: async (userId: number) => {
      setIsOperationLoading(true);
      try {
        await deleteUser(userId);
        await revalidateUsers();
      } catch (error) {
        // エラーはAPIフック内でハンドリング済み
      } finally {
        setIsOperationLoading(false);
      }
    },
  });

  // 顧客作成
  const handleCreate = async (data: UserFormData) => {
    setIsOperationLoading(true);
    try {
      const createData: CreateUserDto = {
        name: data.name,
        email: data.email,
      };

      await createUser(createData);
      setIsCreateDialogOpen(false);
      await revalidateUsers();
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // 顧客編集
  const handleEdit = async (data: UserFormData) => {
    if (!editingUser) return;

    setIsOperationLoading(true);
    try {
      const updateData: UpdateUserDto = {
        name: data.name,
        email: data.email,
      };

      await updateUser(editingUser.id, updateData);
      setIsEditDialogOpen(false);
      setEditingUser(null);
      await revalidateUsers();
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // 編集ダイアログを開く
  function openEditDialog(user: User) {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  }

  // 詳細シートを開く
  function openDetailSheet(user: User) {
    setSelectedUser(user);
    setIsDetailSheetOpen(true);
  }

  // 削除確認
  function handleDelete(user: User) {
    const orderCount = user._count?.orders || 0;
    const description = `「${user.name}」を削除しますか？`;
    const details =
      orderCount > 0
        ? `この顧客には${orderCount}件の注文履歴があります。削除すると注文履歴も削除されます。`
        : 'この操作は元に戻せません。';

    confirmDelete.show(description, details, user.id);
  }

  // 注文ステータスのバッジ
  function getOrderStatusBadge(status: string) {
    const statusMap = {
      PENDING: { label: '待機中', variant: 'secondary' as const },
      CONFIRMED: { label: '確認済み', variant: 'default' as const },
      SHIPPED: { label: '発送済み', variant: 'default' as const },
      COMPLETED: { label: '完了', variant: 'default' as const },
      CANCELED: { label: 'キャンセル', variant: 'destructive' as const },
    };

    const config = statusMap[status as keyof typeof statusMap] || {
      label: status,
      variant: 'secondary' as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title="顧客管理"
        description="顧客の作成、編集、削除および注文履歴を管理します"
      />

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メインテーブル */}
      <EntityTable
        title="顧客一覧"
        description="登録されている顧客の一覧です"
        data={users}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="名前またはメールアドレスで検索..."
        onRowClick={openDetailSheet}
        createButton={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        }
      />

      {/* 新規作成ダイアログ */}
      <EntityFormDialog
        title="新しい顧客を作成"
        description="新しい顧客を登録します。"
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        fields={formFields}
        schema={userSchema}
        onSubmit={handleCreate}
        isLoading={isLoading}
        submitLabel="作成"
      />

      {/* 編集ダイアログ */}
      <EntityFormDialog
        title="顧客情報を編集"
        description="顧客情報を編集します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={formFields}
        schema={userSchema}
        defaultValues={
          editingUser
            ? { name: editingUser.name, email: editingUser.email }
            : {}
        }
        onSubmit={handleEdit}
        isLoading={isLoading}
        submitLabel="更新"
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="顧客詳細"
        description="顧客の詳細情報と注文履歴を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedUser}
        sections={detailSections}
        relatedData={relatedData}
        actions={[
          {
            label: '編集',
            icon: Edit,
            variant: 'outline',
            onClick: (user) => {
              setIsDetailSheetOpen(false);
              openEditDialog(user);
            },
          },
          {
            label: '削除',
            icon: Trash2,
            variant: 'destructive',
            onClick: (user) => {
              setIsDetailSheetOpen(false);
              handleDelete(user);
            },
          },
        ]}
        isLoading={isLoading}
      />

      {/* 削除確認ダイアログ */}
      {confirmDelete.modal}
    </div>
  );
}
