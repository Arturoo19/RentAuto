import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rental } from './rental.entity';
import { Repository } from 'typeorm';
import { Car } from 'src/cars/car.entity';

@Injectable()
export class RentalsService {
  private readonly availableStatuses = ['Disponible', 'available', 'availible'];

  constructor(
    @InjectRepository(Rental)
    private rentalsRepo: Repository<Rental>, // таблиця оренд
    @InjectRepository(Car)
    private carsRepo: Repository<Car>, // таблиця машин (щоб міняти статус)
  ) {}

  async create(userId: number, carId: number, startDate: string, endDate: string) {
    const coche = await this.carsRepo.findOneBy({ id: carId });
    if (!coche) throw new NotFoundException('Coche no encontrado');
    if (!this.availableStatuses.includes(coche.status)) {
      throw new BadRequestException('Coche en mantenimiento');
    }

    // Перевіряємо конфлікт дат
    const conflict = await this.rentalsRepo
      .createQueryBuilder('rental')
      .where('rental.carId = :carId', { carId })
      .andWhere('rental.status != :cancelled', { cancelled: 'cancelled' })
      .andWhere('rental.status != :completed', { completed: 'completed' })
      .andWhere('rental.startDate < :endDate', { endDate })
      .andWhere('rental.endDate > :startDate', { startDate })
      .getOne();

    if (conflict) {
      throw new BadRequestException('Coche no disponible en estas fechas');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const dias = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (dias <= 0) throw new BadRequestException('Datos incorrectos');
    const totalPrice = dias * Number(coche.pricePerDay);

    const rental = this.rentalsRepo.create({
      user: { id: userId },
      car: { id: carId },
      startDate: start,
      endDate: end,
      totalPrice,
      status: 'active',
    });

    return this.rentalsRepo.save(rental);
  }

  findAll() {
    return this.rentalsRepo.find({
      relations: ['user', 'car'],
    });
  }

  findByUser(userId: number) {
    return this.rentalsRepo.find({
      where: { user: { id: userId } },
      relations: ['car'],
    });
  }
  // PUT /rentals/:id/complete - завершити оренду
  async complete(id: number) {
    const rental = await this.rentalsRepo.findOne({
      where: { id },
      relations: ['car'],
    });
    if (!rental) throw new NotFoundException('No se encontró ningún alquiler');

    await this.rentalsRepo.update(id, { status: 'completed' });

    return { message: 'Alquiler completo' };
  }
  async cancel(id: number, userId: number) {
    const rental = await this.rentalsRepo.findOne({
      where: { id, user: { id: userId } },
    });

    if (!rental) throw new NotFoundException('Reserva no encontrada');
    if (rental.status === 'cancelled') throw new BadRequestException('Ya cancelada');

    rental.status = 'cancelled';
    return this.rentalsRepo.save(rental);
  }
}
