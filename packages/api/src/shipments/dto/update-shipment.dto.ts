import { PartialType } from '@nestjs/mapped-types';

import { ShipmentStatus } from '../entities/shipment.entity';
import { CreateShipmentDto } from './create-shipment.dto';

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {}

export class UpdateShipmentStatusDto {
  shippingStatus: ShipmentStatus;
  trackingNumber?: string;
  shippedAt?: Date;
}
