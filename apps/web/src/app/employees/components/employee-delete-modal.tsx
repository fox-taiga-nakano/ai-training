'use client';

import { memo, useCallback } from 'react';

import { Button } from '@repo/components/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/components/sheet';
import { AlertTriangle } from 'lucide-react';

import { Employee } from '../columns';

interface EmployeeDeleteModalProps {
  employee: Employee | null;
  isOpen: boolean;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: (employeeId: string) => Promise<void>;
}

/**
 * 社員削除確認モーダルコンポーネント
 * - 誤操作防止のため明確な確認UI
 * - アクセシビリティ対応
 * - セキュリティを考慮した削除処理
 */
export const EmployeeDeleteModal = memo<EmployeeDeleteModalProps>(
  function EmployeeDeleteModal({
    employee,
    isOpen,
    isDeleting = false,
    onClose,
    onConfirm,
  }) {
    // 削除確認処理
    const handleConfirm = useCallback(async () => {
      if (!employee) return;

      try {
        await onConfirm(employee.id);
      } catch (error) {
        console.error('削除エラー:', error);
        // エラーは親コンポーネントで処理
      }
    }, [employee, onConfirm]);

    // キーボードイベントハンドラー
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'Escape' && !isDeleting) {
          onClose();
        }
      },
      [isDeleting, onClose]
    );

    if (!employee) return null;

    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent
          className="sm:max-w-[400px]"
          aria-describedby="delete-employee-description"
          onKeyDown={handleKeyDown}
        >
          <SheetHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle
                  className="h-5 w-5 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <div>
                <SheetTitle className="text-left text-lg font-semibold text-gray-900">
                  社員を削除
                </SheetTitle>
                <SheetDescription
                  id="delete-employee-description"
                  className="text-left text-sm text-gray-600"
                >
                  この操作は取り消すことができません
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {/* 削除対象の社員情報 */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="mb-2 font-medium text-gray-900">削除対象</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>
                  <span className="font-medium">名前:</span> {employee.name}
                </p>
                <p>
                  <span className="font-medium">ユーザー名:</span>{' '}
                  {employee.username}
                </p>
                <p>
                  <span className="font-medium">メール:</span> {employee.email}
                </p>
                <p>
                  <span className="font-medium">役割:</span> {employee.role}
                </p>
              </div>
            </div>

            {/* 警告メッセージ */}
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                  aria-hidden="true"
                />
                <div className="text-sm">
                  <p className="mb-1 font-medium text-red-800">注意事項</p>
                  <ul className="list-inside list-disc space-y-1 text-red-700">
                    <li>この社員のアカウントは完全に削除されます</li>
                    <li>関連するデータもすべて削除されます</li>
                    <li>この操作は取り消すことができません</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 確認テキスト */}
            <div className="text-sm text-gray-600">
              <p>
                本当に{' '}
                <span className="font-semibold text-gray-900">
                  {employee.name}
                </span>{' '}
                を削除しますか？
              </p>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="mt-8 flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isDeleting}
              className="min-w-[80px]"
            >
              キャンセル
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isDeleting}
              className="min-w-[80px]"
              aria-describedby={isDeleting ? 'delete-status' : undefined}
            >
              {isDeleting ? '削除中...' : '削除'}
            </Button>
            {isDeleting && (
              <span id="delete-status" className="sr-only">
                社員データを削除しています
              </span>
            )}
          </div>

          {/* キーボードヒント */}
          <div className="mt-4 text-center text-xs text-gray-500">
            Escキーでキャンセル
          </div>
        </SheetContent>
      </Sheet>
    );
  }
);
