/**
 * ユーザー管理用のSWRカスタムフック
 */
import { toast } from 'sonner';
import useSWR, { mutate } from 'swr';

import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type {
  ApiHookOptions,
  CreateUserDto,
  QueryParams,
  UpdateUserDto,
  User,
} from '@/lib/api/types';

/**
 * ユーザー一覧取得フック
 */
export function useUsers(params?: QueryParams, options?: ApiHookOptions) {
  const key = params
    ? [API_ENDPOINTS.USERS.BASE, params]
    : API_ENDPOINTS.USERS.BASE;

  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    key,
    async () => {
      const users = await apiClient.get<User[]>(
        API_ENDPOINTS.USERS.BASE,
        params as Record<string, string | number>
      );
      return users;
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
    users: data || [],
    isLoading,
    error,
    revalidate,
  };
}

/**
 * ユーザー詳細取得フック
 */
export function useUser(id: number, options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    id ? API_ENDPOINTS.USERS.BY_ID(id) : null,
    async () => {
      const user = await apiClient.get<User>(API_ENDPOINTS.USERS.BY_ID(id));
      return user;
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
    user: data,
    isLoading,
    error,
    revalidate,
  };
}

/**
 * ユーザー作成フック
 */
export function useCreateUser() {
  const createUser = async (userData: CreateUserDto): Promise<User> => {
    try {
      const newUser = await apiClient.post<User, CreateUserDto>(
        API_ENDPOINTS.USERS.BASE,
        userData
      );

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.USERS.BASE);

      toast.success('ユーザーを作成しました');
      return newUser;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'ユーザーの作成に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { createUser };
}

/**
 * ユーザー更新フック
 */
export function useUpdateUser() {
  const updateUser = async (
    id: number,
    userData: UpdateUserDto
  ): Promise<User> => {
    try {
      const updatedUser = await apiClient.patch<User, UpdateUserDto>(
        API_ENDPOINTS.USERS.BY_ID(id),
        userData
      );

      // 個別ユーザーとユーザー一覧のキャッシュを無効化
      await mutate(API_ENDPOINTS.USERS.BY_ID(id));
      await mutate(API_ENDPOINTS.USERS.BASE);

      toast.success('ユーザー情報を更新しました');
      return updatedUser;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'ユーザーの更新に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { updateUser };
}

/**
 * ユーザー削除フック
 */
export function useDeleteUser() {
  const deleteUser = async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.USERS.BY_ID(id));

      // キャッシュを無効化して再取得
      await mutate(API_ENDPOINTS.USERS.BASE);

      toast.success('ユーザーを削除しました');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'ユーザーの削除に失敗しました';
      toast.error(errorMessage);
      throw error;
    }
  };

  return { deleteUser };
}

/**
 * ユーザー検索フック
 */
export function useSearchUsers(searchTerm: string, options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    searchTerm ? [API_ENDPOINTS.USERS.BASE, { search: searchTerm }] : null,
    async () => {
      const users = await apiClient.get<User[]>(API_ENDPOINTS.USERS.BASE, {
        search: searchTerm,
      } as Record<string, string | number>);
      return users;
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
    users: data || [],
    isLoading,
    error,
    revalidate,
  };
}

/**
 * ユーザー注文履歴取得フック
 */
export function useUserOrders(userId: number, options?: ApiHookOptions) {
  const {
    data,
    error,
    isLoading,
    mutate: revalidate,
  } = useSWR(
    userId ? [API_ENDPOINTS.ORDERS.BASE, { userId }] : null,
    async () => {
      const orders = await apiClient.get<any[]>(API_ENDPOINTS.ORDERS.BASE, {
        userId,
      } as Record<string, string | number>);
      return orders;
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
    orders: data || [],
    isLoading,
    error,
    revalidate,
  };
}
