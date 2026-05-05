import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rental } from '../rentals/rental.entity';
import { User } from '../users/user.entity';
import { Car } from '../cars/car.entity';

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

  async getStats(period: 'day' | 'week') {
    const now = new Date();
    const from = new Date();

    if (period === 'day') {
      from.setHours(0, 0, 0, 0);
    } else {
      from.setDate(now.getDate() - 7);
    }

    // Прибуток
    const rentals = await this.rentalsRepo
      .createQueryBuilder('rental')
      .where('rental.createdAt >= :from', { from })
      .andWhere('rental.status != :cancelled', { cancelled: 'cancelled' })
      .getMany();

    const revenue = rentals.reduce((sum, r) => sum + Number(r.totalPrice), 0);

    //порівняння з вчора
    let revenueChange = 0;
    if (period === 'day') {
      const yesterdayStart = new Date();
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date();
      yesterdayEnd.setHours(0, 0, 0, 0);

      const yesterdayRentals = await this.rentalsRepo
        .createQueryBuilder('rental')
        .where('rental.createdAt >= :from', { from: yesterdayStart })
        .andWhere('rental.createdAt < :to', { to: yesterdayEnd })
        .andWhere('rental.status != :cancelled', { cancelled: 'cancelled' })
        .getMany();

      const yesterdayRevenue = yesterdayRentals.reduce((sum, r) => sum + Number(r.totalPrice), 0);
      revenueChange =
        yesterdayRevenue === 0
          ? 0
          : Math.round(((revenue - yesterdayRevenue) / yesterdayRevenue) * 100);
    }

    // Нові юзери
    const newUsers = await this.usersRepo
      .createQueryBuilder('user')
      .where('user.createdAt >= :from', { from })
      .getCount();

    // Машини
    const totalCars = await this.carsRepo.count();
    const activeCars = await this.carsRepo.count({
      where: { status: 'available' },
    });

    // Активні оренди
    const activeRentals = await this.rentalsRepo.count({
      where: { status: 'active' },
    });
    // Машини без бронювань сьогодні
    const carsWithBookings = await this.rentalsRepo
      .createQueryBuilder('rental')
      .select('rental.carId')
      .where('rental.createdAt >= :from', { from })
      .andWhere('rental.status != :cancelled', { cancelled: 'cancelled' })
      .distinct(true)
      .getRawMany();

    const bookedIds = carsWithBookings.map((r) => r.rental_carId);
    const carsWithoutBookings =
      bookedIds.length === 0
        ? totalCars
        : await this.carsRepo
            .createQueryBuilder('car')
            .where('car.id NOT IN (:...ids)', { ids: bookedIds })
            .getCount();

    const failedPayments = await this.rentalsRepo.count({ where: { status: 'payment_failed' } });

    let weeklyExtras: any = {};

    if (period === 'week') {
      // % vs минулий тиждень
      const prevWeekStart = new Date();
      prevWeekStart.setDate(prevWeekStart.getDate() - 14);
      const prevWeekEnd = new Date();
      prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

      const prevWeekRentals = await this.rentalsRepo
        .createQueryBuilder('rental')
        .where('rental.createdAt >= :from', { from: prevWeekStart })
        .andWhere('rental.createdAt < :to', { to: prevWeekEnd })
        .andWhere('rental.status != :cancelled', { cancelled: 'cancelled' })
        .getMany();

      const prevWeekRevenue = prevWeekRentals.reduce((sum, r) => sum + Number(r.totalPrice), 0);
      revenueChange =
        prevWeekRevenue === 0
          ? 0
          : Math.round(((revenue - prevWeekRevenue) / prevWeekRevenue) * 100);

      // Топ 3 машини за тиждень
      const topCars = await this.rentalsRepo
        .createQueryBuilder('rental')
        .leftJoin('rental.car', 'car')
        .where('rental.createdAt >= :from', { from })
        .andWhere('rental.status != :cancelled', { cancelled: 'cancelled' })
        .select('car.brand', 'brand')
        .addSelect('car.model', 'model')
        .addSelect('SUM(rental.totalPrice)', 'totalRevenue')
        .groupBy('car.id')
        .addGroupBy('car.brand')
        .addGroupBy('car.model')
        .orderBy('"totalRevenue"', 'DESC')
        .limit(3)
        .getRawMany();

      // Кращий день
      const allWeekRentals = await this.rentalsRepo
        .createQueryBuilder('rental')
        .where('rental.createdAt >= :from', { from })
        .andWhere('rental.status != :cancelled', { cancelled: 'cancelled' })
        .getMany();

      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const byDay: Record<number, number> = {};
      for (const r of allWeekRentals) {
        const day = new Date(r.createdAt).getDay();
        byDay[day] = (byDay[day] || 0) + Number(r.totalPrice);
      }
      const bestDayNum = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];
      const bestDay = bestDayNum
        ? `${dayNames[Number(bestDayNum[0])]} — ${Number(bestDayNum[1]).toFixed(2)} €`
        : 'N/A';

      // Скасування
      const cancellations = await this.rentalsRepo
        .createQueryBuilder('rental')
        .where('rental.createdAt >= :from', { from })
        .andWhere('rental.status = :cancelled', { cancelled: 'cancelled' })
        .getCount();

      // Нові бронювання
      const newReservations = await this.rentalsRepo
        .createQueryBuilder('rental')
        .where('rental.createdAt >= :from', { from })
        .getCount();

      weeklyExtras = { topCars, bestDay, cancellations, newReservations };
    }

    return {
      period,
      from,
      revenue: Number(revenue.toFixed(2)),
      revenueChange,
      newUsers,
      totalCars,
      activeCars,
      activeRentals,
      failedPayments,
      carsWithoutBookings,
      weeklyExtras,
    };
  }

  async getActiveRentals() {
    const rentals = await this.rentalsRepo.find({
      where: { status: 'active' },
      relations: ['user', 'car'],
      order: { endDate: 'ASC' },
    });

    return rentals.map((r) => ({
      id: r.id,
      client: r.user?.name,
      email: r.user?.email,
      car: `${r.car?.brand} ${r.car?.model}`,
      startDate: r.startDate,
      endDate: r.endDate,
      totalPrice: r.totalPrice,
    }));
  }

  async getExpiringRentals() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 2);

    const rentals = await this.rentalsRepo
      .createQueryBuilder('rental')
      .leftJoinAndSelect('rental.user', 'user')
      .leftJoinAndSelect('rental.car', 'car')
      .where('rental.status = :status', { status: 'active' })
      .andWhere('rental.endDate >= :today', { today })
      .andWhere('rental.endDate < :tomorrow', { tomorrow })
      .orderBy('rental.endDate', 'ASC')
      .getMany();

    return rentals.map((r) => ({
      id: r.id,
      client: r.user?.name,
      car: `${r.car?.brand} ${r.car.model}`,
      endDate: r.endDate,
      totalPrice: r.totalPrice,
    }));
  }

  async getMostProfitable() {
    const cars = await this.rentalsRepo
      .createQueryBuilder('rental')
      .leftJoin('rental.car', 'car')
      .where('rental.status != :cancelled', { cancelled: 'cancelled' })
      .select('car.id', 'carId')
      .addSelect('car.brand', 'brand')
      .addSelect('car.model', 'model')
      .addSelect('SUM(rental.totalPrice)', 'totalRevenue')
      .addSelect('COUNT(rental.id)', 'totalRentals')
      .groupBy('car.id')
      .addGroupBy('car.brand')
      .addGroupBy('car.model')
      .orderBy('"totalRevenue"', 'DESC')
      .limit(3)
      .getRawMany();

    return { topCars: cars };
  }
}
