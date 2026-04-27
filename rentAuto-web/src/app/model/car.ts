export interface Car {
  id?: string;
  brand: string;
  model: string;
  pricePerDay: number;
  status: 'Disponible' | 'En Mantenimiento' | 'available' | 'availible' | 'rented';
  imageUrl: string;
  category?: string
}