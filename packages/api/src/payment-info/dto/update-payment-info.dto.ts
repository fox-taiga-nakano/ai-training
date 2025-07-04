import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';

import { CreatePaymentInfoDto } from './create-payment-info.dto';

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
}

export class UpdatePaymentInfoDto extends PartialType(CreatePaymentInfoDto) {
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;
}
