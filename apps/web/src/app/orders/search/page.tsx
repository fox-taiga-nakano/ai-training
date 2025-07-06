'use client';

import { useState } from 'react';

import type {
  BaseEntity,
  DetailSection,
  RelatedData,
  StatisticCard,
  TableAction,
  TableColumn,
} from '@/types/management';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import {
  Calendar,
  Download,
  Edit,
  Eye,
  Filter,
  Package,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  EntityDetailSheet,
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';
import { useConfirmModal } from '@/hooks/useConfirmModal';

// 注文検索の型定義
interface SearchOrder extends BaseEntity {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  shippingFee: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  orderDate: string;
  desiredArrivalDate?: string;
  shippingAddress: string;
  notes?: string;
  items: SearchOrderItem[];
}

interface SearchOrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELED';
type PaymentStatus = 'UNPAID' | 'AUTHORIZED' | 'PAID' | 'REFUNDED';

// 検索条件の型定義
interface SearchFilters {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

// ダミーデータ
const dummyOrders: SearchOrder[] = [
  {
    id: 1,
    orderNumber: 'ORD-2024-001',
    customerName: '田中太郎',
    customerEmail: 'tanaka@example.com',
    totalAmount: 89800,
    shippingFee: 500,
    orderStatus: 'SHIPPED',
    paymentStatus: 'PAID',
    paymentMethod: 'クレジットカード',
    orderDate: '2024-03-01',
    desiredArrivalDate: '2024-03-05',
    shippingAddress: '東京都渋谷区xxx-xxx',
    notes: '午前中配送希望',
    items: [
      {
        id: 1,
        productName: 'スマートフォン',
        quantity: 1,
        unitPrice: 89800,
        totalPrice: 89800,
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD-2024-002',
    customerName: '佐藤花子',
    customerEmail: 'sato@example.com',
    totalAmount: 15000,
    shippingFee: 300,
    orderStatus: 'CONFIRMED',
    paymentStatus: 'PAID',
    paymentMethod: '銀行振込',
    orderDate: '2024-03-02',
    shippingAddress: '大阪府大阪市xxx-xxx',
    items: [
      {
        id: 2,
        productName: 'ワイヤレスイヤホン',
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'ORD-2024-003',
    customerName: '鈴木一郎',
    customerEmail: 'suzuki@example.com',
    totalAmount: 8500,
    shippingFee: 200,
    orderStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentMethod: 'クレジットカード',
    orderDate: '2024-02-28',
    desiredArrivalDate: '2024-03-03',
    shippingAddress: '愛知県名古屋市xxx-xxx',
    items: [
      {
        id: 3,
        productName: 'プレミアムTシャツ',
        quantity: 1,
        unitPrice: 4500,
        totalPrice: 4500,
      },
      {
        id: 4,
        productName: 'ビジネス書籍',
        quantity: 1,
        unitPrice: 4000,
        totalPrice: 4000,
      },
    ],
  },
  {
    id: 4,
    orderNumber: 'ORD-2024-004',
    customerName: '山田美咲',
    customerEmail: 'yamada@example.com',
    totalAmount: 8000,
    shippingFee: 400,
    orderStatus: 'CANCELED',
    paymentStatus: 'REFUNDED',
    paymentMethod: 'クレジットカード',
    orderDate: '2024-02-25',
    shippingAddress: '福岡県福岡市xxx-xxx',
    notes: 'お客様都合によりキャンセル',
    items: [
      {
        id: 5,
        productName: 'ビジネス書籍',
        quantity: 2,
        unitPrice: 4000,
        totalPrice: 8000,
      },
    ],
  },
  {
    id: 5,
    orderNumber: 'ORD-2024-005',
    customerName: '高橋健太',
    customerEmail: 'takahashi@example.com',
    totalAmount: 25000,
    shippingFee: 600,
    orderStatus: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentMethod: '代金引換',
    orderDate: '2024-03-03',
    desiredArrivalDate: '2024-03-07',
    shippingAddress: '神奈川県横浜市xxx-xxx',
    items: [
      {
        id: 6,
        productName: 'ノートパソコン',
        quantity: 1,
        unitPrice: 25000,
        totalPrice: 25000,
      },
    ],
  },
];

export default function OrderSearchPage() {
  const [orders, setOrders] = useState<SearchOrder[]>(dummyOrders);
  const [filteredOrders, setFilteredOrders] =
    useState<SearchOrder[]>(dummyOrders);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SearchOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 検索フィルター
  const [filters, setFilters] = useState<SearchFilters>({
    orderNumber: '',
    customerName: '',
    customerEmail: '',
    orderStatus: '',
    paymentStatus: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  });

  // 統計計算
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(
    (o) => o.orderStatus === 'PENDING'
  ).length;
  const completedOrders = filteredOrders.filter(
    (o) => o.orderStatus === 'COMPLETED'
  ).length;
  const canceledOrders = filteredOrders.filter(
    (o) => o.orderStatus === 'CANCELED'
  ).length;
  const totalRevenue = filteredOrders
    .filter((o) => o.orderStatus !== 'CANCELED')
    .reduce((sum, order) => sum + order.totalAmount, 0);

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '検索結果',
      value: totalOrders,
      description: '条件に一致する注文',
      icon: Search,
    },
    {
      title: '未処理注文',
      value: pendingOrders,
      description: '処理待ちの注文',
      icon: Package,
    },
    {
      title: '完了注文',
      value: completedOrders,
      description: '完了した注文',
      icon: Package,
    },
    {
      title: '総売上',
      value: `¥${totalRevenue.toLocaleString()}`,
      description: '検索結果の合計売上',
      icon: Package,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<SearchOrder>[] = [
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
      key: 'paymentMethod',
      label: '支払方法',
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<SearchOrder>[] = [
    {
      label: '詳細を見る',
      icon: Eye,
      onClick: openDetailSheet,
    },
    {
      label: '編集',
      icon: Edit,
      onClick: (order) => {
        // TODO: 注文編集画面への遷移
        toast.info('注文編集機能は実装予定です');
      },
      show: (order) =>
        order.orderStatus !== 'COMPLETED' && order.orderStatus !== 'CANCELED',
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<SearchOrder>[] = [
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
          label: '希望配送日',
          key: 'desiredArrivalDate',
          formatter: (value) => value || '指定なし',
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
      title: '金額情報',
      fields: [
        {
          label: '商品合計',
          key: 'totalAmount',
          formatter: (value) => `¥${value.toLocaleString()}`,
        },
        {
          label: '送料',
          key: 'shippingFee',
          formatter: (value) => `¥${value.toLocaleString()}`,
        },
        {
          label: '総合計',
          key: 'id',
          formatter: (value, row) =>
            `¥${(row.totalAmount + row.shippingFee).toLocaleString()}`,
        },
      ],
    },
    {
      title: 'ステータス・支払い',
      fields: [
        {
          label: '注文状況',
          key: 'orderStatus',
          formatter: (value) => getOrderStatusBadge(value),
        },
        {
          label: '支払状況',
          key: 'paymentStatus',
          formatter: (value) => getPaymentStatusBadge(value),
        },
        {
          label: '支払方法',
          key: 'paymentMethod',
        },
      ],
    },
    {
      title: 'その他',
      fields: [
        {
          label: '備考',
          key: 'notes',
          formatter: (value) => value || 'なし',
        },
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
        { key: 'productName', label: '商品名', className: 'font-medium' },
        { key: 'quantity', label: '数量', render: (value) => `${value}個` },
        {
          key: 'unitPrice',
          label: '単価',
          render: (value) => `¥${value.toLocaleString()}`,
          className: 'text-right',
        },
        {
          key: 'totalPrice',
          label: '小計',
          render: (value) => `¥${value.toLocaleString()}`,
          className: 'text-right font-medium',
        },
      ],
      emptyMessage: '商品がありません',
    },
  ];

  // 検索実行
  const handleSearch = () => {
    setIsLoading(true);

    // フィルタリング処理
    const filtered = orders.filter((order) => {
      // 基本検索条件
      if (
        filters.orderNumber &&
        !order.orderNumber
          .toLowerCase()
          .includes(filters.orderNumber.toLowerCase())
      )
        return false;
      if (
        filters.customerName &&
        !order.customerName
          .toLowerCase()
          .includes(filters.customerName.toLowerCase())
      )
        return false;
      if (
        filters.customerEmail &&
        !order.customerEmail
          .toLowerCase()
          .includes(filters.customerEmail.toLowerCase())
      )
        return false;

      // ステータス条件
      if (
        filters.orderStatus &&
        filters.orderStatus !== 'all' &&
        order.orderStatus !== filters.orderStatus
      )
        return false;
      if (
        filters.paymentStatus &&
        filters.paymentStatus !== 'all' &&
        order.paymentStatus !== filters.paymentStatus
      )
        return false;
      if (
        filters.paymentMethod &&
        filters.paymentMethod !== 'all' &&
        order.paymentMethod !== filters.paymentMethod
      )
        return false;

      // 日付条件
      if (filters.dateFrom && order.orderDate < filters.dateFrom) return false;
      if (filters.dateTo && order.orderDate > filters.dateTo) return false;

      // 金額条件
      if (filters.amountMin && order.totalAmount < parseInt(filters.amountMin))
        return false;
      if (filters.amountMax && order.totalAmount > parseInt(filters.amountMax))
        return false;

      return true;
    });

    setTimeout(() => {
      setFilteredOrders(filtered);
      setIsLoading(false);
      toast.success(`${filtered.length}件の注文が見つかりました`);
    }, 500);
  };

  // フィルターリセット
  const handleReset = () => {
    setFilters({
      orderNumber: '',
      customerName: '',
      customerEmail: '',
      orderStatus: '',
      paymentStatus: '',
      paymentMethod: '',
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
    });
    setFilteredOrders(orders);
    toast.info('検索条件をリセットしました');
  };

  // CSVエクスポート
  const handleExport = () => {
    // TODO: CSVエクスポート処理
    toast.success('CSVファイルのダウンロードを開始しました');
  };

  // 詳細シートを開く
  function openDetailSheet(order: SearchOrder) {
    setSelectedOrder(order);
    setIsDetailSheetOpen(true);
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

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title="注文検索"
        description="詳細な条件で注文を検索・抽出できます"
      >
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          CSVエクスポート
        </Button>
      </PageHeader>

      {/* 検索フィルター */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>検索条件</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {showAdvancedFilters ? '基本検索' : '詳細検索'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 基本検索 */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">注文番号</label>
              <Input
                placeholder="例：ORD-2024-001"
                value={filters.orderNumber}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    orderNumber: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">顧客名</label>
              <Input
                placeholder="例：田中太郎"
                value={filters.customerName}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    customerName: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">メールアドレス</label>
              <Input
                placeholder="例：customer@example.com"
                value={filters.customerEmail}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    customerEmail: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* 詳細検索 */}
          {showAdvancedFilters && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium">注文状況</label>
                  <Select
                    value={filters.orderStatus}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, orderStatus: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="PENDING">保留中</SelectItem>
                      <SelectItem value="CONFIRMED">確認済み</SelectItem>
                      <SelectItem value="SHIPPED">発送済み</SelectItem>
                      <SelectItem value="COMPLETED">完了</SelectItem>
                      <SelectItem value="CANCELED">キャンセル</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">支払状況</label>
                  <Select
                    value={filters.paymentStatus}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, paymentStatus: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="UNPAID">未払い</SelectItem>
                      <SelectItem value="AUTHORIZED">承認済み</SelectItem>
                      <SelectItem value="PAID">支払済み</SelectItem>
                      <SelectItem value="REFUNDED">返金済み</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">支払方法</label>
                  <Select
                    value={filters.paymentMethod}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, paymentMethod: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="クレジットカード">
                        クレジットカード
                      </SelectItem>
                      <SelectItem value="銀行振込">銀行振込</SelectItem>
                      <SelectItem value="代金引換">代金引換</SelectItem>
                      <SelectItem value="コンビニ支払い">
                        コンビニ支払い
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="text-sm font-medium">注文日（開始）</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateFrom: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">注文日（終了）</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateTo: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">金額（最小）</label>
                  <Input
                    type="number"
                    placeholder="例：1000"
                    value={filters.amountMin}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        amountMin: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">金額（最大）</label>
                  <Input
                    type="number"
                    placeholder="例：100000"
                    value={filters.amountMax}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        amountMax: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* 検索アクション */}
          <div className="flex items-center gap-2 border-t pt-4">
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? '検索中...' : '検索'}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              リセット
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* 検索結果テーブル */}
      <EntityTable
        title="検索結果"
        description={`${filteredOrders.length}件の注文が見つかりました`}
        data={filteredOrders}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="結果内で検索..."
        onRowClick={openDetailSheet}
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="注文詳細"
        description="注文の詳細情報を表示します"
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
              toast.info('注文編集機能は実装予定です');
            },
          },
        ]}
        isLoading={isLoading}
      />
    </div>
  );
}
