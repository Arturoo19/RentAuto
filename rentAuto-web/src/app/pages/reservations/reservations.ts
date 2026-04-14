import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Reservas } from '../../services/reservas';
import { AuthService } from '../../services/auth';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs';

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
      error: (err) => {
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
    const map: Record<string, string> = {
      active: 'Activa',
      completed: 'Completada',
    };
    return map[status] || status;
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      active: 'status-active',
      completed: 'status-completed',
    };
    return map[status] || '';
  }
}
