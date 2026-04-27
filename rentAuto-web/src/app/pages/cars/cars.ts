import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { CarsService } from '../../services/cars';
import { AuthService } from '../../services/auth';
import { filter, Subscription } from 'rxjs';
import { Reservas } from '../../services/reservas';
import Swal from 'sweetalert2';

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
  selectedCategory = '';
  selectedPrice = 'todos';

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

  onCategoryChange(event: Event) {
    this.selectedCategory = (event.target as HTMLSelectElement).value;
  }
  onPriceChange(event: Event) {
    this.selectedPrice = (event.target as HTMLSelectElement).value;
  }

  resetFilters() {
    this.selectedCategory = 'todos';
    this.selectedPrice = 'todos';
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
        this.cars = this.esAdmin ? [...data] : data.filter((car) => this.isDisponible(car.status));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  async deleteCar(id: number) {
    const result = await Swal.fire({
      title: 'Eliminar coche',
      text: '¿Estás seguro de eliminar este coche? Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d6001c',
      cancelButtonColor: '#64748b',
    });
    if (!result.isConfirmed) return;

    this.carsService.deleteCar(id).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Coche eliminado correctamente',
          timer: 1700,
          showConfirmButton: false,
        });
        if (this.startDate && this.endDate) {
          this.loadCars();
          return;
        }
        this.loadAllCars();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el coche',
          confirmButtonColor: '#d6001c',
        });
      },
    });
  }

  isDisponible(status: string): boolean {
    return status === 'Disponible' || status === 'available' || status === 'availible';
  }

  getStatusLabel(status: string): string {
    return this.isDisponible(status) ? 'Disponible' : 'En Mantenimiento';
  }

  getStatusClass(status: string): string {
    return this.isDisponible(status) ? 'available' : 'maintenance';
  }

  toggleMaintenance(car: any) {
    const nextStatus = this.isDisponible(car.status) ? 'En Mantenimiento' : 'Disponible';
    this.carsService.updateCar(car.id, { status: nextStatus }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Estado actualizado',
          text:
            nextStatus === 'En Mantenimiento'
              ? 'El coche se marcó como En Mantenimiento'
              : 'El coche ahora está Disponible',
          timer: 1700,
          showConfirmButton: false,
        });
        if (this.startDate && this.endDate) {
          this.loadCars();
          return;
        }
        this.loadAllCars();
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el estado del coche',
          confirmButtonColor: '#d6001c',
        });
      },
    });
  }

  get cochesFiltrados() {
    let resultado = this.cars;

    if (this.selectedCategory && this.selectedCategory !== 'todos') {
      resultado = resultado.filter((car) => car.category === this.selectedCategory);
    }
    if (this.selectedPrice && this.selectedPrice !== 'todos') {
      resultado = resultado.filter((car) => {
        const price = car.pricePerDay;
        if (this.selectedPrice === 'low') return price <= 60;
        if (this.selectedPrice === 'mid') return price > 60 && price <= 100;
        if (this.selectedPrice === 'high') return price > 100;
        return true;
      });
    }

    return resultado;
  }
}
