import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { Badge } from '@repo/ui/components/badge';
import { Input } from '@repo/ui/components/input';
import { Package, Plus, Search } from 'lucide-react';

// 仮の商品データ（実際のAPIから取得予定）
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
  },
  {
    id: 2,
    code: 'PROD002',
    name: 'ワイヤレスイヤホン',
    category: '電子機器',
    supplier: 'テクノロジー株式会社',
    retailPrice: 19800,
    purchasePrice: 12000,
    stock: 5,
  },
  {
    id: 3,
    code: 'PROD003',
    name: 'オーガニックコーヒー',
    category: '食品',
    supplier: 'フード産業',
    retailPrice: 1200,
    purchasePrice: 800,
    stock: 50,
  },
  {
    id: 4,
    code: 'PROD004',
    name: 'プレミアムTシャツ',
    category: '衣類',
    supplier: 'ファッション商事',
    retailPrice: 4800,
    purchasePrice: 2500,
    stock: 15,
  },
];

export default function ProductsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">商品管理</h1>
          <p className="text-muted-foreground">
            商品の在庫状況と基本情報を管理できます
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          商品を追加
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="商品を検索..." className="pl-8" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <Badge 
                  variant={product.stock < 10 ? "destructive" : "default"}
                  className="ml-2"
                >
                  {product.stock < 10 ? "在庫少" : "在庫あり"}
                </Badge>
              </div>
              <CardDescription>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {product.code}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">カテゴリ</span>
                  <span className="text-sm">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">サプライヤー</span>
                  <span className="text-sm">{product.supplier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">販売価格</span>
                  <span className="text-sm font-medium">¥{product.retailPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">仕入価格</span>
                  <span className="text-sm">¥{product.purchasePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">在庫数</span>
                  <span className={`text-sm font-medium ${product.stock < 10 ? 'text-red-600' : ''}`}>
                    {product.stock}個
                  </span>
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    詳細を表示
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">商品統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">総商品数</span>
                <span className="text-sm font-medium">{products.length}点</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">在庫アラート</span>
                <span className="text-sm font-medium text-red-600">
                  {products.filter(p => p.stock < 10).length}点
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">カテゴリ別</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">電子機器</span>
                <span className="text-sm font-medium">2点</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">食品</span>
                <span className="text-sm font-medium">1点</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">衣類</span>
                <span className="text-sm font-medium">1点</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">最近の更新</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium">スマートフォン</span>
                <p className="text-muted-foreground">在庫数が更新されました</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}