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
import { CreateDeliveryMethodDto } from '@repo/api/delivery-methods/dto/create-delivery-method.dto';
import { UpdateDeliveryMethodDto } from '@repo/api/delivery-methods/dto/update-delivery-method.dto';
import type { DeliveryMethod, DeliveryMethodType } from '@repo/database';

import { DeliveryMethodsService } from './delivery-methods.service';

@Controller('delivery-methods')
export class DeliveryMethodsController {
  constructor(
    private readonly deliveryMethodsService: DeliveryMethodsService
  ) {}

  @Post()
  async create(
    @Body() createDeliveryMethodDto: CreateDeliveryMethodDto
  ): Promise<DeliveryMethod> {
    return this.deliveryMethodsService.create(createDeliveryMethodDto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('code') code?: string,
    @Query('type') type?: DeliveryMethodType
  ): Promise<DeliveryMethod[]> {
    if (code) {
      return [await this.deliveryMethodsService.findByCode(code)];
    }
    if (search) {
      return this.deliveryMethodsService.searchDeliveryMethods(search);
    }
    if (type) {
      return this.deliveryMethodsService.findByType(type);
    }
    return this.deliveryMethodsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number
  ): Promise<DeliveryMethod> {
    return this.deliveryMethodsService.findOne(id);
  }

  @Get(':id/slots')
  async getMethodSlots(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.deliveryMethodsService.getMethodSlots(id);
  }

  @Get(':id/orders')
  async getMethodOrders(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.deliveryMethodsService.getMethodOrders(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeliveryMethodDto: UpdateDeliveryMethodDto
  ): Promise<DeliveryMethod> {
    return this.deliveryMethodsService.update(id, updateDeliveryMethodDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.deliveryMethodsService.remove(id);
  }
}
