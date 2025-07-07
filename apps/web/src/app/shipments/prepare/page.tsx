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
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Filter,
  Package,
  Plus,
  Search,
  Truck,
} from 'lucide-react';
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

// 配送準備の型定義
interface PrepareShipment extends BaseEntity {
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  orderDate: string;
  expectedShipDate: string;
  prepareStatus: PrepareStatus;
  items: PrepareItem[];
  totalWeight?: number;
  packagingNotes?: string;
  priority: 'HIGH' | 'NORMAL' | 'LOW';
}

interface PrepareItem {
  id: number;
  productName: string;
  quantity: number;
  weight?: number;
  isPrepared: boolean;
  notes?: string;
}

type PrepareStatus = 'PENDING' | 'PREPARING' | 'PREPARED' | 'SHIPPED';

// バリデーションスキーマ
const prepareSchema = z.object({
  prepareStatus: z.enum(['PENDING', 'PREPARING', 'PREPARED', 'SHIPPED']),
  expectedShipDate: z.string().min(1, '予定発送日は必須です'),
  packagingNotes: z
    .string()
    .max(500, '梱包メモは500文字以内で入力してください')
    .optional(),
  priority: z.enum(['HIGH', 'NORMAL', 'LOW']),
});

type PrepareFormData = z.infer<typeof prepareSchema>;

// ダミーデータ
const dummyPrepareShipments: PrepareShipment[] = [
  {
    id: 1,
    orderId: 1,
    orderNumber: 'ORD-2024-001',
    customerName: '田中太郎',
    customerEmail: 'tanaka@example.com',
    shippingAddress: '東京都渋谷区xxx-xxx',
    orderDate: '2024-03-01',
    expectedShipDate: '2024-03-05',
    prepareStatus: 'PENDING',
    priority: 'HIGH',
    totalWeight: 0.7,
    items: [
      {
        id: 1,
        productName: 'スマートフォン',
        quantity: 1,
        weight: 0.2,
        isPrepared: false,
      },
      {
        id: 2,
        productName: 'オーガニックコーヒー',
        quantity: 1,
        weight: 0.5,
        isPrepared: false,
      },
    ],
  },
  {
    id: 2,
    orderId: 2,
    orderNumber: 'ORD-2024-002',
    customerName: '佐藤花子',
    customerEmail: 'sato@example.com',
    shippingAddress: '大阪府大阪市xxx-xxx',
    orderDate: '2024-03-02',
    expectedShipDate: '2024-03-06',
    prepareStatus: 'PREPARING',
    priority: 'NORMAL',
    totalWeight: 0.1,
    items: [
      {
        id: 3,
        productName: 'ワイヤレスイヤホン',
        quantity: 1,
        weight: 0.1,
        isPrepared: true,
      },
    ],
  },
  {
    id: 3,
    orderId: 3,
    orderNumber: 'ORD-2024-003',
    customerName: '鈴木一郎',
    customerEmail: 'suzuki@example.com',
    shippingAddress: '愛知県名古屋市xxx-xxx',
    orderDate: '2024-03-01',
    expectedShipDate: '2024-03-04',
    prepareStatus: 'PREPARED',
    priority: 'HIGH',
    totalWeight: 0.7,
    packagingNotes: '壊れ物注意',
    items: [
      {
        id: 4,
        productName: 'プレミアムTシャツ',
        quantity: 1,
        weight: 0.3,
        isPrepared: true,
      },
      {
        id: 5,
        productName: 'ビジネス書籍',
        quantity: 1,
        weight: 0.4,
        isPrepared: true,
      },
    ],
  },
  {
    id: 4,
    orderId: 4,
    orderNumber: 'ORD-2024-004',
    customerName: '山田美咲',
    customerEmail: 'yamada@example.com',
    shippingAddress: '福岡県福岡市xxx-xxx',
    orderDate: '2024-02-28',
    expectedShipDate: '2024-03-03',
    prepareStatus: 'SHIPPED',
    priority: 'LOW',
    totalWeight: 0.8,
    items: [
      {
        id: 6,
        productName: 'ビジネス書籍',
        quantity: 2,
        weight: 0.8,
        isPrepared: true,
      },
    ],
  },
];

export default function ShipmentPreparePage() {
  const [shipments, setShipments] = useState<PrepareShipment[]>(
    dummyPrepareShipments
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingShipment, setEditingShipment] =
    useState<PrepareShipment | null>(null);
  const [selectedShipment, setSelectedShipment] =
    useState<PrepareShipment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 統計計算
  const totalShipments = shipments.length;
  const pendingShipments = shipments.filter(
    (s) => s.prepareStatus === 'PENDING'
  ).length;
  const preparingShipments = shipments.filter(
    (s) => s.prepareStatus === 'PREPARING'
  ).length;
  const preparedShipments = shipments.filter(
    (s) => s.prepareStatus === 'PREPARED'
  ).length;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総配送予定',
      value: totalShipments,
      description: '配送準備対象の注文',
      icon: Package,
    },
    {
      title: '準備待ち',
      value: pendingShipments,
      description: '準備開始待ちの注文',
      icon: Clock,
    },
    {
      title: '準備中',
      value: preparingShipments,
      description: '現在準備中の注文',
      icon: Package,
    },
    {
      title: '準備完了',
      value: preparedShipments,
      description: '発送可能な注文',
      icon: CheckCircle,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<PrepareShipment>[] = [
    {
      key: 'orderNumber',
      label: '注文番号',
      render: (value) => <span className="font-mono">{value}</span>,
    },
    {
      key: 'customerName',
      label: '顧客名',
      className: 'font-medium',
    },
    {
      key: 'expectedShipDate',
      label: '予定発送日',
      render: (value) => {
        const isUrgent =
          new Date(value) <= new Date(Date.now() + 24 * 60 * 60 * 1000);
        return (
          <span className={isUrgent ? 'font-medium text-red-600' : ''}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'priority',
      label: '優先度',
      render: (value) => getPriorityBadge(value),
    },
    {
      key: 'prepareStatus',
      label: '準備状況',
      render: (value) => getPrepareStatusBadge(value),
    },
    {
      key: 'items',
      label: '商品数',
      render: (items) => `${items.length}点`,
    },
    {
      key: 'totalWeight',
      label: '総重量',
      render: (value) => (value ? `${value}kg` : '未設定'),
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<PrepareShipment>[] = [
    {
      label: '詳細を見る',
      icon: Eye,
      onClick: openDetailSheet,
    },
    {
      label: '準備状況を更新',
      icon: Edit,
      onClick: openEditDialog,
      show: (shipment) => shipment.prepareStatus !== 'SHIPPED',
    },
  ];

  // フォームフィールドの設定
  const formFields: FormField[] = [
    {
      name: 'prepareStatus',
      label: '準備状況',
      type: 'select',
      required: true,
      options: [
        { value: 'PENDING', label: '準備待ち' },
        { value: 'PREPARING', label: '準備中' },
        { value: 'PREPARED', label: '準備完了' },
        { value: 'SHIPPED', label: '発送済み' },
      ],
    },
    {
      name: 'expectedShipDate',
      label: '予定発送日',
      type: 'text',
      placeholder: '例：2024-03-05',
      required: true,
    },
    {
      name: 'priority',
      label: '優先度',
      type: 'select',
      required: true,
      options: [
        { value: 'HIGH', label: '高' },
        { value: 'NORMAL', label: '通常' },
        { value: 'LOW', label: '低' },
      ],
    },
    {
      name: 'packagingNotes',
      label: '梱包メモ',
      type: 'textarea',
      placeholder: '梱包時の注意事項を入力してください',
      required: false,
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<PrepareShipment>[] = [
    {
      title: '注文基本情報',
      fields: [
        {
          label: '注文ID',
          key: 'orderId',
          formatter: (value) => <span className="font-mono">#{value}</span>,
        },
        {
          label: '注文番号',
          key: 'orderNumber',
          formatter: (value) => <span className="font-mono">{value}</span>,
        },
        {
          label: '注文日',
          key: 'orderDate',
        },
        {
          label: '予定発送日',
          key: 'expectedShipDate',
        },
      ],
    },
    {
      title: '顧客・配送先情報',
      fields: [
        { label: '顧客名', key: 'customerName' },
        { label: 'メールアドレス', key: 'customerEmail' },
        { label: '配送先住所', key: 'shippingAddress' },
      ],
    },
    {
      title: '準備状況',
      fields: [
        {
          label: '準備状況',
          key: 'prepareStatus',
          formatter: (value) => getPrepareStatusBadge(value),
        },
        {
          label: '優先度',
          key: 'priority',
          formatter: (value) => getPriorityBadge(value),
        },
        {
          label: '総重量',
          key: 'totalWeight',
          formatter: (value) => (value ? `${value}kg` : '未設定'),
        },
        {
          label: '梱包メモ',
          key: 'packagingNotes',
          formatter: (value) => value || 'なし',
        },
      ],
    },
  ];

  // 関連データ設定（準備商品）
  const relatedData: RelatedData[] = [
    {
      title: '準備商品一覧',
      description: 'この注文の商品の準備状況',
      data: selectedShipment?.items || [],
      columns: [
        { key: 'productName', label: '商品名' },
        { key: 'quantity', label: '数量', render: (value) => `${value}個` },
        {
          key: 'weight',
          label: '重量',
          render: (value) => (value ? `${value}kg` : '未設定'),
        },
        {
          key: 'isPrepared',
          label: '準備状況',
          render: (value) => (
            <Badge variant={value ? 'default' : 'secondary'}>
              {value ? '準備完了' : '未準備'}
            </Badge>
          ),
        },
        {
          key: 'notes',
          label: '備考',
          render: (value) => value || '-',
        },
      ],
      emptyMessage: '商品がありません',
    },
  ];

  // 準備状況更新
  const handleEdit = async (data: PrepareFormData) => {
    if (!editingShipment) return;

    setIsLoading(true);
    try {
      // TODO: API call to update shipment preparation
      await new Promise((resolve) => setTimeout(resolve, 1000)); // ダミー遅延

      setShipments((prev) =>
        prev.map((shipment) =>
          shipment.id === editingShipment.id
            ? {
                ...shipment,
                prepareStatus: data.prepareStatus,
                expectedShipDate: data.expectedShipDate,
                priority: data.priority,
                packagingNotes: data.packagingNotes,
              }
            : shipment
        )
      );

      setIsEditDialogOpen(false);
      setEditingShipment(null);
      toast.success('準備状況を更新しました');
    } catch (error) {
      toast.error('準備状況の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 編集ダイアログを開く
  function openEditDialog(shipment: PrepareShipment) {
    setEditingShipment(shipment);
    setIsEditDialogOpen(true);
  }

  // 詳細シートを開く
  function openDetailSheet(shipment: PrepareShipment) {
    setSelectedShipment(shipment);
    setIsDetailSheetOpen(true);
  }

  // 準備ステータスのバッジ
  function getPrepareStatusBadge(status: PrepareStatus) {
    const statusMap = {
      PENDING: {
        label: '準備待ち',
        variant: 'secondary' as const,
        icon: Clock,
      },
      PREPARING: {
        label: '準備中',
        variant: 'default' as const,
        icon: Package,
      },
      PREPARED: {
        label: '準備完了',
        variant: 'default' as const,
        icon: CheckCircle,
      },
      SHIPPED: { label: '発送済み', variant: 'default' as const, icon: Truck },
    };

    const config = statusMap[status] || {
      label: status,
      variant: 'secondary' as const,
      icon: Clock,
    };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  }

  // 優先度のバッジ
  function getPriorityBadge(priority: 'HIGH' | 'NORMAL' | 'LOW') {
    const priorityMap = {
      HIGH: { label: '高', variant: 'destructive' as const },
      NORMAL: { label: '通常', variant: 'default' as const },
      LOW: { label: '低', variant: 'secondary' as const },
    };

    const config = priorityMap[priority] || {
      label: priority,
      variant: 'secondary' as const,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title="配送準備"
        description="注文の配送準備状況を管理します"
      />

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メインテーブル */}
      <EntityTable
        title="配送準備一覧"
        description="配送準備が必要な注文を管理します"
        data={shipments}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="注文番号、顧客名で検索..."
        onRowClick={openDetailSheet}
      />

      {/* 編集ダイアログ */}
      <EntityFormDialog
        title="準備状況を更新"
        description="配送準備の状況を更新します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={formFields}
        schema={prepareSchema}
        defaultValues={
          editingShipment
            ? {
                prepareStatus: editingShipment.prepareStatus,
                expectedShipDate: editingShipment.expectedShipDate,
                priority: editingShipment.priority,
                packagingNotes: editingShipment.packagingNotes || '',
              }
            : {}
        }
        onSubmit={handleEdit}
        isLoading={isLoading}
        submitLabel="更新"
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="配送準備詳細"
        description="注文の詳細情報と準備状況を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedShipment}
        sections={detailSections}
        relatedData={relatedData}
        actions={[
          {
            label: '準備状況を更新',
            icon: Edit,
            variant: 'outline',
            onClick: (shipment) => {
              setIsDetailSheetOpen(false);
              openEditDialog(shipment);
            },
          },
        ]}
        isLoading={isLoading}
      />
    </div>
  );
}
