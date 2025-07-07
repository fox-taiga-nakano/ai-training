import { IsDecimal, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePaymentInfoDto {
  @IsInt()
  orderId: number;

  @IsInt()
  siteId: number;

  @IsDecimal()
  paymentAmount: number;

  @IsOptional()
  @IsString()
  transactionId?: string;
}
