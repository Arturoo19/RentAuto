import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';

interface JwtUser {
  id: number;
  email: string;
  role: string;
}

interface RequestWithUser extends Request {
  user: JwtUser;
}

@Controller('rentals')
export class RentalsController {
  constructor(private rentalsService: RentalsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() req: RequestWithUser,
    @Body() body: { carId: number; startDate: string; endDate: string },
  ) {
    const userId = req.user.id;
    return this.rentalsService.create(userId, body.carId, body.startDate, body.endDate);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.rentalsService.findAll();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findByUser(@Req() req: RequestWithUser) {
    return this.rentalsService.findByUser(req.user.id);
  }

  @Put(':id/complete')
  @UseGuards(JwtAuthGuard)
  complete(@Param('id') id: string) {
    return this.rentalsService.complete(+id);
  }
}
