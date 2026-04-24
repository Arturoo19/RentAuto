import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CarsService {
  private apiUrl = `${environment.apiUrl}/cars`;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  getCars() {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  getCar(id: number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  createCar(data: any) {
    return this.http.post(this.apiUrl, data, this.getHeaders());
  }

  updateCar(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getHeaders());
  }

  deleteCar(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  getAvailableCars(startDate?: string, endDate?: string) {
    const url =
      startDate && endDate
        ? `${this.apiUrl}/available?startDate=${startDate}&endDate=${endDate}`
        : this.apiUrl;
    return this.http.get<any[]>(url, this.getHeaders());
  }
}
