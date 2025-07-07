'use client';

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
import { ArrowLeft, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Search className="text-muted-foreground h-6 w-6" />
          </div>
          <div className="mb-2">
            <Badge variant="outline" className="font-mono text-lg">
              404
            </Badge>
          </div>
          <CardTitle>ページが見つかりません</CardTitle>
          <CardDescription>
            お探しのページは存在しないか、移動された可能性があります。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground text-center text-sm">
            <p>以下のような原因が考えられます：</p>
            <ul className="mt-2 space-y-1 text-left">
              <li>• URLが正しく入力されていない</li>
              <li>• ページが削除または移動されている</li>
              <li>• アクセス権限がない</li>
            </ul>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                ホームに戻る
              </Link>
            </Button>
          </div>

          <div className="pt-4 text-center">
            <p className="text-muted-foreground text-sm">
              問題が解決しない場合は、システム管理者にお問い合わせください。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
