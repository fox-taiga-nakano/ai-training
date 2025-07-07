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
import { Edit, Eye, Globe, Plus, Settings, Trash2 } from 'lucide-react';
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

// サイトの型定義
interface Site extends BaseEntity {
  code: string;
  name: string;
  url: string;
  status: SiteStatus;
  description?: string;
  adminEmail: string;
  timezone: string;
  currency: string;
  language: string;
  theme: string;
  createdAt: string;
  updatedAt: string;
  shops: SiteShop[];
  settings: SiteSetting[];
}

interface SiteShop {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
}

interface SiteSetting {
  id: number;
  key: string;
  value: string;
  description: string;
}

type SiteStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';

// バリデーションスキーマ
const siteSchema = z.object({
  code: z
    .string()
    .min(1, 'サイトコードは必須です')
    .max(20, 'サイトコードは20文字以内で入力してください')
    .regex(
      /^[A-Z0-9_]+$/,
      'サイトコードは英大文字、数字、アンダースコアで入力してください'
    ),
  name: z
    .string()
    .min(1, 'サイト名は必須です')
    .max(100, 'サイト名は100文字以内で入力してください'),
  url: z.string().min(1, 'URLは必須です').url('有効なURLを入力してください'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  adminEmail: z
    .string()
    .min(1, '管理者メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  timezone: z.string().min(1, 'タイムゾーンは必須です'),
  currency: z.string().min(1, '通貨は必須です'),
  language: z.string().min(1, '言語は必須です'),
  theme: z.string().min(1, 'テーマは必須です'),
});

type SiteFormData = z.infer<typeof siteSchema>;

// ダミーデータ
const dummySites: Site[] = [
  {
    id: 1,
    code: 'MAIN',
    name: 'メインサイト',
    url: 'https://main.example.com',
    status: 'ACTIVE',
    description: 'メインのECサイト',
    adminEmail: 'admin@main.example.com',
    timezone: 'Asia/Tokyo',
    currency: 'JPY',
    language: 'ja',
    theme: 'default',
    createdAt: '2024-01-01',
    updatedAt: '2024-03-01',
    shops: [
      { id: 1, name: '東京店', code: 'TOKYO', isActive: true },
      { id: 2, name: '大阪店', code: 'OSAKA', isActive: true },
      { id: 3, name: '名古屋店', code: 'NAGOYA', isActive: false },
    ],
    settings: [
      {
        id: 1,
        key: 'max_cart_items',
        value: '10',
        description: 'カートの最大商品数',
      },
      {
        id: 2,
        key: 'session_timeout',
        value: '3600',
        description: 'セッションタイムアウト（秒）',
      },
      {
        id: 3,
        key: 'enable_reviews',
        value: 'true',
        description: 'レビュー機能の有効化',
      },
    ],
  },
  {
    id: 2,
    code: 'MOBILE',
    name: 'モバイルサイト',
    url: 'https://m.example.com',
    status: 'ACTIVE',
    description: 'モバイル専用サイト',
    adminEmail: 'admin@mobile.example.com',
    timezone: 'Asia/Tokyo',
    currency: 'JPY',
    language: 'ja',
    theme: 'mobile',
    createdAt: '2024-01-15',
    updatedAt: '2024-02-28',
    shops: [{ id: 4, name: 'モバイル店', code: 'MOBILE', isActive: true }],
    settings: [
      {
        id: 4,
        key: 'max_cart_items',
        value: '5',
        description: 'カートの最大商品数',
      },
      {
        id: 5,
        key: 'enable_push_notifications',
        value: 'true',
        description: 'プッシュ通知の有効化',
      },
    ],
  },
  {
    id: 3,
    code: 'B2B',
    name: 'B2Bサイト',
    url: 'https://b2b.example.com',
    status: 'INACTIVE',
    description: '法人向けECサイト',
    adminEmail: 'admin@b2b.example.com',
    timezone: 'Asia/Tokyo',
    currency: 'JPY',
    language: 'ja',
    theme: 'business',
    createdAt: '2024-02-01',
    updatedAt: '2024-02-15',
    shops: [{ id: 5, name: 'B2B店舗', code: 'B2B', isActive: false }],
    settings: [
      {
        id: 6,
        key: 'min_order_amount',
        value: '10000',
        description: '最小注文金額',
      },
      {
        id: 7,
        key: 'bulk_discount_rate',
        value: '0.1',
        description: '大口割引率',
      },
    ],
  },
  {
    id: 4,
    code: 'TEST',
    name: 'テストサイト',
    url: 'https://test.example.com',
    status: 'MAINTENANCE',
    description: 'テスト・開発環境',
    adminEmail: 'dev@example.com',
    timezone: 'Asia/Tokyo',
    currency: 'JPY',
    language: 'ja',
    theme: 'debug',
    createdAt: '2024-01-10',
    updatedAt: '2024-03-05',
    shops: [{ id: 6, name: 'テスト店', code: 'TEST', isActive: true }],
    settings: [
      {
        id: 8,
        key: 'debug_mode',
        value: 'true',
        description: 'デバッグモードの有効化',
      },
      {
        id: 9,
        key: 'test_payments',
        value: 'true',
        description: 'テスト決済の有効化',
      },
    ],
  },
];

export default function SiteSettingsPage() {
  const [sites, setSites] = useState<Site[]>(dummySites);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const confirmDelete = useConfirmModal({
    type: 'delete',
    title: 'サイトを削除しますか？',
    onConfirm: async (siteId: number) => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setSites((prev) => prev.filter((site) => site.id !== siteId));
        toast.success('サイトを削除しました');
      } catch (error) {
        toast.error('サイトの削除に失敗しました');
      } finally {
        setIsLoading(false);
      }
    },
  });

  // 統計計算
  const totalSites = sites.length;
  const activeSites = sites.filter((s) => s.status === 'ACTIVE').length;
  const inactiveSites = sites.filter((s) => s.status === 'INACTIVE').length;
  const maintenanceSites = sites.filter(
    (s) => s.status === 'MAINTENANCE'
  ).length;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総サイト数',
      value: totalSites,
      description: '管理対象のサイト',
      icon: Globe,
    },
    {
      title: '稼働中',
      value: activeSites,
      description: '正常稼働中のサイト',
      icon: Globe,
    },
    {
      title: '停止中',
      value: inactiveSites,
      description: '停止中のサイト',
      icon: Globe,
    },
    {
      title: 'メンテナンス',
      value: maintenanceSites,
      description: 'メンテナンス中のサイト',
      icon: Settings,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<Site>[] = [
    {
      key: 'name',
      label: 'サイト名',
      className: 'font-medium',
    },
    {
      key: 'code',
      label: 'コード',
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'url',
      label: 'URL',
      render: (value) => (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {value}
        </a>
      ),
    },
    {
      key: 'status',
      label: 'ステータス',
      render: (value) => getSiteStatusBadge(value),
    },
    {
      key: 'shops',
      label: '店舗数',
      render: (shops) => `${shops.length}店舗`,
    },
    {
      key: 'language',
      label: '言語',
      render: (value) => getLanguageLabel(value),
    },
    {
      key: 'updatedAt',
      label: '最終更新',
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<Site>[] = [
    {
      label: '詳細を見る',
      icon: Eye,
      onClick: openDetailSheet,
    },
    {
      label: '編集',
      icon: Edit,
      onClick: openEditDialog,
    },
    {
      label: '削除',
      icon: Trash2,
      onClick: handleDelete,
      variant: 'destructive',
      show: (site) => site.status !== 'ACTIVE',
    },
  ];

  // フォームフィールドの設定
  const formFields: FormField[] = [
    {
      name: 'code',
      label: 'サイトコード',
      type: 'text',
      placeholder: '例：MAIN',
      required: true,
    },
    {
      name: 'name',
      label: 'サイト名',
      type: 'text',
      placeholder: '例：メインサイト',
      required: true,
    },
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      placeholder: 'https://example.com',
      required: true,
    },
    {
      name: 'status',
      label: 'ステータス',
      type: 'select',
      required: true,
      options: [
        { value: 'ACTIVE', label: '稼働中' },
        { value: 'INACTIVE', label: '停止中' },
        { value: 'MAINTENANCE', label: 'メンテナンス' },
      ],
    },
    {
      name: 'adminEmail',
      label: '管理者メールアドレス',
      type: 'email',
      placeholder: 'admin@example.com',
      required: true,
    },
    {
      name: 'timezone',
      label: 'タイムゾーン',
      type: 'select',
      required: true,
      options: [
        { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
        { value: 'UTC', label: 'UTC' },
        { value: 'America/New_York', label: 'America/New_York (EST)' },
        { value: 'Europe/London', label: 'Europe/London (GMT)' },
      ],
    },
    {
      name: 'currency',
      label: '通貨',
      type: 'select',
      required: true,
      options: [
        { value: 'JPY', label: '日本円 (JPY)' },
        { value: 'USD', label: '米ドル (USD)' },
        { value: 'EUR', label: 'ユーロ (EUR)' },
        { value: 'GBP', label: '英ポンド (GBP)' },
      ],
    },
    {
      name: 'language',
      label: '言語',
      type: 'select',
      required: true,
      options: [
        { value: 'ja', label: '日本語' },
        { value: 'en', label: 'English' },
        { value: 'zh', label: '中文' },
        { value: 'ko', label: '한국어' },
      ],
    },
    {
      name: 'theme',
      label: 'テーマ',
      type: 'select',
      required: true,
      options: [
        { value: 'default', label: 'デフォルト' },
        { value: 'mobile', label: 'モバイル' },
        { value: 'business', label: 'ビジネス' },
        { value: 'debug', label: 'デバッグ' },
      ],
    },
    {
      name: 'description',
      label: '説明',
      type: 'textarea',
      placeholder: 'サイトの説明を入力してください',
      required: false,
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<Site>[] = [
    {
      title: '基本情報',
      fields: [
        {
          label: 'サイトID',
          key: 'id',
          formatter: (value) => <span className="font-mono">#{value}</span>,
        },
        {
          label: 'サイトコード',
          key: 'code',
          formatter: (value) => <span className="font-mono">{value}</span>,
        },
        { label: 'サイト名', key: 'name' },
        {
          label: 'URL',
          key: 'url',
          formatter: (value) => (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {value}
            </a>
          ),
        },
        {
          label: 'ステータス',
          key: 'status',
          formatter: (value) => getSiteStatusBadge(value),
        },
      ],
    },
    {
      title: '管理情報',
      fields: [
        { label: '管理者メール', key: 'adminEmail' },
        { label: 'タイムゾーン', key: 'timezone' },
        { label: '通貨', key: 'currency' },
        {
          label: '言語',
          key: 'language',
          formatter: (value) => getLanguageLabel(value),
        },
        { label: 'テーマ', key: 'theme' },
      ],
    },
    {
      title: '日時情報',
      fields: [
        { label: '作成日', key: 'createdAt' },
        { label: '最終更新', key: 'updatedAt' },
      ],
    },
    {
      title: 'その他',
      fields: [
        {
          label: '説明',
          key: 'description',
          formatter: (value) => value || 'なし',
        },
      ],
    },
  ];

  // 関連データ設定
  const relatedData: RelatedData[] = [
    {
      title: '店舗一覧',
      description: 'このサイトに属する店舗',
      data: selectedSite?.shops || [],
      columns: [
        { key: 'name', label: '店舗名', className: 'font-medium' },
        {
          key: 'code',
          label: 'コード',
          render: (value) => <span className="font-mono text-sm">{value}</span>,
        },
        {
          key: 'isActive',
          label: 'ステータス',
          render: (value) => (
            <Badge variant={value ? 'default' : 'secondary'}>
              {value ? '稼働中' : '停止中'}
            </Badge>
          ),
        },
      ],
      emptyMessage: '店舗がありません',
    },
    {
      title: 'サイト設定',
      description: 'このサイトの個別設定',
      data: selectedSite?.settings || [],
      columns: [
        {
          key: 'key',
          label: '設定キー',
          render: (value) => <span className="font-mono text-sm">{value}</span>,
        },
        {
          key: 'value',
          label: '値',
          render: (value) => <span className="font-mono text-sm">{value}</span>,
        },
        { key: 'description', label: '説明' },
      ],
      emptyMessage: '個別設定がありません',
    },
  ];

  // サイト作成
  const handleCreate = async (data: SiteFormData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newSite: Site = {
        id: Math.max(...sites.map((s) => s.id)) + 1,
        code: data.code,
        name: data.name,
        url: data.url,
        status: data.status,
        description: data.description,
        adminEmail: data.adminEmail,
        timezone: data.timezone,
        currency: data.currency,
        language: data.language,
        theme: data.theme,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shops: [],
        settings: [],
      };

      setSites((prev) => [...prev, newSite]);
      setIsCreateDialogOpen(false);
      toast.success('サイトを作成しました');
    } catch (error) {
      toast.error('サイトの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // サイト編集
  const handleEdit = async (data: SiteFormData) => {
    if (!editingSite) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSites((prev) =>
        prev.map((site) =>
          site.id === editingSite.id
            ? {
                ...site,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : site
        )
      );

      setIsEditDialogOpen(false);
      setEditingSite(null);
      toast.success('サイト情報を更新しました');
    } catch (error) {
      toast.error('サイト情報の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  function openEditDialog(site: Site) {
    setEditingSite(site);
    setIsEditDialogOpen(true);
  }

  function openDetailSheet(site: Site) {
    setSelectedSite(site);
    setIsDetailSheetOpen(true);
  }

  function handleDelete(site: Site) {
    const description = `「${site.name}」を削除しますか？`;
    const details = '削除すると、関連する店舗や設定も削除されます。';
    confirmDelete.show(description, details, site.id);
  }

  // サイトステータスのバッジ
  function getSiteStatusBadge(status: SiteStatus) {
    const statusMap = {
      ACTIVE: { label: '稼働中', variant: 'default' as const },
      INACTIVE: { label: '停止中', variant: 'secondary' as const },
      MAINTENANCE: { label: 'メンテナンス', variant: 'destructive' as const },
    };

    const config = statusMap[status] || {
      label: status,
      variant: 'secondary' as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  // 言語ラベル取得
  function getLanguageLabel(language: string): string {
    const languageMap = {
      ja: '日本語',
      en: 'English',
      zh: '中文',
      ko: '한국어',
    };
    return languageMap[language as keyof typeof languageMap] || language;
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader title="サイト管理" description="マルチサイトの設定と管理">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </PageHeader>

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メインテーブル */}
      <EntityTable
        title="サイト一覧"
        description="管理対象のサイト一覧"
        data={sites}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="サイト名、URL、コードで検索..."
        onRowClick={openDetailSheet}
      />

      {/* 新規作成ダイアログ */}
      <EntityFormDialog
        title="新しいサイトを作成"
        description="新しいサイトを登録します。"
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        fields={formFields}
        schema={siteSchema}
        defaultValues={{
          code: '',
          name: '',
          url: '',
          status: 'INACTIVE',
          description: '',
          adminEmail: '',
          timezone: 'Asia/Tokyo',
          currency: 'JPY',
          language: 'ja',
          theme: 'default',
        }}
        onSubmit={handleCreate}
        isLoading={isLoading}
        submitLabel="作成"
      />

      {/* 編集ダイアログ */}
      <EntityFormDialog
        title="サイト情報を編集"
        description="サイトの設定を変更します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={formFields}
        schema={siteSchema}
        defaultValues={
          editingSite
            ? {
                code: editingSite.code,
                name: editingSite.name,
                url: editingSite.url,
                status: editingSite.status,
                description: editingSite.description || '',
                adminEmail: editingSite.adminEmail,
                timezone: editingSite.timezone,
                currency: editingSite.currency,
                language: editingSite.language,
                theme: editingSite.theme,
              }
            : {}
        }
        onSubmit={handleEdit}
        isLoading={isLoading}
        submitLabel="更新"
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="サイト詳細"
        description="サイトの詳細情報と関連データを表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedSite}
        sections={detailSections}
        relatedData={relatedData}
        actions={[
          {
            label: '編集',
            icon: Edit,
            variant: 'outline',
            onClick: (site) => {
              setIsDetailSheetOpen(false);
              openEditDialog(site);
            },
          },
        ]}
        isLoading={isLoading}
      />

      {/* 削除確認ダイアログ */}
      {confirmDelete.modal}
    </div>
  );
}
