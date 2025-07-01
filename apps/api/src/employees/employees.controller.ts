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
import { CreateEmployeeDto } from '@repo/api/employees/dto/create-employee.dto';
import { UpdateEmployeeDto } from '@repo/api/employees/dto/update-employee.dto';
import type { Status } from '@repo/database';

import { EmployeesService } from './employees.service';

@Controller('employees')
@UsePipes(new ValidationPipe({ transform: true }))
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return await this.employeesService.create(createEmployeeDto);
  }

  @Get()
  async findAll(
    @Query('departmentId') departmentId?: string,
    @Query('status') status?: Status
  ) {
    if (departmentId) {
      return await this.employeesService.findByDepartment(departmentId);
    }

    if (status) {
      return await this.employeesService.findByStatus(status);
    }

    return await this.employeesService.findAll();
  }

  @Get('count')
  async count(@Query('status') status?: Status) {
    if (status) {
      return { count: await this.employeesService.countByStatus(status) };
    }
    return { count: await this.employeesService.count() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.employeesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ) {
    return await this.employeesService.update(id, updateEmployeeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.employeesService.remove(id);
  }
}
