import { PartialType } from '@nestjs/mapped-types';

import { OrderStatus } from '../entities/order.entity';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

export class UpdateOrderStatusDto {
  orderStatus: OrderStatus;
  memo?: string;
}
