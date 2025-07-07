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
import { CreateSiteDto } from '@repo/api/sites/dto/create-site.dto';
import { UpdateSiteDto } from '@repo/api/sites/dto/update-site.dto';
import type { Site, SiteStatus } from '@repo/database';

import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  async create(@Body() createSiteDto: CreateSiteDto): Promise<Site> {
    return this.sitesService.create(createSiteDto);
  }

  @Get()
  async findAll(
    @Query('status') status?: SiteStatus,
    @Query('code') code?: string
  ): Promise<Site[]> {
    if (code) {
      return [await this.sitesService.findByCode(code)];
    }
    if (status) {
      return this.sitesService.findByStatus(status);
    }
    return this.sitesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Site> {
    return this.sitesService.findOne(id);
  }

  @Get(':id/shops')
  async getSiteShops(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.sitesService.getSiteShops(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSiteDto: UpdateSiteDto
  ): Promise<Site> {
    return this.sitesService.update(id, updateSiteDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.sitesService.remove(id);
  }
}
