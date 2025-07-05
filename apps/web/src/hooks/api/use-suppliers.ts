/**
 * サプライヤー管理用のSWRカスタムフック
 */
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiHookOptions,
  CreateSupplierDto,
  QueryParams,
  Supplier,
  UpdateSupplierDto,
} from '@/lib/api/types';

/**
 * サプライヤー一覧取得フック
 */
export function useSuppliers(params?: QueryParams, options?: ApiHookOptions) {
  const key = params
    ? [API_ENDPOINTS.SUPPLIERS.BASE, params]
    : API_ENDPOINTS.SUPPLIERS.BASE;

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const suppliers = await apiClient.get<Supplier[]>(
        API_ENDPOINTS.SUPPLIERS.BASE,
        params as Record<string, string | number>
      );
      return suppliers;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval,
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );

  return {
    suppliers: data || [],
    isLoading,
    error,
    revalidate,
  };
}

/**
 * サプライヤー詳細取得フック
 */
export function useSupplier(id: number, options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    id ? API_ENDPOINTS.SUPPLIERS.BY_ID(id) : null,
    async () => {
      const supplier = await apiClient.get<Supplier>(
        API_ENDPOINTS.SUPPLIERS.BY_ID(id)
      );
      return supplier;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval,
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );

  return {
    supplier: data,
    isLoading,
    error,
    revalidate,
  };
}

/**
 * サプライヤー作成フック
 */
export function useCreateSupplier() {
  const createSupplier = async (
    supplierData: CreateSupplierDto
  ): Promise<Supplier> => {
    try {
      const newSupplier = await apiClient.post<Supplier, CreateSupplierDto>(
        API_ENDPOINTS.SUPPLIERS.BASE,
        supplierData
      );

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.SUPPLIERS.BASE);
      // 商品用のサプライヤー一覧も更新
      await mutate(API_ENDPOINTS.PRODUCTS.SUPPLIERS);

      toast.success('サプライヤーを作成しました');
      return newSupplier;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'サプライヤーの作成に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { createSupplier };
}

/**
 * サプライヤー更新フック
 */
export function useUpdateSupplier() {
  const updateSupplier = async (
    id: number,
    supplierData: UpdateSupplierDto
  ): Promise<Supplier> => {
    try {
      const updatedSupplier = await apiClient.patch<
        Supplier,
        UpdateSupplierDto
      >(API_ENDPOINTS.SUPPLIERS.BY_ID(id), supplierData);

      // 個別サプライヤーとサプライヤー一覧のキャッシュを無効化
      await mutate(API_ENDPOINTS.SUPPLIERS.BY_ID(id));
      await mutate(API_ENDPOINTS.SUPPLIERS.BASE);
      // 商品用のサプライヤー一覧も更新
      await mutate(API_ENDPOINTS.PRODUCTS.SUPPLIERS);

      toast.success('サプライヤー情報を更新しました');
      return updatedSupplier;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'サプライヤーの更新に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { updateSupplier };
}

/**
 * サプライヤー削除フック
 */
export function useDeleteSupplier() {
  const deleteSupplier = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.SUPPLIERS.BY_ID(id));

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.SUPPLIERS.BASE);
      // 商品用のサプライヤー一覧も更新
      await mutate(API_ENDPOINTS.PRODUCTS.SUPPLIERS);

      toast.success('サプライヤーを削除しました');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'サプライヤーの削除に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { deleteSupplier };
}

/**
 * サプライヤー検索フック
 */
export function useSearchSuppliers(
  searchTerm: string,
  options?: ApiHookOptions
) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    searchTerm ? [API_ENDPOINTS.SUPPLIERS.BASE, { search: searchTerm }] : null,
    async () => {
      const suppliers = await apiClient.get<Supplier[]>(
        API_ENDPOINTS.SUPPLIERS.BASE,
        {
          search: searchTerm,
        }
      );
      return suppliers;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval,
      onSuccess: options?.onSuccess,
      onError: options?.onError,
    }
  );

  return {
    suppliers: data || [],
    isLoading,
    error,
    revalidate,
  };
}
