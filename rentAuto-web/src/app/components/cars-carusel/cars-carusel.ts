import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cars-carusel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cars-carusel.html',
  styleUrl: './cars-carusel.css',
})
export class CarsCarusel {
  currentIndex = 0;
  cardWidth = 320;

  cars = [
    {
      id: 1,
      name: 'BMW Serie 3',
      category: 'Premium',
      seats: 5,
      transmission: 'Automático',
      ac: 'Climatizador',
      price: 89,
      image: '/fotosCoches/bmw3.jpg',
    },
    {
      id: 2,
      name: 'Audi A4',
      category: 'Premium',
      seats: 5,
      transmission: 'Automático',
      ac: 'Climatizador',
      price: 95,
      image: '/fotosCoches/audiA4.jpg',
    },
    {
      id: 6,
      name: 'Volkswagen Golf',
      category: 'Compacto',
      seats: 5,
      transmission: 'Manual',
      ac: 'Aire acond.',
      price: 45,
      image: '/fotosCoches/golf.jpg',
    },
    {
      id: 4,
      name: 'Toyota RAV4',
      category: 'SUV',
      seats: 5,
      transmission: 'Automático',
      ac: 'Climatizador',
      price: 75,
      image: '/fotosCoches/RAV4.jpg',
    },
    {
      id: 5,
      name: 'Ford Mustang',
      category: 'Sport',
      seats: 4,
      transmission: 'Automático',
      ac: 'Climatizador',
      price: 120,
      image: '/fotosCoches/Mustang.jpg',
    },
    {
      id: 3,
      name: 'Mercedes Clase C',
      category: 'Lujo',
      seats: 5,
      transmission: 'Automático',
      ac: 'Climatizador',
      price: 110,
      image: '/fotosCoches/mercedesC.jpg',
    },
  ];

  get dots() {
    return Array(this.cars.length - 2);
  }

  get maxIndex() {
    return this.cars.length - 3;
  }

  next() {
    if (this.currentIndex < this.maxIndex) this.currentIndex++;
  }

  prev() {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  goTo(i: number) {
    this.currentIndex = i;
  }
}
