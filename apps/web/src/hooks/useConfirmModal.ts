import { useCallback, useState } from 'react';

import type { ConfirmData } from '@/components/confirm-modal';

// フック戻り値の型定義
interface UseConfirmModalReturn {
  isOpen: boolean;
  isLoading: boolean;
  data: ConfirmData | null;
  openConfirm: (
    data: ConfirmData,
    onConfirm: () => Promise<void> | void
  ) => void;
  closeConfirm: () => void;
  executeConfirm: () => Promise<void>;
}

/**
 * 確認モーダルを管理するカスタムフック
 * - 状態管理の一元化
 * - 型安全性の確保
 * - 再利用可能な設計
 */
export function useConfirmModal(): UseConfirmModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ConfirmData | null>(null);
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    (() => Promise<void> | void) | null
  >(null);

  // 確認モーダルを開く
  const openConfirm = useCallback(
    (confirmData: ConfirmData, onConfirm: () => Promise<void> | void) => {
      setData(confirmData);
      setOnConfirmCallback(() => onConfirm);
      setIsOpen(true);
    },
    []
  );

  // 確認モーダルを閉じる
  const closeConfirm = useCallback(() => {
    if (isLoading) return; // 処理中はモーダルを閉じられない

    setIsOpen(false);
    setData(null);
    setOnConfirmCallback(null);
  }, [isLoading]);

  // 確認処理を実行
  const executeConfirm = useCallback(async () => {
    if (!onConfirmCallback) return;

    setIsLoading(true);
    try {
      await onConfirmCallback();
      closeConfirm();
    } catch (error) {
      console.error('確認処理エラー:', error);
      // エラーは呼び出し元で処理される
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [onConfirmCallback, closeConfirm]);

  return {
    isOpen,
    isLoading,
    data,
    openConfirm,
    closeConfirm,
    executeConfirm,
  };
}
