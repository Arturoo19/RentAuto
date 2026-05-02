import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Rental } from "../rentals/rental.entity";
import { User } from "../users/user.entity";
import { Car } from "../cars/car.entity";

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Rental)
    private rentalsRepo: Repository<Rental>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Car)
    private carsRepo: Repository<Car>,
  ) {}

  async getStats(period: "day" | "week") {
    const now = new Date();
    const from = new Date();

    if (period === "day") {
      from.setHours(0, 0, 0, 0);
    } else {
      from.setDate(now.getDate() - 7);
    }

    // Прибуток
    const rentals = await this.rentalsRepo
      .createQueryBuilder("rental")
      .where("rental.createdAt >= :from", { from })
      .andWhere("rental.status != :cancelled", { cancelled: "cancelled" })
      .getMany();

    const revenue = rentals.reduce((sum, r) => sum + Number(r.totalPrice), 0);

    // Нові юзери
    const newUsers = await this.usersRepo
      .createQueryBuilder("user")
      .where("user.createdAt >= :from", { from })
      .getCount();

    // Машини
    const totalCars = await this.carsRepo.count();
    const activeCars = await this.carsRepo.count({
      where: { status: "available" },
    });

    // Активні оренди
    const activeRentals = await this.rentalsRepo.count({
      where: { status: "active" },
    });

    return {
      period,
      from,
      revenue: Number(revenue.toFixed(2)),
      newUsers,
      totalCars,
      activeCars,
      activeRentals,
    };
  }
}
