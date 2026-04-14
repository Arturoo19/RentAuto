import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { CarsService } from './cars.service';
import { Car } from './car.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.decorator';

@Controller('cars')
export class CarsController {
  constructor(private carsService: CarsService) {}

  // GET /cars — доступно всім
  @Get()
  findAll() {
    return this.carsService.findAll();
  }

  @Get('available')
  findAvailable(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    if (startDate && endDate) {
      return this.carsService.findAvailable(startDate, endDate);
    }
    return this.carsService.findAll();
  }

  // GET /cars/:id — доступно всім
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(+id);
  }

  // POST /cars — тільки адмін
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('admin')
  create(@Body() dto: Partial<Car>) {
    return this.carsService.create(dto);
  }

  // PUT /cars/:id — тільки адмін
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('admin')
  update(@Param('id') id: string, @Body() dto: Partial<Car>) {
    return this.carsService.update(+id, dto);
  }

  // DELETE /cars/:id — тільки адмін
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('admin')
  remove(@Param('id') id: string) {
    return this.carsService.remove(+id);
  }
  @Get(':id/booked-dates')
  getBookedDates(@Param('id') id: string) {
    return this.carsService.getBookedDates(+id);
  }
}
