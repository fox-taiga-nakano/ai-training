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
import { CreateDeliverySlotDto } from '@repo/api/delivery-slots/dto/create-delivery-slot.dto';
import { UpdateDeliverySlotDto } from '@repo/api/delivery-slots/dto/update-delivery-slot.dto';
import type { DeliverySlot } from '@repo/database';

import { DeliverySlotsService } from './delivery-slots.service';

@Controller('delivery-slots')
export class DeliverySlotsController {
  constructor(private readonly deliverySlotsService: DeliverySlotsService) {}

  @Post()
  async create(
    @Body() createDeliverySlotDto: CreateDeliverySlotDto
  ): Promise<DeliverySlot> {
    return this.deliverySlotsService.create(createDeliverySlotDto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('deliveryMethodId') deliveryMethodId?: string,
    @Query('code') code?: string
  ): Promise<DeliverySlot[]> {
    if (code && deliveryMethodId) {
      return [
        await this.deliverySlotsService.findByCode(
          parseInt(deliveryMethodId),
          code
        ),
      ];
    }
    if (search) {
      return this.deliverySlotsService.searchDeliverySlots(search);
    }
    if (deliveryMethodId) {
      return this.deliverySlotsService.findByDeliveryMethod(
        parseInt(deliveryMethodId)
      );
    }
    return this.deliverySlotsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<DeliverySlot> {
    return this.deliverySlotsService.findOne(id);
  }

  @Get(':id/orders')
  async getSlotOrders(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.deliverySlotsService.getSlotOrders(id);
  }

  @Get(':id/shipments')
  async getSlotShipments(
    @Param('id', ParseIntPipe) id: number
  ): Promise<any[]> {
    return this.deliverySlotsService.getSlotShipments(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeliverySlotDto: UpdateDeliverySlotDto
  ): Promise<DeliverySlot> {
    return this.deliverySlotsService.update(id, updateDeliverySlotDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.deliverySlotsService.remove(id);
  }
}
