/**
 * API クライアント設定
 * NestJS バックエンドとの通信を管理
 */

// API ベース URL（環境変数または固定値）
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// API クライアントのエラー型定義
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;
}

// HTTPレスポンスラッパー型
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * APIクライアント用の共通fetchラッパー
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * 共通のfetchメソッド
   */
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // レスポンスが空の場合（204 No Content等）
      if (response.status === 204) {
        return undefined as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError({
          message: data.message || 'API request failed',
          statusCode: response.status,
          error: data.error,
          timestamp: data.timestamp,
          path: data.path,
        });
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // ネットワークエラーや予期しないエラー
      throw new ApiError({
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        statusCode: 0,
      });
    }
  }

  /**
   * GET リクエスト
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string | number>
  ): Promise<T> {
    let url = endpoint;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value));
      });
      url += `?${searchParams.toString()}`;
    }

    return this.fetch<T>(url, { method: 'GET' });
  }

  /**
   * POST リクエスト
   */
  async post<T, U = unknown>(endpoint: string, data?: U): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT リクエスト
   */
  async put<T, U = unknown>(endpoint: string, data?: U): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH リクエスト
   */
  async patch<T, U = unknown>(endpoint: string, data?: U): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE リクエスト
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  }
}

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  statusCode: number;
  error?: string;
  timestamp?: string;
  path?: string;

  constructor(errorData: {
    message: string;
    statusCode: number;
    error?: string;
    timestamp?: string;
    path?: string;
  }) {
    super(errorData.message);
    this.statusCode = errorData.statusCode;
    this.error = errorData.error;
    this.timestamp = errorData.timestamp;
    this.path = errorData.path;
    this.name = 'ApiError';
  }
}

// デフォルトのAPIクライアントインスタンス
export const apiClient = new ApiClient();
