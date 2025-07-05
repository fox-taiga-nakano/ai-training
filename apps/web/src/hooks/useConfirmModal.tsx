import React, { useCallback, useState } from 'react';

import { ConfirmModal } from '@/components/confirm-modal';

// 確認モーダルの設定
interface ConfirmModalConfig {
  type: 'delete' | 'save' | 'cancel' | 'submit' | 'reset' | 'info';
  title: string;
  onConfirm: (id?: any) => Promise<void>;
}

// フック戻り値の型定義
interface UseConfirmModalReturn {
  show: (description: string, details?: string, id?: any) => void;
  modal: React.ReactElement;
}

/**
 * 確認モーダルを管理するカスタムフック
 * 画面での使用方法: confirmDelete.show(description, details, id)
 */
export function useConfirmModal(
  config: ConfirmModalConfig
): UseConfirmModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState<string>('');
  const [currentId, setCurrentId] = useState<any>(null);

  // 確認モーダルを表示
  const show = useCallback((desc: string, detailsText?: string, id?: any) => {
    setDescription(desc);
    setDetails(detailsText || '');
    setCurrentId(id);
    setIsOpen(true);
  }, []);

  // 確認モーダルを閉じる
  const closeConfirm = useCallback(() => {
    if (isLoading) return; // 処理中はモーダルを閉じられない
    setIsOpen(false);
    setDescription('');
    setDetails('');
    setCurrentId(null);
  }, [isLoading]);

  // 確認処理を実行
  const executeConfirm = useCallback(async () => {
    setIsLoading(true);
    try {
      await config.onConfirm(currentId);
      closeConfirm();
    } catch (error) {
      console.error('確認処理エラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [config.onConfirm, currentId, closeConfirm]);

  // モーダルコンポーネントを生成
  const modal = (
    <ConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      data={
        isOpen
          ? {
              title: config.title,
              description: description,
              warnings: details ? [details] : undefined,
              actionType: config.type,
            }
          : null
      }
      onClose={closeConfirm}
      onConfirm={executeConfirm}
    />
  );

  return {
    show,
    modal,
  };
}
