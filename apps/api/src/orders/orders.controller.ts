import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from '@repo/api/orders/dto/create-order.dto';
import { UpdateOrderStatusDto } from '@repo/api/orders/dto/update-order.dto';
import { OrderStatus } from '@repo/api/orders/entities/order.entity';
import type { Order } from '@repo/database';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  async findAll(@Query('status') status?: OrderStatus, @Query('userId') userId?: string): Promise<Order[]> {
    if (status) {
      return this.ordersService.findByStatus(status);
    }
    if (userId) {
      return this.ordersService.findByUser(parseInt(userId));
    }
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.remove(id);
  }
}