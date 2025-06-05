'use client';

import { useRouter } from 'next/navigation';

import { Separator } from '@repo/components/separator';

import { EmployeeForm } from './components/employee-form';

/**
 * 社員登録ページコンポーネント
 * 社員情報を入力するフォームを提供し、送信時にバリデーションを行います
 */
export default function CreateEmployeePage() {
  const router = useRouter();

  // 登録成功時のコールバック
  const handleSuccess = () => {
    // 登録成功後、社員一覧ページにリダイレクト
    router.push('/employees');
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">社員登録</h1>
      </div>
      <Separator />
      <EmployeeForm onSuccess={handleSuccess} />
    </div>
  );
}
