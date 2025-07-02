import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui/components/card';
import { Package, ShoppingBag, Truck, Users } from 'lucide-react';

export default function Page() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="aspect-video rounded-xl bg-muted/50 p-4">
          <h2 className="text-2xl font-bold">ECサイト管理ダッシュボード</h2>
          <p className="text-muted-foreground mt-2">通販システムの管理画面へようこそ</p>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h3 className="font-semibold">本日の注文</h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">12件</div>
            <p className="text-xs text-muted-foreground">前日比 +2件</p>
          </div>
        </div>
        <div className="aspect-video rounded-xl bg-muted/50 p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <h3 className="font-semibold">商品数</h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold">156点</div>
            <p className="text-xs text-muted-foreground">在庫あり商品</p>
          </div>
        </div>
      </div>
      <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
        <div className="grid gap-4 p-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                最近の注文
              </CardTitle>
              <CardDescription>最新の注文状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">ORD-2024-001</span>
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">確認済み</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ORD-2024-002</span>
                  <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800">保留中</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                配送状況
              </CardTitle>
              <CardDescription>現在の配送状況</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">TRACK-001</span>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">配送中</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">準備中の配送</span>
                  <span className="text-sm text-muted-foreground">3件</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                顧客情報
              </CardTitle>
              <CardDescription>登録顧客数</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">245名</div>
                <p className="text-xs text-muted-foreground">今月新規: 12名</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                在庫アラート
              </CardTitle>
              <CardDescription>在庫が少ない商品</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">スマートフォン</span>
                  <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-800">残り2個</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">ワイヤレスイヤホン</span>
                  <span className="rounded-full bg-orange-100 px-2 py-1 text-xs text-orange-800">残り5個</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
