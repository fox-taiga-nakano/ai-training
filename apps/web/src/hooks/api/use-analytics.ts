/**
 * 分析・レポート用のSWRカスタムフック
 */
import { toast } from 'sonner';
import useSWR from 'swr';

import { apiClient } from '@/lib/api/client';
import type { ApiHookOptions } from '@/lib/api/types';

// 売上分析の型定義
export interface SalesAnalytics {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  newCustomers: number;
  returningCustomers: number;
  conversionRate: number;
  topProducts: TopProduct[];
  salesByCategory: CategorySales[];
  dailySales: DailySales[];
  customerSegments?: CustomerSegment[];
}

export interface TopProduct {
  id: number;
  name: string;
  category: string;
  totalSales: number;
  totalQuantity: number;
  revenue: number;
  profit?: number;
  profitMargin?: number;
  rank?: number;
}

export interface CategorySales {
  id: number;
  categoryId: number;
  categoryName: string;
  totalSales: number;
  percentage: number;
  growth: number;
}

export interface DailySales {
  date: string;
  sales: number;
  orders: number;
  customers: number;
}

// 顧客分析の型定義
export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  customerLifetimeValue: number;
  averageOrdersPerCustomer: number;
  topCustomers: TopCustomer[];
  customerSegments: CustomerSegment[];
}

export interface TopCustomer {
  id: number;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export interface CustomerSegment {
  id: number;
  segment: string;
  count: number;
  percentage: number;
  averageValue: number;
}

// 商品分析の型定義
export interface ProductAnalytics {
  totalProducts: number;
  totalCategories: number;
  averagePrice: number;
  topSellingProducts: TopProduct[];
  lowStockProducts: LowStockProduct[];
  categoryPerformance: CategoryPerformance[];
}

export interface LowStockProduct {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  status: 'LOW' | 'OUT_OF_STOCK';
}

export interface CategoryPerformance {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalRevenue: number;
  averagePrice: number;
  topProduct: string;
}

// レポートパラメーター
export interface ReportParams {
  period?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  supplierId?: number;
  compare?: boolean;
}

/**
 * 売上分析取得フック
 */
export function useSalesAnalytics(
  params?: ReportParams,
  options?: ApiHookOptions
) {
  const key = params ? ['/analytics/sales', params] : '/analytics/sales';

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const analytics = await apiClient.get<SalesAnalytics>(
        '/analytics/sales',
        params as Record<string, string | number>
      );
      return analytics;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval ?? 300000, // 5分間隔でリフレッシュ
      // onSuccess: options?.onSuccess,
      // onError: options?.onError,
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    revalidate,
  };
}

/**
 * 顧客分析取得フック
 */
export function useCustomerAnalytics(
  params?: ReportParams,
  options?: ApiHookOptions
) {
  const key = params
    ? ['/analytics/customers', params]
    : '/analytics/customers';

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const analytics = await apiClient.get<CustomerAnalytics>(
        '/analytics/customers',
        params as Record<string, string | number>
      );
      return analytics;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval ?? 300000,
      // onSuccess: options?.onSuccess,
      // onError: options?.onError,
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    revalidate,
  };
}

/**
 * 商品分析取得フック
 */
export function useProductAnalytics(
  params?: ReportParams,
  options?: ApiHookOptions
) {
  const key = params ? ['/analytics/products', params] : '/analytics/products';

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const analytics = await apiClient.get<ProductAnalytics>(
        '/analytics/products',
        params as Record<string, string | number>
      );
      return analytics;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval ?? 300000,
      // onSuccess: options?.onSuccess,
      // onError: options?.onError,
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    revalidate,
  };
}

/**
 * レポートエクスポートフック
 */
export function useExportReport() {
  const exportReport = async (
    type: 'sales' | 'customers' | 'products',
    format: 'csv' | 'excel' | 'pdf',
    params?: ReportParams
  ): Promise<Blob> => {
    try {
      const response = await apiClient.post(`/analytics/export/${type}`, {
        format,
        ...params,
      });

      toast.success('レポートを生成しました');
      return response as unknown as Blob;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'レポートの生成に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { exportReport };
}

/**
 * リアルタイム統計取得フック
 */
export function useRealtimeStats(options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    '/analytics/realtime',
    async () => {
      const stats = await apiClient.get<{
        activeVisitors: number;
        todayOrders: number;
        todayRevenue: number;
        pendingOrders: number;
      }>('/analytics/realtime');
      return stats;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? true,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval ?? 30000, // 30秒間隔
      // onSuccess: options?.onSuccess,
      // onError: options?.onError,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    revalidate,
  };
}

/**
 * ダッシュボード統計取得フック
 */
export function useDashboardStats(
  params?: ReportParams,
  options?: ApiHookOptions
) {
  const key = params
    ? ['/analytics/dashboard', params]
    : '/analytics/dashboard';

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const stats = await apiClient.get<{
        totalRevenue: number;
        totalOrders: number;
        totalCustomers: number;
        totalProducts: number;
        revenueGrowth: number;
        orderGrowth: number;
        customerGrowth: number;
        conversionRate: number;
      }>('/analytics/dashboard', params as Record<string, string | number>);
      return stats;
    },
    {
      revalidateOnFocus: options?.revalidateOnFocus ?? false,
      revalidateOnReconnect: options?.revalidateOnReconnect ?? true,
      refreshInterval: options?.refreshInterval ?? 300000,
      // onSuccess: options?.onSuccess,
      // onError: options?.onError,
    }
  );

  return {
    stats: data,
    isLoading,
    error,
    revalidate,
  };
}
