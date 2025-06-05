import Link from 'next/link';

import { Button } from '@repo/components/button';

import { columns, data } from '@/app/employees/columns';
import { DataTable } from '@/app/employees/data-table';
import { AppBreadcrumb } from '@/components/app-breadcrumb';

/**
 * 社員一覧ページ
 *
 * 社員データを表示するデータテーブルを実装しています。
 * フィルタリング、ソート、ページネーション機能を備えています。
 * 新規登録ボタンから社員登録画面に遷移できます。
 */
export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">社員一覧</h1>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
