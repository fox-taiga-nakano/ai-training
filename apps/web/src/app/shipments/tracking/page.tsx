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
  CheckCircle,
  Clock,
  Edit,
  ExternalLink,
  Eye,
  MapPin,
  Package,
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

// 追跡情報の型定義
interface TrackingShipment extends BaseEntity {
  trackingNumber: string;
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  carrier: string;
  trackingStatus: TrackingStatus;
  estimatedDeliveryDate: string;
  actualDeliveryDate?: string;
  shippedAt: string;
  lastUpdateAt: string;
  currentLocation?: string;
  deliveryAttempts: number;
  notes?: string;
  trackingEvents: TrackingEvent[];
}

interface TrackingEvent {
  id: number;
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

type TrackingStatus =
  | 'LABEL_CREATED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'EXCEPTION';

// バリデーションスキーマ
const trackingSchema = z.object({
  trackingNumber: z
    .string()
    .min(1, '追跡番号は必須です')
    .max(50, '追跡番号は50文字以内で入力してください'),
  carrier: z.string().min(1, '配送業者は必須です'),
  estimatedDeliveryDate: z.string().min(1, '予定配送日は必須です'),
  actualDeliveryDate: z.string().optional(),
  currentLocation: z.string().optional(),
  notes: z
    .string()
    .max(1000, '備考は1000文字以内で入力してください')
    .optional(),
});

type TrackingFormData = z.infer<typeof trackingSchema>;

// ダミーデータ
const dummyTrackingShipments: TrackingShipment[] = [
  {
    id: 1,
    trackingNumber: 'TRK-2024-001',
    orderId: 1,
    orderNumber: 'ORD-2024-001',
    customerName: '田中太郎',
    customerEmail: 'tanaka@example.com',
    shippingAddress: '東京都渋谷区xxx-xxx',
    carrier: 'ヤマト運輸',
    trackingStatus: 'IN_TRANSIT',
    estimatedDeliveryDate: '2024-03-05',
    shippedAt: '2024-03-03 10:00',
    lastUpdateAt: '2024-03-04 14:30',
    currentLocation: '東京ベース店',
    deliveryAttempts: 0,
    trackingEvents: [
      {
        id: 1,
        timestamp: '2024-03-03 10:00',
        location: '発送センター',
        status: 'PICKED_UP',
        description: '荷物をお預かりしました',
      },
      {
        id: 2,
        timestamp: '2024-03-03 15:30',
        location: '東京ベース店',
        status: 'IN_TRANSIT',
        description: '配送センターに到着しました',
      },
      {
        id: 3,
        timestamp: '2024-03-04 14:30',
        location: '東京ベース店',
        status: 'IN_TRANSIT',
        description: '配送準備中です',
      },
    ],
  },
  {
    id: 2,
    trackingNumber: 'TRK-2024-002',
    orderId: 2,
    orderNumber: 'ORD-2024-002',
    customerName: '佐藤花子',
    customerEmail: 'sato@example.com',
    shippingAddress: '大阪府大阪市xxx-xxx',
    carrier: '佐川急便',
    trackingStatus: 'OUT_FOR_DELIVERY',
    estimatedDeliveryDate: '2024-03-06',
    shippedAt: '2024-03-04 09:00',
    lastUpdateAt: '2024-03-05 08:00',
    currentLocation: '大阪営業所',
    deliveryAttempts: 0,
    trackingEvents: [
      {
        id: 4,
        timestamp: '2024-03-04 09:00',
        location: '発送センター',
        status: 'PICKED_UP',
        description: '荷物をお預かりしました',
      },
      {
        id: 5,
        timestamp: '2024-03-04 18:00',
        location: '大阪営業所',
        status: 'IN_TRANSIT',
        description: '配送センターに到着しました',
      },
      {
        id: 6,
        timestamp: '2024-03-05 08:00',
        location: '大阪営業所',
        status: 'OUT_FOR_DELIVERY',
        description: '配達に出発しました',
      },
    ],
  },
  {
    id: 3,
    trackingNumber: 'TRK-2024-003',
    orderId: 3,
    orderNumber: 'ORD-2024-003',
    customerName: '鈴木一郎',
    customerEmail: 'suzuki@example.com',
    shippingAddress: '愛知県名古屋市xxx-xxx',
    carrier: '日本郵便',
    trackingStatus: 'DELIVERED',
    estimatedDeliveryDate: '2024-03-03',
    actualDeliveryDate: '2024-03-03',
    shippedAt: '2024-03-01 11:00',
    lastUpdateAt: '2024-03-03 16:00',
    currentLocation: '配送完了',
    deliveryAttempts: 1,
    trackingEvents: [
      {
        id: 7,
        timestamp: '2024-03-01 11:00',
        location: '発送センター',
        status: 'PICKED_UP',
        description: '荷物をお預かりしました',
      },
      {
        id: 8,
        timestamp: '2024-03-02 14:00',
        location: '名古屋郵便局',
        status: 'IN_TRANSIT',
        description: '配送センターに到着しました',
      },
      {
        id: 9,
        timestamp: '2024-03-03 09:00',
        location: '名古屋郵便局',
        status: 'OUT_FOR_DELIVERY',
        description: '配達に出発しました',
      },
      {
        id: 10,
        timestamp: '2024-03-03 16:00',
        location: '配送先',
        status: 'DELIVERED',
        description: 'お届け完了しました',
      },
    ],
  },
  {
    id: 4,
    trackingNumber: 'TRK-2024-004',
    orderId: 4,
    orderNumber: 'ORD-2024-004',
    customerName: '山田美咲',
    customerEmail: 'yamada@example.com',
    shippingAddress: '福岡県福岡市xxx-xxx',
    carrier: 'ヤマト運輸',
    trackingStatus: 'EXCEPTION',
    estimatedDeliveryDate: '2024-02-27',
    shippedAt: '2024-02-26 13:00',
    lastUpdateAt: '2024-02-28 10:00',
    currentLocation: '福岡ベース店',
    deliveryAttempts: 2,
    notes: '不在のため持ち戻り。再配達依頼済み',
    trackingEvents: [
      {
        id: 11,
        timestamp: '2024-02-26 13:00',
        location: '発送センター',
        status: 'PICKED_UP',
        description: '荷物をお預かりしました',
      },
      {
        id: 12,
        timestamp: '2024-02-27 12:00',
        location: '福岡ベース店',
        status: 'OUT_FOR_DELIVERY',
        description: '配達に出発しました',
      },
      {
        id: 13,
        timestamp: '2024-02-27 16:00',
        location: '福岡ベース店',
        status: 'EXCEPTION',
        description: '不在のため持ち戻りました',
      },
      {
        id: 14,
        timestamp: '2024-02-28 10:00',
        location: '福岡ベース店',
        status: 'EXCEPTION',
        description: '再配達準備中です',
      },
    ],
  },
];

export default function ShipmentTrackingPage() {
  const [shipments, setShipments] = useState<TrackingShipment[]>(
    dummyTrackingShipments
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingShipment, setEditingShipment] =
    useState<TrackingShipment | null>(null);
  const [selectedShipment, setSelectedShipment] =
    useState<TrackingShipment | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 統計計算
  const totalShipments = shipments.length;
  const inTransitShipments = shipments.filter(
    (s) => s.trackingStatus === 'IN_TRANSIT'
  ).length;
  const outForDeliveryShipments = shipments.filter(
    (s) => s.trackingStatus === 'OUT_FOR_DELIVERY'
  ).length;
  const deliveredShipments = shipments.filter(
    (s) => s.trackingStatus === 'DELIVERED'
  ).length;
  const exceptionShipments = shipments.filter(
    (s) => s.trackingStatus === 'EXCEPTION'
  ).length;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '追跡中配送',
      value: totalShipments,
      description: '追跡可能な配送',
      icon: Truck,
    },
    {
      title: '輸送中',
      value: inTransitShipments,
      description: '配送センター間輸送中',
      icon: Package,
    },
    {
      title: '配達中',
      value: outForDeliveryShipments,
      description: '最終配達中',
      icon: MapPin,
    },
    {
      title: '配達完了',
      value: deliveredShipments,
      description: '配達済み',
      icon: CheckCircle,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<TrackingShipment>[] = [
    {
      key: 'trackingNumber',
      label: '追跡番号',
      render: (value) => (
        <div className="flex items-center gap-2">
          <span className="font-mono">{value}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: 配送業者の追跡サイトへのリンク
              toast.info('追跡サイトを開きます');
            }}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
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
      key: 'carrier',
      label: '配送業者',
    },
    {
      key: 'trackingStatus',
      label: '追跡状況',
      render: (value) => getTrackingStatusBadge(value),
    },
    {
      key: 'currentLocation',
      label: '現在地',
      render: (value) => value || '不明',
    },
    {
      key: 'estimatedDeliveryDate',
      label: '予定配送日',
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<TrackingShipment>[] = [
    {
      label: '追跡詳細を見る',
      icon: Eye,
      onClick: openDetailSheet,
    },
    {
      label: '追跡情報を更新',
      icon: Edit,
      onClick: openEditDialog,
      show: (shipment) => shipment.trackingStatus !== 'DELIVERED',
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
      name: 'carrier',
      label: '配送業者',
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
      required: true,
    },
    {
      name: 'actualDeliveryDate',
      label: '実際の配送日',
      type: 'text',
      placeholder: '例：2024-03-05',
      required: false,
    },
    {
      name: 'currentLocation',
      label: '現在地',
      type: 'text',
      placeholder: '例：東京ベース店',
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
  const detailSections: DetailSection<TrackingShipment>[] = [
    {
      title: '追跡基本情報',
      fields: [
        {
          label: '追跡番号',
          key: 'trackingNumber',
          formatter: (value) => <span className="font-mono">{value}</span>,
        },
        {
          label: '注文番号',
          key: 'orderNumber',
          formatter: (value) => <span className="font-mono">{value}</span>,
        },
        {
          label: '配送業者',
          key: 'carrier',
        },
        {
          label: '追跡状況',
          key: 'trackingStatus',
          formatter: (value) => getTrackingStatusBadge(value),
        },
        {
          label: '現在地',
          key: 'currentLocation',
          formatter: (value) => value || '不明',
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
        },
        {
          label: '実際の配送日',
          key: 'actualDeliveryDate',
          formatter: (value) => value || '未配送',
        },
        {
          label: '発送日時',
          key: 'shippedAt',
        },
        {
          label: '最終更新',
          key: 'lastUpdateAt',
        },
      ],
    },
    {
      title: '配送状況',
      fields: [
        {
          label: '配達試行回数',
          key: 'deliveryAttempts',
          formatter: (value) => `${value}回`,
        },
        {
          label: '備考',
          key: 'notes',
          formatter: (value) => value || 'なし',
        },
      ],
    },
  ];

  // 関連データ設定（追跡履歴）
  const relatedData: RelatedData[] = [
    {
      title: '追跡履歴',
      description: 'この配送の詳細な追跡履歴',
      data: selectedShipment?.trackingEvents || [],
      columns: [
        {
          key: 'timestamp',
          label: '日時',
          render: (value) => <span className="font-mono text-sm">{value}</span>,
        },
        { key: 'location', label: '場所' },
        {
          key: 'status',
          label: 'ステータス',
          render: (value) => (
            <Badge variant="outline" className="text-xs">
              {value}
            </Badge>
          ),
        },
        { key: 'description', label: '詳細' },
      ],
      emptyMessage: '追跡履歴がありません',
    },
  ];

  // 追跡情報更新
  const handleEdit = async (data: TrackingFormData) => {
    if (!editingShipment) return;

    setIsLoading(true);
    try {
      // TODO: API call to update tracking information
      await new Promise((resolve) => setTimeout(resolve, 1000)); // ダミー遅延

      setShipments((prev) =>
        prev.map((shipment) =>
          shipment.id === editingShipment.id
            ? {
                ...shipment,
                trackingNumber: data.trackingNumber,
                carrier: data.carrier,
                estimatedDeliveryDate: data.estimatedDeliveryDate,
                actualDeliveryDate: data.actualDeliveryDate,
                currentLocation: data.currentLocation,
                notes: data.notes,
                lastUpdateAt: new Date()
                  .toISOString()
                  .replace('T', ' ')
                  .substring(0, 16),
              }
            : shipment
        )
      );

      setIsEditDialogOpen(false);
      setEditingShipment(null);
      toast.success('追跡情報を更新しました');
    } catch (error) {
      toast.error('追跡情報の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 編集ダイアログを開く
  function openEditDialog(shipment: TrackingShipment) {
    setEditingShipment(shipment);
    setIsEditDialogOpen(true);
  }

  // 詳細シートを開く
  function openDetailSheet(shipment: TrackingShipment) {
    setSelectedShipment(shipment);
    setIsDetailSheetOpen(true);
  }

  // 追跡ステータスのバッジ
  function getTrackingStatusBadge(status: TrackingStatus) {
    const statusMap = {
      LABEL_CREATED: {
        label: 'ラベル作成',
        variant: 'secondary' as const,
        icon: Package,
      },
      PICKED_UP: {
        label: '集荷完了',
        variant: 'default' as const,
        icon: Truck,
      },
      IN_TRANSIT: { label: '輸送中', variant: 'default' as const, icon: Truck },
      OUT_FOR_DELIVERY: {
        label: '配達中',
        variant: 'default' as const,
        icon: MapPin,
      },
      DELIVERED: {
        label: '配達完了',
        variant: 'default' as const,
        icon: CheckCircle,
      },
      EXCEPTION: {
        label: '配達異常',
        variant: 'destructive' as const,
        icon: AlertTriangle,
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
        title="追跡管理"
        description="配送の追跡情報を管理・確認します"
      />

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* 異常配送の警告 */}
      {exceptionShipments > 0 && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800">
                配送異常が発生しています
              </h3>
              <p className="text-sm text-yellow-700">
                {exceptionShipments}
                件の配送で異常が発生しています。詳細を確認してください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* メインテーブル */}
      <EntityTable
        title="追跡情報一覧"
        description="配送中の荷物の追跡情報を管理します"
        data={shipments}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="追跡番号、注文番号、顧客名で検索..."
        onRowClick={openDetailSheet}
      />

      {/* 編集ダイアログ */}
      <EntityFormDialog
        title="追跡情報を更新"
        description="配送の追跡情報を更新します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={formFields}
        schema={trackingSchema}
        defaultValues={
          editingShipment
            ? {
                trackingNumber: editingShipment.trackingNumber,
                carrier: editingShipment.carrier,
                estimatedDeliveryDate: editingShipment.estimatedDeliveryDate,
                actualDeliveryDate: editingShipment.actualDeliveryDate || '',
                currentLocation: editingShipment.currentLocation || '',
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
        title="追跡詳細"
        description="配送の詳細な追跡情報を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedShipment}
        sections={detailSections}
        relatedData={relatedData}
        actions={[
          {
            label: '追跡情報を更新',
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
