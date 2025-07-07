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
  Plus,
  Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import type { ShipmentStatus } from '@/lib/api/types';

import {
  EntityDetailSheet,
  EntityFormDialog,
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';
import {
  type CreateShipmentDto,
  type Shipment,
  type ShipmentItem,
  type UpdateShipmentDto,
  useCreateShipment,
  useDeleteShipment,
  useShipments,
  useUpdateShipment,
  useUpdateShipmentStatus,
} from '@/hooks/api/use-shipments';
import { useConfirmModal } from '@/hooks/useConfirmModal';

// 配送の型定義は @/hooks/api/use-shipments からインポート

// バリデーションスキーマ
const shipmentSchema = z.object({
  trackingNumber: z
    .string()
    .min(1, '追跡番号は必須です')
    .max(50, '追跡番号は50文字以内で入力してください'),
  shippingStatus: z.enum(['PREPARING', 'IN_TRANSIT', 'DELIVERED', 'RETURNED']),
  shippingMethod: z.string().min(1, '配送方法は必須です'),
  estimatedDeliveryDate: z.string().optional(),
  actualDeliveryDate: z.string().optional(),
  notes: z
    .string()
    .max(1000, '備考は1000文字以内で入力してください')
    .optional(),
});

type ShipmentFormData = z.infer<typeof shipmentSchema>;

export default function ShipmentsPage() {
  // ローカル状態
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // APIフックの使用
  const {
    shipments,
    isLoading: isShipmentsLoading,
    revalidate: revalidateShipments,
  } = useShipments();
  const { createShipment } = useCreateShipment();
  const { updateShipment } = useUpdateShipment();
  const { updateShipmentStatus } = useUpdateShipmentStatus();
  const { deleteShipment } = useDeleteShipment();

  // ローディング状態の統合
  const isLoading = isShipmentsLoading || isOperationLoading;

  // 統計計算
  const totalShipments = shipments.length;
  const preparingShipments = shipments.filter(
    (s) => s.shippingStatus === 'PREPARING'
  ).length;
  const inTransitShipments = shipments.filter(
    (s) => s.shippingStatus === 'IN_TRANSIT'
  ).length;
  const deliveredShipments = shipments.filter(
    (s) => s.shippingStatus === 'DELIVERED'
  ).length;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総配送数',
      value: totalShipments,
      description: '全ての配送',
      icon: Truck,
    },
    {
      title: '配送準備中',
      value: preparingShipments,
      description: '発送待ちの配送',
      icon: Package,
    },
    {
      title: '配送中',
      value: inTransitShipments,
      description: '輸送中の配送',
      icon: Clock,
    },
    {
      title: '配送完了',
      value: deliveredShipments,
      description: '配送済みの件数',
      icon: CheckCircle,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<Shipment>[] = [
    {
      key: 'trackingNumber',
      label: '追跡番号',
      render: (value) =>
        value ? (
          <span className="font-mono">{value}</span>
        ) : (
          <span className="text-muted-foreground">未発行</span>
        ),
    },
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
      key: 'shippingMethod',
      label: '配送方法',
    },
    {
      key: 'shippingStatus',
      label: '配送状況',
      render: (value) => getShippingStatusBadge(value),
    },
    {
      key: 'estimatedDeliveryDate',
      label: '予定配送日',
      render: (value) => value || '未設定',
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<Shipment>[] = [
    {
      label: '詳細を見る',
      icon: Eye,
      onClick: openDetailSheet,
    },
    {
      label: '配送情報を更新',
      icon: Edit,
      onClick: openEditDialog,
      show: (shipment) => shipment.shippingStatus !== 'DELIVERED',
    },
  ];

  // フォームフィールドの設定
  const formFields: FormField[] = [
    {
      name: 'trackingNumber',
      label: '追跡番号',
      type: 'text',
      placeholder: '例：TRK-2024-001',
      required: true,
    },
    {
      name: 'shippingStatus',
      label: '配送状況',
      type: 'select',
      required: true,
      options: [
        { value: 'PREPARING', label: '配送準備中' },
        { value: 'IN_TRANSIT', label: '配送中' },
        { value: 'DELIVERED', label: '配送完了' },
        { value: 'RETURNED', label: '返送済み' },
      ],
    },
    {
      name: 'shippingMethod',
      label: '配送方法',
      type: 'select',
      required: true,
      options: [
        { value: 'ヤマト運輸', label: 'ヤマト運輸' },
        { value: '佐川急便', label: '佐川急便' },
        { value: '日本郵便', label: '日本郵便' },
        { value: '西濃運輸', label: '西濃運輸' },
      ],
    },
    {
      name: 'estimatedDeliveryDate',
      label: '予定配送日',
      type: 'text',
      placeholder: '例：2024-03-05',
      required: false,
    },
    {
      name: 'actualDeliveryDate',
      label: '実際の配送日',
      type: 'text',
      placeholder: '例：2024-03-05',
      required: false,
    },
    {
      name: 'notes',
      label: '備考',
      type: 'textarea',
      placeholder: '配送に関する特記事項を入力してください',
      required: false,
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<Shipment>[] = [
    {
      title: '配送基本情報',
      fields: [
        {
          label: '配送ID',
          key: 'id',
          formatter: (value) => <span className="font-mono">#{value}</span>,
        },
        {
          label: '追跡番号',
          key: 'trackingNumber',
          formatter: (value) =>
            value ? (
              <span className="font-mono">{value}</span>
            ) : (
              <span className="text-muted-foreground">未発行</span>
            ),
        },
        {
          label: '注文番号',
          key: 'orderNumber',
          formatter: (value) => <span className="font-mono">{value}</span>,
        },
        {
          label: '配送状況',
          key: 'shippingStatus',
          formatter: (value) => getShippingStatusBadge(value),
        },
        {
          label: '配送方法',
          key: 'shippingMethod',
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
      title: '配送日程',
      fields: [
        {
          label: '予定配送日',
          key: 'estimatedDeliveryDate',
          formatter: (value) => value || '未設定',
        },
        {
          label: '実際の配送日',
          key: 'actualDeliveryDate',
          formatter: (value) => value || '未配送',
        },
        {
          label: '発送日',
          key: 'shippedAt',
          formatter: (value) => value || '未発送',
        },
        {
          label: '配送完了日',
          key: 'deliveredAt',
          formatter: (value) => value || '未配送',
        },
      ],
    },
    {
      title: 'その他',
      fields: [
        { label: '備考', key: 'notes', formatter: (value) => value || 'なし' },
      ],
    },
  ];

  // 関連データ設定（配送商品）
  const relatedData: RelatedData[] = [
    {
      title: '配送商品',
      description: 'この配送に含まれる商品一覧',
      data: selectedShipment?.items || [],
      columns: [
        { key: 'productName', label: '商品名' },
        { key: 'quantity', label: '数量', render: (value) => `${value}個` },
        {
          key: 'weight',
          label: '重量',
          render: (value) => (value ? `${value}kg` : '未設定'),
        },
      ],
      emptyMessage: '商品がありません',
    },
  ];

  // 配送情報編集
  const handleEdit = async (data: ShipmentFormData) => {
    if (!editingShipment) return;

    setIsOperationLoading(true);
    try {
      const updateData: UpdateShipmentDto = {
        trackingNumber: data.trackingNumber,
        shippingStatus: data.shippingStatus,
        shippingMethod: data.shippingMethod,
        estimatedDeliveryDate: data.estimatedDeliveryDate,
        actualDeliveryDate: data.actualDeliveryDate,
        notes: data.notes,
      };

      await updateShipment(editingShipment.id, updateData);
      setIsEditDialogOpen(false);
      setEditingShipment(null);
      await revalidateShipments();
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // 編集ダイアログを開く
  function openEditDialog(shipment: Shipment) {
    setEditingShipment(shipment);
    setIsEditDialogOpen(true);
  }

  // 詳細シートを開く
  function openDetailSheet(shipment: Shipment) {
    setSelectedShipment(shipment);
    setIsDetailSheetOpen(true);
  }

  // 配送ステータスのバッジ
  function getShippingStatusBadge(status: ShipmentStatus) {
    const statusMap = {
      PREPARING: {
        label: '配送準備中',
        variant: 'secondary' as const,
        icon: Package,
      },
      IN_TRANSIT: { label: '配送中', variant: 'default' as const, icon: Truck },
      DELIVERED: {
        label: '配送完了',
        variant: 'default' as const,
        icon: CheckCircle,
      },
      RETURNED: {
        label: '返送済み',
        variant: 'destructive' as const,
        icon: AlertCircle,
      },
    };

    const config = statusMap[status] || {
      label: status,
      variant: 'secondary' as const,
      icon: Package,
    };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title="配送管理"
        description="注文の配送状況を管理・追跡します"
      >
        <Button onClick={() => (window.location.href = '/shipments/prepare')}>
          <Package className="mr-2 h-4 w-4" />
          配送準備
        </Button>
        <Button onClick={() => (window.location.href = '/shipments/tracking')}>
          <Truck className="mr-2 h-4 w-4" />
          追跡管理
        </Button>
      </PageHeader>

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メインテーブル */}
      <EntityTable
        title="配送一覧"
        description="全ての配送の状況を管理します"
        data={shipments}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="追跡番号、注文番号、顧客名で検索..."
        onRowClick={openDetailSheet}
      />

      {/* 編集ダイアログ */}
      <EntityFormDialog
        title="配送情報を更新"
        description="配送情報を更新します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={formFields}
        schema={shipmentSchema}
        defaultValues={
          editingShipment
            ? {
                trackingNumber: editingShipment.trackingNumber || '',
                shippingStatus: editingShipment.shippingStatus,
                shippingMethod: editingShipment.shippingMethod,
                estimatedDeliveryDate:
                  editingShipment.estimatedDeliveryDate || '',
                actualDeliveryDate: editingShipment.actualDeliveryDate || '',
                notes: editingShipment.notes || '',
              }
            : {}
        }
        onSubmit={handleEdit}
        isLoading={isLoading}
        submitLabel="更新"
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="配送詳細"
        description="配送の詳細情報と商品一覧を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedShipment}
        sections={detailSections}
        relatedData={relatedData}
        actions={[
          {
            label: '配送情報を更新',
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
