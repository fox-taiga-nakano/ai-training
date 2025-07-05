'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/form';
import { Input } from '@repo/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select';
import { Switch } from '@repo/ui/components/switch';
import { Textarea } from '@repo/ui/components/textarea';
import { Globe, Info, Mail, MapPin, Phone, Save, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { PageHeader } from '@/components/management';
import {
  type GeneralSettings,
  type UpdateGeneralSettingsDto,
  useGeneralSettings,
  useUpdateGeneralSettings,
} from '@/hooks/api/use-settings';

// バリデーションスキーマ
const generalSettingsSchema = z.object({
  // 基本情報
  siteName: z
    .string()
    .min(1, 'サイト名は必須です')
    .max(100, 'サイト名は100文字以内で入力してください'),
  siteDescription: z
    .string()
    .max(500, 'サイト説明は500文字以内で入力してください')
    .optional(),
  siteUrl: z
    .string()
    .min(1, 'サイトURLは必須です')
    .url('有効なURLを入力してください'),

  // 会社情報
  companyName: z
    .string()
    .min(1, '会社名は必須です')
    .max(100, '会社名は100文字以内で入力してください'),
  companyAddress: z
    .string()
    .min(1, '会社住所は必須です')
    .max(200, '会社住所は200文字以内で入力してください'),
  companyPhone: z
    .string()
    .min(1, '電話番号は必須です')
    .regex(/^[\d-]+$/, '電話番号は数字とハイフンで入力してください'),
  companyEmail: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),

  // システム設定
  timezone: z.string().min(1, 'タイムゾーンは必須です'),
  currency: z.string().min(1, '通貨は必須です'),
  language: z.string().min(1, '言語は必須です'),
  dateFormat: z.string().min(1, '日付形式は必須です'),

  // 機能設定
  enableUserRegistration: z.boolean(),
  enableNotifications: z.boolean(),
  maintenanceMode: z.boolean(),
  enableAnalytics: z.boolean(),

  // 通知設定
  adminEmail: z
    .string()
    .min(1, '管理者メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  enableOrderNotification: z.boolean(),
  enableInventoryAlert: z.boolean(),
});

type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;

export default function GeneralSettingsPage() {
  // APIフックの使用
  const {
    settings,
    isLoading: isSettingsLoading,
    revalidate: revalidateSettings,
  } = useGeneralSettings();
  const { updateSettings } = useUpdateGeneralSettings();

  const [isOperationLoading, setIsOperationLoading] = useState(false);
  const isLoading = isSettingsLoading || isOperationLoading;

  const form = useForm<GeneralSettingsFormData>({
    resolver: zodResolver(generalSettingsSchema),
    values: settings
      ? {
          siteName: settings.siteName,
          siteDescription: settings.siteDescription || '',
          siteUrl: settings.siteUrl || '',
          companyName: settings.companyName,
          companyAddress: settings.companyAddress || '',
          companyPhone: settings.companyPhone || '',
          companyEmail: settings.companyEmail || '',
          timezone: settings.timezone,
          currency: settings.currency,
          language: settings.language,
          dateFormat: settings.dateFormat,
          enableUserRegistration: settings.enableUserRegistration,
          enableNotifications: settings.enableNotifications,
          maintenanceMode: settings.maintenanceMode,
          enableAnalytics: settings.enableAnalytics,
          adminEmail: settings.adminEmail,
          enableOrderNotification: settings.enableOrderNotification,
          enableInventoryAlert: settings.enableInventoryAlert,
        }
      : undefined,
  });

  // 設定保存処理
  const handleSubmit = async (data: GeneralSettingsFormData) => {
    setIsOperationLoading(true);
    try {
      const updateData: UpdateGeneralSettingsDto = {
        siteName: data.siteName,
        siteDescription: data.siteDescription,
        siteUrl: data.siteUrl,
        companyName: data.companyName,
        companyAddress: data.companyAddress,
        companyPhone: data.companyPhone,
        companyEmail: data.companyEmail,
        timezone: data.timezone,
        currency: data.currency,
        language: data.language,
        dateFormat: data.dateFormat,
        enableUserRegistration: data.enableUserRegistration,
        enableNotifications: data.enableNotifications,
        maintenanceMode: data.maintenanceMode,
        enableAnalytics: data.enableAnalytics,
        adminEmail: data.adminEmail,
        enableOrderNotification: data.enableOrderNotification,
        enableInventoryAlert: data.enableInventoryAlert,
      };

      await updateSettings(updateData);
      await revalidateSettings();
    } catch (error) {
      // エラーはAPIフック内でハンドリング済み
    } finally {
      setIsOperationLoading(false);
    }
  };

  // 設定リセット
  const handleReset = () => {
    if (settings) {
      form.reset({
        siteName: settings.siteName,
        siteDescription: settings.siteDescription || '',
        siteUrl: settings.siteUrl || '',
        companyName: settings.companyName,
        companyAddress: settings.companyAddress || '',
        companyPhone: settings.companyPhone || '',
        companyEmail: settings.companyEmail || '',
        timezone: settings.timezone,
        currency: settings.currency,
        language: settings.language,
        dateFormat: settings.dateFormat,
        enableUserRegistration: settings.enableUserRegistration,
        enableNotifications: settings.enableNotifications,
        maintenanceMode: settings.maintenanceMode,
        enableAnalytics: settings.enableAnalytics,
        adminEmail: settings.adminEmail,
        enableOrderNotification: settings.enableOrderNotification,
        enableInventoryAlert: settings.enableInventoryAlert,
      });
      toast.info('設定をリセットしました');
    }
  };

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <PageHeader
        title="一般設定"
        description="システムの基本設定を管理します"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  基本情報
                </CardTitle>
                <CardDescription>
                  サイトの基本的な情報を設定します
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>サイト名</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例：ECサイト管理システム"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>サイト説明</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="サイトの説明を入力してください"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>サイトURL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 会社情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  会社情報
                </CardTitle>
                <CardDescription>運営会社の情報を設定します</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>会社名</FormLabel>
                      <FormControl>
                        <Input placeholder="例：株式会社サンプル" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>会社住所</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="例：東京都渋谷区xxx-xxx"
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>電話番号</FormLabel>
                      <FormControl>
                        <Input placeholder="例：03-1234-5678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <Input placeholder="例：info@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* システム設定 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  システム設定
                </CardTitle>
                <CardDescription>システムの動作に関する設定</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>タイムゾーン</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="タイムゾーンを選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Asia/Tokyo">
                            Asia/Tokyo (JST)
                          </SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="America/New_York">
                            America/New_York (EST)
                          </SelectItem>
                          <SelectItem value="Europe/London">
                            Europe/London (GMT)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>通貨</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="通貨を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="JPY">日本円 (JPY)</SelectItem>
                          <SelectItem value="USD">米ドル (USD)</SelectItem>
                          <SelectItem value="EUR">ユーロ (EUR)</SelectItem>
                          <SelectItem value="GBP">英ポンド (GBP)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>言語</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="言語を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ja">日本語</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="zh">中文</SelectItem>
                          <SelectItem value="ko">한국어</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateFormat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>日付形式</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="日付形式を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY年MM月DD日">
                            YYYY年MM月DD日
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 機能設定・通知設定 */}
            <div className="space-y-6">
              {/* 機能設定 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    機能設定
                  </CardTitle>
                  <CardDescription>システム機能のON/OFF</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="enableUserRegistration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>ユーザー登録</FormLabel>
                          <FormDescription>
                            新規ユーザーの登録を許可します
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>通知機能</FormLabel>
                          <FormDescription>
                            システム通知を有効にします
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>メンテナンスモード</FormLabel>
                          <FormDescription>
                            サイトをメンテナンスモードにします
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableAnalytics"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>アナリティクス</FormLabel>
                          <FormDescription>
                            アクセス解析を有効にします
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* 通知設定 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    通知設定
                  </CardTitle>
                  <CardDescription>メール通知に関する設定</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>管理者メールアドレス</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="例：admin@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          システム通知の送信先メールアドレス
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableOrderNotification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>注文通知</FormLabel>
                          <FormDescription>
                            新規注文時にメール通知を送信します
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="enableInventoryAlert"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>在庫アラート</FormLabel>
                          <FormDescription>
                            在庫不足時にメール通知を送信します
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              リセット
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  設定を保存
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
