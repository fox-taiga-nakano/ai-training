import { useCallback, useState } from 'react';

import { Employee } from '@/app/employees/columns';

// エラー型定義
interface EmployeeEditError {
  type: 'validation' | 'network' | 'permission' | 'unknown';
  message: string;
  field?: string;
}

// フック戻り値の型定義
interface UseEmployeeEditReturn {
  editingEmployee: Employee | null;
  isEditModalOpen: boolean;
  isSubmitting: boolean;
  error: EmployeeEditError | null;
  openEditModal: (employee: Employee) => void;
  closeEditModal: () => void;
  saveEmployee: (updatedEmployee: Employee) => Promise<void>;
  clearError: () => void;
}

/**
 * 社員編集機能を管理するカスタムフック
 * セキュリティとパフォーマンスを考慮した実装
 */
export function useEmployeeEdit(
  employees: Employee[],
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>
): UseEmployeeEditReturn {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<EmployeeEditError | null>(null);

  // セキュリティ：権限チェック（実際の環境では認証情報をチェック）
  const checkEditPermission = useCallback((employee: Employee): boolean => {
    // 実際の環境では、現在のユーザーの権限をチェック
    // 例：管理者のみが特権管理者を編集可能
    // if (currentUser.role !== 'superadmin' && employee.role === 'superadmin') {
    //   return false;
    // }
    return true;
  }, []);

  // モーダルを開く
  const openEditModal = useCallback(
    (employee: Employee) => {
      // 権限チェック
      if (!checkEditPermission(employee)) {
        setError({
          type: 'permission',
          message: 'この社員の情報を編集する権限がありません',
        });
        return;
      }

      setEditingEmployee(employee);
      setIsEditModalOpen(true);
      setError(null);
    },
    [checkEditPermission]
  );

  // モーダルを閉じる
  const closeEditModal = useCallback(() => {
    setEditingEmployee(null);
    setIsEditModalOpen(false);
    setError(null);
  }, []);

  // 社員情報を保存
  const saveEmployee = useCallback(
    async (updatedEmployee: Employee) => {
      if (!editingEmployee) return;

      setIsSubmitting(true);
      setError(null);

      try {
        // セキュリティ：データの整合性チェック
        if (updatedEmployee.id !== editingEmployee.id) {
          throw new Error('不正なデータ操作が検出されました');
        }

        // 実際の環境では API を呼び出す
        // const response = await fetch(`/api/employees/${updatedEmployee.id}`, {
        //   method: 'PUT',
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'Authorization': `Bearer ${token}`,
        //   },
        //   body: JSON.stringify(updatedEmployee),
        // });

        // if (!response.ok) {
        //   throw new Error(`更新に失敗しました: ${response.status}`);
        // }

        // ローカル状態の更新（楽観的更新）
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === updatedEmployee.id ? { ...updatedEmployee } : emp
          )
        );

        closeEditModal();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '予期しないエラーが発生しました';

        setError({
          type: errorMessage.includes('権限')
            ? 'permission'
            : errorMessage.includes('ネットワーク')
              ? 'network'
              : 'unknown',
          message: errorMessage,
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingEmployee, setEmployees, closeEditModal]
  );

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    editingEmployee,
    isEditModalOpen,
    isSubmitting,
    error,
    openEditModal,
    closeEditModal,
    saveEmployee,
    clearError,
  };
}
