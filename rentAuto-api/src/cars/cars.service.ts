import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from './car.entity';
import { Repository } from 'typeorm';
import { Rental } from 'src/rentals/rental.entity';

@Injectable()
export class CarsService {
  private readonly availableStatuses = ['Disponible', 'available', 'availible'];

  constructor(
    @InjectRepository(Car)
    private carsRepo: Repository<Car>,
    @InjectRepository(Rental)
    private rentalsRepo: Repository<Rental>,
  ) {}

  findAll() {
    return this.carsRepo.find();
  }

  async findOne(id: number) {
    const car = await this.carsRepo.findOneBy({ id });
    if (!car) throw new NotFoundException('Coche no encontrado');
    return car;
  }

  create(dto: Partial<Car>) {
    const car = this.carsRepo.create(dto);
    return this.carsRepo.save(car);
  }

  async update(id: number, dto: Partial<Car>) {
    await this.findOne(id);
    await this.carsRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.carsRepo.delete(id);
    return { message: 'Coche eliminado' };
  }
  async findAvailable(startDate: string, endDate: string) {
    const rentedCars = await this.rentalsRepo
      .createQueryBuilder('rental')
      .select('rental.carId', 'carId')
      .where('rental.status != :cancelled', { cancelled: 'cancelled' })
      .andWhere('rental.startDate < :endDate', { endDate })
      .andWhere('rental.endDate > :startDate', { startDate })
      .getRawMany();

    type RentedCar = { carId: string };

    const rentedCarIds = rentedCars
      .map((r: RentedCar) => Number(r.carId))
      .filter((id: number) => !isNaN(id));

    console.log('Rented car IDs:', rentedCarIds);

    const qb = this.carsRepo
      .createQueryBuilder('car')
      .where('car.status IN (:...availableStatuses)', {
        availableStatuses: this.availableStatuses,
      });

    if (rentedCarIds.length > 0) {
      qb.andWhere('car.id NOT IN (:...ids)', { ids: rentedCarIds });
    }

    return qb.getMany();
  }
  async getBookedDates(carId: number) {
    const rentals = await this.rentalsRepo.find({
      where: {
        car: { id: carId },
        status: 'active',
      },
      relations: ['car'],
    });

    return rentals.map((r) => ({
      startDate: r.startDate,
      endDate: r.endDate,
    }));
  }
}
