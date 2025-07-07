'use client';

import { useEffect } from 'react';

import { Alert, AlertDescription } from '@repo/ui/components/alert';
import { Button } from '@repo/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // エラーログ送信 (実際の実装では適切なログサービスに送信)
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="mx-auto max-w-md">
        <CardHeader className="text-center">
          <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <AlertTriangle className="text-destructive h-6 w-6" />
          </div>
          <CardTitle>エラーが発生しました</CardTitle>
          <CardDescription>
            申し訳ありませんが、予期しないエラーが発生しました。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              システムエラーが発生しました。問題が解決しない場合は、システム管理者にお問い合わせください。
            </AlertDescription>
          </Alert>

          {process.env.NODE_ENV === 'development' && (
            <details className="rounded-md border p-3">
              <summary className="cursor-pointer text-sm font-medium">
                エラー詳細 (開発環境)
              </summary>
              <div className="text-muted-foreground mt-2 text-xs">
                <p className="font-mono">{error.message}</p>
                {error.digest && (
                  <p className="mt-1">
                    <span className="font-medium">Error ID:</span>{' '}
                    {error.digest}
                  </p>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-2">
            <Button onClick={reset} className="flex-1" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              再試行
            </Button>
            <Button
              onClick={() => (window.location.href = '/')}
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              ホームに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
