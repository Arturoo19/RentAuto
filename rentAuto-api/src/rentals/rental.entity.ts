import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Car } from '../cars/car.entity';
import { User } from 'src/users/user.entity';

@Entity('rentals')
export class Rental {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Car)
  car: Car;

  @Column('date')
  startDate: Date;

  @Column('date')
  endDate: Date;

  @Column('decimal')
  totalPrice: number;

  @Column({ default: 'pending' })
  status: string;
}
