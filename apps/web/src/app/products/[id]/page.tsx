import Link from 'next/link';

import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { ArrowLeft, Edit, Package, Trash2 } from 'lucide-react';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

// 仮の商品データ（実際のAPIから取得予定）
const getProduct = (id: string) => {
  const products = [
    {
      id: 1,
      code: 'PROD001',
      name: 'スマートフォン',
      category: '電子機器',
      supplier: 'テクノロジー株式会社',
      retailPrice: 89800,
      purchasePrice: 65000,
      stock: 2,
      description:
        '最新のスマートフォン。高性能なプロセッサと長時間バッテリーを搭載。',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-15',
    },
  ];

  return products.find((p) => p.id === parseInt(id));
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const product = getProduct(id);

  if (!product) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
          </Link>
        </div>
        <div className="py-8 text-center">
          <h2 className="text-2xl font-bold">商品が見つかりません</h2>
          <p className="text-muted-foreground mt-2">
            指定された商品は存在しません。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/products">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              商品一覧に戻る
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            編集
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            削除
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{product.name}</CardTitle>
              <Badge variant={product.stock < 10 ? 'destructive' : 'default'}>
                {product.stock < 10 ? '在庫少' : '在庫あり'}
              </Badge>
            </div>
            <CardDescription>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                商品コード: {product.code}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">商品説明</h3>
                <p className="text-muted-foreground text-sm">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-muted-foreground text-sm font-medium">
                    カテゴリ
                  </h4>
                  <p className="font-medium">{product.category}</p>
                </div>
                <div>
                  <h4 className="text-muted-foreground text-sm font-medium">
                    サプライヤー
                  </h4>
                  <p className="font-medium">{product.supplier}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>価格・在庫情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <h4 className="text-muted-foreground text-sm font-medium">
                    販売価格
                  </h4>
                  <p className="text-2xl font-bold text-green-600">
                    ¥{product.retailPrice.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <h4 className="text-muted-foreground text-sm font-medium">
                    仕入価格
                  </h4>
                  <p className="text-2xl font-bold">
                    ¥{product.purchasePrice.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="text-muted-foreground text-sm font-medium">
                  現在在庫
                </h4>
                <p
                  className={`text-3xl font-bold ${product.stock < 10 ? 'text-red-600' : 'text-blue-600'}`}
                >
                  {product.stock}個
                </p>
                {product.stock < 10 && (
                  <p className="mt-1 text-sm text-red-600">
                    在庫が少なくなっています
                  </p>
                )}
              </div>

              <div className="bg-muted rounded-lg p-4">
                <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                  利益率
                </h4>
                <p className="text-lg font-bold">
                  {(
                    ((product.retailPrice - product.purchasePrice) /
                      product.retailPrice) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-muted-foreground text-sm">
                  利益: ¥
                  {(
                    product.retailPrice - product.purchasePrice
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">在庫履歴</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  2024/01/15
                </span>
                <span className="text-sm">入荷 +10個</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  2024/01/14
                </span>
                <span className="text-sm">販売 -5個</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  2024/01/13
                </span>
                <span className="text-sm">販売 -3個</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">販売実績</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  今月の販売
                </span>
                <span className="text-sm font-medium">8個</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  先月の販売
                </span>
                <span className="text-sm font-medium">12個</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">
                  平均販売/月
                </span>
                <span className="text-sm font-medium">10個</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">システム情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground text-sm">作成日</span>
                <p className="text-sm font-medium">{product.createdAt}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-sm">最終更新</span>
                <p className="text-sm font-medium">{product.updatedAt}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
