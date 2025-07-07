import { IsEnum, IsString } from 'class-validator';

export enum DeliveryMethodType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  COOL = 'COOL',
  MAIL = 'MAIL',
}

export class CreateDeliveryMethodDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsEnum(DeliveryMethodType)
  type: DeliveryMethodType;
}
