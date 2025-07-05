/**
 * 注文管理用のSWRカスタムフック
 */
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiHookOptions,
  CreateOrderDto,
  Order,
  OrderStatus,
  QueryParams,
  UpdateOrderDto,
} from '@/lib/api/types';

/**
 * 注文一覧取得フック
 */
export function useOrders(params?: QueryParams, options?: ApiHookOptions) {
  const key = params
    ? [API_ENDPOINTS.ORDERS.BASE, params]
    : API_ENDPOINTS.ORDERS.BASE;

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const orders = await apiClient.get<Order[]>(
        API_ENDPOINTS.ORDERS.BASE,
        params as Record<string, string | number>
      );
      return orders;
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
    orders: data || [],
    isLoading,
    error,
    revalidate,
  };
}

/**
 * 注文詳細取得フック
 */
export function useOrder(id: number, options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    id ? API_ENDPOINTS.ORDERS.BY_ID(id) : null,
    async () => {
      const order = await apiClient.get<Order>(API_ENDPOINTS.ORDERS.BY_ID(id));
      return order;
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
    order: data,
    isLoading,
    error,
    revalidate,
  };
}

/**
 * 注文作成フック
 */
export function useCreateOrder() {
  const createOrder = async (orderData: CreateOrderDto): Promise<Order> => {
    try {
      const newOrder = await apiClient.post<Order, CreateOrderDto>(
        API_ENDPOINTS.ORDERS.BASE,
        orderData
      );

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.ORDERS.BASE);

      toast.success('注文を作成しました');
      return newOrder;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '注文の作成に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { createOrder };
}

/**
 * 注文更新フック
 */
export function useUpdateOrder() {
  const updateOrder = async (
    id: number,
    orderData: UpdateOrderDto
  ): Promise<Order> => {
    try {
      const updatedOrder = await apiClient.patch<Order, UpdateOrderDto>(
        API_ENDPOINTS.ORDERS.BY_ID(id),
        orderData
      );

      // 個別注文と注文一覧のキャッシュを無効化
      await mutate(API_ENDPOINTS.ORDERS.BY_ID(id));
      await mutate(API_ENDPOINTS.ORDERS.BASE);

      toast.success('注文情報を更新しました');
      return updatedOrder;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '注文の更新に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { updateOrder };
}

/**
 * 注文ステータス更新フック
 */
export function useUpdateOrderStatus() {
  const updateOrderStatus = async (
    id: number,
    status: OrderStatus
  ): Promise<Order> => {
    try {
      const updatedOrder = await apiClient.patch<
        Order,
        { orderStatus: OrderStatus }
      >(API_ENDPOINTS.ORDERS.BY_ID(id), { orderStatus: status });

      // キャッシュを無効化
      await mutate(API_ENDPOINTS.ORDERS.BY_ID(id));
      await mutate(API_ENDPOINTS.ORDERS.BASE);

      toast.success('注文ステータスを更新しました');
      return updatedOrder;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '注文ステータスの更新に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { updateOrderStatus };
}

/**
 * 注文削除フック
 */
export function useDeleteOrder() {
  const deleteOrder = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.ORDERS.BY_ID(id));

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.ORDERS.BASE);

      toast.success('注文を削除しました');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '注文の削除に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { deleteOrder };
}

/**
 * 注文検索フック
 */
export function useSearchOrders(searchTerm: string, options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    searchTerm ? [API_ENDPOINTS.ORDERS.SEARCH, { search: searchTerm }] : null,
    async () => {
      const orders = await apiClient.get<Order[]>(API_ENDPOINTS.ORDERS.SEARCH, {
        search: searchTerm,
      });
      return orders;
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
    orders: data || [],
    isLoading,
    error,
    revalidate,
  };
}

/**
 * ステータス別注文取得フック
 */
export function useOrdersByStatus(
  status: OrderStatus,
  options?: ApiHookOptions
) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    status ? [API_ENDPOINTS.ORDERS.BASE, { status }] : null,
    async () => {
      const orders = await apiClient.get<Order[]>(API_ENDPOINTS.ORDERS.BASE, {
        status,
      });
      return orders;
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
    orders: data || [],
    isLoading,
    error,
    revalidate,
  };
}

/**
 * 顧客別注文履歴取得フック
 */
export function useCustomerOrders(userId: number, options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    userId ? [API_ENDPOINTS.ORDERS.BASE, { userId }] : null,
    async () => {
      const orders = await apiClient.get<Order[]>(API_ENDPOINTS.ORDERS.BASE, {
        userId,
      });
      return orders;
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
    orders: data || [],
    isLoading,
    error,
    revalidate,
  };
}
