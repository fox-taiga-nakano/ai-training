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
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import type { Order, OrderStatus, PaymentStatus } from '@/lib/api/types';

import {
  EntityDetailSheet,
  EntityFormDialog,
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';
import {
  useDeleteOrder,
  useOrders,
  useUpdateOrderStatus,
} from '@/hooks/api/use-orders';
import { useConfirmModal } from '@/hooks/useConfirmModal';

// 注文の型定義は @/lib/api/types からインポート

// バリデーションスキーマ（ステータス更新用）
const orderStatusSchema = z.object({
  orderStatus: z.enum([
    'PENDING',
    'CONFIRMED',
    'SHIPPED',
    'COMPLETED',
    'CANCELED',
  ]),
});

type OrderStatusFormData = z.infer<typeof orderStatusSchema>;

export default function OrdersPage() {
  // APIフックの使用
  const {
    orders,
    isLoading: isOrdersLoading,
    revalidate: revalidateOrders,
  } = useOrders();
  const { updateOrderStatus } = useUpdateOrderStatus();
  const { deleteOrder } = useDeleteOrder();

  // ローカル状態
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // ローディング状態の統合
  const isLoading = isOrdersLoading || isOperationLoading;

  // 統計計算
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) =>
      order.paymentStatus === 'PAID'
        ? sum + order.totalAmount + (order.shippingFee || 0)
        : sum,
    0
  );
  const pendingOrders = orders.filter(
    (order) => order.orderStatus === 'PENDING'
  ).length;
  const unpaidOrders = orders.filter(
    (order) => order.paymentStatus === 'UNPAID'
  ).length;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総注文数',
      value: totalOrders,
      description: '全ての注文',
      icon: ShoppingBag,
    },
    {
      title: '総売上',
      value: `¥${totalRevenue.toLocaleString()}`,
      description: '支払済み注文の合計',
      icon: DollarSign,
    },
    {
      title: '処理待ち',
      value: pendingOrders,
      description: '確認待ちの注文',
      icon: Clock,
    },
    {
      title: '未払い',
      value: unpaidOrders,
      description: '支払い待ちの注文',
      icon: CreditCard,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<Order>[] = [
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
      key: 'totalAmount',
      label: '合計金額',
      render: (value, row) =>
        `¥${(value + (row.shippingFee || 0)).toLocaleString()}`,
    },
    {
      key: 'orderStatus',
      label: '注文状況',
      render: (value) => getOrderStatusBadge(value),
    },
    {
      key: 'paymentStatus',
      label: '支払い状況',
      render: (value) => getPaymentStatusBadge(value),
    },
    {
      key: 'orderDate',
      label: '注文日',
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<Order>[] = [
    {
      label: '詳細を見る',
      icon: Eye,
      onClick: openDetailSheet,
    },
    {
      label: '編集',
      icon: Edit,
      onClick: openEditDialog,
      show: (order) =>
        order.orderStatus !== 'COMPLETED' && order.orderStatus !== 'CANCELED',
    },
    {
      label: 'キャンセル',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleCancel,
      show: (order) =>
        order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED',
    },
  ];

  // フォームフィールドの設定（ステータス更新用）
  const formFields: FormField[] = [
    {
      name: 'orderStatus',
      label: '注文状況',
      type: 'select',
      required: true,
      options: [
        { value: 'PENDING', label: '保留中' },
        { value: 'CONFIRMED', label: '確認済み' },
        { value: 'SHIPPED', label: '発送済み' },
        { value: 'COMPLETED', label: '完了' },
        { value: 'CANCELED', label: 'キャンセル' },
      ],
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<Order>[] = [
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
        { label: '注文日', key: 'orderDate' },
        {
          label: '希望到着日',
          key: 'desiredArrivalDate',
          formatter: (value) => value || '指定なし',
        },
        {
          label: '注文状況',
          key: 'orderStatus',
          formatter: (value) => getOrderStatusBadge(value),
        },
      ],
    },
    {
      title: '顧客情報',
      fields: [
        { label: '顧客名', key: 'customerName' },
        { label: 'メールアドレス', key: 'customerEmail' },
        { label: '配送先住所', key: 'shippingAddress' },
      ],
    },
    {
      title: '支払い・配送情報',
      fields: [
        {
          label: '商品合計',
          key: 'totalAmount',
          formatter: (value) => `¥${value.toLocaleString()}`,
        },
        {
          label: '配送料',
          key: 'shippingFee',
          formatter: (value) => `¥${(value || 0).toLocaleString()}`,
        },
        {
          label: '総合計',
          key: 'totalAmount',
          formatter: (_, row) =>
            `¥${(row.totalAmount + (row.shippingFee || 0)).toLocaleString()}`,
        },
        {
          label: '支払い状況',
          key: 'paymentStatus',
          formatter: (value) => getPaymentStatusBadge(value),
        },
        { label: '支払い方法', key: 'paymentMethod' },
      ],
    },
    {
      title: 'その他',
      fields: [
        { label: '備考', key: 'notes', formatter: (value) => value || 'なし' },
      ],
    },
  ];

  // 関連データ設定（注文商品）
  const relatedData: RelatedData[] = [
    {
      title: '注文商品',
      description: 'この注文に含まれる商品一覧',
      data: selectedOrder?.items || [],
      columns: [
        { key: 'productName', label: '商品名' },
        { key: 'quantity', label: '数量', render: (value) => `${value}個` },
        {
          key: 'unitPrice',
          label: '単価',
          render: (value) => `¥${value.toLocaleString()}`,
        },
        {
          key: 'totalPrice',
          label: '小計',
          render: (value) => `¥${value.toLocaleString()}`,
        },
      ],
      emptyMessage: '商品がありません',
    },
  ];

  // キャンセル確認モーダル
  const confirmCancel = useConfirmModal({
    type: 'delete',
    title: '注文をキャンセルしますか？',
    onConfirm: async (orderId: number) => {
      setIsOperationLoading(true);
      try {
        await updateOrderStatus(orderId, 'CANCELED');
        await revalidateOrders();
      } catch (error) {
        // エラーはAPIフック内でハンドリング済み
      } finally {
        setIsOperationLoading(false);
      }
    },
  });

  // 注文作成（実装予定）
  const handleCreate = async () => {
    // 注文作成は複雑なロジックが必要なため、今回は一覧表示とステータス更新に集中
    toast.info('注文作成機能は実装予定です');
  };

  // 注文編集（ステータス更新のみ）
  const handleEdit = async (data: OrderStatusFormData) => {
    if (!editingOrder) return;

    setIsOperationLoading(true);
    try {
      await updateOrderStatus(editingOrder.id, data.orderStatus);
      setIsEditDialogOpen(false);
      setEditingOrder(null);
      await revalidateOrders();
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // 編集ダイアログを開く
  function openEditDialog(order: Order) {
    setEditingOrder(order);
    setIsEditDialogOpen(true);
  }

  // 詳細シートを開く
  function openDetailSheet(order: Order) {
    setSelectedOrder(order);
    setIsDetailSheetOpen(true);
  }

  // キャンセル確認
  function handleCancel(order: Order) {
    const description = `注文番号「${order.orderNumber}」をキャンセルしますか？`;
    const details = '一度キャンセルした注文は元に戻せません。';

    confirmCancel.show(description, details, order.id);
  }

  // 注文ステータスのバッジ
  function getOrderStatusBadge(status: OrderStatus) {
    const statusMap = {
      PENDING: { label: '保留中', variant: 'secondary' as const },
      CONFIRMED: { label: '確認済み', variant: 'default' as const },
      SHIPPED: { label: '発送済み', variant: 'default' as const },
      COMPLETED: { label: '完了', variant: 'default' as const },
      CANCELED: { label: 'キャンセル', variant: 'destructive' as const },
    };

    const config = statusMap[status] || {
      label: status,
      variant: 'secondary' as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  // 支払いステータスのバッジ
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

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title="注文管理"
        description="お客様からの注文を管理・処理します"
      />

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メインテーブル */}
      <EntityTable
        title="注文一覧"
        description="登録されている注文の一覧です"
        data={orders}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="注文番号または顧客名で検索..."
        onRowClick={openDetailSheet}
        createButton={
          <Button onClick={() => setIsCreateDialogOpen(true)} disabled>
            <Plus className="mr-2 h-4 w-4" />
            新規作成（実装予定）
          </Button>
        }
      />

      {/* 新規作成ダイアログ（実装予定） */}
      <EntityFormDialog
        title="新しい注文を作成"
        description="注文作成機能は実装予定です。"
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        fields={[]}
        schema={orderStatusSchema}
        onSubmit={handleCreate}
        isLoading={isLoading}
        submitLabel="作成"
      />

      {/* 編集ダイアログ（ステータス更新のみ） */}
      <EntityFormDialog
        title="注文ステータスを更新"
        description="注文のステータスを変更します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={formFields}
        schema={orderStatusSchema}
        defaultValues={
          editingOrder
            ? {
                orderStatus: editingOrder.orderStatus,
              }
            : {}
        }
        onSubmit={handleEdit}
        isLoading={isLoading}
        submitLabel="更新"
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="注文詳細"
        description="注文の詳細情報と商品一覧を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedOrder}
        sections={detailSections}
        relatedData={relatedData}
        actions={[
          {
            label: '編集',
            icon: Edit,
            variant: 'outline',
            onClick: (order) => {
              setIsDetailSheetOpen(false);
              openEditDialog(order);
            },
            show: (order) =>
              order.orderStatus !== 'COMPLETED' &&
              order.orderStatus !== 'CANCELED',
          },
          {
            label: 'キャンセル',
            icon: Trash2,
            variant: 'destructive',
            onClick: (order) => {
              setIsDetailSheetOpen(false);
              handleCancel(order);
            },
            show: (order) =>
              order.orderStatus === 'PENDING' ||
              order.orderStatus === 'CONFIRMED',
          },
        ]}
        isLoading={isLoading}
      />

      {/* キャンセル確認ダイアログ */}
      {confirmCancel.modal}
    </div>
  );
}
