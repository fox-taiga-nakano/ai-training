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
import { CreateShipmentDto } from '@repo/api/shipments/dto/create-shipment.dto';
import { UpdateShipmentDto } from '@repo/api/shipments/dto/update-shipment.dto';
import type { Shipment, ShipmentStatus } from '@repo/database';

import { ShipmentsService } from './shipments.service';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  async create(
    @Body() createShipmentDto: CreateShipmentDto
  ): Promise<Shipment> {
    return this.shipmentsService.create(createShipmentDto);
  }

  @Get()
  async findAll(
    @Query('status') status?: ShipmentStatus,
    @Query('orderId') orderId?: string,
    @Query('trackingNumber') trackingNumber?: string
  ): Promise<Shipment[]> {
    if (trackingNumber) {
      return [await this.shipmentsService.findByTrackingNumber(trackingNumber)];
    }
    if (status) {
      return this.shipmentsService.findByStatus(status);
    }
    if (orderId) {
      return this.shipmentsService.findByOrder(parseInt(orderId));
    }
    return this.shipmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Shipment> {
    return this.shipmentsService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: ShipmentStatus; trackingNumber?: string }
  ): Promise<Shipment> {
    return this.shipmentsService.updateStatus(
      id,
      body.status,
      body.trackingNumber
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShipmentDto: UpdateShipmentDto
  ): Promise<Shipment> {
    return this.shipmentsService.update(id, updateShipmentDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.shipmentsService.remove(id);
  }
}
