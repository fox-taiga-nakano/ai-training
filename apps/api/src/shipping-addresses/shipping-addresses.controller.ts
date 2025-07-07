import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateShippingAddressDto } from '@repo/api/shipping-addresses/dto/create-shipping-address.dto';
import { UpdateShippingAddressDto } from '@repo/api/shipping-addresses/dto/update-shipping-address.dto';
import type { ShippingAddress } from '@repo/database';

import { ShippingAddressesService } from './shipping-addresses.service';

@Controller('shipping-addresses')
export class ShippingAddressesController {
  constructor(
    private readonly shippingAddressesService: ShippingAddressesService
  ) {}

  @Post()
  async create(
    @Body() createShippingAddressDto: CreateShippingAddressDto
  ): Promise<ShippingAddress> {
    return this.shippingAddressesService.create(createShippingAddressDto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('prefecture') prefecture?: string,
    @Query('postalCode') postalCode?: string
  ): Promise<ShippingAddress[]> {
    if (prefecture) {
      return this.shippingAddressesService.findByPrefecture(prefecture);
    }
    if (postalCode) {
      return this.shippingAddressesService.findByPostalCode(postalCode);
    }
    if (search) {
      return this.shippingAddressesService.searchShippingAddresses(search);
    }
    return this.shippingAddressesService.findAll();
  }

  @Get('prefectures')
  async getPrefectures(): Promise<
    Array<{ prefecture: string; count: number }>
  > {
    return this.shippingAddressesService.getPrefectures();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number
  ): Promise<ShippingAddress> {
    return this.shippingAddressesService.findOne(id);
  }

  @Get(':id/shipments')
  async getAddressShipments(
    @Param('id', ParseIntPipe) id: number
  ): Promise<any[]> {
    return this.shippingAddressesService.getAddressShipments(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShippingAddressDto: UpdateShippingAddressDto
  ): Promise<ShippingAddress> {
    return this.shippingAddressesService.update(id, updateShippingAddressDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.shippingAddressesService.remove(id);
  }
}
