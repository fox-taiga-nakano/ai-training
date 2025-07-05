/**
 * 配送管理用のSWRカスタムフック
 */
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiHookOptions,
  QueryParams,
  ShipmentStatus,
} from '@/lib/api/types';

// 配送アイテムの型定義
export interface ShipmentItem {
  id: number;
  productName: string;
  quantity: number;
  weight?: number;
}

// 配送情報の型定義（型定義ファイルに追加予定）
export interface Shipment {
  id: number;
  trackingNumber?: string;
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  shippingStatus: ShipmentStatus;
  shippingMethod: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  items?: ShipmentItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateShipmentDto {
  orderId: number;
  shippingMethod: string;
  estimatedDeliveryDate?: string;
  notes?: string;
}

export interface UpdateShipmentDto {
  trackingNumber?: string;
  shippingStatus?: ShipmentStatus;
  shippingMethod?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  notes?: string;
}

/**
 * 配送一覧取得フック
 */
export function useShipments(params?: QueryParams, options?: ApiHookOptions) {
  const key = params
    ? [API_ENDPOINTS.SHIPMENTS.BASE, params]
    : API_ENDPOINTS.SHIPMENTS.BASE;

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const shipments = await apiClient.get<Shipment[]>(
        API_ENDPOINTS.SHIPMENTS.BASE,
        params as Record<string, string | number>
      );
      return shipments;
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
    shipments: data || [],
    isLoading,
    error,
    revalidate,
  };
}

/**
 * 配送詳細取得フック
 */
export function useShipment(id: number, options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    id ? API_ENDPOINTS.SHIPMENTS.BY_ID(id) : null,
    async () => {
      const shipment = await apiClient.get<Shipment>(
        API_ENDPOINTS.SHIPMENTS.BY_ID(id)
      );
      return shipment;
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
    shipment: data,
    isLoading,
    error,
    revalidate,
  };
}

/**
 * 配送作成フック
 */
export function useCreateShipment() {
  const createShipment = async (
    shipmentData: CreateShipmentDto
  ): Promise<Shipment> => {
    try {
      const newShipment = await apiClient.post<Shipment, CreateShipmentDto>(
        API_ENDPOINTS.SHIPMENTS.BASE,
        shipmentData
      );

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.SHIPMENTS.BASE);

      toast.success('配送情報を作成しました');
      return newShipment;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '配送情報の作成に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { createShipment };
}

/**
 * 配送更新フック
 */
export function useUpdateShipment() {
  const updateShipment = async (
    id: number,
    shipmentData: UpdateShipmentDto
  ): Promise<Shipment> => {
    try {
      const updatedShipment = await apiClient.patch<
        Shipment,
        UpdateShipmentDto
      >(API_ENDPOINTS.SHIPMENTS.BY_ID(id), shipmentData);

      // 個別配送と配送一覧のキャッシュを無効化
      await mutate(API_ENDPOINTS.SHIPMENTS.BY_ID(id));
      await mutate(API_ENDPOINTS.SHIPMENTS.BASE);

      toast.success('配送情報を更新しました');
      return updatedShipment;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '配送情報の更新に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { updateShipment };
}

/**
 * 配送ステータス更新フック
 */
export function useUpdateShipmentStatus() {
  const updateShipmentStatus = async (
    id: number,
    status: ShipmentStatus
  ): Promise<Shipment> => {
    try {
      const updatedShipment = await apiClient.patch<
        Shipment,
        { shippingStatus: ShipmentStatus }
      >(API_ENDPOINTS.SHIPMENTS.BY_ID(id), { shippingStatus: status });

      // キャッシュを無効化
      await mutate(API_ENDPOINTS.SHIPMENTS.BY_ID(id));
      await mutate(API_ENDPOINTS.SHIPMENTS.BASE);

      toast.success('配送ステータスを更新しました');
      return updatedShipment;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '配送ステータスの更新に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { updateShipmentStatus };
}

/**
 * 配送削除フック
 */
export function useDeleteShipment() {
  const deleteShipment = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.SHIPMENTS.BY_ID(id));

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.SHIPMENTS.BASE);

      toast.success('配送情報を削除しました');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '配送情報の削除に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { deleteShipment };
}

/**
 * 配送検索フック
 */
export function useSearchShipments(
  searchTerm: string,
  options?: ApiHookOptions
) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    searchTerm ? [API_ENDPOINTS.SHIPMENTS.BASE, { search: searchTerm }] : null,
    async () => {
      const shipments = await apiClient.get<Shipment[]>(
        API_ENDPOINTS.SHIPMENTS.BASE,
        {
          search: searchTerm,
        } as Record<string, string | number>
      );
      return shipments;
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
    shipments: data || [],
    isLoading,
    error,
    revalidate,
  };
}
