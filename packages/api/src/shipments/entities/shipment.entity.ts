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

export class ShippingAddress {
  id: number;
  name: string;
  postalCode: string;
  prefecture: string;
  addressLine: string;
}

export enum ShipmentStatus {
  PREPARING = 'PREPARING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED'
}

export class Order {
  id: number;
  orderNumber: string;
  orderStatus: string;
  orderDate: Date;
}

export class Site {
  id: number;
  code: string;
  name: string;
}

export class Shop {
  id: number;
  name: string;
  code: string;
}

export class DeliverySlot {
  id: number;
  name: string;
  code: string;
}