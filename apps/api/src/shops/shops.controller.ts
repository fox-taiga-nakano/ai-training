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
import { CreateShopDto } from '@repo/api/shops/dto/create-shop.dto';
import { UpdateShopDto } from '@repo/api/shops/dto/update-shop.dto';
import type { Shop } from '@repo/database';

import { ShopsService } from './shops.service';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  async create(@Body() createShopDto: CreateShopDto): Promise<Shop> {
    return this.shopsService.create(createShopDto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('code') code?: string,
    @Query('siteId') siteId?: string
  ): Promise<Shop[]> {
    if (code) {
      return [await this.shopsService.findByCode(code)];
    }
    if (search) {
      return this.shopsService.searchShops(search);
    }
    if (siteId) {
      return this.shopsService.findBySite(parseInt(siteId));
    }
    return this.shopsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Shop> {
    return this.shopsService.findOne(id);
  }

  @Get(':id/orders')
  async getShopOrders(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.shopsService.getShopOrders(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShopDto: UpdateShopDto
  ): Promise<Shop> {
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.shopsService.remove(id);
  }
}
