import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { CarCategory } from './car.entity';

export class CarDto {
  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsNumber()
  year: number;

  @IsNumber()
  pricePerDay: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(CarCategory)
  category?: CarCategory;
}