import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SiteStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export class CreateSiteDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(SiteStatus)
  status?: SiteStatus;
}
