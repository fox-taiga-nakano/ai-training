'use client';

import { useState } from 'react';

import type {
  BaseEntity,
  FormField,
  StatisticCard,
  TableAction,
  TableColumn,
} from '@/types/management';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { Edit, Package, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/lib/api/types';

import {
  EntityFormDialog,
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/hooks/api/use-categories';
import { useConfirmModal } from '@/hooks/useConfirmModal';

// カテゴリの型定義は @/lib/api/types からインポート

// バリデーションスキーマ
const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'カテゴリ名は必須です')
    .max(100, 'カテゴリ名は100文字以内で入力してください'),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  // APIフックの使用
  const {
    categories,
    isLoading: isCategoriesLoading,
    revalidate: revalidateCategories,
  } = useCategories();
  const { createCategory } = useCreateCategory();
  const { updateCategory } = useUpdateCategory();
  const { deleteCategory } = useDeleteCategory();

  // ローカル状態
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // ローディング状態の統合
  const isLoading = isCategoriesLoading || isOperationLoading;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総カテゴリ数',
      value: categories.length,
      description: '登録されているカテゴリ',
      icon: Package,
    },
    {
      title: '総商品数',
      value: categories.reduce(
        (sum, cat) => sum + (cat._count?.products || 0),
        0
      ),
      description: 'カテゴリに紐づく商品',
      icon: Package,
    },
    {
      title: '平均商品数',
      value:
        categories.length > 0
          ? Math.round(
              categories.reduce(
                (sum, cat) => sum + (cat._count?.products || 0),
                0
              ) / categories.length
            )
          : 0,
      description: 'カテゴリあたりの商品数',
      icon: Package,
    },
    {
      title: '最大商品数',
      value: Math.max(...categories.map((cat) => cat._count?.products || 0)),
      description: '最も商品数の多いカテゴリ',
      icon: Package,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<Category>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => <span className="font-mono">#{value}</span>,
    },
    {
      key: 'name',
      label: 'カテゴリ名',
      className: 'font-medium',
    },
    {
      key: '_count.products',
      label: '商品数',
      render: (_, row) => (
        <Badge variant="secondary">{row._count?.products || 0}個</Badge>
      ),
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<Category>[] = [
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
      label: 'カテゴリ名',
      type: 'text',
      placeholder: '例：食品',
      required: true,
    },
  ];

  // 削除確認モーダル
  const confirmDelete = useConfirmModal({
    type: 'delete',
    title: 'カテゴリを削除しますか？',
    onConfirm: async (categoryId: number) => {
      setIsOperationLoading(true);
      try {
        await deleteCategory(categoryId);
        await revalidateCategories();
      } catch (error) {
        // エラーはAPIフック内でハンドリング済み
      } finally {
        setIsOperationLoading(false);
      }
    },
  });

  // カテゴリ作成
  const handleCreate = async (data: CategoryFormData) => {
    setIsOperationLoading(true);
    try {
      const createData: CreateCategoryDto = {
        name: data.name,
      };

      await createCategory(createData);
      setIsCreateDialogOpen(false);
      await revalidateCategories();
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // カテゴリ編集
  const handleEdit = async (data: CategoryFormData) => {
    if (!editingCategory) return;

    setIsOperationLoading(true);
    try {
      const updateData: UpdateCategoryDto = {
        name: data.name,
      };

      await updateCategory(editingCategory.id, updateData);
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      await revalidateCategories();
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // 編集ダイアログを開く
  function openEditDialog(category: Category) {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  }

  // 削除確認
  function handleDelete(category: Category) {
    const productCount = category._count?.products || 0;
    const description = `「${category.name}」を削除しますか？`;
    const details =
      productCount > 0
        ? `このカテゴリには${productCount}個の商品が登録されています。削除すると商品のカテゴリ情報も削除されます。`
        : 'この操作は元に戻せません。';

    confirmDelete.show(description, details, category.id);
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title="カテゴリ管理"
        description="商品カテゴリの作成、編集、削除を行います"
      />

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メインテーブル */}
      <EntityTable
        title="カテゴリ一覧"
        description="登録されているカテゴリの一覧です"
        data={categories}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="カテゴリ名で検索..."
        createButton={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        }
      />

      {/* 新規作成ダイアログ */}
      <EntityFormDialog
        title="新しいカテゴリを作成"
        description="新しい商品カテゴリを作成します。"
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        fields={formFields}
        schema={categorySchema}
        onSubmit={handleCreate}
        isLoading={isLoading}
        submitLabel="作成"
      />

      {/* 編集ダイアログ */}
      <EntityFormDialog
        title="カテゴリを編集"
        description="カテゴリ情報を編集します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={formFields}
        schema={categorySchema}
        defaultValues={editingCategory ? { name: editingCategory.name } : {}}
        onSubmit={handleEdit}
        isLoading={isLoading}
        submitLabel="更新"
      />

      {/* 削除確認ダイアログ */}
      {confirmDelete.modal}
    </div>
  );
}
