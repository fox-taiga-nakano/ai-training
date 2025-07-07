import { IsInt, IsString } from 'class-validator';

export class CreateShopDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsInt()
  siteId: number;
}
