import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum CarCategory {
  DEPORTIVO = 'deportivo',
  SUV = 'suv',
  ELECTRICOS = 'electricos',
  LUJO = 'lujo',
}

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

  @Column({
    type: 'enum',
    enum: CarCategory,
    nullable: true,
  })
  category: CarCategory;
}
