/**
 * 設定管理用のSWRカスタムフック
 */
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { ApiHookOptions, QueryParams } from '@/lib/api/types';

// 一般設定の型定義
export interface GeneralSettings {
  id: number;
  siteName: string;
  siteDescription?: string;
  siteUrl?: string;
  companyName: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  timezone: string;
  currency: string;
  language: string;
  dateFormat: string;
  enableUserRegistration: boolean;
  enableNotifications: boolean;
  maintenanceMode: boolean;
  enableAnalytics: boolean;
  adminEmail: string;
  enableOrderNotification: boolean;
  enableInventoryAlert: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateGeneralSettingsDto {
  siteName?: string;
  siteDescription?: string;
  siteUrl?: string;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  timezone?: string;
  currency?: string;
  language?: string;
  dateFormat?: string;
  enableUserRegistration?: boolean;
  enableNotifications?: boolean;
  maintenanceMode?: boolean;
  enableAnalytics?: boolean;
  adminEmail?: string;
  enableOrderNotification?: boolean;
  enableInventoryAlert?: boolean;
}

// 配送方法の型定義
export interface DeliveryMethod {
  id: number;
  name: string;
  code: string;
  type: string;
  basePrice: number;
  freeShippingThreshold?: number;
  active: boolean;
  description?: string;
  estimatedDays?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDeliveryMethodDto {
  name: string;
  code: string;
  type: string;
  basePrice: number;
  freeShippingThreshold?: number;
  active?: boolean;
  description?: string;
  estimatedDays?: number;
}

export interface UpdateDeliveryMethodDto {
  name?: string;
  code?: string;
  type?: string;
  basePrice?: number;
  freeShippingThreshold?: number;
  active?: boolean;
  description?: string;
  estimatedDays?: number;
}

// 支払い方法の型定義
export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  provider?: string;
  active: boolean;
  testMode: boolean;
  feeType: 'PERCENTAGE' | 'FIXED';
  feeAmount: number;
  apiKey?: string;
  secretKey?: string;
  webhookUrl?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePaymentMethodDto {
  name: string;
  code: string;
  provider?: string;
  active?: boolean;
  testMode?: boolean;
  feeType: 'PERCENTAGE' | 'FIXED';
  feeAmount: number;
  apiKey?: string;
  secretKey?: string;
  webhookUrl?: string;
  description?: string;
}

export interface UpdatePaymentMethodDto {
  name?: string;
  code?: string;
  provider?: string;
  active?: boolean;
  testMode?: boolean;
  feeType?: 'PERCENTAGE' | 'FIXED';
  feeAmount?: number;
  apiKey?: string;
  secretKey?: string;
  webhookUrl?: string;
  description?: string;
}

/**
 * 一般設定取得フック
 */
export function useGeneralSettings(options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    '/settings/general',
    async () => {
      const settings =
        await apiClient.get<GeneralSettings>('/settings/general');
      return settings;
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
    settings: data,
    isLoading,
    error,
    revalidate,
  };
}

/**
 * 一般設定更新フック
 */
export function useUpdateGeneralSettings() {
  const updateSettings = async (
    settingsData: UpdateGeneralSettingsDto
  ): Promise<GeneralSettings> => {
    try {
      const updatedSettings = await apiClient.patch<
        GeneralSettings,
        UpdateGeneralSettingsDto
      >('/settings/general', settingsData);

      // キャッシュを無効化
      await mutate('/settings/general');

      toast.success('設定を更新しました');
      return updatedSettings;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '設定の更新に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { updateSettings };
}

/**
 * 配送方法一覧取得フック
 */
export function useDeliveryMethods(
  params?: QueryParams,
  options?: ApiHookOptions
) {
  const key = params
    ? [API_ENDPOINTS.DELIVERY_METHODS.BASE, params]
    : API_ENDPOINTS.DELIVERY_METHODS.BASE;

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const methods = await apiClient.get<DeliveryMethod[]>(
        API_ENDPOINTS.DELIVERY_METHODS.BASE,
        params as Record<string, string | number>
      );
      return methods;
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
    deliveryMethods: data || [],
    isLoading,
    error,
    revalidate,
  };
}

/**
 * 配送方法作成フック
 */
export function useCreateDeliveryMethod() {
  const createDeliveryMethod = async (
    methodData: CreateDeliveryMethodDto
  ): Promise<DeliveryMethod> => {
    try {
      const newMethod = await apiClient.post<
        DeliveryMethod,
        CreateDeliveryMethodDto
      >(API_ENDPOINTS.DELIVERY_METHODS.BASE, methodData);

      // キャッシュを無効化
      await mutate(API_ENDPOINTS.DELIVERY_METHODS.BASE);

      toast.success('配送方法を作成しました');
      return newMethod;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '配送方法の作成に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { createDeliveryMethod };
}

/**
 * 配送方法更新フック
 */
export function useUpdateDeliveryMethod() {
  const updateDeliveryMethod = async (
    id: number,
    methodData: UpdateDeliveryMethodDto
  ): Promise<DeliveryMethod> => {
    try {
      const updatedMethod = await apiClient.patch<
        DeliveryMethod,
        UpdateDeliveryMethodDto
      >(API_ENDPOINTS.DELIVERY_METHODS.BY_ID(id), methodData);

      // キャッシュを無効化
      await mutate(API_ENDPOINTS.DELIVERY_METHODS.BY_ID(id));
      await mutate(API_ENDPOINTS.DELIVERY_METHODS.BASE);

      toast.success('配送方法を更新しました');
      return updatedMethod;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '配送方法の更新に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { updateDeliveryMethod };
}

/**
 * 配送方法削除フック
 */
export function useDeleteDeliveryMethod() {
  const deleteDeliveryMethod = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.DELIVERY_METHODS.BY_ID(id));

      // キャッシュを無効化
      await mutate(API_ENDPOINTS.DELIVERY_METHODS.BASE);

      toast.success('配送方法を削除しました');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '配送方法の削除に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { deleteDeliveryMethod };
}

/**
 * 支払い方法一覧取得フック
 */
export function usePaymentMethods(
  params?: QueryParams,
  options?: ApiHookOptions
) {
  const key = params
    ? [API_ENDPOINTS.PAYMENT_METHODS.BASE, params]
    : API_ENDPOINTS.PAYMENT_METHODS.BASE;

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const methods = await apiClient.get<PaymentMethod[]>(
        API_ENDPOINTS.PAYMENT_METHODS.BASE,
        params as Record<string, string | number>
      );
      return methods;
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
    paymentMethods: data || [],
    isLoading,
    error,
    revalidate,
  };
}

/**
 * 支払い方法作成フック
 */
export function useCreatePaymentMethod() {
  const createPaymentMethod = async (
    methodData: CreatePaymentMethodDto
  ): Promise<PaymentMethod> => {
    try {
      const newMethod = await apiClient.post<
        PaymentMethod,
        CreatePaymentMethodDto
      >(API_ENDPOINTS.PAYMENT_METHODS.BASE, methodData);

      // キャッシュを無効化
      await mutate(API_ENDPOINTS.PAYMENT_METHODS.BASE);

      toast.success('支払い方法を作成しました');
      return newMethod;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '支払い方法の作成に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { createPaymentMethod };
}

/**
 * 支払い方法更新フック
 */
export function useUpdatePaymentMethod() {
  const updatePaymentMethod = async (
    id: number,
    methodData: UpdatePaymentMethodDto
  ): Promise<PaymentMethod> => {
    try {
      const updatedMethod = await apiClient.patch<
        PaymentMethod,
        UpdatePaymentMethodDto
      >(API_ENDPOINTS.PAYMENT_METHODS.BY_ID(id), methodData);

      // キャッシュを無効化
      await mutate(API_ENDPOINTS.PAYMENT_METHODS.BY_ID(id));
      await mutate(API_ENDPOINTS.PAYMENT_METHODS.BASE);

      toast.success('支払い方法を更新しました');
      return updatedMethod;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '支払い方法の更新に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { updatePaymentMethod };
}

/**
 * 支払い方法削除フック
 */
export function useDeletePaymentMethod() {
  const deletePaymentMethod = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.PAYMENT_METHODS.BY_ID(id));

      // キャッシュを無効化
      await mutate(API_ENDPOINTS.PAYMENT_METHODS.BASE);

      toast.success('支払い方法を削除しました');
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : '支払い方法の削除に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { deletePaymentMethod };
}
