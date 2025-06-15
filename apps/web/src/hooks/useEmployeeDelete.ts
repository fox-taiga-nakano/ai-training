import { useCallback, useState } from 'react';

import { Employee } from '@/app/employees/columns';

// エラー型定義
interface EmployeeDeleteError {
  type: 'permission' | 'network' | 'validation' | 'unknown';
  message: string;
}

// フック戻り値の型定義
interface UseEmployeeDeleteReturn {
  deletingEmployee: Employee | null;
  isDeleteModalOpen: boolean;
  isDeleting: boolean;
  error: EmployeeDeleteError | null;
  openDeleteModal: (employee: Employee) => void;
  closeDeleteModal: () => void;
  confirmDelete: (employeeId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * 社員削除機能を管理するカスタムフック
 * セキュリティとユーザビリティを考慮した削除処理
 */
export function useEmployeeDelete(
  employees: Employee[],
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>
): UseEmployeeDeleteReturn {
  const [deletingEmployee, setDeletingEmployee] = useState<Employee | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<EmployeeDeleteError | null>(null);

  // セキュリティ：削除権限チェック
  const checkDeletePermission = useCallback((employee: Employee): boolean => {
    // 実際の環境では、現在のユーザーの権限をチェック
    // 例：特権管理者は削除できない、自分自身は削除できない等
    // if (employee.role === 'superadmin') {
    //   return false;
    // }
    // if (employee.id === currentUser.id) {
    //   return false;
    // }
    return true;
  }, []);

  // 削除モーダルを開く
  const openDeleteModal = useCallback(
    (employee: Employee) => {
      // 権限チェック
      if (!checkDeletePermission(employee)) {
        setError({
          type: 'permission',
          message: 'この社員を削除する権限がありません',
        });
        return;
      }

      setDeletingEmployee(employee);
      setIsDeleteModalOpen(true);
      setError(null);
    },
    [checkDeletePermission]
  );

  // 削除モーダルを閉じる
  const closeDeleteModal = useCallback(() => {
    if (isDeleting) return; // 削除中はモーダルを閉じられない

    setDeletingEmployee(null);
    setIsDeleteModalOpen(false);
    setError(null);
  }, [isDeleting]);

  // 削除を実行
  const confirmDelete = useCallback(
    async (employeeId: string) => {
      if (!deletingEmployee || deletingEmployee.id !== employeeId) {
        setError({
          type: 'validation',
          message: '削除対象が正しくありません',
        });
        return;
      }

      setIsDeleting(true);
      setError(null);

      try {
        // セキュリティ：データの整合性チェック
        const employeeExists = employees.some((emp) => emp.id === employeeId);
        if (!employeeExists) {
          throw new Error('削除対象の社員が見つかりません');
        }

        // 実際の環境では API を呼び出す
        // const response = await fetch(`/api/employees/${employeeId}`, {
        //   method: 'DELETE',
        //   headers: {
        //     'Authorization': `Bearer ${token}`,
        //   },
        // });

        // if (!response.ok) {
        //   if (response.status === 403) {
        //     throw new Error('削除権限がありません');
        //   }
        //   if (response.status === 404) {
        //     throw new Error('削除対象が見つかりません');
        //   }
        //   throw new Error(`削除に失敗しました: ${response.status}`);
        // }

        // シミュレート：削除処理の待機時間
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // ローカル状態の更新
        setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId));

        // モーダルを閉じる
        setDeletingEmployee(null);
        setIsDeleteModalOpen(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : '予期しないエラーが発生しました';

        setError({
          type: errorMessage.includes('権限')
            ? 'permission'
            : errorMessage.includes('ネットワーク')
              ? 'network'
              : errorMessage.includes('見つかりません')
                ? 'validation'
                : 'unknown',
          message: errorMessage,
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [deletingEmployee, employees, setEmployees]
  );

  // エラーをクリア
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    deletingEmployee,
    isDeleteModalOpen,
    isDeleting,
    error,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    clearError,
  };
}
