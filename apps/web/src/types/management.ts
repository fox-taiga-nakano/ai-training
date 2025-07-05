import { LucideIcon } from 'lucide-react';

// 基本エンティティの型
export interface BaseEntity {
  id: number;
  [key: string]: any;
}

// 統計カードの型
export interface StatisticCard {
  title: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
}

// テーブルカラムの型
export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

// テーブルアクションの型
export interface TableAction<T = any> {
  label: string;
  icon?: LucideIcon;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
  show?: (row: T) => boolean;
}

// フォームフィールドの型
export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'tel'
    | 'number'
    | 'password'
    | 'textarea'
    | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: any; // Zod schema
}

// エンティティ設定の型
export interface EntityConfig<T extends BaseEntity = BaseEntity> {
  // 基本設定
  name: string;
  namePlural: string;

  // 統計設定
  statistics: StatisticCard[];

  // テーブル設定
  columns: TableColumn<T>[];
  actions: TableAction<T>[];
  searchPlaceholder: string;

  // フォーム設定
  fields: FormField[];

  // API設定
  apiEndpoint: string;

  // その他の設定
  allowCreate?: boolean;
  allowEdit?: boolean;
  allowDelete?: boolean;
  allowDetail?: boolean;

  // カスタム関数
  formatters?: {
    [key: string]: (value: any, row: T) => React.ReactNode;
  };
}

// CRUD操作の型
export interface CrudOperations<T extends BaseEntity = BaseEntity> {
  create: (data: Omit<T, 'id'>) => Promise<T>;
  read: (id: number) => Promise<T>;
  update: (id: number, data: Partial<T>) => Promise<T>;
  delete: (id: number) => Promise<void>;
  list: (params?: any) => Promise<T[]>;
}

// フィルターの型
export interface Filter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
}

// ページネーションの型
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 詳細シートのセクション型
export interface DetailSection<T = any> {
  title: string;
  description?: string;
  fields: Array<{
    label: string;
    key: string;
    formatter?: (value: any, row: T) => React.ReactNode;
  }>;
}

// 関連データの型
export interface RelatedData<T = any> {
  title: string;
  description?: string;
  data: T[];
  columns: TableColumn<T>[];
  emptyMessage?: string;
}

// 商品関連の型定義
export interface Product extends BaseEntity {
  code: string;
  name: string;
  category: string;
  categoryId: number;
  supplier: string;
  supplierId: number;
  retailPrice: number;
  purchasePrice: number;
  stock: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category extends BaseEntity {
  name: string;
  _count?: {
    products: number;
  };
}

export interface Supplier extends BaseEntity {
  code: string;
  name: string;
  email: string;
  phoneNumber: string;
  _count?: {
    products: number;
    purchaseOrders: number;
  };
}

// 注文関連の型定義
export interface Order extends BaseEntity {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  shippingFee: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  orderDate: string;
  desiredArrivalDate?: string;
  shippingAddress: string;
  notes?: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELED';
export type PaymentStatus = 'UNPAID' | 'AUTHORIZED' | 'PAID' | 'REFUNDED';

// 顧客関連の型定義
export interface Customer extends BaseEntity {
  name: string;
  email: string;
  _count?: {
    orders: number;
  };
  createdAt?: string;
  lastOrderAt?: string;
}

export interface OrderHistory {
  id: number;
  orderNumber: string;
  totalAmount: number;
  orderDate: string;
  orderStatus: string;
}

// ステータス管理の型定義
export interface StatusConfig {
  [key: string]: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

// バリデーションスキーマの型
export interface ValidationSchema {
  [fieldName: string]: any; // Zod schema type
}

// API操作の結果型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ダッシュボード統計の型
export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  lowStockProducts: number;
  pendingOrders: number;
  newCustomers: number;
}
