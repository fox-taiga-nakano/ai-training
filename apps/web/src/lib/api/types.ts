/**
 * API関連の型定義
 * @repo/api パッケージの型定義を拡張・使用
 */

// DTOインポート（@repo/apiから）
export type {
  CreateProductDto,
  UpdateProductDto,
} from '@repo/api/products/dto/create-product.dto';
export type {
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@repo/api/suppliers/dto/create-supplier.dto';
export type {
  CreateOrderDto,
  UpdateOrderDto,
} from '@repo/api/orders/dto/create-order.dto';
export type {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@repo/api/categories/dto/create-category.dto';
export type {
  CreateUserDto,
  UpdateUserDto,
} from '@repo/api/users/dto/create-user.dto';

// ページネーション関連の型
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 検索パラメーター
export interface SearchParams {
  search?: string;
  categoryId?: number;
  supplierId?: number;
  status?: string;
}

// ソートパラメーター
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 共通のクエリパラメーター
export interface QueryParams
  extends PaginationParams,
    SearchParams,
    SortParams {}

// エンティティの基本型（各ページで使用されている型と一致）
export interface Product {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  category: {
    id: number;
    name: string;
  };
  supplierId: number;
  supplier: {
    id: number;
    code: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  retailPrice: number;
  purchasePrice: number;
  stock?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Supplier {
  id: number;
  code: string;
  name: string;
  email: string;
  phoneNumber: string;
  _count?: {
    products: number;
    purchaseOrders: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  _count?: {
    products: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  billingAmount: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  deliveryMethod: string;
  orderDate: string;
  desiredArrivalDate?: string;
  memo?: string;
  items: OrderItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  categoryId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  memo?: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  _count?: {
    orders: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

// Enum型定義（Prismaスキーマと一致）
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELED';
export type PaymentStatus = 'UNPAID' | 'AUTHORIZED' | 'PAID' | 'REFUNDED';
export type DeliveryMethodType = 'STANDARD' | 'EXPRESS' | 'COOL' | 'MAIL';
export type ShipmentStatus =
  | 'PREPARING'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'RETURNED';
export type SiteStatus = 'ACTIVE' | 'INACTIVE';

// APIレスポンス統計用の型
export interface Statistics {
  totalCount: number;
  recentCount?: number;
  percentageChange?: number;
}

// APIフックのオプション型
export interface ApiHookOptions {
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  refreshInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}
