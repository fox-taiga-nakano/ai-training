import { IsString } from 'class-validator';

export class CreateShippingAddressDto {
  @IsString()
  name: string;

  @IsString()
  postalCode: string;

  @IsString()
  prefecture: string;

  @IsString()
  addressLine: string;
}
