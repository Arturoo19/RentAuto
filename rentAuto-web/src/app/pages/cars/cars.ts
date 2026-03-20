import { Component } from '@angular/core';
import { CarsCarusel } from '../../components/cars-carusel/cars-carusel';

@Component({
  selector: 'app-cars',
  imports: [CarsCarusel],
  templateUrl: './cars.html',
  styleUrl: './cars.css',
})
export class Cars {
  promoActive = false;

}
