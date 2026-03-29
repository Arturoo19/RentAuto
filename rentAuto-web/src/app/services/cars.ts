import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class CarsService {
  private apiUrl = 'http://localhost:3000/cars';

  constructor(private http: HttpClient) {}

  getCars() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getCar(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createCar(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  updateCar(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteCar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getAvailableCars(startDate?: string, endDate?: string) {
    if (startDate && endDate) {
      return this.http.get<any[]>(
        `${this.apiUrl}/available?startDate=${startDate}&endDate=${endDate}`,
      );
    }
    return this.http.get<any[]>(this.apiUrl);
  }
}
