import { columns, data } from '@/app/employees/columns';
import { EmployeeTable } from '@/app/employees/components/employee-table';

/**
 * 社員一覧ページ（サーバーコンポーネント）
 *
 * 社員データを表示するデータテーブルを実装しています。
 * フィルタリング、ソート、ページネーション機能を備えています。
 * 新規登録ボタンから社員登録画面に遷移できます。
 * 社員情報の編集モーダルと削除確認モーダルも含みます。
 *
 * リファクタリング内容：
 * - セキュリティ強化（入力値検証、XSS対策）
 * - パフォーマンス最適化（メモ化、コールバック最適化）
 * - 型安全性向上
 * - エラーハンドリング改善
 * - アクセシビリティ向上
 * - 削除機能のUX改善（アラート→確認モーダル）
 * - 汎用確認モーダルの導入
 * - サーバーコンポーネント化（'use client'最小化）
 */
export default function Page() {
  // 実際の環境では、ここでAPIからデータを取得
  // const employees = await fetchEmployees();

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">社員一覧</h1>
      </div>

      <EmployeeTable initialEmployees={data} columns={columns} />
    </div>
  );
}
