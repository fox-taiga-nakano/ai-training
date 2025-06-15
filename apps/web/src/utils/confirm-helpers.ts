import type { Employee } from '@/app/employees/columns';
import type { ConfirmData } from '@/components/confirm-modal';

/**
 * 確認モーダル用のヘルパー関数集
 * - 各アクションタイプ別の設定を提供
 * - 一貫したUX/UI
 * - 型安全性の確保
 */

// 社員削除確認の設定
export const createDeleteEmployeeConfirm = (
  employee: Employee
): ConfirmData => ({
  title: '社員を削除',
  description: 'この操作は取り消すことができません',
  details: [
    { label: '名前', value: employee.name },
    { label: 'ユーザー名', value: employee.username },
    { label: 'メール', value: employee.email },
    { label: '役割', value: employee.role },
  ],
  warnings: [
    'この社員のアカウントは完全に削除されます',
    '関連するデータもすべて削除されます',
    'この操作は取り消すことができません',
  ],
  confirmText: `本当に ${employee.name} を削除しますか？`,
  actionType: 'delete',
});

// 社員情報保存確認の設定
export const createSaveEmployeeConfirm = (employee: Employee): ConfirmData => ({
  title: '変更を保存',
  description: '社員情報の変更内容を保存します',
  details: [
    { label: '名前', value: employee.name },
    { label: 'ユーザー名', value: employee.username },
    { label: 'メール', value: employee.email },
    { label: 'ステータス', value: employee.status },
    { label: '役割', value: employee.role },
  ],
  confirmText: '変更内容を保存しますか？',
  actionType: 'save',
});

// フォームリセット確認の設定
export const createResetFormConfirm = (): ConfirmData => ({
  title: 'フォームをリセット',
  description: '入力した内容がすべて削除されます',
  warnings: [
    '入力したすべての内容が削除されます',
    'この操作は取り消すことができません',
  ],
  confirmText: '本当にフォームをリセットしますか？',
  actionType: 'reset',
});

// 変更の破棄確認の設定
export const createDiscardChangesConfirm = (): ConfirmData => ({
  title: '変更を破棄',
  description: '未保存の変更内容が失われます',
  warnings: [
    '未保存の変更内容がすべて失われます',
    'この操作は取り消すことができません',
  ],
  confirmText: '変更を破棄してページを離れますか？',
  actionType: 'cancel',
});

// ログアウト確認の設定
export const createLogoutConfirm = (): ConfirmData => ({
  title: 'ログアウト',
  description: 'アカウントからログアウトします',
  warnings: [
    '未保存の作業内容は失われる可能性があります',
    '再度ログインが必要になります',
  ],
  confirmText: '本当にログアウトしますか？',
  actionType: 'info',
});

// データエクスポート確認の設定
export const createExportDataConfirm = (recordCount: number): ConfirmData => ({
  title: 'データをエクスポート',
  description: '選択されたデータをファイルに出力します',
  details: [
    { label: 'エクスポート件数', value: `${recordCount}件` },
    { label: 'ファイル形式', value: 'CSV' },
  ],
  confirmText: 'データをエクスポートしますか？',
  actionType: 'submit',
});

// データインポート確認の設定
export const createImportDataConfirm = (
  filename: string,
  recordCount: number
): ConfirmData => ({
  title: 'データをインポート',
  description: 'ファイルからデータを読み込みます',
  details: [
    { label: 'ファイル名', value: filename },
    { label: 'インポート件数', value: `${recordCount}件` },
  ],
  warnings: [
    '既存のデータと重複する場合は上書きされます',
    'インポート処理は時間がかかる場合があります',
  ],
  confirmText: 'データをインポートしますか？',
  actionType: 'submit',
});

// 一括削除確認の設定
export const createBulkDeleteConfirm = (
  selectedCount: number
): ConfirmData => ({
  title: '選択項目を一括削除',
  description: '選択されたすべての項目を削除します',
  details: [{ label: '削除対象', value: `${selectedCount}件` }],
  warnings: [
    `${selectedCount}件の項目がすべて削除されます`,
    '関連するデータもすべて削除されます',
    'この操作は取り消すことができません',
  ],
  confirmText: `本当に${selectedCount}件の項目を削除しますか？`,
  actionType: 'delete',
});

// 権限変更確認の設定
export const createChangeRoleConfirm = (
  employee: Employee,
  newRole: string
): ConfirmData => ({
  title: '権限を変更',
  description: '社員の権限レベルを変更します',
  details: [
    { label: '対象社員', value: employee.name },
    { label: '現在の権限', value: employee.role },
    { label: '新しい権限', value: newRole },
  ],
  warnings: [
    '権限変更により、アクセス可能な機能が変わります',
    '変更は即座に反映されます',
  ],
  confirmText: `${employee.name}の権限を${newRole}に変更しますか？`,
  actionType: 'save',
});
