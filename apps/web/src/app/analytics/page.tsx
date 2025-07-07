'use client';

import { useState } from 'react';

import type { StatisticCard, TableColumn } from '@/types/management';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import {
  BarChart3,
  Calendar,
  Download,
  PieChart,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';

import {
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';
import {
  type CategorySales,
  type CustomerSegment,
  type ReportParams,
  type TopProduct,
  useExportReport,
  useSalesAnalytics,
} from '@/hooks/api/use-analytics';

// 売上分析の型定義は @/hooks/api/use-analytics からインポート

export default function AnalyticsPage() {
  // ローカル状態
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [selectedView, setSelectedView] = useState('overview');
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // APIフックの使用
  const reportParams: ReportParams = {
    period: selectedPeriod as any,
  };
  const { analytics, isLoading: isAnalyticsLoading } =
    useSalesAnalytics(reportParams);
  const { exportReport } = useExportReport();

  // ローディング状態の統合
  const isLoading = isAnalyticsLoading || isOperationLoading;

  // 統計データの設定
  const statistics: StatisticCard[] = analytics
    ? [
        {
          title: '総売上',
          value: `¥${analytics.totalSales.toLocaleString()}`,
          description: analytics.period,
          icon: TrendingUp,
          trend: {
            value: 15.2,
            label: '前月比',
            isPositive: true,
          },
        },
        {
          title: '注文数',
          value: analytics.totalOrders,
          description: `平均注文額: ¥${analytics.averageOrderValue.toLocaleString()}`,
          icon: ShoppingCart,
          trend: {
            value: 8.5,
            label: '前月比',
            isPositive: true,
          },
        },
        {
          title: '新規顧客',
          value: analytics.newCustomers,
          description: `リピート顧客: ${analytics.returningCustomers}人`,
          icon: Users,
          trend: {
            value: 22.1,
            label: '前月比',
            isPositive: true,
          },
        },
        {
          title: 'コンバージョン率',
          value: `${analytics.conversionRate}%`,
          description: '訪問者から顧客への転換率',
          icon: TrendingUp,
          trend: {
            value: 0.8,
            label: '前月比',
            isPositive: true,
          },
        },
      ]
    : [];

  // 売上上位商品のテーブルカラム
  const topProductColumns: TableColumn<TopProduct>[] = [
    {
      key: 'rank',
      label: '順位',
      render: (value) => (
        <div className="flex items-center justify-center">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
            {value}
          </span>
        </div>
      ),
      className: 'text-center',
    },
    {
      key: 'name',
      label: '商品名',
      className: 'font-medium',
    },
    {
      key: 'totalSales',
      label: '売上金額',
      render: (value) => `¥${value.toLocaleString()}`,
      className: 'text-right',
    },
    {
      key: 'totalQuantity',
      label: '販売数',
      render: (value) => `${value}個`,
      className: 'text-right',
    },
    {
      key: 'profit',
      label: '利益',
      render: (value) => `¥${value.toLocaleString()}`,
      className: 'text-right',
    },
    {
      key: 'profitMargin',
      label: '利益率',
      render: (value) => `${value}%`,
      className: 'text-right',
    },
  ];

  // カテゴリ別売上のテーブルカラム
  const categorySalesColumns: TableColumn<CategorySales>[] = [
    {
      key: 'categoryName',
      label: 'カテゴリ',
      className: 'font-medium',
    },
    {
      key: 'totalSales',
      label: '売上金額',
      render: (value) => `¥${value.toLocaleString()}`,
      className: 'text-right',
    },
    {
      key: 'percentage',
      label: '構成比',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm">{value}%</span>
        </div>
      ),
    },
  ];

  // 顧客セグメントのテーブルカラム
  const customerSegmentColumns: TableColumn<CustomerSegment>[] = [
    {
      key: 'segment',
      label: 'セグメント',
      className: 'font-medium',
    },
    {
      key: 'count',
      label: '顧客数',
      render: (value) => `${value}人`,
      className: 'text-right',
    },
    {
      key: 'averageValue',
      label: '平均購入額',
      render: (value) => `¥${value.toLocaleString()}`,
      className: 'text-right',
    },
    {
      key: 'percentage',
      label: '構成比',
      render: (value) => `${value}%`,
      className: 'text-right',
    },
  ];

  // データエクスポート
  const handleExport = async () => {
    setIsOperationLoading(true);
    try {
      await exportReport('sales', 'csv', reportParams);
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // データ更新（使用していないため削除）

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader title="売上分析" description="売上実績と顧客行動の詳細分析">
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">今月</SelectItem>
              <SelectItem value="last_month">先月</SelectItem>
              <SelectItem value="current_quarter">今四半期</SelectItem>
              <SelectItem value="last_quarter">前四半期</SelectItem>
              <SelectItem value="current_year">今年</SelectItem>
              <SelectItem value="last_year">昨年</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">概要</SelectItem>
              <SelectItem value="products">商品別</SelectItem>
              <SelectItem value="categories">カテゴリ別</SelectItem>
              <SelectItem value="customers">顧客別</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExport} variant="outline" disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            エクスポート
          </Button>
        </div>
      </PageHeader>

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メイン分析エリア */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 売上推移グラフエリア */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              売上推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300">
              <div className="text-muted-foreground text-center">
                <BarChart3 className="mx-auto mb-2 h-12 w-12" />
                <p>売上推移グラフ</p>
                <p className="text-sm">（Chart.js等で実装予定）</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* カテゴリ別売上円グラフエリア */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              カテゴリ別売上構成
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300">
              <div className="text-muted-foreground text-center">
                <PieChart className="mx-auto mb-2 h-12 w-12" />
                <p>カテゴリ別円グラフ</p>
                <p className="text-sm">（Chart.js等で実装予定）</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 詳細分析テーブル */}
      <div className="space-y-6">
        {(selectedView === 'overview' || selectedView === 'products') && (
          <EntityTable
            title="売上上位商品"
            description="売上金額順での商品ランキング"
            data={analytics?.topProducts || []}
            columns={topProductColumns}
            isLoading={isLoading}
            searchPlaceholder="商品名で検索..."
          />
        )}

        {(selectedView === 'overview' || selectedView === 'categories') && (
          <EntityTable
            title="カテゴリ別売上"
            description="カテゴリごとの売上分析"
            data={analytics?.salesByCategory || []}
            columns={categorySalesColumns}
            isLoading={isLoading}
            searchPlaceholder="カテゴリ名で検索..."
          />
        )}

        {(selectedView === 'overview' || selectedView === 'customers') && (
          <EntityTable
            title="顧客セグメント分析"
            description="顧客の購買行動に基づくセグメント別分析"
            data={analytics?.customerSegments || []}
            columns={customerSegmentColumns}
            isLoading={isLoading}
            searchPlaceholder="セグメント名で検索..."
          />
        )}
      </div>

      {/* 分析サマリー（実装予定） */}
    </div>
  );
}
