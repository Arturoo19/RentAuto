import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CarsService } from '../../services/cars';
import { AuthService } from '../../services/auth';
import { filter, Subscription } from 'rxjs';
import { Reservas } from '../../services/reservas';

@Component({
  selector: 'app-cars',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cars.html',
  styleUrl: './cars.css',
})
export class Cars implements OnInit, OnDestroy {
  cars: any[] = [];
  esAdmin = false;
  loading = true;
  startDate = '';
  endDate = '';
  private sub!: Subscription;

  constructor(
    private carsService: CarsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private reservasService: Reservas,
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    this.esAdmin = user?.role === 'admin';

    this.route.queryParams.subscribe((params) => {
      this.startDate = params['startDate'] || '';
      this.endDate = params['endDate'] || '';

      if (this.startDate && this.endDate) {
        this.loadCars();
      } else {
        this.loadAllCars();
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  loadCars() {
    this.loading = true;
    this.carsService.getAvailableCars(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.cars = [...data];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
  loadAllCars() {
    this.loading = true;

    this.carsService.getCars().subscribe({
      next: (data) => {
        this.cars = [...data];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteCar(id: number) {
    if (confirm('¿Estás seguro de eliminar este coche?')) {
      this.carsService.deleteCar(id).subscribe({
        next: () => this.loadCars(),
      });
    }
  }
}
