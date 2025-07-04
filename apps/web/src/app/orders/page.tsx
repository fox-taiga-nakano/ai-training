import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
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
import { Eye, Search, ShoppingBag } from 'lucide-react';

// 仮の注文データ（実際のAPIから取得予定）
const orders = [
  {
    id: 1,
    orderNumber: 'ORD-2024-001',
    customerName: '田中太郎',
    customerEmail: 'user1@example.com',
    totalAmount: 91000,
    billingAmount: 91000,
    status: 'CONFIRMED',
    orderDate: '2024-01-15T10:30:00Z',
    paymentStatus: 'PAID',
    items: [
      { name: 'スマートフォン', quantity: 1, unitPrice: 89800 },
      { name: 'オーガニックコーヒー', quantity: 1, unitPrice: 1200 },
    ],
  },
  {
    id: 2,
    orderNumber: 'ORD-2024-002',
    customerName: '佐藤花子',
    customerEmail: 'user2@example.com',
    totalAmount: 21000,
    billingAmount: 21200,
    status: 'PENDING',
    orderDate: '2024-01-16T14:15:00Z',
    paymentStatus: 'UNPAID',
    items: [{ name: 'ワイヤレスイヤホン', quantity: 1, unitPrice: 19800 }],
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING':
      return (
        <Badge variant="outline" className="border-yellow-600 text-yellow-600">
          保留中
        </Badge>
      );
    case 'CONFIRMED':
      return (
        <Badge variant="outline" className="border-green-600 text-green-600">
          確認済み
        </Badge>
      );
    case 'SHIPPED':
      return (
        <Badge variant="outline" className="border-blue-600 text-blue-600">
          発送済み
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="outline" className="border-green-600 text-green-600">
          完了
        </Badge>
      );
    case 'CANCELED':
      return <Badge variant="destructive">キャンセル</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case 'UNPAID':
      return <Badge variant="destructive">未払い</Badge>;
    case 'PAID':
      return (
        <Badge variant="outline" className="border-green-600 text-green-600">
          支払済み
        </Badge>
      );
    case 'REFUNDED':
      return (
        <Badge variant="outline" className="border-orange-600 text-orange-600">
          返金済み
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function OrdersPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">注文管理</h1>
          <p className="text-muted-foreground">
            お客様からの注文を管理・処理できます
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
          <Input placeholder="注文番号で検索..." className="pl-8" />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="pending">保留中</SelectItem>
            <SelectItem value="confirmed">確認済み</SelectItem>
            <SelectItem value="shipped">発送済み</SelectItem>
            <SelectItem value="completed">完了</SelectItem>
            <SelectItem value="canceled">キャンセル</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="支払い状況" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="unpaid">未払い</SelectItem>
            <SelectItem value="paid">支払済み</SelectItem>
            <SelectItem value="refunded">返金済み</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {orders.map((order) => (
          <Card key={order.id} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      {order.orderNumber}
                    </div>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    注文日時:{' '}
                    {new Date(order.orderDate).toLocaleString('ja-JP')}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <h4 className="text-muted-foreground text-sm font-medium">
                    顧客情報
                  </h4>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-muted-foreground text-sm">
                    {order.customerEmail}
                  </p>
                </div>

                <div>
                  <h4 className="text-muted-foreground text-sm font-medium">
                    注文内容
                  </h4>
                  <div className="space-y-1">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm">
                        {item.name} × {item.quantity}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-muted-foreground text-sm font-medium">
                    金額
                  </h4>
                  <p className="font-medium">
                    合計: ¥{order.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    請求: ¥{order.billingAmount.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    詳細を表示
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">注文統計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">総注文数</span>
                <span className="text-sm font-medium">{orders.length}件</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">処理待ち</span>
                <span className="text-sm font-medium text-yellow-600">
                  {orders.filter((o) => o.status === 'PENDING').length}件
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">売上</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground text-sm">
                  今日の売上
                </span>
                <p className="text-lg font-bold">
                  ¥
                  {orders
                    .reduce((sum, order) => sum + order.billingAmount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">支払い状況</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">支払済み</span>
                <span className="text-sm font-medium text-green-600">
                  {orders.filter((o) => o.paymentStatus === 'PAID').length}件
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">未払い</span>
                <span className="text-sm font-medium text-red-600">
                  {orders.filter((o) => o.paymentStatus === 'UNPAID').length}件
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">注文ステータス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">確認済み</span>
                <span className="text-sm font-medium">
                  {orders.filter((o) => o.status === 'CONFIRMED').length}件
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground text-sm">保留中</span>
                <span className="text-sm font-medium">
                  {orders.filter((o) => o.status === 'PENDING').length}件
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
