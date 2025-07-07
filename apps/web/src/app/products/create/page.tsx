'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Form,
  FormControl,
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
import { Textarea } from '@repo/ui/components/textarea';
import { ArrowLeft, Package, Save } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

// バリデーションスキーマ
const productCreateSchema = z
  .object({
    code: z
      .string()
      .min(1, '商品コードは必須です')
      .max(20, '商品コードは20文字以内で入力してください')
      .regex(/^[A-Z0-9-]+$/, '商品コードは英数字とハイフンで入力してください'),
    name: z
      .string()
      .min(1, '商品名は必須です')
      .max(100, '商品名は100文字以内で入力してください'),
    categoryId: z.number().min(1, 'カテゴリは必須です'),
    supplierId: z.number().min(1, 'サプライヤーは必須です'),
    retailPrice: z.number().min(1, '販売価格は必須です'),
    purchasePrice: z.number().min(1, '仕入価格は必須です'),
    stock: z.number().min(0, '初期在庫は0以上の値を入力してください'),
    description: z
      .string()
      .max(1000, '商品説明は1000文字以内で入力してください')
      .optional(),
  })
  .refine((data) => data.purchasePrice < data.retailPrice, {
    message: '販売価格は仕入価格より高く設定してください',
    path: ['retailPrice'],
  });

type ProductCreateFormData = z.infer<typeof productCreateSchema>;

// カテゴリとサプライヤーの型定義
interface Category {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
  code: string;
}

// ダミーデータ
const dummyCategories: Category[] = [
  { id: 1, name: '電子機器' },
  { id: 2, name: '書籍' },
  { id: 3, name: '衣類' },
  { id: 4, name: '食品' },
  { id: 5, name: '家具' },
  { id: 6, name: 'スポーツ用品' },
];

const dummySuppliers: Supplier[] = [
  { id: 1, name: '株式会社フード・サプライ', code: 'SUP-001' },
  { id: 2, name: '東京商事株式会社', code: 'SUP-002' },
  { id: 3, name: 'グローバル・トレーディング', code: 'SUP-003' },
  { id: 4, name: '関西物産株式会社', code: 'SUP-004' },
  { id: 5, name: 'エコ・プロダクツ', code: 'SUP-005' },
];

export default function ProductCreatePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const form = useForm<ProductCreateFormData>({
    resolver: zodResolver(productCreateSchema),
    defaultValues: {
      code: '',
      name: '',
      categoryId: 0,
      supplierId: 0,
      retailPrice: 0,
      purchasePrice: 0,
      stock: 0,
      description: '',
    },
  });

  // カテゴリとサプライヤーのデータを取得
  useEffect(() => {
    const loadData = async () => {
      setIsDataLoading(true);
      try {
        // TODO: API call to fetch categories and suppliers
        await new Promise((resolve) => setTimeout(resolve, 500)); // ダミー遅延
        setCategories(dummyCategories);
        setSuppliers(dummySuppliers);
      } catch (error) {
        toast.error('データの取得に失敗しました');
      } finally {
        setIsDataLoading(false);
      }
    };

    loadData();
  }, []);

  // 商品作成処理
  const handleSubmit = async (data: ProductCreateFormData) => {
    setIsLoading(true);
    try {
      // TODO: API call to create product
      await new Promise((resolve) => setTimeout(resolve, 1500)); // ダミー遅延

      toast.success('商品を作成しました');
      router.push('/products');
    } catch (error) {
      toast.error('商品の作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 利益率の計算
  const calculateProfitMargin = () => {
    const retailPrice = form.watch('retailPrice') || 0;
    const purchasePrice = form.watch('purchasePrice') || 0;

    if (retailPrice > 0 && purchasePrice > 0) {
      return (((retailPrice - purchasePrice) / retailPrice) * 100).toFixed(1);
    }
    return '0.0';
  };

  // 利益額の計算
  const calculateProfit = () => {
    const retailPrice = form.watch('retailPrice') || 0;
    const purchasePrice = form.watch('purchasePrice') || 0;

    if (retailPrice > 0 && purchasePrice > 0) {
      return (retailPrice - purchasePrice).toLocaleString();
    }
    return '0';
  };

  if (isDataLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              商品一覧に戻る
            </Button>
          </Link>
        </div>
        <div className="py-8 text-center">
          <div className="text-lg">データを読み込み中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              商品一覧に戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">新しい商品を作成</h1>
            <p className="text-muted-foreground">
              商品情報を入力して新しい商品を登録します
            </p>
          </div>
        </div>
        <Package className="text-muted-foreground h-8 w-8" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 基本情報 */}
            <Card>
              <CardHeader>
                <CardTitle>基本情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>商品コード</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="例：PROD-001"
                          {...field}
                          className="uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>商品名</FormLabel>
                      <FormControl>
                        <Input placeholder="例：スマートフォン" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>カテゴリ</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="カテゴリを選択してください" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem
                              key={category.id}
                              value={category.id.toString()}
                            >
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>サプライヤー</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="サプライヤーを選択してください" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((supplier) => (
                            <SelectItem
                              key={supplier.id}
                              value={supplier.id.toString()}
                            >
                              <div className="flex items-center gap-2">
                                <span>{supplier.name}</span>
                                <span className="text-muted-foreground font-mono text-sm">
                                  ({supplier.code})
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>商品説明</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="商品の詳細な説明を入力してください"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* 価格・在庫情報 */}
            <Card>
              <CardHeader>
                <CardTitle>価格・在庫情報</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="retailPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>販売価格 (円)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="例：1000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchasePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>仕入価格 (円)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="例：700" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>初期在庫</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="例：50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 利益情報の表示 */}
                <div className="bg-muted/50 rounded-lg border p-4">
                  <h4 className="mb-3 font-medium">利益計算</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">利益率:</span>
                      <span className="font-medium">
                        {calculateProfitMargin()}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">利益額:</span>
                      <span className="font-medium">¥{calculateProfit()}</span>
                    </div>
                  </div>
                </div>

                {/* 在庫価値の表示 */}
                <div className="rounded-lg border bg-blue-50 p-4">
                  <h4 className="mb-3 font-medium text-blue-900">在庫価値</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">仕入価値:</span>
                      <span className="font-medium text-blue-900">
                        ¥
                        {(
                          (form.watch('purchasePrice') || 0) *
                          (form.watch('stock') || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">販売価値:</span>
                      <span className="font-medium text-blue-900">
                        ¥
                        {(
                          (form.watch('retailPrice') || 0) *
                          (form.watch('stock') || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/products">
              <Button type="button" variant="outline" disabled={isLoading}>
                キャンセル
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  作成中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  商品を作成
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
