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
  AlertTriangle,
  DollarSign,
  Edit,
  Eye,
  Package,
  Plus,
  Tag,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import type {
  CreateProductDto,
  Product,
  UpdateProductDto,
} from '@/lib/api/types';

import {
  EntityDetailSheet,
  EntityFormDialog,
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';
import {
  useCategories,
  useCreateProduct,
  useDeleteProduct,
  useProductSuppliers,
  useProducts,
  useUpdateProduct,
} from '@/hooks/api/use-products';
import { useConfirmModal } from '@/hooks/useConfirmModal';

// 商品の型定義は @/lib/api/types からインポート

// バリデーションスキーマ
const productSchema = z.object({
  code: z
    .string()
    .min(1, '商品コードは必須です')
    .max(50, '商品コードは50文字以内で入力してください')
    .regex(
      /^[A-Z0-9_-]+$/,
      '商品コードは英数字、ハイフン、アンダースコアのみ使用可能です'
    ),
  name: z
    .string()
    .min(1, '商品名は必須です')
    .max(200, '商品名は200文字以内で入力してください'),
  categoryId: z.number().min(1, 'カテゴリは必須です'),
  supplierId: z.number().min(1, 'サプライヤーは必須です'),
  retailPrice: z
    .number()
    .min(1, '販売価格は1円以上で入力してください')
    .max(999999999, '販売価格は999,999,999円以下で入力してください'),
  purchasePrice: z
    .number()
    .min(1, '仕入価格は1円以上で入力してください')
    .max(999999999, '仕入価格は999,999,999円以下で入力してください'),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function ProductsPage() {
  // APIフックの使用
  const {
    products,
    isLoading: isProductsLoading,
    revalidate: revalidateProducts,
  } = useProducts();
  const { categories, isLoading: isCategoriesLoading } = useCategories();
  const { suppliers, isLoading: isSuppliersLoading } = useProductSuppliers();
  const { createProduct } = useCreateProduct();
  const { updateProduct } = useUpdateProduct();
  const { deleteProduct } = useDeleteProduct();

  // ローカル状態
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // ローディング状態の統合
  const isLoading =
    isProductsLoading ||
    isCategoriesLoading ||
    isSuppliersLoading ||
    isOperationLoading;

  // 統計計算
  const totalProducts = products.length;
  const totalValue = products.reduce(
    (sum, product) => sum + product.retailPrice * (product.stock || 0),
    0
  );
  const lowStockCount = products.filter(
    (product) => (product.stock || 0) < 10
  ).length;
  const avgMargin =
    products.length > 0
      ? Math.round(
          products.reduce((sum, product) => {
            const margin =
              ((product.retailPrice - product.purchasePrice) /
                product.retailPrice) *
              100;
            return sum + margin;
          }, 0) / products.length
        )
      : 0;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総商品数',
      value: totalProducts,
      description: '登録されている商品',
      icon: Package,
    },
    {
      title: '在庫総額',
      value: `¥${totalValue.toLocaleString()}`,
      description: '在庫の総販売価格',
      icon: DollarSign,
    },
    {
      title: '在庫アラート',
      value: lowStockCount,
      description: '在庫10個未満の商品',
      icon: AlertTriangle,
    },
    {
      title: '平均利益率',
      value: `${avgMargin}%`,
      description: '販売価格に対する利益率',
      icon: DollarSign,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<Product>[] = [
    {
      key: 'code',
      label: '商品コード',
      render: (value) => <span className="font-mono">{value}</span>,
    },
    {
      key: 'name',
      label: '商品名',
      className: 'font-medium',
    },
    {
      key: 'category',
      label: 'カテゴリ',
      render: (value) => (
        <div className="flex items-center">
          <Tag className="text-muted-foreground mr-2 h-4 w-4" />
          {value}
        </div>
      ),
    },
    {
      key: 'supplier',
      label: 'サプライヤー',
    },
    {
      key: 'retailPrice',
      label: '販売価格',
      render: (value) => `¥${value.toLocaleString()}`,
    },
    {
      key: 'stock',
      label: '在庫数',
      render: (value) => {
        const stock = value || 0;
        return (
          <Badge variant={stock < 10 ? 'destructive' : 'default'}>
            {stock}個
          </Badge>
        );
      },
    },
    {
      key: 'updatedAt',
      label: '更新日',
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<Product>[] = [
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
      variant: 'destructive',
      onClick: handleDelete,
    },
  ];

  // フォームフィールドの設定
  const formFields: FormField[] = [
    {
      name: 'code',
      label: '商品コード',
      type: 'text',
      placeholder: '例：PROD001',
      required: true,
    },
    {
      name: 'name',
      label: '商品名',
      type: 'text',
      placeholder: '例：スマートフォン',
      required: true,
    },
    {
      name: 'categoryId',
      label: 'カテゴリ',
      type: 'select',
      required: true,
      options: categories.map((cat) => ({
        value: cat.id.toString(),
        label: cat.name,
      })),
    },
    {
      name: 'supplierId',
      label: 'サプライヤー',
      type: 'select',
      required: true,
      options: suppliers.map((sup) => ({
        value: sup.id.toString(),
        label: sup.name,
      })),
    },
    {
      name: 'retailPrice',
      label: '販売価格',
      type: 'number',
      placeholder: '例：89800',
      required: true,
    },
    {
      name: 'purchasePrice',
      label: '仕入価格',
      type: 'number',
      placeholder: '例：65000',
      required: true,
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<Product>[] = [
    {
      title: '基本情報',
      fields: [
        {
          label: '商品ID',
          key: 'id',
          formatter: (value) => <span className="font-mono">#{value}</span>,
        },
        {
          label: '商品コード',
          key: 'code',
          formatter: (value) => <span className="font-mono">{value}</span>,
        },
        { label: '商品名', key: 'name' },
        { label: 'カテゴリ', key: 'category' },
        { label: 'サプライヤー', key: 'supplier' },
        {
          label: '商品説明',
          key: 'description',
          formatter: (value) => value || '説明なし',
        },
      ],
    },
    {
      title: '価格・在庫情報',
      fields: [
        {
          label: '販売価格',
          key: 'retailPrice',
          formatter: (value) => `¥${value.toLocaleString()}`,
        },
        {
          label: '仕入価格',
          key: 'purchasePrice',
          formatter: (value) => `¥${value.toLocaleString()}`,
        },
        {
          label: '利益率',
          key: 'retailPrice',
          formatter: (_, row) => {
            const margin =
              ((row.retailPrice - row.purchasePrice) / row.retailPrice) * 100;
            return `${Math.round(margin)}%`;
          },
        },
        {
          label: '在庫数',
          key: 'stock',
          formatter: (value) => `${value || 0}個`,
        },
        {
          label: '在庫総額',
          key: 'retailPrice',
          formatter: (_, row) =>
            `¥${(row.retailPrice * (row.stock || 0)).toLocaleString()}`,
        },
      ],
    },
    {
      title: '管理情報',
      fields: [
        { label: '作成日', key: 'createdAt' },
        { label: '更新日', key: 'updatedAt' },
      ],
    },
  ];

  // 削除確認モーダル
  const confirmDelete = useConfirmModal({
    type: 'delete',
    title: '商品を削除しますか？',
    onConfirm: async (productId: number) => {
      setIsOperationLoading(true);
      try {
        await deleteProduct(productId);
        await revalidateProducts();
      } catch (error) {
        // エラーはAPIフック内でハンドリング済み
      } finally {
        setIsOperationLoading(false);
      }
    },
  });

  // 商品作成
  const handleCreate = async (data: ProductFormData) => {
    setIsOperationLoading(true);
    try {
      const createData: CreateProductDto = {
        code: data.code,
        name: data.name,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        retailPrice: data.retailPrice,
        purchasePrice: data.purchasePrice,
      };

      await createProduct(createData);
      setIsCreateDialogOpen(false);
      await revalidateProducts();
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // 商品編集
  const handleEdit = async (data: ProductFormData) => {
    if (!editingProduct) return;

    setIsOperationLoading(true);
    try {
      const updateData: UpdateProductDto = {
        code: data.code,
        name: data.name,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        retailPrice: data.retailPrice,
        purchasePrice: data.purchasePrice,
      };

      await updateProduct(editingProduct.id, updateData);
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      await revalidateProducts();
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // 編集ダイアログを開く
  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  }

  // 詳細シートを開く
  function openDetailSheet(product: Product) {
    setSelectedProduct(product);
    setIsDetailSheetOpen(true);
  }

  // 削除確認
  function handleDelete(product: Product) {
    const stock = product.stock || 0;
    const description = `「${product.name}」を削除しますか？`;
    const details =
      stock > 0
        ? `この商品には${stock}個の在庫があります。削除すると在庫も削除されます。`
        : 'この操作は元に戻せません。';

    confirmDelete.show(description, details, product.id);
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title="商品管理"
        description="商品の作成、編集、削除および在庫管理を行います"
      />

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メインテーブル */}
      <EntityTable
        title="商品一覧"
        description="登録されている商品の一覧です"
        data={products}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="商品名またはコードで検索..."
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
        title="新しい商品を作成"
        description="新しい商品を登録します。"
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        fields={formFields}
        schema={productSchema}
        onSubmit={handleCreate}
        isLoading={isLoading}
        submitLabel="作成"
      />

      {/* 編集ダイアログ */}
      <EntityFormDialog
        title="商品情報を編集"
        description="商品情報を編集します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={formFields}
        schema={productSchema}
        defaultValues={
          editingProduct
            ? {
                code: editingProduct.code,
                name: editingProduct.name,
                categoryId: editingProduct.categoryId,
                supplierId: editingProduct.supplierId,
                retailPrice: editingProduct.retailPrice,
                purchasePrice: editingProduct.purchasePrice,
              }
            : {}
        }
        onSubmit={handleEdit}
        isLoading={isLoading}
        submitLabel="更新"
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="商品詳細"
        description="商品の詳細情報を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedProduct}
        sections={detailSections}
        actions={[
          {
            label: '編集',
            icon: Edit,
            variant: 'outline',
            onClick: (product) => {
              setIsDetailSheetOpen(false);
              openEditDialog(product);
            },
          },
          {
            label: '削除',
            icon: Trash2,
            variant: 'destructive',
            onClick: (product) => {
              setIsDetailSheetOpen(false);
              handleDelete(product);
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
