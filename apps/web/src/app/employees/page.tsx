import { columns, data } from '@/app/employees/columns';
import { DataTable } from '@/app/employees/data-table';
import { AppBreadcrumb } from '@/components/app-breadcrumb';

/**
 * 社員一覧ページ
 *
 * 社員データを表示するデータテーブルを実装しています。
 * フィルタリング、ソート、ページネーション機能を備えています。
 */
export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <AppBreadcrumb />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">社員一覧</h1>
      </div>
      <div className="">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
