export class Order {
  id: number;
  siteId: number;
  shopId: number;
  userId: number;
  orderNumber: string;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  billingAmount: number;
  paymentMethodId: number;
  deliveryMethodId: number;
  deliverySlotId?: number;
  orderStatus: OrderStatus;
  orderDate: Date;
  desiredArrivalDate?: Date;
  memo?: string;
  createdAt: Date;
  updatedAt: Date;
  
  site: Site;
  shop: Shop;
  user: User;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  deliverySlot?: DeliverySlot;
  items: OrderItem[];
  payments: PaymentInfo[];
  shipments: Shipment[];
}

export class OrderItem {
  id: number;
  orderId: number;
  productId: number;
  categoryId: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  memo?: string;
  
  order: Order;
  product: Product;
  category: Category;
}

export class PaymentInfo {
  id: number;
  orderId: number;
  siteId: number;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentDate?: Date;
  transactionId?: string;
  
  order: Order;
  site: Site;
}

export class Shipment {
  id: number;
  orderId: number;
  siteId: number;
  shopId: number;
  addressId: number;
  deliverySlotId?: number;
  trackingNumber?: string;
  shippedAt?: Date;
  shippingStatus: ShipmentStatus;
  
  order: Order;
  site: Site;
  shop: Shop;
  address: ShippingAddress;
  deliverySlot?: DeliverySlot;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED'
}

export enum ShipmentStatus {
  PREPARING = 'PREPARING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED'
}

export class Site {
  id: number;
  code: string;
  name: string;
  status: SiteStatus;
}

export class Shop {
  id: number;
  name: string;
  code: string;
  siteId: number;
  
  site: Site;
}

export class User {
  id: number;
  email: string;
  name: string;
}

export class PaymentMethod {
  id: number;
  name: string;
  code: string;
  active: boolean;
}

export class DeliveryMethod {
  id: number;
  name: string;
  code: string;
  type: DeliveryMethodType;
}

export class DeliverySlot {
  id: number;
  deliveryMethodId: number;
  name: string;
  code: string;
  
  deliveryMethod: DeliveryMethod;
}

export class ShippingAddress {
  id: number;
  name: string;
  postalCode: string;
  prefecture: string;
  addressLine: string;
}

export class Product {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  supplierId: number;
  retailPrice: number;
  purchasePrice: number;
}

export class Category {
  id: number;
  name: string;
}

export enum SiteStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}

export enum DeliveryMethodType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  COOL = 'COOL',
  MAIL = 'MAIL'
}