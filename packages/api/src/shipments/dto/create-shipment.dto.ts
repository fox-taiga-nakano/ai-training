export class CreateShipmentDto {
  orderId: number;
  siteId: number;
  shopId: number;
  addressId: number;
  deliverySlotId?: number;
  trackingNumber?: string;
  shippedAt?: Date;
}
