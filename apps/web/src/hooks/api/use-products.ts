/**
 * 商品管理用のSWRカスタムフック
 */
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiHookOptions,
  Category,
  CreateProductDto,
  Product,
  QueryParams,
  Supplier,
  UpdateProductDto,
} from '@/lib/api/types';

/**
 * 商品一覧取得フック
 */
export function useProducts(params?: QueryParams, options?: ApiHookOptions) {
  const key = params
    ? [API_ENDPOINTS.PRODUCTS.BASE, params]
    : API_ENDPOINTS.PRODUCTS.BASE;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const products = await apiClient.get<Product[]>(
        API_ENDPOINTS.PRODUCTS.BASE,
        params as Record<string, string | number>
      );
      return products;
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
    products: data || [],
    isLoading: isLoading || (!data && isValidating),
    error,
    revalidate,
  };
}
/**
 * 商品詳細取得フック
 */
export function useProduct(id: number, options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    id ? API_ENDPOINTS.PRODUCTS.BY_ID(id) : null,
    async () => {
      const product = await apiClient.get<Product>(
        API_ENDPOINTS.PRODUCTS.BY_ID(id)
      );
      return product;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval,
    }
  );

  return {
    product: data,
    isLoading,
    error,
    revalidate,
  };
}

/**
 * カテゴリ一覧取得フック
 */
export function useCategories(options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    API_ENDPOINTS.PRODUCTS.CATEGORIES,
    async () => {
      const categories = await apiClient.get<Category[]>(
        API_ENDPOINTS.PRODUCTS.CATEGORIES
      );
      return categories;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval,
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
 * サプライヤー一覧取得フック（商品作成用）
 */
export function useProductSuppliers(options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    API_ENDPOINTS.PRODUCTS.SUPPLIERS,
    async () => {
      const suppliers = await apiClient.get<Supplier[]>(
        API_ENDPOINTS.PRODUCTS.SUPPLIERS
      );
      return suppliers;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval,
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
 * 商品作成フック
 */
export function useCreateProduct() {
  const createProduct = async (
    productData: CreateProductDto
  ): Promise<Product> => {
    try {
      const newProduct = await apiClient.post<Product, CreateProductDto>(
        API_ENDPOINTS.PRODUCTS.BASE,
        productData
      );

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.PRODUCTS.BASE);

      toast.success('商品を作成しました');
      return newProduct;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '商品の作成に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { createProduct };
}

/**
 * 商品更新フック
 */
export function useUpdateProduct() {
  const updateProduct = async (
    id: number,
    productData: UpdateProductDto
  ): Promise<Product> => {
    try {
      const updatedProduct = await apiClient.patch<Product, UpdateProductDto>(
        API_ENDPOINTS.PRODUCTS.BY_ID(id),
        productData
      );

      // 個別商品と商品一覧のキャッシュを無効化
      await mutate(API_ENDPOINTS.PRODUCTS.BY_ID(id));
      await mutate(API_ENDPOINTS.PRODUCTS.BASE);

      toast.success('商品情報を更新しました');
      return updatedProduct;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '商品の更新に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { updateProduct };
}

/**
 * 商品削除フック
 */
export function useDeleteProduct() {
  const deleteProduct = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.PRODUCTS.BASE);

      toast.success('商品を削除しました');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '商品の削除に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { deleteProduct };
}

/**
 * 商品検索フック
 */
export function useSearchProducts(
  searchTerm: string,
  options?: ApiHookOptions
) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    searchTerm ? [API_ENDPOINTS.PRODUCTS.SEARCH, { search: searchTerm }] : null,
    async () => {
      const products = await apiClient.get<Product[]>(
        API_ENDPOINTS.PRODUCTS.SEARCH,
        {
          search: searchTerm,
        }
      );
      return products;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval,
    }
  );

  return {
    products: data || [],
    isLoading,
    error,
    revalidate,
  };
}

/**
 * カテゴリ別商品取得フック
 */
export function useProductsByCategory(
  categoryId: number,
  options?: ApiHookOptions
) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    categoryId ? [API_ENDPOINTS.PRODUCTS.BASE, { categoryId }] : null,
    async () => {
      const products = await apiClient.get<Product[]>(
        API_ENDPOINTS.PRODUCTS.BASE,
        {
          categoryId,
        }
      );
      return products;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval,
    }
  );

  return {
    products: data || [],
    isLoading,
    error,
    revalidate,
  };
}
