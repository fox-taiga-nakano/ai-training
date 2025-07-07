import { PartialType } from '@nestjs/mapped-types';

import { CreateShipmentDto } from './create-shipment.dto';

export enum ShipmentStatus {
  PREPARING = 'PREPARING',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  RETURNED = 'RETURNED',
}

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {
  addressId?: number;
  deliverySlotId?: number;
  trackingNumber?: string;
  shippedAt?: Date;
}

export class UpdateShipmentStatusDto {
  shippingStatus: ShipmentStatus;
  trackingNumber?: string;
  shippedAt?: Date;
}
