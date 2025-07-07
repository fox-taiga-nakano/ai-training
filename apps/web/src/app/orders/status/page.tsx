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
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Package,
  RefreshCcw,
  Truck,
  XCircle,
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

// 注文ステータス管理の型定義
interface StatusOrder extends BaseEntity {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  orderDate: string;
  updatedAt: string;
  statusHistory: StatusHistoryItem[];
  canUpdateTo: OrderStatus[];
  priority: 'HIGH' | 'NORMAL' | 'LOW';
  notes?: string;
  items: StatusOrderItem[];
}

interface StatusOrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface StatusHistoryItem {
  id: number;
  status: OrderStatus;
  changedAt: string;
  changedBy: string;
  notes?: string;
}

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELED';
type PaymentStatus = 'UNPAID' | 'AUTHORIZED' | 'PAID' | 'REFUNDED';

// バリデーションスキーマ
const statusUpdateSchema = z.object({
  orderStatus: z.enum([
    'PENDING',
    'CONFIRMED',
    'SHIPPED',
    'COMPLETED',
    'CANCELED',
  ]),
  notes: z
    .string()
    .max(500, 'ステータス変更理由は500文字以内で入力してください')
    .optional(),
});

type StatusUpdateFormData = z.infer<typeof statusUpdateSchema>;

// ダミーデータ
const dummyOrders: StatusOrder[] = [
  {
    id: 1,
    orderNumber: 'ORD-2024-001',
    customerName: '田中太郎',
    customerEmail: 'tanaka@example.com',
    totalAmount: 89800,
    orderStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    orderDate: '2024-03-01',
    updatedAt: '2024-03-02 10:30',
    priority: 'HIGH',
    canUpdateTo: ['SHIPPED', 'CANCELED'],
    items: [
      { id: 1, productName: 'スマートフォン', quantity: 1, unitPrice: 89800 },
    ],
    statusHistory: [
      {
        id: 1,
        status: 'PENDING',
        changedAt: '2024-03-01 10:00',
        changedBy: 'システム',
        notes: '注文受付',
      },
      {
        id: 2,
        status: 'CONFIRMED',
        changedAt: '2024-03-02 10:30',
        changedBy: '田中（管理者）',
        notes: '在庫確認完了、支払い確認済み',
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD-2024-002',
    customerName: '佐藤花子',
    customerEmail: 'sato@example.com',
    totalAmount: 15000,
    orderStatus: 'PENDING',
    paymentStatus: 'UNPAID',
    orderDate: '2024-03-02',
    updatedAt: '2024-03-02 15:00',
    priority: 'NORMAL',
    canUpdateTo: ['CONFIRMED', 'CANCELED'],
    notes: '支払い確認待ち',
    items: [
      {
        id: 2,
        productName: 'ワイヤレスイヤホン',
        quantity: 1,
        unitPrice: 15000,
      },
    ],
    statusHistory: [
      {
        id: 3,
        status: 'PENDING',
        changedAt: '2024-03-02 15:00',
        changedBy: 'システム',
        notes: '注文受付',
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'ORD-2024-003',
    customerName: '鈴木一郎',
    customerEmail: 'suzuki@example.com',
    totalAmount: 8500,
    orderStatus: 'SHIPPED',
    paymentStatus: 'PAID',
    orderDate: '2024-02-28',
    updatedAt: '2024-03-01 14:00',
    priority: 'NORMAL',
    canUpdateTo: ['COMPLETED'],
    items: [
      { id: 3, productName: 'プレミアムTシャツ', quantity: 1, unitPrice: 4500 },
      { id: 4, productName: 'ビジネス書籍', quantity: 1, unitPrice: 4000 },
    ],
    statusHistory: [
      {
        id: 4,
        status: 'PENDING',
        changedAt: '2024-02-28 09:00',
        changedBy: 'システム',
      },
      {
        id: 5,
        status: 'CONFIRMED',
        changedAt: '2024-02-28 11:00',
        changedBy: '佐藤（管理者）',
      },
      {
        id: 6,
        status: 'SHIPPED',
        changedAt: '2024-03-01 14:00',
        changedBy: '配送センター',
        notes: 'ヤマト運輸にて発送',
      },
    ],
  },
  {
    id: 4,
    orderNumber: 'ORD-2024-004',
    customerName: '山田美咲',
    customerEmail: 'yamada@example.com',
    totalAmount: 8000,
    orderStatus: 'CANCELED',
    paymentStatus: 'REFUNDED',
    orderDate: '2024-02-25',
    updatedAt: '2024-02-26 16:00',
    priority: 'LOW',
    canUpdateTo: [],
    notes: 'お客様都合によりキャンセル',
    items: [
      { id: 5, productName: 'ビジネス書籍', quantity: 2, unitPrice: 4000 },
    ],
    statusHistory: [
      {
        id: 7,
        status: 'PENDING',
        changedAt: '2024-02-25 13:00',
        changedBy: 'システム',
      },
      {
        id: 8,
        status: 'CONFIRMED',
        changedAt: '2024-02-25 15:00',
        changedBy: '田中（管理者）',
      },
      {
        id: 9,
        status: 'CANCELED',
        changedAt: '2024-02-26 16:00',
        changedBy: '佐藤（管理者）',
        notes: 'お客様より依頼、返金処理済み',
      },
    ],
  },
  {
    id: 5,
    orderNumber: 'ORD-2024-005',
    customerName: '高橋健太',
    customerEmail: 'takahashi@example.com',
    totalAmount: 25000,
    orderStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    orderDate: '2024-02-20',
    updatedAt: '2024-02-23 16:30',
    priority: 'HIGH',
    canUpdateTo: [],
    items: [
      { id: 6, productName: 'ノートパソコン', quantity: 1, unitPrice: 25000 },
    ],
    statusHistory: [
      {
        id: 10,
        status: 'PENDING',
        changedAt: '2024-02-20 10:00',
        changedBy: 'システム',
      },
      {
        id: 11,
        status: 'CONFIRMED',
        changedAt: '2024-02-20 14:00',
        changedBy: '田中（管理者）',
      },
      {
        id: 12,
        status: 'SHIPPED',
        changedAt: '2024-02-22 09:00',
        changedBy: '配送センター',
      },
      {
        id: 13,
        status: 'COMPLETED',
        changedAt: '2024-02-23 16:30',
        changedBy: 'システム',
        notes: '配送完了確認',
      },
    ],
  },
];

export default function OrderStatusPage() {
  const [orders, setOrders] = useState<StatusOrder[]>(dummyOrders);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<StatusOrder | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<StatusOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');

  // フィルタリングされた注文
  const filteredOrders = statusFilter
    ? orders.filter((order) => order.orderStatus === statusFilter)
    : orders;

  // 統計計算
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === 'PENDING'
  ).length;
  const confirmedOrders = orders.filter(
    (o) => o.orderStatus === 'CONFIRMED'
  ).length;
  const shippedOrders = orders.filter(
    (o) => o.orderStatus === 'SHIPPED'
  ).length;
  const completedOrders = orders.filter(
    (o) => o.orderStatus === 'COMPLETED'
  ).length;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '保留中',
      value: pendingOrders,
      description: '処理待ちの注文',
      icon: Clock,
    },
    {
      title: '確認済み',
      value: confirmedOrders,
      description: '処理開始可能な注文',
      icon: CheckCircle,
    },
    {
      title: '発送済み',
      value: shippedOrders,
      description: '配送中の注文',
      icon: Truck,
    },
    {
      title: '完了',
      value: completedOrders,
      description: '完了した注文',
      icon: Package,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<StatusOrder>[] = [
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
      key: 'orderDate',
      label: '注文日',
    },
    {
      key: 'totalAmount',
      label: '注文金額',
      render: (value) => `¥${value.toLocaleString()}`,
      className: 'text-right',
    },
    {
      key: 'orderStatus',
      label: '注文状況',
      render: (value) => getOrderStatusBadge(value),
    },
    {
      key: 'paymentStatus',
      label: '支払状況',
      render: (value) => getPaymentStatusBadge(value),
    },
    {
      key: 'priority',
      label: '優先度',
      render: (value) => getPriorityBadge(value),
    },
    {
      key: 'updatedAt',
      label: '最終更新',
      render: (value) => (
        <span className="text-muted-foreground text-sm">{value}</span>
      ),
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<StatusOrder>[] = [
    {
      label: '詳細を見る',
      icon: Eye,
      onClick: openDetailSheet,
    },
    {
      label: 'ステータス更新',
      icon: Edit,
      onClick: openEditDialog,
      show: (order) => order.canUpdateTo.length > 0,
    },
  ];

  // フォームフィールドの設定
  const getFormFields = (order: StatusOrder | null): FormField[] => [
    {
      name: 'orderStatus',
      label: '新しいステータス',
      type: 'select',
      required: true,
      options:
        order?.canUpdateTo.map((status) => ({
          value: status,
          label: getStatusLabel(status),
        })) || [],
    },
    {
      name: 'notes',
      label: 'ステータス変更理由',
      type: 'textarea',
      placeholder: 'ステータス変更の理由や備考を入力してください',
      required: false,
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<StatusOrder>[] = [
    {
      title: '注文基本情報',
      fields: [
        {
          label: '注文ID',
          key: 'id',
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
          label: '最終更新',
          key: 'updatedAt',
        },
      ],
    },
    {
      title: '顧客情報',
      fields: [
        { label: '顧客名', key: 'customerName' },
        { label: 'メールアドレス', key: 'customerEmail' },
      ],
    },
    {
      title: 'ステータス情報',
      fields: [
        {
          label: '現在のステータス',
          key: 'orderStatus',
          formatter: (value) => getOrderStatusBadge(value),
        },
        {
          label: '支払状況',
          key: 'paymentStatus',
          formatter: (value) => getPaymentStatusBadge(value),
        },
        {
          label: '優先度',
          key: 'priority',
          formatter: (value) => getPriorityBadge(value),
        },
        {
          label: '備考',
          key: 'notes',
          formatter: (value) => value || 'なし',
        },
      ],
    },
  ];

  // 関連データ設定
  const relatedData: RelatedData[] = [
    {
      title: '注文商品',
      description: 'この注文に含まれる商品一覧',
      data: selectedOrder?.items || [],
      columns: [
        { key: 'productName', label: '商品名', className: 'font-medium' },
        { key: 'quantity', label: '数量', render: (value) => `${value}個` },
        {
          key: 'unitPrice',
          label: '単価',
          render: (value) => `¥${value.toLocaleString()}`,
          className: 'text-right',
        },
      ],
      emptyMessage: '商品がありません',
    },
    {
      title: 'ステータス履歴',
      description: 'この注文のステータス変更履歴',
      data: selectedOrder?.statusHistory || [],
      columns: [
        {
          key: 'changedAt',
          label: '変更日時',
          render: (value) => <span className="font-mono text-sm">{value}</span>,
        },
        {
          key: 'status',
          label: 'ステータス',
          render: (value) => getOrderStatusBadge(value),
        },
        { key: 'changedBy', label: '変更者' },
        {
          key: 'notes',
          label: '備考',
          render: (value) => value || '-',
        },
      ],
      emptyMessage: '履歴がありません',
    },
  ];

  // ステータス更新
  const handleStatusUpdate = async (data: StatusUpdateFormData) => {
    if (!editingOrder) return;

    setIsLoading(true);
    try {
      // TODO: API call to update order status
      await new Promise((resolve) => setTimeout(resolve, 1000)); // ダミー遅延

      const now = new Date().toISOString().replace('T', ' ').substring(0, 16);

      setOrders((prev) =>
        prev.map((order) =>
          order.id === editingOrder.id
            ? {
                ...order,
                orderStatus: data.orderStatus,
                updatedAt: now,
                canUpdateTo: getNextStatuses(data.orderStatus),
                statusHistory: [
                  ...order.statusHistory,
                  {
                    id: order.statusHistory.length + 1,
                    status: data.orderStatus,
                    changedAt: now,
                    changedBy: '管理者',
                    notes: data.notes,
                  },
                ],
              }
            : order
        )
      );

      setIsEditDialogOpen(false);
      setEditingOrder(null);
      toast.success('注文ステータスを更新しました');
    } catch (error) {
      toast.error('ステータスの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 編集ダイアログを開く
  function openEditDialog(order: StatusOrder) {
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  }

  // 詳細シートを開く
  function openDetailSheet(order: StatusOrder) {
    setSelectedOrder(order);
    setIsDetailSheetOpen(true);
  }

  // 次のステータス候補を取得
  function getNextStatuses(currentStatus: OrderStatus): OrderStatus[] {
    const statusFlow = {
      PENDING: ['CONFIRMED', 'CANCELED'],
      CONFIRMED: ['SHIPPED', 'CANCELED'],
      SHIPPED: ['COMPLETED'],
      COMPLETED: [],
      CANCELED: [],
    };
    return (statusFlow[currentStatus] || []) as OrderStatus[];
  }

  // ステータスラベル取得
  function getStatusLabel(status: OrderStatus): string {
    const labels = {
      PENDING: '保留中',
      CONFIRMED: '確認済み',
      SHIPPED: '発送済み',
      COMPLETED: '完了',
      CANCELED: 'キャンセル',
    };
    return labels[status] || status;
  }

  // 注文ステータスのバッジ
  function getOrderStatusBadge(status: OrderStatus) {
    const statusMap = {
      PENDING: { label: '保留中', variant: 'secondary' as const, icon: Clock },
      CONFIRMED: {
        label: '確認済み',
        variant: 'default' as const,
        icon: CheckCircle,
      },
      SHIPPED: { label: '発送済み', variant: 'default' as const, icon: Truck },
      COMPLETED: { label: '完了', variant: 'default' as const, icon: Package },
      CANCELED: {
        label: 'キャンセル',
        variant: 'destructive' as const,
        icon: XCircle,
      },
    };

    const config = statusMap[status] || {
      label: status,
      variant: 'secondary' as const,
      icon: AlertCircle,
    };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  }

  // 支払ステータスのバッジ
  function getPaymentStatusBadge(status: PaymentStatus) {
    const statusMap = {
      UNPAID: { label: '未払い', variant: 'destructive' as const },
      AUTHORIZED: { label: '承認済み', variant: 'secondary' as const },
      PAID: { label: '支払済み', variant: 'default' as const },
      REFUNDED: { label: '返金済み', variant: 'secondary' as const },
    };

    const config = statusMap[status] || {
      label: status,
      variant: 'secondary' as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
        title="ステータス管理"
        description="注文のステータスを一元管理します"
      >
        <div className="flex gap-2">
          <select
            className="border-input bg-background rounded-md border px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">すべてのステータス</option>
            <option value="PENDING">保留中</option>
            <option value="CONFIRMED">確認済み</option>
            <option value="SHIPPED">発送済み</option>
            <option value="COMPLETED">完了</option>
            <option value="CANCELED">キャンセル</option>
          </select>
          <Button onClick={() => window.location.reload()} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            更新
          </Button>
        </div>
      </PageHeader>

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メインテーブル */}
      <EntityTable
        title="注文ステータス一覧"
        description={`${filteredOrders.length}件の注文を表示しています`}
        data={filteredOrders}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="注文番号、顧客名で検索..."
        onRowClick={openDetailSheet}
      />

      {/* ステータス更新ダイアログ */}
      <EntityFormDialog
        title="ステータス更新"
        description="注文のステータスを更新します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={getFormFields(editingOrder)}
        schema={statusUpdateSchema}
        defaultValues={{
          orderStatus: '',
          notes: '',
        }}
        onSubmit={handleStatusUpdate}
        isLoading={isLoading}
        submitLabel="ステータス更新"
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="注文詳細"
        description="注文の詳細情報とステータス履歴を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedOrder}
        sections={detailSections}
        relatedData={relatedData}
        actions={[
          {
            label: 'ステータス更新',
            icon: Edit,
            variant: 'outline',
            onClick: (order) => {
              setIsDetailSheetOpen(false);
              openEditDialog(order);
            },
            show: (order) => order.canUpdateTo.length > 0,
          },
        ]}
        isLoading={isLoading}
      />
    </div>
  );
}
