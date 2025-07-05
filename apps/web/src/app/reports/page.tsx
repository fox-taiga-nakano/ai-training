'use client';

import { useEffect, useState } from 'react';

import type {
  BaseEntity,
  DetailSection,
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
  Download,
  Eye,
  FileText,
  Filter,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  EntityDetailSheet,
  EntityTable,
  PageHeader,
  StatisticsGrid,
} from '@/components/management';

// レポートの型定義
interface Report extends BaseEntity {
  name: string;
  type: ReportType;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  fileSize?: string;
  downloadCount: number;
  author: string;
  parameters: ReportParameter[];
  schedule?: ReportSchedule;
  lastGenerated?: string;
  nextGeneration?: string;
}

interface ReportParameter {
  name: string;
  value: string;
  type: 'date' | 'select' | 'text' | 'number';
}

interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
}

type ReportType =
  | 'SALES'
  | 'INVENTORY'
  | 'CUSTOMER'
  | 'FINANCIAL'
  | 'OPERATIONAL';
type ReportCategory = 'STANDARD' | 'CUSTOM' | 'SCHEDULED' | 'TEMPLATE';
type ReportStatus = 'READY' | 'GENERATING' | 'COMPLETED' | 'ERROR';

// レポートテンプレートの型定義
interface ReportTemplate extends BaseEntity {
  name: string;
  type: ReportType;
  description: string;
  defaultParameters: ReportParameter[];
  estimatedTime: string;
  outputFormat: string[];
}

// ダミーデータ
const dummyReports: Report[] = [
  {
    id: 1,
    name: '月次売上レポート - 2024年3月',
    type: 'SALES',
    category: 'SCHEDULED',
    description: '2024年3月の売上実績詳細レポート',
    status: 'COMPLETED',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-31',
    fileSize: '2.5MB',
    downloadCount: 15,
    author: '田中管理者',
    lastGenerated: '2024-03-31 23:59',
    nextGeneration: '2024-04-30 23:59',
    parameters: [
      { name: '対象期間', value: '2024-03-01 ~ 2024-03-31', type: 'date' },
      { name: '出力形式', value: 'PDF', type: 'select' },
    ],
    schedule: {
      frequency: 'monthly',
      enabled: true,
      lastRun: '2024-03-31 23:59',
      nextRun: '2024-04-30 23:59',
    },
  },
  {
    id: 2,
    name: '在庫分析レポート',
    type: 'INVENTORY',
    category: 'STANDARD',
    description: '現在の在庫状況と発注推奨分析',
    status: 'READY',
    createdAt: '2024-03-05',
    updatedAt: '2024-03-05',
    downloadCount: 8,
    author: '佐藤倉庫管理',
    parameters: [
      { name: '在庫基準日', value: '2024-03-05', type: 'date' },
      { name: 'カテゴリ', value: '全て', type: 'select' },
    ],
  },
  {
    id: 3,
    name: '顧客行動分析 - VIP顧客',
    type: 'CUSTOMER',
    category: 'CUSTOM',
    description: 'VIP顧客の購買パターンと傾向分析',
    status: 'GENERATING',
    createdAt: '2024-03-04',
    updatedAt: '2024-03-05',
    downloadCount: 3,
    author: '山田マーケティング',
    parameters: [
      { name: '顧客セグメント', value: 'VIP顧客', type: 'select' },
      { name: '分析期間', value: '直近6ヶ月', type: 'select' },
    ],
  },
  {
    id: 4,
    name: '財務サマリー - Q1 2024',
    type: 'FINANCIAL',
    category: 'SCHEDULED',
    description: '2024年第1四半期の財務サマリー',
    status: 'COMPLETED',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-31',
    fileSize: '1.8MB',
    downloadCount: 22,
    author: '鈴木経理',
    lastGenerated: '2024-03-31 18:00',
    nextGeneration: '2024-06-30 18:00',
    parameters: [
      { name: '対象四半期', value: 'Q1 2024', type: 'select' },
      { name: '詳細レベル', value: '詳細', type: 'select' },
    ],
    schedule: {
      frequency: 'quarterly',
      enabled: true,
      lastRun: '2024-03-31 18:00',
      nextRun: '2024-06-30 18:00',
    },
  },
  {
    id: 5,
    name: '運営効率レポート',
    type: 'OPERATIONAL',
    category: 'TEMPLATE',
    description: '注文処理から配送までの運営効率分析',
    status: 'ERROR',
    createdAt: '2024-03-03',
    updatedAt: '2024-03-04',
    downloadCount: 0,
    author: '高橋運営',
    parameters: [
      { name: '分析対象', value: '全プロセス', type: 'select' },
      { name: '期間', value: '直近1ヶ月', type: 'select' },
    ],
  },
  {
    id: 6,
    name: '週次売上速報 - 2024年3月第1週',
    type: 'SALES',
    category: 'SCHEDULED',
    description: '2024年3月第1週の売上速報',
    status: 'COMPLETED',
    createdAt: '2024-03-01',
    updatedAt: '2024-03-07',
    fileSize: '850KB',
    downloadCount: 12,
    author: '田中管理者',
    lastGenerated: '2024-03-07 09:00',
    nextGeneration: '2024-03-14 09:00',
    parameters: [
      { name: '対象週', value: '2024-03-01 ~ 2024-03-07', type: 'date' },
    ],
    schedule: {
      frequency: 'weekly',
      enabled: true,
      lastRun: '2024-03-07 09:00',
      nextRun: '2024-03-14 09:00',
    },
  },
];

const dummyTemplates: ReportTemplate[] = [
  {
    id: 1,
    name: '売上分析レポート',
    type: 'SALES',
    description: '期間を指定した売上実績と傾向分析',
    estimatedTime: '3-5分',
    outputFormat: ['PDF', 'Excel', 'CSV'],
    defaultParameters: [
      { name: '開始日', value: '', type: 'date' },
      { name: '終了日', value: '', type: 'date' },
      { name: 'グループ化', value: '日別', type: 'select' },
    ],
  },
  {
    id: 2,
    name: '在庫状況レポート',
    type: 'INVENTORY',
    description: '在庫レベル、回転率、発注推奨の包括的分析',
    estimatedTime: '2-3分',
    outputFormat: ['PDF', 'Excel'],
    defaultParameters: [
      { name: '基準日', value: '', type: 'date' },
      { name: 'カテゴリ', value: '全て', type: 'select' },
    ],
  },
  {
    id: 3,
    name: '顧客分析レポート',
    type: 'CUSTOMER',
    description: '顧客セグメント、行動パターン、LTV分析',
    estimatedTime: '5-7分',
    outputFormat: ['PDF', 'Excel'],
    defaultParameters: [
      { name: '分析期間', value: '直近6ヶ月', type: 'select' },
      { name: 'セグメント', value: '全て', type: 'select' },
    ],
  },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(dummyReports);
  const [templates] = useState<ReportTemplate[]>(dummyTemplates);
  const [filteredReports, setFilteredReports] =
    useState<Report[]>(dummyReports);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // フィルター状態
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>('');

  // フィルタリング処理
  useEffect(() => {
    let filtered = reports;

    if (typeFilter) {
      filtered = filtered.filter((report) => report.type === typeFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter((report) => report.status === statusFilter);
    }
    if (categoryFilter) {
      filtered = filtered.filter(
        (report) => report.category === categoryFilter
      );
    }
    if (authorFilter) {
      filtered = filtered.filter((report) =>
        report.author.toLowerCase().includes(authorFilter.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  }, [typeFilter, statusFilter, categoryFilter, authorFilter, reports]);

  // 統計計算
  const totalReports = reports.length;
  const completedReports = reports.filter(
    (r) => r.status === 'COMPLETED'
  ).length;
  const scheduledReports = reports.filter(
    (r) => r.category === 'SCHEDULED'
  ).length;
  const totalDownloads = reports.reduce(
    (sum, report) => sum + report.downloadCount,
    0
  );

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総レポート数',
      value: totalReports,
      description: '作成されたレポート',
      icon: FileText,
    },
    {
      title: '完了済み',
      value: completedReports,
      description: 'ダウンロード可能',
      icon: FileText,
    },
    {
      title: '自動生成',
      value: scheduledReports,
      description: 'スケジュール設定済み',
      icon: FileText,
    },
    {
      title: '総ダウンロード',
      value: totalDownloads,
      description: '累計ダウンロード数',
      icon: Download,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<Report>[] = [
    {
      key: 'name',
      label: 'レポート名',
      className: 'font-medium',
    },
    {
      key: 'type',
      label: 'タイプ',
      render: (value) => getReportTypeBadge(value),
    },
    {
      key: 'category',
      label: 'カテゴリ',
      render: (value) => getReportCategoryBadge(value),
    },
    {
      key: 'status',
      label: 'ステータス',
      render: (value) => getReportStatusBadge(value),
    },
    {
      key: 'author',
      label: '作成者',
    },
    {
      key: 'updatedAt',
      label: '最終更新',
      render: (value) => <span className="text-sm">{value}</span>,
    },
    {
      key: 'fileSize',
      label: 'ファイルサイズ',
      render: (value) => value || '-',
      className: 'text-right',
    },
    {
      key: 'downloadCount',
      label: 'DL数',
      render: (value) => `${value}回`,
      className: 'text-right',
    },
  ];

  // レポートダウンロード
  const handleDownload = async (report: Report) => {
    if (report.status !== 'COMPLETED') {
      toast.error('レポートがまだ完成していません');
      return;
    }

    try {
      // TODO: API call to download report
      await new Promise((resolve) => setTimeout(resolve, 500));

      // ダウンロード数を更新
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id ? { ...r, downloadCount: r.downloadCount + 1 } : r
        )
      );

      toast.success('レポートをダウンロードしました');
    } catch (error) {
      toast.error('ダウンロードに失敗しました');
    }
  };

  // 詳細シートを開く
  function openDetailSheet(report: Report) {
    setSelectedReport(report);
    setIsDetailSheetOpen(true);
  }

  // テーブルアクションの設定
  const actions: TableAction<Report>[] = [
    {
      label: '詳細を見る',
      icon: Eye,
      onClick: openDetailSheet,
    },
    {
      label: 'ダウンロード',
      icon: Download,
      onClick: handleDownload,
      show: (report) => report.status === 'COMPLETED',
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<Report>[] = [
    {
      title: 'レポート基本情報',
      fields: [
        {
          label: 'レポートID',
          key: 'id',
          formatter: (value) => <span className="font-mono">#{value}</span>,
        },
        { label: 'レポート名', key: 'name' },
        {
          label: 'タイプ',
          key: 'type',
          formatter: (value) => getReportTypeBadge(value),
        },
        {
          label: 'カテゴリ',
          key: 'category',
          formatter: (value) => getReportCategoryBadge(value),
        },
        {
          label: 'ステータス',
          key: 'status',
          formatter: (value) => getReportStatusBadge(value),
        },
      ],
    },
    {
      title: '作成情報',
      fields: [
        { label: '作成者', key: 'author' },
        { label: '作成日', key: 'createdAt' },
        { label: '最終更新', key: 'updatedAt' },
        {
          label: 'ファイルサイズ',
          key: 'fileSize',
          formatter: (value) => value || '未生成',
        },
        {
          label: 'ダウンロード数',
          key: 'downloadCount',
          formatter: (value) => `${value}回`,
        },
      ],
    },
    {
      title: 'スケジュール情報',
      fields: [
        {
          label: '最終生成日時',
          key: 'lastGenerated',
          formatter: (value) => value || '未生成',
        },
        {
          label: '次回生成予定',
          key: 'nextGeneration',
          formatter: (value) => value || '設定なし',
        },
        {
          label: '自動生成',
          key: 'schedule',
          formatter: (schedule) =>
            schedule?.enabled
              ? `有効 (${getFrequencyLabel(schedule.frequency)})`
              : '無効',
        },
      ],
    },
    {
      title: 'その他',
      fields: [
        {
          label: '説明',
          key: 'description',
        },
      ],
    },
  ];

  // レポート生成
  const handleGenerate = async (templateId: number) => {
    setIsLoading(true);
    try {
      // TODO: API call to generate report
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success('レポートの生成を開始しました');
    } catch (error) {
      toast.error('レポート生成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // レポートタイプのバッジ
  function getReportTypeBadge(type: ReportType) {
    const typeMap = {
      SALES: { label: '売上', variant: 'default' as const, icon: TrendingUp },
      INVENTORY: { label: '在庫', variant: 'default' as const, icon: Package },
      CUSTOMER: { label: '顧客', variant: 'default' as const, icon: Users },
      FINANCIAL: {
        label: '財務',
        variant: 'default' as const,
        icon: ShoppingCart,
      },
      OPERATIONAL: {
        label: '運営',
        variant: 'secondary' as const,
        icon: FileText,
      },
    };

    const config = typeMap[type] || {
      label: type,
      variant: 'secondary' as const,
      icon: FileText,
    };
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  }

  // レポートカテゴリのバッジ
  function getReportCategoryBadge(category: ReportCategory) {
    const categoryMap = {
      STANDARD: { label: '標準', variant: 'default' as const },
      CUSTOM: { label: 'カスタム', variant: 'secondary' as const },
      SCHEDULED: { label: '定期', variant: 'default' as const },
      TEMPLATE: { label: 'テンプレート', variant: 'outline' as const },
    };

    const config = categoryMap[category] || {
      label: category,
      variant: 'secondary' as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  // レポートステータスのバッジ
  function getReportStatusBadge(status: ReportStatus) {
    const statusMap = {
      READY: { label: '生成可能', variant: 'secondary' as const },
      GENERATING: { label: '生成中', variant: 'default' as const },
      COMPLETED: { label: '完了', variant: 'default' as const },
      ERROR: { label: 'エラー', variant: 'destructive' as const },
    };

    const config = statusMap[status] || {
      label: status,
      variant: 'secondary' as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  // 頻度ラベル取得
  function getFrequencyLabel(frequency: string): string {
    const labels = {
      daily: '日次',
      weekly: '週次',
      monthly: '月次',
      quarterly: '四半期',
    };
    return labels[frequency as keyof typeof labels] || frequency;
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title="レポート"
        description="各種レポートの生成・管理・ダウンロード"
      />

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* レポートテンプレート */}
      <Card>
        <CardHeader>
          <CardTitle>レポートテンプレート</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {templates.map((template) => (
              <div key={template.id} className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium">{template.name}</h3>
                  {getReportTypeBadge(template.type)}
                </div>
                <p className="text-muted-foreground mb-3 text-sm">
                  {template.description}
                </p>
                <div className="text-muted-foreground mb-3 flex items-center justify-between text-xs">
                  <span>生成時間: {template.estimatedTime}</span>
                  <span>形式: {template.outputFormat.join(', ')}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleGenerate(template.id)}
                  disabled={isLoading}
                  className="w-full"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  生成
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* フィルター */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            フィルター
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">タイプ</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">すべて</SelectItem>
                  <SelectItem value="SALES">売上</SelectItem>
                  <SelectItem value="INVENTORY">在庫</SelectItem>
                  <SelectItem value="CUSTOMER">顧客</SelectItem>
                  <SelectItem value="FINANCIAL">財務</SelectItem>
                  <SelectItem value="OPERATIONAL">運営</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">ステータス</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">すべて</SelectItem>
                  <SelectItem value="READY">生成可能</SelectItem>
                  <SelectItem value="GENERATING">生成中</SelectItem>
                  <SelectItem value="COMPLETED">完了</SelectItem>
                  <SelectItem value="ERROR">エラー</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">カテゴリ</label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="すべて" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">すべて</SelectItem>
                  <SelectItem value="STANDARD">標準</SelectItem>
                  <SelectItem value="CUSTOM">カスタム</SelectItem>
                  <SelectItem value="SCHEDULED">定期</SelectItem>
                  <SelectItem value="TEMPLATE">テンプレート</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">作成者</label>
              <Input
                placeholder="作成者名で検索"
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* レポート一覧 */}
      <EntityTable
        title="レポート一覧"
        description={`${filteredReports.length}件のレポートを表示しています`}
        data={filteredReports}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="レポート名で検索..."
        onRowClick={openDetailSheet}
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="レポート詳細"
        description="レポートの詳細情報とパラメータを表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedReport}
        sections={detailSections}
        actions={[
          {
            label: 'ダウンロード',
            icon: Download,
            variant: 'outline',
            onClick: (report) => {
              setIsDetailSheetOpen(false);
              handleDownload(report);
            },
            show: (report) => report.status === 'COMPLETED',
          },
        ]}
        isLoading={isLoading}
      />
    </div>
  );
}
