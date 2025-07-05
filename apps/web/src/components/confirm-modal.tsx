'use client';

import { memo, useCallback } from 'react';

import { Button } from '@repo/ui/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/ui/components/sheet';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

// アクションタイプの定義
export type ConfirmActionType =
  | 'delete'
  | 'save'
  | 'cancel'
  | 'submit'
  | 'reset'
  | 'info';

// 確認データの型定義
export interface ConfirmData {
  title: string;
  description: string;
  details?: Array<{ label: string; value: string }>;
  warnings?: string[];
  confirmText?: string;
  cancelText?: string;
  actionType?: ConfirmActionType;
}

interface ConfirmModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  data: ConfirmData | null;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

// アクションタイプ別の設定
const actionConfig: Record<
  ConfirmActionType,
  {
    icon: typeof AlertTriangle;
    iconColor: string;
    bgColor: string;
    buttonVariant: 'default' | 'destructive' | 'outline' | 'secondary';
    defaultConfirmText: string;
  }
> = {
  delete: {
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-100',
    buttonVariant: 'destructive',
    defaultConfirmText: '削除',
  },
  save: {
    icon: CheckCircle,
    iconColor: 'text-green-600',
    bgColor: 'bg-green-100',
    buttonVariant: 'default',
    defaultConfirmText: '保存',
  },
  cancel: {
    icon: XCircle,
    iconColor: 'text-gray-600',
    bgColor: 'bg-gray-100',
    buttonVariant: 'outline',
    defaultConfirmText: 'キャンセル',
  },
  submit: {
    icon: CheckCircle,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    buttonVariant: 'default',
    defaultConfirmText: '送信',
  },
  reset: {
    icon: AlertTriangle,
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-100',
    buttonVariant: 'outline',
    defaultConfirmText: 'リセット',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    buttonVariant: 'default',
    defaultConfirmText: 'OK',
  },
};

/**
 * 汎用確認モーダルコンポーネント
 * - 全アクションタイプに対応
 * - カスタマイズ可能な表示内容
 * - アクセシビリティ対応
 * - 統一されたUI/UX
 */
export const ConfirmModal = memo<ConfirmModalProps>(function ConfirmModal({
  isOpen,
  isLoading = false,
  data,
  onClose,
  onConfirm,
}) {
  // 確認処理
  const handleConfirm = useCallback(async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('確認処理エラー:', error);
      // エラーは親コンポーネントで処理
    }
  }, [onConfirm]);

  // キーボードイベントハンドラー
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
      if (event.key === 'Enter' && !isLoading) {
        handleConfirm();
      }
    },
    [isLoading, onClose, handleConfirm]
  );

  if (!data) return null;

  const actionType = data.actionType || 'info';
  const config = actionConfig[actionType];
  const IconComponent = config.icon;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="sm:max-w-[500px]"
        aria-describedby="confirm-modal-description"
        onKeyDown={handleKeyDown}
      >
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor}`}
            >
              <IconComponent
                className={`h-5 w-5 ${config.iconColor}`}
                aria-hidden="true"
              />
            </div>
            <div>
              <SheetTitle className="text-foreground text-left text-lg font-semibold">
                {data.title}
              </SheetTitle>
              <SheetDescription
                id="confirm-modal-description"
                className="text-muted-foreground text-left text-sm"
              >
                {data.description}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {/* 詳細情報 */}
          {data.details && data.details.length > 0 && (
            <div className="bg-muted/50 rounded-lg border p-4">
              <h4 className="text-foreground mb-2 font-medium">詳細情報</h4>
              <div className="text-muted-foreground space-y-1 text-sm">
                {data.details.map((detail, index) => (
                  <p key={index}>
                    <span className="font-medium">{detail.label}:</span>{' '}
                    {detail.value}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 警告メッセージ */}
          {data.warnings && data.warnings.length > 0 && (
            <div
              className={`rounded-lg border p-4 ${
                actionType === 'delete'
                  ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/50'
                  : actionType === 'reset'
                    ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/50'
                    : 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                    actionType === 'delete'
                      ? 'text-red-600 dark:text-red-400'
                      : actionType === 'reset'
                        ? 'text-orange-600 dark:text-orange-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                  }`}
                  aria-hidden="true"
                />
                <div className="text-sm">
                  <p
                    className={`mb-1 font-medium ${
                      actionType === 'delete'
                        ? 'text-red-800 dark:text-red-200'
                        : actionType === 'reset'
                          ? 'text-orange-800 dark:text-orange-200'
                          : 'text-yellow-800 dark:text-yellow-200'
                    }`}
                  >
                    注意事項
                  </p>
                  <ul
                    className={`list-inside list-disc space-y-1 ${
                      actionType === 'delete'
                        ? 'text-red-700 dark:text-red-300'
                        : actionType === 'reset'
                          ? 'text-orange-700 dark:text-orange-300'
                          : 'text-yellow-700 dark:text-yellow-300'
                    }`}
                  >
                    {data.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 確認テキスト */}
          {data.confirmText && (
            <div className="text-muted-foreground text-sm">
              <p>{data.confirmText}</p>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="mt-8 flex items-center justify-end space-x-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {data.cancelText || 'キャンセル'}
          </Button>
          <Button
            type="button"
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[80px]"
            aria-describedby={isLoading ? 'confirm-status' : undefined}
          >
            {isLoading
              ? `${config.defaultConfirmText}中...`
              : data.confirmText || config.defaultConfirmText}
          </Button>
          {isLoading && (
            <span id="confirm-status" className="sr-only">
              処理を実行しています
            </span>
          )}
        </div>

        {/* キーボードヒント */}
        <div className="text-muted-foreground mt-4 space-x-2 text-center text-xs">
          <span>Escキーでキャンセル</span>
          <span>•</span>
          <span>Enterキーで実行</span>
        </div>
      </SheetContent>
    </Sheet>
  );
});
