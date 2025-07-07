'use client';

import { useState } from 'react';

import type {
  BaseEntity,
  DetailSection,
  FormField,
  StatisticCard,
  TableAction,
  TableColumn,
} from '@/types/management';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import { CreditCard, Edit, Eye, Plus, Settings, Trash2 } from 'lucide-react';
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

// 支払い方法の型定義
interface PaymentMethod extends BaseEntity {
  name: string;
  code: string;
  provider: string;
  isActive: boolean;
  transactionFee: number;
  minimumAmount?: number;
  maximumAmount?: number;
  processingTime: string;
  description?: string;
  apiKey?: string;
  secretKey?: string;
  webhookUrl?: string;
  testMode: boolean;
}

// バリデーションスキーマ
const paymentMethodSchema = z.object({
  name: z
    .string()
    .min(1, '支払い方法名は必須です')
    .max(50, '支払い方法名は50文字以内で入力してください'),
  code: z
    .string()
    .min(1, 'コードは必須です')
    .max(20, 'コードは20文字以内で入力してください')
    .regex(
      /^[A-Z0-9_]+$/,
      'コードは英大文字、数字、アンダースコアで入力してください'
    ),
  provider: z.string().min(1, 'プロバイダーは必須です'),
  isActive: z.boolean(),
  transactionFee: z
    .string()
    .min(1, '手数料率は必須です')
    .transform((val) => parseFloat(val))
    .refine(
      (val) => val >= 0 && val <= 100,
      '手数料率は0-100の範囲で入力してください'
    ),
  minimumAmount: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  maximumAmount: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined)),
  processingTime: z.string().min(1, '処理時間は必須です'),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  apiKey: z
    .string()
    .max(200, 'APIキーは200文字以内で入力してください')
    .optional(),
  secretKey: z
    .string()
    .max(200, 'シークレットキーは200文字以内で入力してください')
    .optional(),
  webhookUrl: z
    .string()
    .url('有効なURLを入力してください')
    .optional()
    .or(z.literal('')),
  testMode: z.boolean(),
});

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

// ダミーデータ
const dummyPaymentMethods: PaymentMethod[] = [
  {
    id: 1,
    name: 'クレジットカード',
    code: 'CREDIT_CARD',
    provider: 'Stripe',
    isActive: true,
    transactionFee: 3.6,
    minimumAmount: 100,
    maximumAmount: 1000000,
    processingTime: '即座',
    description: 'Visa、Mastercard、JCB、American Express対応',
    apiKey: 'pk_test_***',
    secretKey: 'sk_test_***',
    webhookUrl: 'https://example.com/webhooks/stripe',
    testMode: true,
  },
  {
    id: 2,
    name: '銀行振込',
    code: 'BANK_TRANSFER',
    provider: 'GMOあおぞらネット銀行',
    isActive: true,
    transactionFee: 0,
    minimumAmount: 1000,
    processingTime: '1-3営業日',
    description: '銀行振込による支払い',
    testMode: false,
  },
  {
    id: 3,
    name: '代金引換',
    code: 'COD',
    provider: 'ヤマト運輸',
    isActive: true,
    transactionFee: 330,
    minimumAmount: 300,
    maximumAmount: 300000,
    processingTime: '配送時',
    description: '商品受け取り時に代金をお支払い',
    testMode: false,
  },
  {
    id: 4,
    name: 'コンビニ支払い',
    code: 'CONVENIENCE_STORE',
    provider: 'PayPay',
    isActive: false,
    transactionFee: 200,
    minimumAmount: 300,
    maximumAmount: 300000,
    processingTime: '即座',
    description: '全国のコンビニエンスストアで支払い可能',
    apiKey: 'test_***',
    testMode: true,
  },
  {
    id: 5,
    name: 'PayPal',
    code: 'PAYPAL',
    provider: 'PayPal',
    isActive: true,
    transactionFee: 3.9,
    processingTime: '即座',
    description: 'PayPalアカウントでの支払い',
    apiKey: 'client_id_***',
    secretKey: 'client_secret_***',
    testMode: true,
  },
];

export default function PaymentSettingsPage() {
  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>(dummyPaymentMethods);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
    null
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const confirmDelete = useConfirmModal({
    type: 'delete',
    title: '支払い方法を削除しますか？',
    onConfirm: async (methodId: number) => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPaymentMethods((prev) =>
          prev.filter((method) => method.id !== methodId)
        );
        toast.success('支払い方法を削除しました');
      } catch (error) {
        toast.error('支払い方法の削除に失敗しました');
      } finally {
        setIsLoading(false);
      }
    },
  });

  // 統計計算
  const totalMethods = paymentMethods.length;
  const activeMethods = paymentMethods.filter((m) => m.isActive).length;
  const inactiveMethods = paymentMethods.filter((m) => !m.isActive).length;
  const testModeMethods = paymentMethods.filter((m) => m.testMode).length;

  // 統計データの設定
  const statistics: StatisticCard[] = [
    {
      title: '総支払い方法',
      value: totalMethods,
      description: '登録されている支払い方法',
      icon: CreditCard,
    },
    {
      title: '有効',
      value: activeMethods,
      description: '利用可能な支払い方法',
      icon: CreditCard,
    },
    {
      title: '無効',
      value: inactiveMethods,
      description: '停止中の支払い方法',
      icon: CreditCard,
    },
    {
      title: 'テストモード',
      value: testModeMethods,
      description: 'テスト環境の支払い方法',
      icon: Settings,
    },
  ];

  // テーブルカラムの設定
  const columns: TableColumn<PaymentMethod>[] = [
    {
      key: 'name',
      label: '支払い方法',
      className: 'font-medium',
    },
    {
      key: 'code',
      label: 'コード',
      render: (value) => <span className="font-mono text-sm">{value}</span>,
    },
    {
      key: 'provider',
      label: 'プロバイダー',
    },
    {
      key: 'transactionFee',
      label: '手数料',
      render: (value, row) => {
        if (value === 0) return '無料';
        return value < 10 ? `${value}%` : `¥${value.toLocaleString()}`;
      },
    },
    {
      key: 'processingTime',
      label: '処理時間',
    },
    {
      key: 'isActive',
      label: 'ステータス',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? '有効' : '無効'}
        </Badge>
      ),
    },
    {
      key: 'testMode',
      label: 'モード',
      render: (value) => (
        <Badge variant={value ? 'outline' : 'default'}>
          {value ? 'テスト' : '本番'}
        </Badge>
      ),
    },
  ];

  // テーブルアクションの設定
  const actions: TableAction<PaymentMethod>[] = [
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
    },
  ];

  // フォームフィールドの設定
  const formFields: FormField[] = [
    {
      name: 'name',
      label: '支払い方法名',
      type: 'text',
      placeholder: '例：クレジットカード',
      required: true,
    },
    {
      name: 'code',
      label: 'コード',
      type: 'text',
      placeholder: '例：CREDIT_CARD',
      required: true,
    },
    {
      name: 'provider',
      label: 'プロバイダー',
      type: 'select',
      required: true,
      options: [
        { value: 'Stripe', label: 'Stripe' },
        { value: 'PayPal', label: 'PayPal' },
        { value: 'GMOあおぞらネット銀行', label: 'GMOあおぞらネット銀行' },
        { value: 'ヤマト運輸', label: 'ヤマト運輸' },
        { value: 'PayPay', label: 'PayPay' },
        { value: 'Square', label: 'Square' },
      ],
    },
    {
      name: 'transactionFee',
      label: '手数料率 (% または 固定額)',
      type: 'number',
      placeholder: '例：3.6',
      required: true,
    },
    {
      name: 'minimumAmount',
      label: '最小金額 (円)',
      type: 'number',
      placeholder: '例：100',
      required: false,
    },
    {
      name: 'maximumAmount',
      label: '最大金額 (円)',
      type: 'number',
      placeholder: '例：1000000',
      required: false,
    },
    {
      name: 'processingTime',
      label: '処理時間',
      type: 'select',
      required: true,
      options: [
        { value: '即座', label: '即座' },
        { value: '1営業日', label: '1営業日' },
        { value: '1-3営業日', label: '1-3営業日' },
        { value: '配送時', label: '配送時' },
      ],
    },
    {
      name: 'description',
      label: '説明',
      type: 'textarea',
      placeholder: '支払い方法の詳細説明',
      required: false,
    },
    {
      name: 'apiKey',
      label: 'APIキー',
      type: 'text',
      placeholder: 'APIキーを入力',
      required: false,
    },
    {
      name: 'secretKey',
      label: 'シークレットキー',
      type: 'password',
      placeholder: 'シークレットキーを入力',
      required: false,
    },
    {
      name: 'webhookUrl',
      label: 'Webhook URL',
      type: 'text',
      placeholder: 'https://example.com/webhooks',
      required: false,
    },
  ];

  // 詳細シートのセクション設定
  const detailSections: DetailSection<PaymentMethod>[] = [
    {
      title: '基本情報',
      fields: [
        {
          label: 'ID',
          key: 'id',
          formatter: (value) => <span className="font-mono">#{value}</span>,
        },
        { label: '支払い方法名', key: 'name' },
        {
          label: 'コード',
          key: 'code',
          formatter: (value) => <span className="font-mono">{value}</span>,
        },
        { label: 'プロバイダー', key: 'provider' },
      ],
    },
    {
      title: '料金設定',
      fields: [
        {
          label: '手数料',
          key: 'transactionFee',
          formatter: (value) =>
            value === 0
              ? '無料'
              : value < 10
                ? `${value}%`
                : `¥${value.toLocaleString()}`,
        },
        {
          label: '最小金額',
          key: 'minimumAmount',
          formatter: (value) =>
            value ? `¥${value.toLocaleString()}` : '制限なし',
        },
        {
          label: '最大金額',
          key: 'maximumAmount',
          formatter: (value) =>
            value ? `¥${value.toLocaleString()}` : '制限なし',
        },
        { label: '処理時間', key: 'processingTime' },
      ],
    },
    {
      title: 'ステータス',
      fields: [
        {
          label: '有効状態',
          key: 'isActive',
          formatter: (value) => (
            <Badge variant={value ? 'default' : 'secondary'}>
              {value ? '有効' : '無効'}
            </Badge>
          ),
        },
        {
          label: 'モード',
          key: 'testMode',
          formatter: (value) => (
            <Badge variant={value ? 'outline' : 'default'}>
              {value ? 'テストモード' : '本番モード'}
            </Badge>
          ),
        },
      ],
    },
    {
      title: 'API設定',
      fields: [
        {
          label: 'APIキー',
          key: 'apiKey',
          formatter: (value) => (value ? '設定済み' : '未設定'),
        },
        {
          label: 'シークレットキー',
          key: 'secretKey',
          formatter: (value) => (value ? '設定済み' : '未設定'),
        },
        {
          label: 'Webhook URL',
          key: 'webhookUrl',
          formatter: (value) => value || '未設定',
        },
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

  // 支払い方法作成
  const handleCreate = async (data: PaymentMethodFormData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newMethod: PaymentMethod = {
        id: Math.max(...paymentMethods.map((m) => m.id)) + 1,
        name: data.name,
        code: data.code,
        provider: data.provider,
        isActive: data.isActive,
        transactionFee: data.transactionFee,
        minimumAmount: data.minimumAmount,
        maximumAmount: data.maximumAmount,
        processingTime: data.processingTime,
        description: data.description,
        apiKey: data.apiKey,
        secretKey: data.secretKey,
        webhookUrl: data.webhookUrl,
        testMode: data.testMode,
      };

      setPaymentMethods((prev) => [...prev, newMethod]);
      setIsCreateDialogOpen(false);
      toast.success('支払い方法を作成しました');
    } catch (error) {
      toast.error('支払い方法の作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 支払い方法編集
  const handleEdit = async (data: PaymentMethodFormData) => {
    if (!editingMethod) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setPaymentMethods((prev) =>
        prev.map((method) =>
          method.id === editingMethod.id ? { ...method, ...data } : method
        )
      );

      setIsEditDialogOpen(false);
      setEditingMethod(null);
      toast.success('支払い方法を更新しました');
    } catch (error) {
      toast.error('支払い方法の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  function openEditDialog(method: PaymentMethod) {
    setEditingMethod(method);
    setIsEditDialogOpen(true);
  }

  function openDetailSheet(method: PaymentMethod) {
    setSelectedMethod(method);
    setIsDetailSheetOpen(true);
  }

  function handleDelete(method: PaymentMethod) {
    const description = `「${method.name}」を削除しますか？`;
    const details = '削除すると、この支払い方法は利用できなくなります。';
    confirmDelete.show(description, details, method.id);
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader title="支払い設定" description="支払い方法の管理と設定">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          新規作成
        </Button>
      </PageHeader>

      {/* 統計カード */}
      <StatisticsGrid statistics={statistics} />

      {/* メインテーブル */}
      <EntityTable
        title="支払い方法一覧"
        description="設定されている支払い方法を管理します"
        data={paymentMethods}
        columns={columns}
        actions={actions}
        isLoading={isLoading}
        searchPlaceholder="支払い方法名、プロバイダーで検索..."
        onRowClick={openDetailSheet}
      />

      {/* 新規作成ダイアログ */}
      <EntityFormDialog
        title="新しい支払い方法を作成"
        description="新しい支払い方法を登録します。"
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        fields={formFields}
        schema={paymentMethodSchema}
        defaultValues={{
          name: '',
          code: '',
          provider: '',
          isActive: true,
          transactionFee: '',
          minimumAmount: '',
          maximumAmount: '',
          processingTime: '',
          description: '',
          apiKey: '',
          secretKey: '',
          webhookUrl: '',
          testMode: true,
        }}
        onSubmit={handleCreate}
        isLoading={isLoading}
        submitLabel="作成"
      />

      {/* 編集ダイアログ */}
      <EntityFormDialog
        title="支払い方法を編集"
        description="支払い方法の設定を変更します。"
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        fields={formFields}
        schema={paymentMethodSchema}
        defaultValues={
          editingMethod
            ? {
                name: editingMethod.name,
                code: editingMethod.code,
                provider: editingMethod.provider,
                isActive: editingMethod.isActive,
                transactionFee: editingMethod.transactionFee.toString(),
                minimumAmount: editingMethod.minimumAmount?.toString() || '',
                maximumAmount: editingMethod.maximumAmount?.toString() || '',
                processingTime: editingMethod.processingTime,
                description: editingMethod.description || '',
                apiKey: editingMethod.apiKey || '',
                secretKey: editingMethod.secretKey || '',
                webhookUrl: editingMethod.webhookUrl || '',
                testMode: editingMethod.testMode,
              }
            : {}
        }
        onSubmit={handleEdit}
        isLoading={isLoading}
        submitLabel="更新"
      />

      {/* 詳細シート */}
      <EntityDetailSheet
        title="支払い方法詳細"
        description="支払い方法の詳細設定を表示します"
        isOpen={isDetailSheetOpen}
        onOpenChange={setIsDetailSheetOpen}
        data={selectedMethod}
        sections={detailSections}
        actions={[
          {
            label: '編集',
            icon: Edit,
            variant: 'outline',
            onClick: (method) => {
              setIsDetailSheetOpen(false);
              openEditDialog(method);
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
