export interface Reservation {
  id?: string;
  userId: string;
  carId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: string;
  createdAt: Date;
}