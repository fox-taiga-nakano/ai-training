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
import { CreatePaymentInfoDto } from '@repo/api/payment-info/dto/create-payment-info.dto';
import { UpdatePaymentInfoDto } from '@repo/api/payment-info/dto/update-payment-info.dto';
import type { PaymentInfo, PaymentStatus } from '@repo/database';

import { PaymentInfoService } from './payment-info.service';

@Controller('payment-info')
export class PaymentInfoController {
  constructor(private readonly paymentInfoService: PaymentInfoService) {}

  @Post()
  async create(
    @Body() createPaymentInfoDto: CreatePaymentInfoDto
  ): Promise<PaymentInfo> {
    return this.paymentInfoService.create(createPaymentInfoDto);
  }

  @Get()
  async findAll(
    @Query('status') status?: PaymentStatus,
    @Query('orderId') orderId?: string,
    @Query('transactionId') transactionId?: string
  ): Promise<PaymentInfo[]> {
    if (transactionId) {
      return [await this.paymentInfoService.findByTransactionId(transactionId)];
    }
    if (status) {
      return this.paymentInfoService.findByStatus(status);
    }
    if (orderId) {
      return this.paymentInfoService.findByOrder(parseInt(orderId));
    }
    return this.paymentInfoService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PaymentInfo> {
    return this.paymentInfoService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: PaymentStatus; transactionId?: string }
  ): Promise<PaymentInfo> {
    return this.paymentInfoService.updateStatus(
      id,
      body.status,
      body.transactionId
    );
  }

  @Post(':id/refund')
  async refund(@Param('id', ParseIntPipe) id: number): Promise<PaymentInfo> {
    return this.paymentInfoService.refund(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePaymentInfoDto: UpdatePaymentInfoDto
  ): Promise<PaymentInfo> {
    return this.paymentInfoService.update(id, updatePaymentInfoDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.paymentInfoService.remove(id);
  }
}
