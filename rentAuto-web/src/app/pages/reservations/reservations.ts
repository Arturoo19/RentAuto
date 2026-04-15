import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Reservas } from '../../services/reservas';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations implements OnInit {
  rentals: any[] = [];
  loading = true;
  private sub!: Subscription;

  cancellingId: string | null = null;

  constructor(
    private reservasService: Reservas,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.loadRentals();

    this.sub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadRentals();
      });
  }
  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  loadRentals() {
    this.loading = true;
    this.reservasService.syncMyRentalsCompletingExpired().subscribe({
      next: (data) => {
        this.rentals = this.reservasService.filterActiveOrCompletedRentals(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  calcDays(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  }

  getStatusLabel(status: string): string {
    const normalized = this.reservasService.normalizeStatus(status);
    const map: Record<string, string> = {
      active: 'Activa',
      completed: 'Completada',
    };
    return map[normalized] || status;
  }

  getStatusClass(status: string): string {
    const normalized = this.reservasService.normalizeStatus(status);
    const map: Record<string, string> = {
      active: 'status-active',
      completed: 'status-completed',
    };
    return map[normalized] || '';
  }

  isCancellable(rental: any): boolean {
    const normalized = this.reservasService.normalizeStatus(rental.status);
    const startDate = new Date(rental.startDate);
    // Можна скасувати тільки активні і якщо старт ще не настав
    return normalized === 'active' && startDate > new Date();
  }

  cancelRental(rental: any): void {
    Swal.fire({
      icon: 'warning',
      title: '¿Cancelar reserva?',
      text: `¿Seguro que quieres cancelar la reserva del ${rental.car?.brand} ${rental.car?.model}?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.cancellingId = rental.id;
      this.reservasService.cancelRental(rental.id).subscribe({
        next: () => {
          this.cancellingId = null;
          this.loadRentals();
          Swal.fire({
            icon: 'success',
            title: 'Cancelación',
            text: 'Reserva cancelada con exito',
            timer: 1700,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          console.error('Cancel error:', err);
          this.cancellingId = null;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al cancelar la reserva. Inténtalo de nuevo.',
            timer: 1700,
            showConfirmButton: false,
          });
        },
      });
    });
  }
}
