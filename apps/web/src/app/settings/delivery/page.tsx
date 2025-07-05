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
import { Clock, Edit, Eye, Plus, Trash2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  EntityDetailSheet,
  EntityFormDialog,
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';
import { useConfirmModal } from '@/hooks/useConfirmModal';

// 配送方法の型定義
interface DeliveryMethod extends BaseEntity {
  name: string;
  code: string;
  carrier: string;
  type: DeliveryType;
  isActive: boolean;
  baseFee: number;
  freeShippingThreshold?: number;
  estimatedDays: string;
  trackingAvailable: boolean;
  description?: string;
  regions: DeliveryRegion[];
  timeSlots: DeliveryTimeSlot[];
  restrictions?: string;
}

interface DeliveryRegion {
  id: number;
  name: string;
  additionalFee: number;
  isAvailable: boolean;
}

interface DeliveryTimeSlot {
  id: number;
  name: string;
  timeRange: string;
  additionalFee: number;
  isAvailable: boolean;
}

type DeliveryType = 'STANDARD' | 'EXPRESS' | 'COOL' | 'MAIL';

// バリデーションスキーマ
const deliveryMethodSchema = z.object({
  name: z
    .string()
    .min(1, '配送方法名は必須です')
    .max(50, '配送方法名は50文字以内で入力してください'),
  code: z
    .string()
    .min(1, 'コードは必須です')
    .max(20, 'コードは20文字以内で入力してください')
    .regex(
      /^[A-Z0-9_]+$/,
      'コードは英大文字、数字、アンダースコアで入力してください'
    ),
  carrier: z.string().min(1, '配送業者は必須です'),
  type: z.enum(['STANDARD', 'EXPRESS', 'COOL', 'MAIL']),
  isActive: z.boolean(),
  baseFee: z
    .string()
    .min(1, '基本送料は必須です')
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 0, '基本送料は0以上の値を入力してください'),
  freeShippingThreshold: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  estimatedDays: z.string().min(1, '配送日数は必須です'),
  trackingAvailable: z.boolean(),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  restrictions: z
    .string()
    .max(500, '制限事項は500文字以内で入力してください')
    .optional(),
});

type DeliveryMethodFormData = z.infer<typeof deliveryMethodSchema>;

// ダミーデータ
const dummyDeliveryMethods: DeliveryMethod[] = [
  {
    id: 1,
    name: '通常配送',
    code: 'STANDARD',
    carrier: 'ヤマト運輸',
    type: 'STANDARD',
    isActive: true,
    baseFee: 500,
    freeShippingThreshold: 5000,
    estimatedDays: '2-3日',
    trackingAvailable: true,
    description: '標準的な配送サービス',
    regions: [
      { id: 1, name: '関東', additionalFee: 0, isAvailable: true },
      { id: 2, name: '関西', additionalFee: 100, isAvailable: true },
      { id: 3, name: '北海道', additionalFee: 300, isAvailable: true },
      { id: 4, name: '沖縄', additionalFee: 500, isAvailable: true },
    ],
    timeSlots: [
      {
        id: 1,
        name: '午前中',
        timeRange: '8:00-12:00',
        additionalFee: 0,
        isAvailable: true,
      },
      {
        id: 2,
        name: '14-16時',
        timeRange: '14:00-16:00',
        additionalFee: 0,
        isAvailable: true,
      },
      {
        id: 3,
        name: '16-18時',
        timeRange: '16:00-18:00',
        additionalFee: 0,
        isAvailable: true,
      },
      {
        id: 4,
        name: '18-20時',
        timeRange: '18:00-20:00',
        additionalFee: 0,
        isAvailable: true,
      },
    ],
  },
  {
    id: 2,
    name: '速達便',
    code: 'EXPRESS',
    carrier: '佐川急便',
    type: 'EXPRESS',
    isActive: true,
    baseFee: 800,
    estimatedDays: '翌日',
    trackingAvailable: true,
    description: '翌日配送の速達サービス',
    regions: [
      { id: 5, name: '関東', additionalFee: 0, isAvailable: true },
      { id: 6, name: '関西', additionalFee: 200, isAvailable: true },
      { id: 7, name: '北海道', additionalFee: 500, isAvailable: false },
      { id: 8, name: '沖縄', additionalFee: 800, isAvailable: false },
    ],
    timeSlots: [
      {
        id: 5,
        name: '午前中',
        timeRange: '8:00-12:00',
        additionalFee: 100,
        isAvailable: true,
      },
      {
        id: 6,
        name: '午後',
        timeRange: '13:00-18:00',
        additionalFee: 100,
        isAvailable: true,
      },
    ],
    restrictions: '一部地域は対象外、重量制限10kg',
  },
  {
    id: 3,
    name: 'クール便',
    code: 'COOL',
    carrier: 'ヤマト運輸',
    type: 'COOL',
    isActive: true,
    baseFee: 700,
    estimatedDays: '2-4日',
    trackingAvailable: true,
    description: '冷蔵・冷凍商品の配送',
    regions: [
      { id: 9, name: '関東', additionalFee: 0, isAvailable: true },
      { id: 10, name: '関西', additionalFee: 150, isAvailable: true },
      { id: 11, name: '北海道', additionalFee: 400, isAvailable: true },
      { id: 12, name: '沖縄', additionalFee: 600, isAvailable: false },
    ],
    timeSlots: [
      {
        id: 7,
        name: '午前中',
        timeRange: '8:00-12:00',
        additionalFee: 0,
        isAvailable: true,
      },
      {
        id: 8,
        name: '14-16時',
        timeRange: '14:00-16:00',
        additionalFee: 0,
        isAvailable: true,
      },
    ],
    restrictions: '冷蔵・冷凍商品のみ',
  },
  {
    id: 4,
    name: 'メール便',
    code: 'MAIL',
    carrier: '日本郵便',
    type: 'MAIL',
    isActive: true,
    baseFee: 200,
    estimatedDays: '3-7日',
    trackingAvailable: false,
    description: '小型商品の低価格配送',
    regions: [
      { id: 13, name: '全国一律', additionalFee: 0, isAvailable: true },
    ],
    timeSlots: [],
    restrictions: 'A4サイズ・厚さ3cm以内・重量1kg以内',
  },
  {
    id: 5,
    name: '当日配送',
    code: 'SAME_DAY',
    carrier: 'Uber Eats',
    type: 'EXPRESS',
    isActive: false,
    baseFee: 1200,
    estimatedDays: '当日',
    trackingAvailable: true,
    description: '当日配送サービス（テスト運用中）',
    regions: [
      { id: 14, name: '東京23区', additionalFee: 0, isAvailable: true },
      { id: 15, name: '大阪市内', additionalFee: 0, isAvailable: true },
    ],
    timeSlots: [
      {
        id: 9,
        name: '2時間以内',
        timeRange: '注文から2時間',
        additionalFee: 300,
        isAvailable: true,
      },
      {
        id: 10,
        name: '4時間以内',
        timeRange: '注文から4時間',
        additionalFee: 0,
        isAvailable: true,
      },
    ],
    restrictions: '対象地域限定・営業時間内のみ',
  },
];

export default function DeliverySettingsPage() {
  const [deliveryMethods, setDeliveryMethods] =
    useState<DeliveryMethod[]>(dummyDeliveryMethods);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<DeliveryMethod | null>(
    null
  );
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const confirmDelete = useConfirmModal({
    type: 'delete',
    title: '配送方法を削除しますか？',
    onConfirm: async (methodId: number) => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setDeliveryMethods((prev) =>
          prev.filter((method) => method.id !== methodId)
        );
        toast.success('配送方法を削除しました');
      } catch (error) {
        toast.error('配送方法の削除に失敗しました');
      } finally {
        setIsLoading(false);
      }
    },
  });

  // 統計計算
  const totalMethods = deliveryMethods.length;
  const activeMethods = deliveryMethods.filter((m) => m.isActive).length;
  const inactiveMethods = deliveryMethods.filter((m) => !m.isActive).length;
  const trackingMethods = deliveryMethods.filter(
    (m) => m.trackingAvailable
  ).length;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総配送方法',
      value: totalMethods,
      description: '登録されている配送方法',
      icon: Truck,
    },
    {
      title: '有効',
      value: activeMethods,
      description: '利用可能な配送方法',
      icon: Truck,
    },
    {
      title: '無効',
      value: inactiveMethods,
      description: '停止中の配送方法',
      icon: Truck,
    },
    {
      title: '追跡可能',
      value: trackingMethods,
      description: '追跡機能付き配送方法',
      icon: Clock,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<DeliveryMethod>[] = [
    {
      key: 'name',
      label: '配送方法',
      className: 'font-medium',
    },
    {
      key: 'code',
      label: 'コード',
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'carrier',
      label: '配送業者',
    },
    {
      key: 'type',
      label: '種別',
      render: (value) => getDeliveryTypeBadge(value),
    },
    {
      key: 'baseFee',
      label: '基本送料',
      render: (value) => `¥${value.toLocaleString()}`,
      className: 'text-right',
    },
    {
      key: 'estimatedDays',
      label: '配送日数',
    },
    {
      key: 'isActive',
      label: 'ステータス',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? '有効' : '無効'}
        </Badge>
      ),
    },
    {
      key: 'trackingAvailable',
      label: '追跡',
      render: (value) => (
        <Badge variant={value ? 'default' : 'outline'}>
          {value ? '可能' : '不可'}
        </Badge>
      ),
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<DeliveryMethod>[] = [
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
      name: 'name',
      label: '配送方法名',
      type: 'text',
      placeholder: '例：通常配送',
      required: true,
    },
    {
      name: 'code',
      label: 'コード',
      type: 'text',
      placeholder: '例：STANDARD',
      required: true,
    },
    {
      name: 'carrier',
      label: '配送業者',
      type: 'select',
      required: true,
      options: [
        { value: 'ヤマト運輸', label: 'ヤマト運輸' },
        { value: '佐川急便', label: '佐川急便' },
        { value: '日本郵便', label: '日本郵便' },
        { value: 'Amazon', label: 'Amazon' },
        { value: 'Uber Eats', label: 'Uber Eats' },
        { value: '西濃運輸', label: '西濃運輸' },
      ],
    },
    {
      name: 'type',
      label: '配送種別',
      type: 'select',
      required: true,
      options: [
        { value: 'STANDARD', label: '通常配送' },
        { value: 'EXPRESS', label: '速達便' },
        { value: 'COOL', label: 'クール便' },
        { value: 'MAIL', label: 'メール便' },
      ],
    },
    {
      name: 'baseFee',
      label: '基本送料 (円)',
      type: 'number',
      placeholder: '例：500',
      required: true,
    },
    {
      name: 'freeShippingThreshold',
      label: '送料無料ライン (円)',
      type: 'number',
      placeholder: '例：5000',
      required: false,
    },
    {
      name: 'estimatedDays',
      label: '配送日数',
      type: 'select',
      required: true,
      options: [
        { value: '当日', label: '当日' },
        { value: '翌日', label: '翌日' },
        { value: '2-3日', label: '2-3日' },
        { value: '2-4日', label: '2-4日' },
        { value: '3-7日', label: '3-7日' },
        { value: '1週間以内', label: '1週間以内' },
      ],
    },
    {
      name: 'description',
      label: '説明',
      type: 'textarea',
      placeholder: '配送方法の詳細説明',
      required: false,
    },
    {
      name: 'restrictions',
      label: '制限事項',
      type: 'textarea',
      placeholder: 'サイズ制限、重量制限など',
      required: false,
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<DeliveryMethod>[] = [
    {
      title: '基本情報',
      fields: [
        {
          label: 'ID',
          key: 'id',
          formatter: (value) => <span className="font-mono">#{value}</span>,
        },
        { label: '配送方法名', key: 'name' },
        {
          label: 'コード',
          key: 'code',
          formatter: (value) => <span className="font-mono">{value}</span>,
        },
        { label: '配送業者', key: 'carrier' },
        {
          label: '配送種別',
          key: 'type',
          formatter: (value) => getDeliveryTypeBadge(value),
        },
      ],
    },
    {
      title: '料金・配送情報',
      fields: [
        {
          label: '基本送料',
          key: 'baseFee',
          formatter: (value) => `¥${value.toLocaleString()}`,
        },
        {
          label: '送料無料ライン',
          key: 'freeShippingThreshold',
          formatter: (value) =>
            value ? `¥${value.toLocaleString()}` : '設定なし',
        },
        { label: '配送日数', key: 'estimatedDays' },
        {
          label: '追跡機能',
          key: 'trackingAvailable',
          formatter: (value) => (
            <Badge variant={value ? 'default' : 'outline'}>
              {value ? '利用可能' : '利用不可'}
            </Badge>
          ),
        },
      ],
    },
    {
      title: 'ステータス',
      fields: [
        {
          label: '有効状態',
          key: 'isActive',
          formatter: (value) => (
            <Badge variant={value ? 'default' : 'secondary'}>
              {value ? '有効' : '無効'}
            </Badge>
          ),
        },
      ],
    },
    {
      title: 'その他',
      fields: [
        {
          label: '説明',
          key: 'description',
          formatter: (value) => value || 'なし',
        },
        {
          label: '制限事項',
          key: 'restrictions',
          formatter: (value) => value || 'なし',
        },
      ],
    },
  ];

  // 関連データ設定
  const relatedData: RelatedData[] = [
    {
      title: '配送地域',
      description: 'この配送方法の対応地域と追加料金',
      data: selectedMethod?.regions || [],
      columns: [
        { key: 'name', label: '地域名', className: 'font-medium' },
        {
          key: 'additionalFee',
          label: '追加料金',
          render: (value) =>
            value > 0 ? `+¥${value.toLocaleString()}` : '無料',
          className: 'text-right',
        },
        {
          key: 'isAvailable',
          label: '利用可能',
          render: (value) => (
            <Badge variant={value ? 'default' : 'secondary'}>
              {value ? '可能' : '不可'}
            </Badge>
          ),
        },
      ],
      emptyMessage: '地域設定がありません',
    },
    {
      title: '配送時間帯',
      description: 'この配送方法の時間帯指定オプション',
      data: selectedMethod?.timeSlots || [],
      columns: [
        { key: 'name', label: '時間帯名', className: 'font-medium' },
        { key: 'timeRange', label: '時間範囲' },
        {
          key: 'additionalFee',
          label: '追加料金',
          render: (value) =>
            value > 0 ? `+¥${value.toLocaleString()}` : '無料',
          className: 'text-right',
        },
        {
          key: 'isAvailable',
          label: '利用可能',
          render: (value) => (
            <Badge variant={value ? 'default' : 'secondary'}>
              {value ? '可能' : '不可'}
            </Badge>
          ),
        },
      ],
      emptyMessage: '時間帯指定はありません',
    },
  ];

  // 配送方法作成
  const handleCreate = async (data: DeliveryMethodFormData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newMethod: DeliveryMethod = {
        id: Math.max(...deliveryMethods.map((m) => m.id)) + 1,
        name: data.name,
        code: data.code,
        carrier: data.carrier,
        type: data.type,
        isActive: data.isActive,
        baseFee: data.baseFee,
        freeShippingThreshold: data.freeShippingThreshold,
        estimatedDays: data.estimatedDays,
        trackingAvailable: data.trackingAvailable,
        description: data.description,
        restrictions: data.restrictions,
        regions: [],
        timeSlots: [],
      };

      setDeliveryMethods((prev) => [...prev, newMethod]);
      setIsCreateDialogOpen(false);
      toast.success('配送方法を作成しました');
    } catch (error) {
      toast.error('配送方法の作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 配送方法編集
  const handleEdit = async (data: DeliveryMethodFormData) => {
    if (!editingMethod) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setDeliveryMethods((prev) =>
        prev.map((method) =>
          method.id === editingMethod.id ? { ...method, ...data } : method
        )
      );

      setIsEditDialogOpen(false);
      setEditingMethod(null);
      toast.success('配送方法を更新しました');
    } catch (error) {
      toast.error('配送方法の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  function openEditDialog(method: DeliveryMethod) {
    setEditingMethod(method);
    setIsEditDialogOpen(true);
  }

  function openDetailSheet(method: DeliveryMethod) {
    setSelectedMethod(method);
    setIsDetailSheetOpen(true);
  }

  function handleDelete(method: DeliveryMethod) {
    const description = `「${method.name}」を削除しますか？`;
    const details = '削除すると、この配送方法は利用できなくなります。';
    confirmDelete.show(description, details, method.id);
  }

  // 配送種別のバッジ
  function getDeliveryTypeBadge(type: DeliveryType) {
    const typeMap = {
      STANDARD: { label: '通常', variant: 'default' as const },
      EXPRESS: { label: '速達', variant: 'default' as const },
      COOL: { label: 'クール', variant: 'default' as const },
      MAIL: { label: 'メール', variant: 'secondary' as const },
    };

    const config = typeMap[type] || {
      label: type,
      variant: 'secondary' as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader title="配送設定" description="配送方法の管理と設定">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </PageHeader>

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メインテーブル */}
      <EntityTable
        title="配送方法一覧"
        description="設定されている配送方法を管理します"
        data={deliveryMethods}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="配送方法名、配送業者で検索..."
        onRowClick={openDetailSheet}
      />

      {/* 新規作成ダイアログ */}
      <EntityFormDialog
        title="新しい配送方法を作成"
        description="新しい配送方法を登録します。"
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        fields={formFields}
        schema={deliveryMethodSchema}
        defaultValues={{
          name: '',
          code: '',
          carrier: '',
          type: 'STANDARD',
          isActive: true,
          baseFee: '',
          freeShippingThreshold: '',
          estimatedDays: '',
          trackingAvailable: true,
          description: '',
          restrictions: '',
        }}
        onSubmit={handleCreate}
        isLoading={isLoading}
        submitLabel="作成"
      />

      {/* 編集ダイアログ */}
      <EntityFormDialog
        title="配送方法を編集"
        description="配送方法の設定を変更します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={formFields}
        schema={deliveryMethodSchema}
        defaultValues={
          editingMethod
            ? {
                name: editingMethod.name,
                code: editingMethod.code,
                carrier: editingMethod.carrier,
                type: editingMethod.type,
                isActive: editingMethod.isActive,
                baseFee: editingMethod.baseFee.toString(),
                freeShippingThreshold:
                  editingMethod.freeShippingThreshold?.toString() || '',
                estimatedDays: editingMethod.estimatedDays,
                trackingAvailable: editingMethod.trackingAvailable,
                description: editingMethod.description || '',
                restrictions: editingMethod.restrictions || '',
              }
            : {}
        }
        onSubmit={handleEdit}
        isLoading={isLoading}
        submitLabel="更新"
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="配送方法詳細"
        description="配送方法の詳細設定を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedMethod}
        sections={detailSections}
        relatedData={relatedData}
        actions={[
          {
            label: '編集',
            icon: Edit,
            variant: 'outline',
            onClick: (method) => {
              setIsDetailSheetOpen(false);
              openEditDialog(method);
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
