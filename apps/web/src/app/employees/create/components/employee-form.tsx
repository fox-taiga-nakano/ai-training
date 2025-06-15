'use client';

import { useForm } from 'react-hook-form';

import { useRouter } from 'next/navigation';

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
import { cn } from '@repo/lib/utils';
import * as z from 'zod';

// 社員情報のバリデーションスキーマ
const employeeFormSchema = z.object({
  name: z.string().min(1, {
    message: '名前は必須項目です',
  }),
  email: z.string().email({
    message: '有効なメールアドレスを入力してください',
  }),
  phone: z.string().min(1, {
    message: '電話番号は必須項目です',
  }),
  department: z.string().min(1, {
    message: '部署は必須項目です',
  }),
  role: z.string().min(1, {
    message: '役職は必須項目です',
  }),
});

type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

// 部署データ（実際の環境では外部から取得する）
const departments = [
  { id: 'dev', name: '開発部' },
  { id: 'sales', name: '営業部' },
  { id: 'hr', name: '人事部' },
  { id: 'finance', name: '財務部' },
];

// 役職データ（実際の環境では外部から取得する）
const roles = [
  { id: 'manager', name: 'マネージャー' },
  { id: 'engineer', name: 'エンジニア' },
  { id: 'designer', name: 'デザイナー' },
  { id: 'sales', name: '営業担当' },
  { id: 'hr', name: '人事担当' },
];

/**
 * 社員登録フォームコンポーネント
 *
 * @param onSuccess - 登録成功時のコールバック関数
 */
export function EmployeeForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();

  // フォームの初期値
  const defaultValues: Partial<EmployeeFormValues> = {
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
  };

  // react-hook-formの設定
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  // フォーム送信処理
  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      // ここでAPIを呼び出して社員情報を登録する処理を実装
      // 例: await fetch('/api/employees', { method: 'POST', body: JSON.stringify(data) });
      console.log('送信データ:', data);

      // 登録成功時の処理
      if (onSuccess) {
        onSuccess();
      } else {
        // デフォルトでは社員一覧ページにリダイレクト
        router.push('/employees');
      }
    } catch (error) {
      console.error('社員登録エラー:', error);
      // エラー処理を実装
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="grid gap-2">
            <label
              htmlFor="department"
              className="text-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              部署
            </label>
            <Select
              onValueChange={(value) =>
                form.setValue('department', value, { shouldValidate: true })
              }
              defaultValue={form.getValues('department')}
            >
              <SelectTrigger
                id="department"
                className={cn('max-w-sm', {
                  'border-red-500': form.formState.errors.department,
                })}
                aria-invalid={!!form.formState.errors.department}
              >
                <SelectValue placeholder="部署を選択" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.department && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {form.formState.errors.department.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="role"
              className="text-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              役職
            </label>
            <Select
              onValueChange={(value) =>
                form.setValue('role', value, { shouldValidate: true })
              }
              defaultValue={form.getValues('role')}
            >
              <SelectTrigger
                id="role"
                className={cn('max-w-sm', {
                  'border-red-500': form.formState.errors.role,
                })}
                aria-invalid={!!form.formState.errors.role}
              >
                <SelectValue placeholder="役職を選択" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-red-500 dark:text-red-400">
                {form.formState.errors.role.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-2">
          <label
            htmlFor="name"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            名前
          </label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="山田 太郎"
            className={cn('max-w-sm', {
              'border-red-500': form.formState.errors.name,
            })}
            aria-invalid={!!form.formState.errors.name}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="email"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            メールアドレス
          </label>
          <Input
            id="email"
            type="email"
            {...form.register('email')}
            placeholder="example@company.com"
            className={cn('max-w-sm', {
              'border-red-500': form.formState.errors.email,
            })}
            aria-invalid={!!form.formState.errors.email}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="phone"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            電話番号
          </label>
          <Input
            id="phone"
            {...form.register('phone')}
            placeholder="090-1234-5678"
            className={cn('max-w-sm', {
              'border-red-500': form.formState.errors.phone,
            })}
            aria-invalid={!!form.formState.errors.phone}
          />
          {form.formState.errors.phone && (
            <p className="text-sm text-red-500 dark:text-red-400">
              {form.formState.errors.phone.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/employees')}
        >
          キャンセル
        </Button>
        <Button type="submit">登録</Button>
      </div>
    </form>
  );
}
