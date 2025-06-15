'use client';

import { memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@repo/components/button';
import { Input } from '@repo/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/components/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@repo/components/sheet';
import { cn } from '@repo/lib/utils';

import {
  type EditEmployeeFormValues,
  editEmployeeFormSchema,
} from '@/lib/validation/employee';

import { Employee } from '../columns';

// ステータスオプション（メモ化）
const statusOptions = [
  { value: 'active', label: '有効' },
  { value: 'inactive', label: '無効' },
  { value: 'suspended', label: '停止中' },
  { value: 'invited', label: '招待中' },
] as const;

// 役割オプション（メモ化）
const roleOptions = [
  { value: 'admin', label: '管理者' },
  { value: 'manager', label: 'マネージャー' },
  { value: 'cashier', label: 'キャッシャー' },
  { value: 'superadmin', label: '特権管理者' },
] as const;

interface EmployeeEditModalProps {
  employee: Employee | null;
  isOpen: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (employee: Employee) => Promise<void>;
  onClearError?: () => void;
}

/**
 * 社員情報編集モーダルコンポーネント（パフォーマンス最適化版）
 * - memo化による不要な再レンダリング防止
 * - useCallback による関数メモ化
 * - セキュリティ強化されたバリデーション
 */
export const EmployeeEditModal = memo<EmployeeEditModalProps>(
  function EmployeeEditModal({
    employee,
    isOpen,
    isSubmitting = false,
    error,
    onClose,
    onSave,
    onClearError,
  }) {
    // フォームの設定
    const form = useForm<EditEmployeeFormValues>({
      resolver: zodResolver(editEmployeeFormSchema),
      values: employee
        ? {
            name: employee.name,
            username: employee.username,
            email: employee.email,
            phone: employee.phone,
            status: employee.status,
            role: employee.role,
          }
        : undefined,
      mode: 'onChange',
    });

    // フォーム送信処理（useCallbackでメモ化）
    const onSubmit = useCallback(
      async (data: EditEmployeeFormValues) => {
        if (!employee) return;

        try {
          // データの整合性チェック（型安全な更新）
          const updatedEmployee: Employee = {
            id: employee.id,
            name: data.name,
            username: data.username,
            email: data.email,
            phone: data.phone,
            status: data.status,
            role: data.role,
          };

          await onSave(updatedEmployee);
        } catch (error) {
          console.error('社員情報更新エラー:', error);
          // エラーは親コンポーネントで処理
        }
      },
      [employee, onSave]
    );

    // モーダルを閉じる際の処理（useCallbackでメモ化）
    const handleClose = useCallback(() => {
      form.reset();
      onClearError?.();
      onClose();
    }, [form, onClose, onClearError]);

    // セレクト値変更ハンドラー（メモ化）
    const handleStatusChange = useCallback(
      (value: string) => {
        form.setValue('status', value as EditEmployeeFormValues['status'], {
          shouldValidate: true,
        });
      },
      [form]
    );

    const handleRoleChange = useCallback(
      (value: string) => {
        form.setValue('role', value as EditEmployeeFormValues['role'], {
          shouldValidate: true,
        });
      },
      [form]
    );

    return (
      <Sheet open={isOpen} onOpenChange={handleClose}>
        <SheetContent
          className="sm:max-w-[500px]"
          aria-describedby="edit-employee-description"
        >
          <SheetHeader>
            <SheetTitle>社員情報を編集</SheetTitle>
            <SheetDescription id="edit-employee-description">
              社員の情報を編集します。変更内容を確認して保存してください。
            </SheetDescription>
          </SheetHeader>

          {/* エラー表示 */}
          {error && (
            <div className="mx-4 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50">
              <p
                className="text-sm text-red-600 dark:text-red-400"
                role="alert"
              >
                {error}
              </p>
            </div>
          )}

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-4"
            noValidate
          >
            {/* 名前 */}
            <div className="grid gap-2">
              <label
                htmlFor="name"
                className="text-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                名前{' '}
                <span
                  className="text-red-500 dark:text-red-400"
                  aria-label="必須"
                >
                  *
                </span>
              </label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="山田 太郎"
                className={cn({
                  'border-red-500': form.formState.errors.name,
                })}
                aria-invalid={!!form.formState.errors.name}
                aria-describedby={
                  form.formState.errors.name ? 'name-error' : undefined
                }
              />
              {form.formState.errors.name && (
                <p
                  id="name-error"
                  className="text-sm text-red-500 dark:text-red-400"
                  role="alert"
                >
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* ユーザー名 */}
            <div className="grid gap-2">
              <label
                htmlFor="username"
                className="text-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                ユーザー名{' '}
                <span
                  className="text-red-500 dark:text-red-400"
                  aria-label="必須"
                >
                  *
                </span>
              </label>
              <Input
                id="username"
                {...form.register('username')}
                placeholder="yamada_taro"
                className={cn({
                  'border-red-500': form.formState.errors.username,
                })}
                aria-invalid={!!form.formState.errors.username}
                aria-describedby={
                  form.formState.errors.username ? 'username-error' : undefined
                }
              />
              {form.formState.errors.username && (
                <p
                  id="username-error"
                  className="text-sm text-red-500 dark:text-red-400"
                  role="alert"
                >
                  {form.formState.errors.username.message}
                </p>
              )}
            </div>

            {/* メールアドレス */}
            <div className="grid gap-2">
              <label
                htmlFor="email"
                className="text-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                メールアドレス{' '}
                <span
                  className="text-red-500 dark:text-red-400"
                  aria-label="必須"
                >
                  *
                </span>
              </label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="example@company.com"
                className={cn({
                  'border-red-500': form.formState.errors.email,
                })}
                aria-invalid={!!form.formState.errors.email}
                aria-describedby={
                  form.formState.errors.email ? 'email-error' : undefined
                }
              />
              {form.formState.errors.email && (
                <p
                  id="email-error"
                  className="text-sm text-red-500 dark:text-red-400"
                  role="alert"
                >
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* 電話番号 */}
            <div className="grid gap-2">
              <label
                htmlFor="phone"
                className="text-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                電話番号{' '}
                <span
                  className="text-red-500 dark:text-red-400"
                  aria-label="必須"
                >
                  *
                </span>
              </label>
              <Input
                id="phone"
                {...form.register('phone')}
                placeholder="+81-90-1234-5678"
                className={cn({
                  'border-red-500': form.formState.errors.phone,
                })}
                aria-invalid={!!form.formState.errors.phone}
                aria-describedby={
                  form.formState.errors.phone ? 'phone-error' : undefined
                }
              />
              {form.formState.errors.phone && (
                <p
                  id="phone-error"
                  className="text-sm text-red-500 dark:text-red-400"
                  role="alert"
                >
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* ステータス */}
            <div className="grid gap-2">
              <label
                htmlFor="status"
                className="text-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                ステータス{' '}
                <span
                  className="text-red-500 dark:text-red-400"
                  aria-label="必須"
                >
                  *
                </span>
              </label>
              <Select
                onValueChange={handleStatusChange}
                value={form.watch('status')}
              >
                <SelectTrigger
                  id="status"
                  className={cn({
                    'border-red-500': form.formState.errors.status,
                  })}
                  aria-invalid={!!form.formState.errors.status}
                  aria-describedby={
                    form.formState.errors.status ? 'status-error' : undefined
                  }
                >
                  <SelectValue placeholder="ステータスを選択" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p
                  id="status-error"
                  className="text-sm text-red-500 dark:text-red-400"
                  role="alert"
                >
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            {/* 役割 */}
            <div className="grid gap-2">
              <label
                htmlFor="role"
                className="text-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                役割{' '}
                <span
                  className="text-red-500 dark:text-red-400"
                  aria-label="必須"
                >
                  *
                </span>
              </label>
              <Select
                onValueChange={handleRoleChange}
                value={form.watch('role')}
              >
                <SelectTrigger
                  id="role"
                  className={cn({
                    'border-red-500': form.formState.errors.role,
                  })}
                  aria-invalid={!!form.formState.errors.role}
                  aria-describedby={
                    form.formState.errors.role ? 'role-error' : undefined
                  }
                >
                  <SelectValue placeholder="役割を選択" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p
                  id="role-error"
                  className="text-sm text-red-500 dark:text-red-400"
                  role="alert"
                >
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            {/* フッターボタン */}
            <div className="flex items-center justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                aria-describedby={isSubmitting ? 'submit-status' : undefined}
              >
                {isSubmitting ? '保存中...' : '保存'}
              </Button>
              {isSubmitting && (
                <span id="submit-status" className="sr-only">
                  データを保存しています
                </span>
              )}
            </div>
          </form>
        </SheetContent>
      </Sheet>
    );
  }
);
