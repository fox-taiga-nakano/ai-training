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
import { CreateProductDto } from '@repo/api/products/dto/create-product.dto';
import { UpdateProductDto } from '@repo/api/products/dto/update-product.dto';

import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string
  ) {
    if (search) {
      return this.productsService.searchProducts(search);
    }
    if (categoryId) {
      return this.productsService.findByCategory(parseInt(categoryId));
    }
    return this.productsService.findAll();
  }

  @Get('categories')
  async getCategories() {
    return this.productsService.getCategories();
  }

  @Get('suppliers')
  async getSuppliers() {
    return this.productsService.getSuppliers();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }
}
