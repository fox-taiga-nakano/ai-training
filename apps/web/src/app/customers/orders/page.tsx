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
import { Calendar, Eye, Filter, Search, ShoppingBag, User } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  EntityDetailSheet,
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';

// 顧客注文履歴の型定義
interface CustomerOrderHistory extends BaseEntity {
  customerId: number;
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: string;
  items: CustomerOrderItem[];
  customerInfo: CustomerInfo;
}

interface CustomerOrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CustomerInfo {
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastOrderDate: string;
  averageOrderValue: number;
  favoriteCategory: string;
}

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELED';
type PaymentStatus = 'UNPAID' | 'AUTHORIZED' | 'PAID' | 'REFUNDED';

// 検索フィルターの型定義
interface OrderFilters {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

// ダミーデータ
const dummyCustomerOrders: CustomerOrderHistory[] = [
  {
    id: 1,
    customerId: 1,
    customerName: '田中太郎',
    customerEmail: 'tanaka@example.com',
    orderNumber: 'ORD-2024-001',
    orderDate: '2024-03-01',
    totalAmount: 89800,
    orderStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentMethod: 'クレジットカード',
    shippingAddress: '東京都渋谷区xxx-xxx',
    items: [
      {
        id: 1,
        productName: 'スマートフォン',
        quantity: 1,
        unitPrice: 89800,
        totalPrice: 89800,
      },
    ],
    customerInfo: {
      totalOrders: 5,
      totalSpent: 250000,
      firstOrderDate: '2023-06-15',
      lastOrderDate: '2024-03-01',
      averageOrderValue: 50000,
      favoriteCategory: '電子機器',
    },
  },
  {
    id: 2,
    customerId: 1,
    customerName: '田中太郎',
    customerEmail: 'tanaka@example.com',
    orderNumber: 'ORD-2024-002',
    orderDate: '2024-02-15',
    totalAmount: 25000,
    orderStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentMethod: 'クレジットカード',
    shippingAddress: '東京都渋谷区xxx-xxx',
    items: [
      {
        id: 2,
        productName: 'ワイヤレスイヤホン',
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      },
      {
        id: 3,
        productName: 'スマホケース',
        quantity: 1,
        unitPrice: 10000,
        totalPrice: 10000,
      },
    ],
    customerInfo: {
      totalOrders: 5,
      totalSpent: 250000,
      firstOrderDate: '2023-06-15',
      lastOrderDate: '2024-03-01',
      averageOrderValue: 50000,
      favoriteCategory: '電子機器',
    },
  },
  {
    id: 3,
    customerId: 2,
    customerName: '佐藤花子',
    customerEmail: 'sato@example.com',
    orderNumber: 'ORD-2024-003',
    orderDate: '2024-03-02',
    totalAmount: 15000,
    orderStatus: 'SHIPPED',
    paymentStatus: 'PAID',
    paymentMethod: '銀行振込',
    shippingAddress: '大阪府大阪市xxx-xxx',
    items: [
      {
        id: 4,
        productName: 'ビジネス書籍',
        quantity: 3,
        unitPrice: 5000,
        totalPrice: 15000,
      },
    ],
    customerInfo: {
      totalOrders: 3,
      totalSpent: 45000,
      firstOrderDate: '2023-12-01',
      lastOrderDate: '2024-03-02',
      averageOrderValue: 15000,
      favoriteCategory: '書籍',
    },
  },
  {
    id: 4,
    customerId: 3,
    customerName: '鈴木一郎',
    customerEmail: 'suzuki@example.com',
    orderNumber: 'ORD-2024-004',
    orderDate: '2024-02-28',
    totalAmount: 8500,
    orderStatus: 'COMPLETED',
    paymentStatus: 'PAID',
    paymentMethod: 'クレジットカード',
    shippingAddress: '愛知県名古屋市xxx-xxx',
    items: [
      {
        id: 5,
        productName: 'プレミアムTシャツ',
        quantity: 1,
        unitPrice: 4500,
        totalPrice: 4500,
      },
      {
        id: 6,
        productName: 'ビジネス書籍',
        quantity: 1,
        unitPrice: 4000,
        totalPrice: 4000,
      },
    ],
    customerInfo: {
      totalOrders: 8,
      totalSpent: 120000,
      firstOrderDate: '2023-03-10',
      lastOrderDate: '2024-02-28',
      averageOrderValue: 15000,
      favoriteCategory: '衣類',
    },
  },
  {
    id: 5,
    customerId: 4,
    customerName: '山田美咲',
    customerEmail: 'yamada@example.com',
    orderNumber: 'ORD-2024-005',
    orderDate: '2024-02-25',
    totalAmount: 8000,
    orderStatus: 'CANCELED',
    paymentStatus: 'REFUNDED',
    paymentMethod: 'クレジットカード',
    shippingAddress: '福岡県福岡市xxx-xxx',
    items: [
      {
        id: 7,
        productName: 'ビジネス書籍',
        quantity: 2,
        unitPrice: 4000,
        totalPrice: 8000,
      },
    ],
    customerInfo: {
      totalOrders: 2,
      totalSpent: 12000,
      firstOrderDate: '2024-01-15',
      lastOrderDate: '2024-02-25',
      averageOrderValue: 6000,
      favoriteCategory: '書籍',
    },
  },
  {
    id: 6,
    customerId: 5,
    customerName: '高橋健太',
    customerEmail: 'takahashi@example.com',
    orderNumber: 'ORD-2024-006',
    orderDate: '2024-03-03',
    totalAmount: 25000,
    orderStatus: 'PENDING',
    paymentStatus: 'UNPAID',
    paymentMethod: '代金引換',
    shippingAddress: '神奈川県横浜市xxx-xxx',
    items: [
      {
        id: 8,
        productName: 'ノートパソコン',
        quantity: 1,
        unitPrice: 25000,
        totalPrice: 25000,
      },
    ],
    customerInfo: {
      totalOrders: 1,
      totalSpent: 25000,
      firstOrderDate: '2024-03-03',
      lastOrderDate: '2024-03-03',
      averageOrderValue: 25000,
      favoriteCategory: '電子機器',
    },
  },
];

export default function CustomerOrdersPage() {
  const [orders, setOrders] =
    useState<CustomerOrderHistory[]>(dummyCustomerOrders);
  const [filteredOrders, setFilteredOrders] =
    useState<CustomerOrderHistory[]>(dummyCustomerOrders);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<CustomerOrderHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // 検索フィルター
  const [filters, setFilters] = useState<OrderFilters>({
    customerName: '',
    customerEmail: '',
    orderNumber: '',
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
  const uniqueCustomers = new Set(filteredOrders.map((o) => o.customerId)).size;
  const totalRevenue = filteredOrders
    .filter((o) => o.orderStatus !== 'CANCELED')
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const averageOrderValue =
    totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総注文数',
      value: totalOrders,
      description: '検索結果の注文数',
      icon: ShoppingBag,
    },
    {
      title: '顧客数',
      value: uniqueCustomers,
      description: 'ユニーク顧客数',
      icon: User,
    },
    {
      title: '総売上',
      value: `¥${totalRevenue.toLocaleString()}`,
      description: '検索結果の合計売上',
      icon: ShoppingBag,
    },
    {
      title: '平均注文額',
      value: `¥${averageOrderValue.toLocaleString()}`,
      description: '1注文あたりの平均金額',
      icon: ShoppingBag,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<CustomerOrderHistory>[] = [
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
      key: 'customerEmail',
      label: 'メールアドレス',
      render: (value) => <span className="text-sm">{value}</span>,
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
  const actions: TableAction<CustomerOrderHistory>[] = [
    {
      label: '詳細を見る',
      icon: Eye,
      onClick: openDetailSheet,
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<CustomerOrderHistory>[] = [
    {
      title: '注文情報',
      fields: [
        {
          label: '注文番号',
          key: 'orderNumber',
          formatter: (value) => <span className="font-mono">{value}</span>,
        },
        { label: '注文日', key: 'orderDate' },
        {
          label: '注文金額',
          key: 'totalAmount',
          formatter: (value) => `¥${value.toLocaleString()}`,
        },
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
        { label: '支払方法', key: 'paymentMethod' },
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
      title: '顧客統計',
      fields: [
        {
          label: '総注文数',
          key: 'customerInfo',
          formatter: (info: CustomerInfo) => `${info.totalOrders}回`,
        },
        {
          label: '総購入金額',
          key: 'customerInfo',
          formatter: (info: CustomerInfo) =>
            `¥${info.totalSpent.toLocaleString()}`,
        },
        {
          label: '平均注文額',
          key: 'customerInfo',
          formatter: (info: CustomerInfo) =>
            `¥${info.averageOrderValue.toLocaleString()}`,
        },
        {
          label: '初回注文日',
          key: 'customerInfo',
          formatter: (info: CustomerInfo) => info.firstOrderDate,
        },
        {
          label: '最終注文日',
          key: 'customerInfo',
          formatter: (info: CustomerInfo) => info.lastOrderDate,
        },
        {
          label: 'お気に入りカテゴリ',
          key: 'customerInfo',
          formatter: (info: CustomerInfo) => info.favoriteCategory,
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
      if (
        filters.orderNumber &&
        !order.orderNumber
          .toLowerCase()
          .includes(filters.orderNumber.toLowerCase())
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
      toast.success(`${filtered.length}件の注文履歴が見つかりました`);
    }, 500);
  };

  // フィルターリセット
  const handleReset = () => {
    setFilters({
      customerName: '',
      customerEmail: '',
      orderNumber: '',
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

  // 詳細シートを開く
  function openDetailSheet(order: CustomerOrderHistory) {
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
        title="顧客注文履歴"
        description="顧客ごとの注文履歴と購入傾向を確認できます"
      />

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
        title="顧客注文履歴"
        description={`${filteredOrders.length}件の注文履歴が見つかりました`}
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
        description="注文の詳細情報と顧客統計を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedOrder}
        sections={detailSections}
        relatedData={relatedData}
        isLoading={isLoading}
      />
    </div>
  );
}
