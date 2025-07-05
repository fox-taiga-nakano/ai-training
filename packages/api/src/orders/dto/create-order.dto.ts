export class CreateOrderDto {
  siteId: number;
  shopId: number;
  userId: number;
  totalAmount: number;
  shippingFee: number;
  discountAmount: number;
  billingAmount: number;
  paymentMethodId: number;
  deliveryMethodId: number;
  deliverySlotId?: number;
  desiredArrivalDate?: Date;
  memo?: string;
  items: CreateOrderItemDto[];
  shippingAddress: CreateShippingAddressDto;
}

export class CreateOrderItemDto {
  productId: number;
  quantity: number;
  unitPrice: number;
  memo?: string;
}

export class CreateShippingAddressDto {
  name: string;
  postalCode: string;
  prefecture: string;
  addressLine: string;
}

export class UpdateOrderDto {
  siteId?: number;
  shopId?: number;
  userId?: number;
  totalAmount?: number;
  shippingFee?: number;
  discountAmount?: number;
  billingAmount?: number;
  paymentMethodId?: number;
  deliveryMethodId?: number;
  deliverySlotId?: number;
  desiredArrivalDate?: Date;
  memo?: string;
}
