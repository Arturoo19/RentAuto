import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CarsService } from '../../services/cars';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-cars-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-cars-form.html',
  styleUrl: './admin-cars-form.css',
})
export class AdminCarsForm implements OnInit {
  isEdit = false;
  carId: number | null = null;
  loading = false;
  dataLoaded = false;

  car = {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    pricePerDay: 0,
    imageUrl: '',
    description: '',
    status: 'Disponible',
    category: '',
  };

  constructor(
    private carsService: CarsService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.params['id'];
    this.carId = idParam ? +idParam : null;

    if (this.carId) {
      this.isEdit = true;
      this.carsService.getCar(this.carId).subscribe({
        next: (data) => {
          this.car = data;
          this.dataLoaded = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error:', err);
          this.dataLoaded = true;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.dataLoaded = true;
    }
  }

  save() {
    this.loading = true;

    const request$ =
      this.isEdit && this.carId
        ? this.carsService.updateCar(this.carId, this.car)
        : this.carsService.createCar(this.car);

    request$.pipe(finalize(() => (this.loading = false))).subscribe({
      next: () => this.router.navigate(['/cars']),
      error: (err) => console.error('Error en guardar:', err),
    });
  }
}
