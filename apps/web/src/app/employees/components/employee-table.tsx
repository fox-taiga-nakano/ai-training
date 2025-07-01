'use client';

import { useCallback, useState } from 'react';

import { createDeleteEmployeeConfirm } from '@/utils/confirm-helpers';
import { Button } from '@repo/components/button';

import { ConfirmModal } from '@/components/confirm-modal';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useEmployeeEdit } from '@/hooks/useEmployeeEdit';

import type { Employee } from '../columns';
import { DataTable } from '../data-table';
import { EmployeeEditModal } from './employee-edit-modal';

interface EmployeeTableProps {
  initialEmployees: Employee[];
  columns: unknown[];
}

/**
 * 社員テーブルコンポーネント（クライアントサイド処理）
 * - 最小限のクライアントサイド処理に限定
 * - 状態管理とインタラクションのみ
 */
export function EmployeeTable({
  initialEmployees,
  columns,
}: EmployeeTableProps) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);

  // カスタムフックで編集機能を管理
  const {
    editingEmployee,
    isEditModalOpen,
    isSubmitting,
    error,
    openEditModal,
    closeEditModal,
    saveEmployee,
    clearError,
  } = useEmployeeEdit(employees, setEmployees);

  // 汎用確認モーダルを管理
  const {
    isOpen: isConfirmOpen,
    isLoading: isConfirmLoading,
    data: confirmData,
    openConfirm,
    closeConfirm,
    executeConfirm,
  } = useConfirmModal();

  // 社員削除処理
  const handleDeleteEmployee = useCallback(
    async (employee: Employee) => {
      const deleteConfirm = createDeleteEmployeeConfirm(employee);
      openConfirm(deleteConfirm, async () => {
        setEmployees((prev) => prev.filter((emp) => emp.id !== employee.id));
      });
    },
    [openConfirm]
  );

  // 編集ボタン付きのカラム定義を作成
  const columnsWithActions = useCallback(() => {
    return columns.map((column) => {
      if (column.id === 'actions') {
        return {
          ...column,
          cell: ({ row }: { row: { original: Employee } }) => (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openEditModal(row.original)}
                disabled={isSubmitting || isConfirmLoading}
                aria-label={`${row.original.name}の情報を編集`}
              >
                編集
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isSubmitting || isConfirmLoading}
                onClick={() => handleDeleteEmployee(row.original)}
                aria-label={`${row.original.name}を削除`}
              >
                削除
              </Button>
            </div>
          ),
        };
      }
      return column;
    });
  }, [openEditModal, isSubmitting, isConfirmLoading, handleDeleteEmployee])();

  return (
    <>
      {/* エラー表示 */}
      {error && error.type !== 'permission' && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950/50">
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {error.message}
          </p>
        </div>
      )}

      <DataTable columns={columnsWithActions} data={employees} />

      <EmployeeEditModal
        employee={editingEmployee}
        isOpen={isEditModalOpen}
        error={error?.message}
        onClose={closeEditModal}
        onSave={saveEmployee}
        onClearError={clearError}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        isLoading={isConfirmLoading}
        data={confirmData}
        onClose={closeConfirm}
        onConfirm={executeConfirm}
      />
    </>
  );
}
