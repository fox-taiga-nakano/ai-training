'use client';

import { useEffect, useState } from 'react';

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
import { Card, CardContent } from '@repo/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import {
  AlertTriangle,
  BarChart3,
  Eye,
  Package,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  EntityDetailSheet,
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';

// 在庫管理の型定義
interface InventoryItem extends BaseEntity {
  productCode: string;
  productName: string;
  categoryName: string;
  supplierName: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reservedStock: number;
  availableStock: number;
  unitCost: number;
  totalValue: number;
  lastRestocked: string;
  stockStatus: StockStatus;
  turnoverRate: number;
  averageMonthlySales: number;
  stockHistory: StockMovement[];
  lowStockDays?: number;
}

interface StockMovement {
  id: number;
  date: string;
  type: MovementType;
  quantity: number;
  reason: string;
  reference?: string;
}

type StockStatus =
  | 'ADEQUATE'
  | 'LOW'
  | 'CRITICAL'
  | 'OVERSTOCK'
  | 'OUT_OF_STOCK';
type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

// ダミーデータ
const dummyInventory: InventoryItem[] = [
  {
    id: 1,
    productCode: 'PROD-001',
    productName: 'スマートフォン',
    categoryName: '電子機器',
    supplierName: 'テクノロジー株式会社',
    currentStock: 5,
    minimumStock: 10,
    maximumStock: 50,
    reservedStock: 2,
    availableStock: 3,
    unitCost: 65000,
    totalValue: 325000,
    lastRestocked: '2024-02-15',
    stockStatus: 'CRITICAL',
    turnoverRate: 8.5,
    averageMonthlySales: 12,
    lowStockDays: 5,
    stockHistory: [
      {
        id: 1,
        date: '2024-03-01',
        type: 'OUT',
        quantity: -2,
        reason: '販売',
        reference: 'ORD-2024-001',
      },
      {
        id: 2,
        date: '2024-02-28',
        type: 'OUT',
        quantity: -1,
        reason: '販売',
        reference: 'ORD-2024-002',
      },
      {
        id: 3,
        date: '2024-02-15',
        type: 'IN',
        quantity: 10,
        reason: '入荷',
        reference: 'PO-2024-005',
      },
    ],
  },
  {
    id: 2,
    productCode: 'PROD-002',
    productName: 'ワイヤレスイヤホン',
    categoryName: '電子機器',
    supplierName: 'オーディオ商事',
    currentStock: 25,
    minimumStock: 15,
    maximumStock: 100,
    reservedStock: 3,
    availableStock: 22,
    unitCost: 8000,
    totalValue: 200000,
    lastRestocked: '2024-03-01',
    stockStatus: 'ADEQUATE',
    turnoverRate: 6.2,
    averageMonthlySales: 18,
    stockHistory: [
      {
        id: 4,
        date: '2024-03-02',
        type: 'OUT',
        quantity: -1,
        reason: '販売',
        reference: 'ORD-2024-003',
      },
      {
        id: 5,
        date: '2024-03-01',
        type: 'IN',
        quantity: 20,
        reason: '入荷',
        reference: 'PO-2024-006',
      },
    ],
  },
  {
    id: 3,
    productCode: 'PROD-003',
    productName: 'プレミアムTシャツ',
    categoryName: '衣類',
    supplierName: 'ファッション企画',
    currentStock: 120,
    minimumStock: 20,
    maximumStock: 80,
    reservedStock: 5,
    availableStock: 115,
    unitCost: 2500,
    totalValue: 300000,
    lastRestocked: '2024-01-20',
    stockStatus: 'OVERSTOCK',
    turnoverRate: 2.1,
    averageMonthlySales: 8,
    stockHistory: [
      {
        id: 6,
        date: '2024-02-28',
        type: 'OUT',
        quantity: -1,
        reason: '販売',
        reference: 'ORD-2024-004',
      },
      {
        id: 7,
        date: '2024-01-20',
        type: 'IN',
        quantity: 100,
        reason: '入荷',
        reference: 'PO-2024-001',
      },
    ],
  },
  {
    id: 4,
    productCode: 'PROD-004',
    productName: 'ビジネス書籍',
    categoryName: '書籍',
    supplierName: '出版流通',
    currentStock: 0,
    minimumStock: 5,
    maximumStock: 30,
    reservedStock: 0,
    availableStock: 0,
    unitCost: 2000,
    totalValue: 0,
    lastRestocked: '2024-01-10',
    stockStatus: 'OUT_OF_STOCK',
    turnoverRate: 4.5,
    averageMonthlySales: 15,
    lowStockDays: 12,
    stockHistory: [
      {
        id: 8,
        date: '2024-02-25',
        type: 'OUT',
        quantity: -2,
        reason: '販売',
        reference: 'ORD-2024-005',
      },
      {
        id: 9,
        date: '2024-02-20',
        type: 'OUT',
        quantity: -3,
        reason: '販売',
        reference: 'ORD-2024-006',
      },
      {
        id: 10,
        date: '2024-01-10',
        type: 'IN',
        quantity: 25,
        reason: '入荷',
        reference: 'PO-2024-002',
      },
    ],
  },
  {
    id: 5,
    productCode: 'PROD-005',
    productName: 'オーガニックコーヒー',
    categoryName: '食品',
    supplierName: 'コーヒー輸入',
    currentStock: 8,
    minimumStock: 12,
    maximumStock: 60,
    reservedStock: 1,
    availableStock: 7,
    unitCost: 1200,
    totalValue: 9600,
    lastRestocked: '2024-02-28',
    stockStatus: 'LOW',
    turnoverRate: 5.8,
    averageMonthlySales: 20,
    lowStockDays: 3,
    stockHistory: [
      {
        id: 11,
        date: '2024-03-01',
        type: 'OUT',
        quantity: -1,
        reason: '販売',
        reference: 'ORD-2024-007',
      },
      {
        id: 12,
        date: '2024-02-28',
        type: 'IN',
        quantity: 15,
        reason: '入荷',
        reference: 'PO-2024-007',
      },
    ],
  },
  {
    id: 6,
    productCode: 'PROD-006',
    productName: 'ノートパソコン',
    categoryName: '電子機器',
    supplierName: 'PC販売',
    currentStock: 15,
    minimumStock: 8,
    maximumStock: 40,
    reservedStock: 1,
    availableStock: 14,
    unitCost: 45000,
    totalValue: 675000,
    lastRestocked: '2024-03-03',
    stockStatus: 'ADEQUATE',
    turnoverRate: 3.2,
    averageMonthlySales: 5,
    stockHistory: [
      {
        id: 13,
        date: '2024-03-03',
        type: 'IN',
        quantity: 10,
        reason: '入荷',
        reference: 'PO-2024-008',
      },
      {
        id: 14,
        date: '2024-02-20',
        type: 'OUT',
        quantity: -1,
        reason: '販売',
        reference: 'ORD-2024-008',
      },
    ],
  },
];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(dummyInventory);
  const [filteredInventory, setFilteredInventory] =
    useState<InventoryItem[]>(dummyInventory);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // フィルタリング処理
  const applyFilters = () => {
    let filtered = inventory;

    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.stockStatus === statusFilter);
    }

    if (categoryFilter && categoryFilter !== 'all') {
      filtered = filtered.filter(
        (item) => item.categoryName === categoryFilter
      );
    }

    setFilteredInventory(filtered);
  };

  // フィルター適用
  useEffect(() => {
    applyFilters();
  }, [statusFilter, categoryFilter, inventory]);

  // 統計計算
  const totalItems = filteredInventory.length;
  const criticalItems = filteredInventory.filter(
    (i) => i.stockStatus === 'CRITICAL'
  ).length;
  const lowStockItems = filteredInventory.filter(
    (i) => i.stockStatus === 'LOW'
  ).length;
  const outOfStockItems = filteredInventory.filter(
    (i) => i.stockStatus === 'OUT_OF_STOCK'
  ).length;
  const totalValue = filteredInventory.reduce(
    (sum, item) => sum + item.totalValue,
    0
  );

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総商品数',
      value: totalItems,
      description: '在庫管理対象商品',
      icon: Package,
    },
    {
      title: '在庫切れ危険',
      value: criticalItems + outOfStockItems,
      description: '緊急対応が必要',
      icon: AlertTriangle,
      trend:
        criticalItems + outOfStockItems > 0
          ? {
              value: criticalItems + outOfStockItems,
              label: '件の緊急対応',
              isPositive: false,
            }
          : undefined,
    },
    {
      title: '在庫不足',
      value: lowStockItems,
      description: '発注検討が必要',
      icon: TrendingDown,
    },
    {
      title: '在庫総額',
      value: `¥${totalValue.toLocaleString()}`,
      description: '現在の在庫評価額',
      icon: BarChart3,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<InventoryItem>[] = [
    {
      key: 'productCode',
      label: '商品コード',
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'productName',
      label: '商品名',
      className: 'font-medium',
    },
    {
      key: 'categoryName',
      label: 'カテゴリ',
    },
    {
      key: 'currentStock',
      label: '現在在庫',
      render: (value, row) => (
        <div className="text-right">
          <div className="font-medium">{value}個</div>
          <div className="text-muted-foreground text-xs">
            利用可能: {row.availableStock}個
          </div>
        </div>
      ),
      className: 'text-right',
    },
    {
      key: 'stockStatus',
      label: '在庫状況',
      render: (value) => getStockStatusBadge(value),
    },
    {
      key: 'turnoverRate',
      label: '回転率',
      render: (value) => `${value}回/年`,
      className: 'text-right',
    },
    {
      key: 'totalValue',
      label: '在庫価値',
      render: (value) => `¥${value.toLocaleString()}`,
      className: 'text-right',
    },
    {
      key: 'lastRestocked',
      label: '最終入荷',
      render: (value) => <span className="text-sm">{value}</span>,
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<InventoryItem>[] = [
    {
      label: '在庫詳細を見る',
      icon: Eye,
      onClick: openDetailSheet,
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<InventoryItem>[] = [
    {
      title: '商品基本情報',
      fields: [
        {
          label: '商品コード',
          key: 'productCode',
          formatter: (value) => <span className="font-mono">{value}</span>,
        },
        { label: '商品名', key: 'productName' },
        { label: 'カテゴリ', key: 'categoryName' },
        { label: 'サプライヤー', key: 'supplierName' },
      ],
    },
    {
      title: '在庫状況',
      fields: [
        {
          label: '現在在庫',
          key: 'currentStock',
          formatter: (value) => `${value}個`,
        },
        {
          label: '予約済み在庫',
          key: 'reservedStock',
          formatter: (value) => `${value}個`,
        },
        {
          label: '利用可能在庫',
          key: 'availableStock',
          formatter: (value) => `${value}個`,
        },
        {
          label: '在庫状況',
          key: 'stockStatus',
          formatter: (value) => getStockStatusBadge(value),
        },
      ],
    },
    {
      title: '在庫基準',
      fields: [
        {
          label: '最小在庫',
          key: 'minimumStock',
          formatter: (value) => `${value}個`,
        },
        {
          label: '最大在庫',
          key: 'maximumStock',
          formatter: (value) => `${value}個`,
        },
        {
          label: '在庫不足日数',
          key: 'lowStockDays',
          formatter: (value) => (value ? `${value}日間` : '正常'),
        },
      ],
    },
    {
      title: '財務情報',
      fields: [
        {
          label: '単価',
          key: 'unitCost',
          formatter: (value) => `¥${value.toLocaleString()}`,
        },
        {
          label: '在庫総額',
          key: 'totalValue',
          formatter: (value) => `¥${value.toLocaleString()}`,
        },
      ],
    },
    {
      title: '売上分析',
      fields: [
        {
          label: '回転率',
          key: 'turnoverRate',
          formatter: (value) => `${value}回/年`,
        },
        {
          label: '月間平均販売',
          key: 'averageMonthlySales',
          formatter: (value) => `${value}個/月`,
        },
        { label: '最終入荷日', key: 'lastRestocked' },
      ],
    },
  ];

  // 関連データ設定（在庫履歴）
  const relatedData: RelatedData[] = [
    {
      title: '在庫履歴',
      description: 'この商品の最近の在庫変動履歴',
      data: selectedItem?.stockHistory || [],
      columns: [
        {
          key: 'date',
          label: '日付',
          render: (value) => <span className="font-mono text-sm">{value}</span>,
        },
        {
          key: 'type',
          label: '種別',
          render: (value) => (
            <Badge
              variant={
                value === 'IN'
                  ? 'default'
                  : value === 'OUT'
                    ? 'destructive'
                    : 'secondary'
              }
            >
              {value === 'IN' ? '入荷' : value === 'OUT' ? '出荷' : '調整'}
            </Badge>
          ),
        },
        {
          key: 'quantity',
          label: '数量',
          render: (value) => (
            <span className={value > 0 ? 'text-green-600' : 'text-red-600'}>
              {value > 0 ? '+' : ''}
              {value}個
            </span>
          ),
        },
        { key: 'reason', label: '理由' },
        {
          key: 'reference',
          label: '参照',
          render: (value) =>
            value ? <span className="font-mono text-sm">{value}</span> : '-',
        },
      ],
      emptyMessage: '在庫履歴がありません',
    },
  ];

  // データ更新
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // TODO: API call to refresh inventory data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('在庫データを更新しました');
    } catch (error) {
      toast.error('データの更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 詳細シートを開く
  function openDetailSheet(item: InventoryItem) {
    setSelectedItem(item);
    setIsDetailSheetOpen(true);
  }

  // 在庫ステータスのバッジ
  function getStockStatusBadge(status: StockStatus) {
    const statusMap = {
      ADEQUATE: { label: '適正', variant: 'default' as const, icon: Package },
      LOW: {
        label: '在庫不足',
        variant: 'secondary' as const,
        icon: TrendingDown,
      },
      CRITICAL: {
        label: '在庫切れ危険',
        variant: 'destructive' as const,
        icon: AlertTriangle,
      },
      OVERSTOCK: {
        label: '過剰在庫',
        variant: 'secondary' as const,
        icon: TrendingUp,
      },
      OUT_OF_STOCK: {
        label: '在庫切れ',
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

  // カテゴリ一覧取得
  const categories = [...new Set(inventory.map((item) => item.categoryName))];

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title="在庫管理"
        description="商品の在庫状況と分析を確認します"
      >
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="在庫状況で絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="CRITICAL">在庫切れ危険</SelectItem>
              <SelectItem value="LOW">在庫不足</SelectItem>
              <SelectItem value="OUT_OF_STOCK">在庫切れ</SelectItem>
              <SelectItem value="OVERSTOCK">過剰在庫</SelectItem>
              <SelectItem value="ADEQUATE">適正</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="カテゴリで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            更新
          </Button>
        </div>
      </PageHeader>

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* 緊急アラート */}
      {(criticalItems > 0 || outOfStockItems > 0) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">在庫アラート</h3>
                <p className="text-sm text-red-700">
                  {outOfStockItems > 0 &&
                    `${outOfStockItems}件の在庫切れ商品があります。`}
                  {criticalItems > 0 &&
                    `${criticalItems}件の在庫切れ危険商品があります。`}
                  緊急に発注を検討してください。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* メインテーブル */}
      <EntityTable
        title="在庫一覧"
        description={`${filteredInventory.length}件の商品在庫を表示しています`}
        data={filteredInventory}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="商品名、商品コードで検索..."
        onRowClick={openDetailSheet}
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="在庫詳細"
        description="商品の詳細な在庫情報と履歴を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedItem}
        sections={detailSections}
        relatedData={relatedData}
        isLoading={isLoading}
      />
    </div>
  );
}
