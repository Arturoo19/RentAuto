import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column('decimal')
  pricePerDay: number;

  @Column({ default: 'Disponible' })
  status: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true })
  description: string;
}
