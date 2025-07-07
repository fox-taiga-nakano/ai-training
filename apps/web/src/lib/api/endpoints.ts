/**
 * API エンドポイント定義
 * バックエンドのNestJSルートと対応
 */

export const API_ENDPOINTS = {
  // 商品関連
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: number) => `/products/${id}`,
    CATEGORIES: '/products/categories',
    SUPPLIERS: '/products/suppliers',
    SEARCH: '/products',
  },

  // サプライヤー関連
  SUPPLIERS: {
    BASE: '/suppliers',
    BY_ID: (id: number) => `/suppliers/${id}`,
  },

  // 注文関連
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: number) => `/orders/${id}`,
    SEARCH: '/orders',
  },

  // カテゴリ関連
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: number) => `/categories/${id}`,
  },

  // ユーザー関連
  USERS: {
    BASE: '/users',
    BY_ID: (id: number) => `/users/${id}`,
  },

  // サイト関連
  SITES: {
    BASE: '/sites',
    BY_ID: (id: number) => `/sites/${id}`,
  },

  // ショップ関連
  SHOPS: {
    BASE: '/shops',
    BY_ID: (id: number) => `/shops/${id}`,
  },

  // 決済方法関連
  PAYMENT_METHODS: {
    BASE: '/payment-methods',
    BY_ID: (id: number) => `/payment-methods/${id}`,
  },

  // 決済情報関連
  PAYMENT_INFO: {
    BASE: '/payment-info',
    BY_ID: (id: number) => `/payment-info/${id}`,
  },

  // 配送方法関連
  DELIVERY_METHODS: {
    BASE: '/delivery-methods',
    BY_ID: (id: number) => `/delivery-methods/${id}`,
  },

  // 配送時間帯関連
  DELIVERY_SLOTS: {
    BASE: '/delivery-slots',
    BY_ID: (id: number) => `/delivery-slots/${id}`,
  },

  // 配送先住所関連
  SHIPPING_ADDRESSES: {
    BASE: '/shipping-addresses',
    BY_ID: (id: number) => `/shipping-addresses/${id}`,
  },

  // 配送関連
  SHIPMENTS: {
    BASE: '/shipments',
    BY_ID: (id: number) => `/shipments/${id}`,
  },
} as const;

// エンドポイント型推論用のヘルパー型
export type ApiEndpoint = typeof API_ENDPOINTS;
export type EndpointKey = keyof ApiEndpoint;
