import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePaymentMethodDto } from '@repo/api/payment-methods/dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '@repo/api/payment-methods/dto/update-payment-method.dto';
import type { PaymentMethod } from '@repo/database';

import { PaymentMethodsService } from './payment-methods.service';

@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  async create(
    @Body() createPaymentMethodDto: CreatePaymentMethodDto
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.create(createPaymentMethodDto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('code') code?: string,
    @Query('active') active?: string
  ): Promise<PaymentMethod[]> {
    if (code) {
      return [await this.paymentMethodsService.findByCode(code)];
    }
    if (search) {
      return this.paymentMethodsService.searchPaymentMethods(search);
    }
    if (active !== undefined) {
      return this.paymentMethodsService.findByStatus(active === 'true');
    }
    return this.paymentMethodsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PaymentMethod> {
    return this.paymentMethodsService.findOne(id);
  }

  @Get(':id/orders')
  async getMethodOrders(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.paymentMethodsService.getMethodOrders(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentMethodDto: UpdatePaymentMethodDto
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.update(id, updatePaymentMethodDto);
  }

  @Patch(':id/toggle')
  async toggleStatus(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PaymentMethod> {
    return this.paymentMethodsService.toggleStatus(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentMethodsService.remove(id);
  }
}
