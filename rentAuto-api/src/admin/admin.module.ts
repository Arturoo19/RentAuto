import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminService } from "./admin.service";
import { AdminController } from "./admin.controller";
import { Rental } from "../rentals/rental.entity";
import { User } from "../users/user.entity";
import { Car } from "../cars/car.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Rental, User, Car])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
