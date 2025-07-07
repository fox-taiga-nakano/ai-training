import { IsEmail, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phoneNumber: string;
}

export class UpdateSupplierDto {
  @IsString()
  code?: string;

  @IsString()
  name?: string;

  @IsEmail()
  email?: string;

  @IsString()
  phoneNumber?: string;
}
