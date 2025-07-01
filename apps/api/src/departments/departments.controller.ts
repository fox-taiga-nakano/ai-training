import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateDepartmentDto } from '@repo/api/departments/dto/create-department.dto';
import { UpdateDepartmentDto } from '@repo/api/departments/dto/update-department.dto';

import { DepartmentsService } from './departments.service';

@Controller('departments')
@UsePipes(new ValidationPipe({ transform: true }))
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDepartmentDto: CreateDepartmentDto) {
    return await this.departmentsService.create(createDepartmentDto);
  }

  @Get()
  async findAll() {
    return await this.departmentsService.findAll();
  }

  @Get('count')
  async count() {
    return { count: await this.departmentsService.count() };
  }

  @Get('stats')
  async getStats() {
    return await this.departmentsService.getDepartmentStats();
  }

  @Get('search')
  async findByName(@Query('name') name: string) {
    if (!name) {
      return [];
    }
    const department = await this.departmentsService.findByName(name);
    return department ? [department] : [];
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.departmentsService.findOne(id);
  }

  @Get(':id/employees/count')
  async getEmployeeCount(@Param('id') id: string) {
    return { count: await this.departmentsService.getEmployeeCount(id) };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto
  ) {
    return await this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.departmentsService.remove(id);
  }
}
