/**
 * カテゴリ管理用のSWRカスタムフック
 */
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiHookOptions,
  Category,
  CreateCategoryDto,
  QueryParams,
  UpdateCategoryDto,
} from '@/lib/api/types';

/**
 * カテゴリ一覧取得フック
 */
export function useCategories(params?: QueryParams, options?: ApiHookOptions) {
  const key = params
    ? [API_ENDPOINTS.CATEGORIES.BASE, params]
    : API_ENDPOINTS.CATEGORIES.BASE;

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const categories = await apiClient.get<Category[]>(
        API_ENDPOINTS.CATEGORIES.BASE,
        params as Record<string, string | number>
      );
      return categories;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval,
      // onSuccess: options?.onSuccess,
      // onError: options?.onError,
    }
  );

  return {
    categories: data || [],
    isLoading,
    error,
    revalidate,
  };
}

/**
 * カテゴリ詳細取得フック
 */
export function useCategory(id: number, options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    id ? API_ENDPOINTS.CATEGORIES.BY_ID(id) : null,
    async () => {
      const category = await apiClient.get<Category>(
        API_ENDPOINTS.CATEGORIES.BY_ID(id)
      );
      return category;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval,
      // onSuccess: options?.onSuccess,
      // onError: options?.onError,
    }
  );

  return {
    category: data,
    isLoading,
    error,
    revalidate,
  };
}

/**
 * カテゴリ作成フック
 */
export function useCreateCategory() {
  const createCategory = async (
    categoryData: CreateCategoryDto
  ): Promise<Category> => {
    try {
      const newCategory = await apiClient.post<Category, CreateCategoryDto>(
        API_ENDPOINTS.CATEGORIES.BASE,
        categoryData
      );

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.CATEGORIES.BASE);
      // 商品用のカテゴリ一覧も更新
      await mutate(API_ENDPOINTS.PRODUCTS.CATEGORIES);

      toast.success('カテゴリを作成しました');
      return newCategory;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'カテゴリの作成に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { createCategory };
}

/**
 * カテゴリ更新フック
 */
export function useUpdateCategory() {
  const updateCategory = async (
    id: number,
    categoryData: UpdateCategoryDto
  ): Promise<Category> => {
    try {
      const updatedCategory = await apiClient.patch<
        Category,
        UpdateCategoryDto
      >(API_ENDPOINTS.CATEGORIES.BY_ID(id), categoryData);

      // 個別カテゴリとカテゴリ一覧のキャッシュを無効化
      await mutate(API_ENDPOINTS.CATEGORIES.BY_ID(id));
      await mutate(API_ENDPOINTS.CATEGORIES.BASE);
      // 商品用のカテゴリ一覧も更新
      await mutate(API_ENDPOINTS.PRODUCTS.CATEGORIES);

      toast.success('カテゴリ情報を更新しました');
      return updatedCategory;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'カテゴリの更新に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { updateCategory };
}

/**
 * カテゴリ削除フック
 */
export function useDeleteCategory() {
  const deleteCategory = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id));

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.CATEGORIES.BASE);
      // 商品用のカテゴリ一覧も更新
      await mutate(API_ENDPOINTS.PRODUCTS.CATEGORIES);

      toast.success('カテゴリを削除しました');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'カテゴリの削除に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { deleteCategory };
}

/**
 * カテゴリ検索フック
 */
export function useSearchCategories(
  searchTerm: string,
  options?: ApiHookOptions
) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    searchTerm ? [API_ENDPOINTS.CATEGORIES.BASE, { search: searchTerm }] : null,
    async () => {
      const categories = await apiClient.get<Category[]>(
        API_ENDPOINTS.CATEGORIES.BASE,
        {
          search: searchTerm,
        } as Record<string, string | number>
      );
      return categories;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval,
      // onSuccess: options?.onSuccess,
      // onError: options?.onError,
    }
  );

  return {
    categories: data || [],
    isLoading,
    error,
    revalidate,
  };
}
