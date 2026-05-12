import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cars-carusel',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cars-carusel.html',
  styleUrl: './cars-carusel.css',
})
export class CarsCarusel implements OnInit {
  currentIndex = 0;
  cardWidth = 320;

  private touchStartX = 0;
  private touchStartY = 0;

  cars = [
    {
      id: 2,
      name: 'BMW Serie 3',
      category: 'Premium',
      seats: 5,
      transmission: 'Automático',
      ac: 'Climatizador',
      price: 95,
      image: '/fotosCoches/bmw3.jpg',
    },
    {
      id: 3,
      name: 'Audi A4',
      category: 'Premium',
      seats: 5,
      transmission: 'Automático',
      ac: 'Climatizador',
      price: 89,
      image: '/fotosCoches/audiA4.jpg',
    },
    {
      id: 1,
      name: 'Volkswagen Golf',
      category: 'Compacto',
      seats: 5,
      transmission: 'Manual',
      ac: 'Aire acond.',
      price: 40,
      image: '/fotosCoches/golf.jpg',
    },
    {
      id: 4,
      name: 'Toyota RAV4',
      category: 'SUV',
      seats: 5,
      transmission: 'Automático',
      ac: 'Climatizador',
      price: 55,
      image: '/fotosCoches/RAV4.jpg',
    },
    {
      id: 5,
      name: 'Ford Mustang',
      category: 'Sport',
      seats: 4,
      transmission: 'Automático',
      ac: 'Climatizador',
      price: 140,
      image: '/fotosCoches/Mustang.jpg',
    },
    {
      id: 6,
      name: 'Mercedes Clase C',
      category: 'Lujo',
      seats: 5,
      transmission: 'Automático',
      ac: 'Climatizador',
      price: 105,
      image: '/fotosCoches/mercedesC.jpg',
    },
  ];

  /** Desktop shows 3 cards per “window”; phones show one card — different dot/step counts. */
  private isNarrowCarousel(): boolean {
    return typeof window !== 'undefined' && window.innerWidth <= 860;
  }

  get dots() {
    const count = this.isNarrowCarousel() ? this.cars.length : this.cars.length - 2;
    return Array(count);
  }

  get maxIndex() {
    return this.isNarrowCarousel() ? this.cars.length - 1 : this.cars.length - 3;
  }

  /** Pixels to translate per step: desktop stride is stored in cardWidth; narrow layouts add flex gap. */
  get translateXStride(): number {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    return w > 860 ? this.cardWidth : this.cardWidth + 20;
  }

  ngOnInit() {
    this.updateCardWidth();
  }

  @HostListener('window:resize')
  onResize() {
    this.updateCardWidth();
    const max = this.maxIndex;
    if (this.currentIndex > max) {
      this.currentIndex = max;
    }
  }

  onTouchStart(event: TouchEvent): void {
    if (!event.touches?.length) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    const t = event.changedTouches?.[0];
    if (!t) return;

    const dx = t.clientX - this.touchStartX;
    const dy = t.clientY - this.touchStartY;
    const threshold = 45;

    if (Math.abs(dx) < threshold) return;
    if (Math.abs(dx) < Math.abs(dy)) return;

    if (dx < 0) {
      this.next();
    } else {
      this.prev();
    }
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

  private updateCardWidth() {
    const viewportWidth = window.innerWidth;

    if (viewportWidth <= 540) {
      this.cardWidth = viewportWidth - 20;
      return;
    }

    if (viewportWidth <= 860) {
      this.cardWidth = viewportWidth - 24;
      return;
    }

    this.cardWidth = 320;
  }
}
