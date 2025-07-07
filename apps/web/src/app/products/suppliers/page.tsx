'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Badge } from '@repo/ui/components/badge';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import { Skeleton } from '@repo/ui/components/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui/components/table';
import {
  Building2,
  Edit,
  Mail,
  MoreHorizontal,
  Package,
  Phone,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

import { useConfirmModal } from '@/hooks/useConfirmModal';

// バリデーションスキーマ
const supplierSchema = z.object({
  code: z
    .string()
    .min(1, 'サプライヤーコードは必須です')
    .max(20, 'サプライヤーコードは20文字以内で入力してください')
    .regex(
      /^[A-Z0-9-]+$/,
      'サプライヤーコードは英数字とハイフンで入力してください'
    ),
  name: z
    .string()
    .min(1, 'サプライヤー名は必須です')
    .max(100, 'サプライヤー名は100文字以内で入力してください'),
  email: z
    .string()
    .min(1, 'メールアドレスは必須です')
    .email('有効なメールアドレスを入力してください'),
  phoneNumber: z
    .string()
    .min(1, '電話番号は必須です')
    .regex(/^[\d-]+$/, '電話番号は数字とハイフンで入力してください'),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

// サプライヤーの型定義
interface Supplier {
  id: number;
  code: string;
  name: string;
  email: string;
  phoneNumber: string;
  _count?: {
    products: number;
    purchaseOrders: number;
  };
}

// 商品情報の型定義
interface SupplierProduct {
  id: number;
  code: string;
  name: string;
  retailPrice: number;
  purchasePrice: number;
}

// ダミーデータ
const dummySuppliers: Supplier[] = [
  {
    id: 1,
    code: 'SUP-001',
    name: '株式会社フード・サプライ',
    email: 'contact@foodsupply.co.jp',
    phoneNumber: '03-1234-5678',
    _count: { products: 45, purchaseOrders: 12 },
  },
  {
    id: 2,
    code: 'SUP-002',
    name: '東京商事株式会社',
    email: 'info@tokyo-shoji.co.jp',
    phoneNumber: '03-2345-6789',
    _count: { products: 23, purchaseOrders: 8 },
  },
  {
    id: 3,
    code: 'SUP-003',
    name: 'グローバル・トレーディング',
    email: 'sales@globaltrading.com',
    phoneNumber: '03-3456-7890',
    _count: { products: 67, purchaseOrders: 25 },
  },
  {
    id: 4,
    code: 'SUP-004',
    name: '関西物産株式会社',
    email: 'contact@kansai-bussan.co.jp',
    phoneNumber: '06-1234-5678',
    _count: { products: 12, purchaseOrders: 3 },
  },
  {
    id: 5,
    code: 'SUP-005',
    name: 'エコ・プロダクツ',
    email: 'info@eco-products.jp',
    phoneNumber: '03-4567-8901',
    _count: { products: 34, purchaseOrders: 15 },
  },
];

const dummyProducts: SupplierProduct[] = [
  {
    id: 1,
    code: 'PROD-001',
    name: '有機野菜セット',
    retailPrice: 1500,
    purchasePrice: 800,
  },
  {
    id: 2,
    code: 'PROD-002',
    name: '特選米 5kg',
    retailPrice: 2800,
    purchasePrice: 1500,
  },
  {
    id: 3,
    code: 'PROD-003',
    name: '冷凍食品セット',
    retailPrice: 1200,
    purchasePrice: 650,
  },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(dummySuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      code: '',
      name: '',
      email: '',
      phoneNumber: '',
    },
  });

  const confirmDelete = useConfirmModal({
    type: 'delete',
    title: 'サプライヤーを削除しますか？',
    onConfirm: async (supplierId: number) => {
      setIsLoading(true);
      try {
        // TODO: API call to delete supplier
        await new Promise((resolve) => setTimeout(resolve, 1000)); // ダミー遅延

        setSuppliers((prev) =>
          prev.filter((supplier) => supplier.id !== supplierId)
        );
        toast.success('サプライヤーを削除しました');
      } catch (error) {
        toast.error('サプライヤーの削除に失敗しました');
      } finally {
        setIsLoading(false);
      }
    },
  });

  // フィルタリングされたサプライヤー
  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // サプライヤー作成
  const handleCreate = async (data: SupplierFormData) => {
    setIsLoading(true);
    try {
      // 重複チェック
      const existingSupplier = suppliers.find((s) => s.code === data.code);
      if (existingSupplier) {
        form.setError('code', {
          message: 'このサプライヤーコードは既に使用されています',
        });
        setIsLoading(false);
        return;
      }

      // TODO: API call to create supplier
      await new Promise((resolve) => setTimeout(resolve, 1000)); // ダミー遅延

      const newSupplier: Supplier = {
        id: Math.max(...suppliers.map((s) => s.id)) + 1,
        code: data.code,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        _count: { products: 0, purchaseOrders: 0 },
      };

      setSuppliers((prev) => [...prev, newSupplier]);
      setIsCreateDialogOpen(false);
      form.reset();
      toast.success('サプライヤーを作成しました');
    } catch (error) {
      toast.error('サプライヤーの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // サプライヤー編集
  const handleEdit = async (data: SupplierFormData) => {
    if (!editingSupplier) return;

    setIsLoading(true);
    try {
      // 重複チェック（自分以外）
      const existingSupplier = suppliers.find(
        (s) => s.code === data.code && s.id !== editingSupplier.id
      );
      if (existingSupplier) {
        form.setError('code', {
          message: 'このサプライヤーコードは既に使用されています',
        });
        setIsLoading(false);
        return;
      }

      // TODO: API call to update supplier
      await new Promise((resolve) => setTimeout(resolve, 1000)); // ダミー遅延

      setSuppliers((prev) =>
        prev.map((supplier) =>
          supplier.id === editingSupplier.id
            ? {
                ...supplier,
                code: data.code,
                name: data.name,
                email: data.email,
                phoneNumber: data.phoneNumber,
              }
            : supplier
        )
      );

      setIsEditDialogOpen(false);
      setEditingSupplier(null);
      form.reset();
      toast.success('サプライヤー情報を更新しました');
    } catch (error) {
      toast.error('サプライヤー情報の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 編集ダイアログを開く
  const openEditDialog = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    form.reset({
      code: supplier.code,
      name: supplier.name,
      email: supplier.email,
      phoneNumber: supplier.phoneNumber,
    });
    setIsEditDialogOpen(true);
  };

  // 詳細シートを開く
  const openDetailSheet = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDetailSheetOpen(true);
  };

  // 削除確認
  const handleDelete = (supplier: Supplier) => {
    const productCount = supplier._count?.products || 0;
    const purchaseOrderCount = supplier._count?.purchaseOrders || 0;
    const description = `「${supplier.name}」を削除しますか？`;
    const details =
      productCount > 0 || purchaseOrderCount > 0
        ? `このサプライヤーには${productCount}個の商品と${purchaseOrderCount}件の発注履歴があります。削除すると関連データも削除されます。`
        : 'この操作は元に戻せません。';

    confirmDelete.show(description, details, supplier.id);
  };

  // 統計計算
  const totalProducts = suppliers.reduce(
    (sum, supplier) => sum + (supplier._count?.products || 0),
    0
  );
  const totalPurchaseOrders = suppliers.reduce(
    (sum, supplier) => sum + (supplier._count?.purchaseOrders || 0),
    0
  );
  const avgProductsPerSupplier =
    suppliers.length > 0 ? Math.round(totalProducts / suppliers.length) : 0;

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div>
        <h1 className="text-3xl font-bold">サプライヤー管理</h1>
        <p className="text-muted-foreground">
          サプライヤーの作成、編集、削除および取引情報を管理します
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              総サプライヤー数
            </CardTitle>
            <Building2 className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-muted-foreground text-xs">
              登録されているサプライヤー
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総商品数</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-muted-foreground text-xs">
              サプライヤーからの商品
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総発注数</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchaseOrders}</div>
            <p className="text-muted-foreground text-xs">発注履歴の件数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均商品数</CardTitle>
            <Package className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgProductsPerSupplier}</div>
            <p className="text-muted-foreground text-xs">
              サプライヤーあたりの商品数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* メインコンテンツ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>サプライヤー一覧</CardTitle>
              <CardDescription>
                登録されているサプライヤーの一覧です
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 検索フィルター */}
          <div className="mb-4 flex items-center space-x-2">
            <div className="relative max-w-sm flex-1">
              <Search className="text-muted-foreground absolute left-2 top-2.5 h-4 w-4" />
              <Input
                placeholder="サプライヤー名、コード、メールアドレスで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* サプライヤーテーブル */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>コード</TableHead>
                <TableHead>サプライヤー名</TableHead>
                <TableHead>メールアドレス</TableHead>
                <TableHead>電話番号</TableHead>
                <TableHead>商品数</TableHead>
                <TableHead>発注数</TableHead>
                <TableHead className="text-right">アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <TableRow
                    key={supplier.id}
                    className="cursor-pointer"
                    onClick={() => openDetailSheet(supplier)}
                  >
                    <TableCell className="font-mono">{supplier.code}</TableCell>
                    <TableCell className="font-medium">
                      {supplier.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="text-muted-foreground mr-2 h-4 w-4" />
                        {supplier.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Phone className="text-muted-foreground mr-2 h-4 w-4" />
                        {supplier.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          supplier._count?.products ? 'default' : 'secondary'
                        }
                      >
                        {supplier._count?.products || 0}個
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          supplier._count?.purchaseOrders
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {supplier._count?.purchaseOrders || 0}件
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openDetailSheet(supplier)}
                          >
                            詳細を見る
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(supplier)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(supplier)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center">
                    <div className="text-muted-foreground">
                      {searchTerm
                        ? '検索結果が見つかりません'
                        : 'サプライヤーが登録されていません'}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 新規作成ダイアログ */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新しいサプライヤーを作成</DialogTitle>
            <DialogDescription>
              新しいサプライヤーを登録します。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleCreate)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>サプライヤーコード</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例：SUP-001"
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
                    <FormLabel>サプライヤー名</FormLabel>
                    <FormControl>
                      <Input placeholder="例：株式会社サンプル" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例：contact@sample.co.jp"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
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
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '作成中...' : '作成'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>サプライヤー情報を編集</DialogTitle>
            <DialogDescription>
              サプライヤー情報を編集します。
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEdit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>サプライヤーコード</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例：SUP-001"
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
                    <FormLabel>サプライヤー名</FormLabel>
                    <FormControl>
                      <Input placeholder="例：株式会社サンプル" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>メールアドレス</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="例：contact@sample.co.jp"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
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
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isLoading}
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '更新中...' : '更新'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* 詳細シート */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-[700px] sm:w-[640px]">
          <SheetHeader>
            <SheetTitle>サプライヤー詳細</SheetTitle>
            <SheetDescription>
              サプライヤーの詳細情報と取扱商品を表示します
            </SheetDescription>
          </SheetHeader>
          {selectedSupplier && (
            <div className="mt-6 space-y-6">
              {/* 基本情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">基本情報</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        サプライヤーID
                      </p>
                      <p className="font-mono">#{selectedSupplier.id}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        サプライヤーコード
                      </p>
                      <p className="font-mono">{selectedSupplier.code}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-muted-foreground text-sm font-medium">
                        サプライヤー名
                      </p>
                      <p>{selectedSupplier.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        メールアドレス
                      </p>
                      <p>{selectedSupplier.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        電話番号
                      </p>
                      <p>{selectedSupplier.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        取扱商品数
                      </p>
                      <p>{selectedSupplier._count?.products || 0}個</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">
                        発注履歴
                      </p>
                      <p>{selectedSupplier._count?.purchaseOrders || 0}件</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 取扱商品 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">取扱商品</CardTitle>
                  <CardDescription>
                    このサプライヤーの取扱商品一覧
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dummyProducts.length > 0 ? (
                    <div className="space-y-3">
                      {dummyProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-muted-foreground font-mono text-sm">
                              {product.code}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              売価: ¥{product.retailPrice.toLocaleString()}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              仕入価格: ¥
                              {product.purchasePrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground py-4 text-center">
                      取扱商品がありません
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* アクションボタン */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDetailSheetOpen(false);
                    openEditDialog(selectedSupplier);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  編集
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsDetailSheetOpen(false);
                    handleDelete(selectedSupplier);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  削除
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* 削除確認ダイアログ */}
      {confirmDelete.modal}
    </div>
  );
}
