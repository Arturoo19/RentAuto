import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class Reservas {
  private apiUrl = 'http://localhost:3000/rentals';

  constructor(private http: HttpClient) {}

  createRental(carId: number, startDate: string, endDate: string) {
    return this.http.post(this.apiUrl, { carId, startDate, endDate });
  }

  getMyRentals() {
    return this.http.get<any[]>(`${this.apiUrl}/my`);
  }

  completeRental(id: number) {
    return this.http.put(`${this.apiUrl}/${id}/complete`, {});
  }
}
