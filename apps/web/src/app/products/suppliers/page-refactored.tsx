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
import {
  Building2,
  Edit,
  Eye,
  Mail,
  Package,
  Phone,
  Plus,
  Trash2,
} from 'lucide-react';
import { z } from 'zod';

import type {
  CreateSupplierDto,
  Supplier,
  UpdateSupplierDto,
} from '@/lib/api/types';

import {
  EntityDetailSheet,
  EntityFormDialog,
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSuppliers,
  useUpdateSupplier,
} from '@/hooks/api/use-suppliers';
import { useConfirmModal } from '@/hooks/useConfirmModal';

// サプライヤーの型定義は @/lib/api/types からインポート

// サプライヤー商品の型定義
interface SupplierProduct {
  id: number;
  code: string;
  name: string;
  retailPrice: number;
  purchasePrice: number;
}

// バリデーションスキーマ
const supplierSchema = z.object({
  code: z
    .string()
    .min(1, 'サプライヤーコードは必須です')
    .max(20, 'サプライヤーコードは20文字以内で入力してください')
    .regex(
      /^[A-Z0-9-]+$/,
      'サプライヤーコードは英数字とハイフンで入力してください'
    ),
  name: z
    .string()
    .min(1, 'サプライヤー名は必須です')
    .max(100, 'サプライヤー名は100文字以内で入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  phoneNumber: z
    .string()
    .min(1, '電話番号は必須です')
    .regex(/^[\d-]+$/, '電話番号は数字とハイフンで入力してください'),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

// ダミー商品データ（関連データ表示用）
const dummyProducts: SupplierProduct[] = [
  {
    id: 1,
    code: 'PROD-001',
    name: '有機野菜セット',
    retailPrice: 1500,
    purchasePrice: 800,
  },
  {
    id: 2,
    code: 'PROD-002',
    name: '特選米 5kg',
    retailPrice: 2800,
    purchasePrice: 1500,
  },
  {
    id: 3,
    code: 'PROD-003',
    name: '冷凍食品セット',
    retailPrice: 1200,
    purchasePrice: 650,
  },
];

export default function SuppliersPageRefactored() {
  // APIフックの使用
  const {
    suppliers,
    isLoading: isSuppliersLoading,
    revalidate: revalidateSuppliers,
  } = useSuppliers();
  const { createSupplier } = useCreateSupplier();
  const { updateSupplier } = useUpdateSupplier();
  const { deleteSupplier } = useDeleteSupplier();

  // ローカル状態
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // ローディング状態の統合
  const isLoading = isSuppliersLoading || isOperationLoading;

  const confirmDelete = useConfirmModal({
    type: 'delete',
    title: 'サプライヤーを削除しますか？',
    onConfirm: async (supplierId: number) => {
      setIsOperationLoading(true);
      try {
        await deleteSupplier(supplierId);
        await revalidateSuppliers();
      } catch (error) {
        // エラーはAPIフック内でハンドリング済み
      } finally {
        setIsOperationLoading(false);
      }
    },
  });

  // 統計計算
  const totalSuppliers = suppliers.length;
  const totalProducts = suppliers.reduce(
    (sum, supplier) => sum + (supplier._count?.products || 0),
    0
  );
  const totalPurchaseOrders = suppliers.reduce(
    (sum, supplier) => sum + (supplier._count?.purchaseOrders || 0),
    0
  );
  const avgProductsPerSupplier =
    suppliers.length > 0 ? Math.round(totalProducts / suppliers.length) : 0;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総サプライヤー数',
      value: totalSuppliers,
      description: '登録されているサプライヤー',
      icon: Building2,
    },
    {
      title: '総商品数',
      value: totalProducts,
      description: 'サプライヤーからの商品',
      icon: Package,
    },
    {
      title: '総発注数',
      value: totalPurchaseOrders,
      description: '発注履歴の件数',
      icon: Package,
    },
    {
      title: '平均商品数',
      value: avgProductsPerSupplier,
      description: 'サプライヤーあたりの商品数',
      icon: Package,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<Supplier>[] = [
    {
      key: 'code',
      label: 'コード',
      render: (value) => <span className="font-mono">{value}</span>,
    },
    {
      key: 'name',
      label: 'サプライヤー名',
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
      key: 'phoneNumber',
      label: '電話番号',
      render: (value) => (
        <div className="flex items-center">
          <Phone className="text-muted-foreground mr-2 h-4 w-4" />
          {value}
        </div>
      ),
    },
    {
      key: '_count',
      label: '商品数',
      render: (count) => (
        <Badge variant={count?.products ? 'default' : 'secondary'}>
          {count?.products || 0}個
        </Badge>
      ),
    },
    {
      key: '_count',
      label: '発注数',
      render: (count) => (
        <Badge variant={count?.purchaseOrders ? 'default' : 'secondary'}>
          {count?.purchaseOrders || 0}件
        </Badge>
      ),
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<Supplier>[] = [
    {
      label: '詳細を見る',
      icon: Eye,
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
      onClick: handleDelete,
      variant: 'destructive',
    },
  ];

  // フォームフィールドの設定
  const formFields: FormField[] = [
    {
      name: 'code',
      label: 'サプライヤーコード',
      type: 'text',
      placeholder: '例：SUP-001',
      required: true,
    },
    {
      name: 'name',
      label: 'サプライヤー名',
      type: 'text',
      placeholder: '例：株式会社サンプル',
      required: true,
    },
    {
      name: 'email',
      label: 'メールアドレス',
      type: 'email',
      placeholder: '例：contact@sample.co.jp',
      required: true,
    },
    {
      name: 'phoneNumber',
      label: '電話番号',
      type: 'tel',
      placeholder: '例：03-1234-5678',
      required: true,
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<Supplier>[] = [
    {
      title: '基本情報',
      fields: [
        {
          label: 'サプライヤーID',
          key: 'id',
          formatter: (value) => <span className="font-mono">#{value}</span>,
        },
        {
          label: 'サプライヤーコード',
          key: 'code',
          formatter: (value) => <span className="font-mono">{value}</span>,
        },
        { label: 'サプライヤー名', key: 'name' },
        { label: 'メールアドレス', key: 'email' },
        { label: '電話番号', key: 'phoneNumber' },
      ],
    },
    {
      title: '取引情報',
      fields: [
        {
          label: '取扱商品数',
          key: '_count',
          formatter: (count) => `${count?.products || 0}個`,
        },
        {
          label: '発注履歴',
          key: '_count',
          formatter: (count) => `${count?.purchaseOrders || 0}件`,
        },
      ],
    },
  ];

  // 関連データ設定（取扱商品）
  const relatedData: RelatedData[] = [
    {
      title: '取扱商品',
      description: 'このサプライヤーの取扱商品一覧',
      data: dummyProducts, // 実際は selectedSupplier?.products
      columns: [
        {
          key: 'name',
          label: '商品名',
          className: 'font-medium',
        },
        {
          key: 'code',
          label: '商品コード',
          render: (value) => <span className="font-mono text-sm">{value}</span>,
        },
        {
          key: 'retailPrice',
          label: '売価',
          render: (value) => `¥${value.toLocaleString()}`,
          className: 'text-right',
        },
        {
          key: 'purchasePrice',
          label: '仕入価格',
          render: (value) => `¥${value.toLocaleString()}`,
          className: 'text-right',
        },
      ],
      emptyMessage: '取扱商品がありません',
    },
  ];

  // サプライヤー作成
  const handleCreate = async (data: SupplierFormData) => {
    setIsOperationLoading(true);
    try {
      const createData: CreateSupplierDto = {
        code: data.code,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
      };

      await createSupplier(createData);
      setIsCreateDialogOpen(false);
      await revalidateSuppliers();
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // サプライヤー編集
  const handleEdit = async (data: SupplierFormData) => {
    if (!editingSupplier) return;

    setIsOperationLoading(true);
    try {
      const updateData: UpdateSupplierDto = {
        code: data.code,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
      };

      await updateSupplier(editingSupplier.id, updateData);
      setIsEditDialogOpen(false);
      setEditingSupplier(null);
      await revalidateSuppliers();
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // 編集ダイアログを開く
  function openEditDialog(supplier: Supplier) {
    setEditingSupplier(supplier);
    setIsEditDialogOpen(true);
  }

  // 詳細シートを開く
  function openDetailSheet(supplier: Supplier) {
    setSelectedSupplier(supplier);
    setIsDetailSheetOpen(true);
  }

  // 削除確認
  function handleDelete(supplier: Supplier) {
    const productCount = supplier._count?.products || 0;
    const purchaseOrderCount = supplier._count?.purchaseOrders || 0;
    const description = `「${supplier.name}」を削除しますか？`;
    const details =
      productCount > 0 || purchaseOrderCount > 0
        ? `このサプライヤーには${productCount}個の商品と${purchaseOrderCount}件の発注履歴があります。削除すると関連データも削除されます。`
        : 'この操作は元に戻せません。';

    confirmDelete.show(description, details, supplier.id);
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title="サプライヤー管理"
        description="サプライヤーの作成、編集、削除および取引情報を管理します"
      >
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </PageHeader>

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メインテーブル */}
      <EntityTable
        title="サプライヤー一覧"
        description="登録されているサプライヤーの一覧です"
        data={suppliers}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="サプライヤー名、コード、メールアドレスで検索..."
        onRowClick={openDetailSheet}
      />

      {/* 新規作成ダイアログ */}
      <EntityFormDialog
        title="新しいサプライヤーを作成"
        description="新しいサプライヤーを登録します。"
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        fields={formFields}
        schema={supplierSchema}
        defaultValues={{
          code: '',
          name: '',
          email: '',
          phoneNumber: '',
        }}
        onSubmit={handleCreate}
        isLoading={isLoading}
        submitLabel="作成"
      />

      {/* 編集ダイアログ */}
      <EntityFormDialog
        title="サプライヤー情報を編集"
        description="サプライヤー情報を編集します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={formFields}
        schema={supplierSchema}
        defaultValues={
          editingSupplier
            ? {
                code: editingSupplier.code,
                name: editingSupplier.name,
                email: editingSupplier.email,
                phoneNumber: editingSupplier.phoneNumber,
              }
            : {}
        }
        onSubmit={handleEdit}
        isLoading={isLoading}
        submitLabel="更新"
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="サプライヤー詳細"
        description="サプライヤーの詳細情報と取扱商品を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedSupplier}
        sections={detailSections}
        relatedData={relatedData}
        actions={[
          {
            label: '編集',
            icon: Edit,
            variant: 'outline',
            onClick: (supplier) => {
              setIsDetailSheetOpen(false);
              openEditDialog(supplier);
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
