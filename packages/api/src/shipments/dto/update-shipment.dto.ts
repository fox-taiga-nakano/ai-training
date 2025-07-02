import { PartialType } from '@nestjs/mapped-types';
import { CreateShipmentDto } from './create-shipment.dto';
import { ShipmentStatus } from '../entities/shipment.entity';

export class UpdateShipmentDto extends PartialType(CreateShipmentDto) {}

export class UpdateShipmentStatusDto {
  shippingStatus: ShipmentStatus;
  trackingNumber?: string;
  shippedAt?: Date;
}