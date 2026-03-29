import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CarsService } from '../../services/cars';

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

  car = {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    pricePerDay: 0,
    imageUrl: '',
    description: '',
    status: 'available',
  };

  constructor(
    private carsService: CarsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.carId = this.route.snapshot.params['id'];
    if (this.carId) {
      this.isEdit = true;
      this.carsService.getCar(this.carId).subscribe({
        next: (data) => (this.car = data),
      });
    }
  }

  save() {
    this.loading = true;
    if (this.isEdit && this.carId) {
      this.carsService.updateCar(this.carId, this.car).subscribe({
        next: () => (window.location.href = '/cars'),
        error: () => (this.loading = false),
      });
    } else {
      this.carsService.createCar(this.car).subscribe({
        next: () => (window.location.href = '/cars'),
        error: () => (this.loading = false),
      });
    }
  }
}
