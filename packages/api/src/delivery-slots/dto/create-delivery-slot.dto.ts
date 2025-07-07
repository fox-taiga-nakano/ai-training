import { IsInt, IsString } from 'class-validator';

export class CreateDeliverySlotDto {
  @IsInt()
  deliveryMethodId: number;

  @IsString()
  name: string;

  @IsString()
  code: string;
}
