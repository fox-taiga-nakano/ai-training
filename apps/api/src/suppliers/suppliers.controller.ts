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
import { CreateSupplierDto } from '@repo/api/suppliers/dto/create-supplier.dto';
import { UpdateSupplierDto } from '@repo/api/suppliers/dto/update-supplier.dto';
import type { Supplier } from '@repo/database';

import { SuppliersService } from './suppliers.service';

@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  async create(
    @Body() createSupplierDto: CreateSupplierDto
  ): Promise<Supplier> {
    return this.suppliersService.create(createSupplierDto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('code') code?: string
  ): Promise<Supplier[]> {
    if (code) {
      return [await this.suppliersService.findByCode(code)];
    }
    if (search) {
      return this.suppliersService.searchSuppliers(search);
    }
    return this.suppliersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Supplier> {
    return this.suppliersService.findOne(id);
  }

  @Get(':id/products')
  async getSupplierProducts(
    @Param('id', ParseIntPipe) id: number
  ): Promise<any[]> {
    return this.suppliersService.getSupplierProducts(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSupplierDto: UpdateSupplierDto
  ): Promise<Supplier> {
    return this.suppliersService.update(id, updateSupplierDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.suppliersService.remove(id);
  }
}
