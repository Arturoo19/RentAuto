import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class Reservas {
  private apiUrl = 'http://localhost:3000/rentals';

  constructor(private http: HttpClient) {}

  rentalPeriodHasEnded(endDate: string): boolean {
    if (!endDate) return false;
    const day = String(endDate).split('T')[0];
    const parts = day.split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return false;
    const [y, m, d] = parts;
    const end = new Date(y, m - 1, d, 23, 59, 59, 999);
    return Date.now() > end.getTime();
  }

  filterActiveOrCompletedRentals(rentals: any[] | null | undefined): any[] {
    return (rentals ?? []).filter((r) => r?.status === 'active' || r?.status === 'completed');
  }

  private expiredActiveIds(rentals: any[]): (number | string)[] {
    return (rentals ?? [])
      .filter((r) => r?.status === 'active' && this.rentalPeriodHasEnded(r.endDate))
      .map((r) => r.id)
      .filter((id) => id != null);
  }

  /**
   * Marca como completadas en el API las reservas activas cuya fecha de fin ya finalizo
   * (el coche vuelve a estar disponible si el backend lo enlaza al estado del alquiler).
   */
  syncMyRentalsCompletingExpired(): Observable<any[]> {
    return this.getMyRentals().pipe(
      switchMap((rentals) => {
        const ids = this.expiredActiveIds(rentals);
        if (ids.length === 0) return of(rentals);
        return forkJoin(
          ids.map((id) => this.completeRental(id).pipe(catchError(() => of(null)))),
        ).pipe(switchMap(() => this.getMyRentals()));
      }),
    );
  }

  /** Igual que syncMyRentalsCompletingExpired pero sobre GET /rentals (admin). */
  syncAdminRentalsCompletingExpired(): Observable<any[]> {
    return this.getAllRentals().pipe(
      switchMap((rentals) => {
        const ids = this.expiredActiveIds(rentals);
        if (ids.length === 0) return of(rentals);
        return forkJoin(
          ids.map((id) => this.completeRental(id).pipe(catchError(() => of(null)))),
        ).pipe(switchMap(() => this.getAllRentals()));
      }),
    );
  }

  createRental(carId: number, startDate: string, endDate: string) {
    return this.http.post(this.apiUrl, { carId, startDate, endDate });
  }

  getMyRentals() {
    return this.http.get<any[]>(`${this.apiUrl}/my`);
  }

  //Para dashboard
  getAllRentals() {
    return this.http.get<any[]>(this.apiUrl);
  }

  completeRental(id: number | string) {
    return this.http.put(`${this.apiUrl}/${id}/complete`, {});
  }
}
