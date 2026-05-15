import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CarsCarusel } from '../../components/cars-carusel/cars-carusel';
import { Noticias } from '../../components/noticias/noticias';
import { Faq } from '../../components/faq/faq';
import {
  AVAILABLE_CITIES,
  AvailableCity,
  isAvailableCity,
} from '../../utils/available-cities';
import { getPromoDiscountRate } from '../../utils/rental-pricing';

@Component({
  selector: 'app-home',
  imports: [RouterModule, CommonModule, FormsModule, CarsCarusel, Noticias, Faq],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly cities = AVAILABLE_CITIES;

  promoActive = false;
  promoCode = '';

  /** Passed into the carousel so “Reservar” keeps the same promo as the hero search. */
  get carouselPromoCode(): string {
    return this.promoActive ? this.promoCode.trim() : '';
  }
  startDate = '';
  endDate = '';
  city = '';
  cityDropdownOpen = false;

  constructor(private router: Router) {}

  toggleCityDropdown(event: Event) {
    event.stopPropagation();
    this.cityDropdownOpen = !this.cityDropdownOpen;
  }

  selectCity(city: AvailableCity, event: Event) {
    event.stopPropagation();
    this.city = city;
    this.cityDropdownOpen = false;
  }

  @HostListener('document:click')
  closeCityDropdown() {
    this.cityDropdownOpen = false;
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.cityDropdownOpen = false;
  }

  async buscar() {
    const normalizedCity = this.city.trim();
    const promo = this.promoActive ? this.promoCode.trim() : '';

    if (!this.promoActive && !normalizedCity) {
      await Swal.fire({
        icon: 'info',
        title: 'Indica ciudad o descuento',
        text: 'Selecciona una ciudad para buscar, o marca el código de descuento para aplicarlo sin fechas ni lugar.',
        confirmButtonColor: '#d6001c',
      });
      return;
    }

    if (normalizedCity && !isAvailableCity(normalizedCity)) {
      await Swal.fire({
        icon: 'warning',
        title: 'Ciudad no disponible',
        text: 'Solo puedes buscar en Barcelona o Madrid.',
        confirmButtonColor: '#d6001c',
      });
      return;
    }

    if (this.promoActive) {
      if (!promo) {
        await Swal.fire({
          icon: 'warning',
          title: 'Código requerido',
          text: 'Introduce un código de descuento o desmarca la casilla.',
          confirmButtonColor: '#d6001c',
        });
        return;
      }
      const rate = getPromoDiscountRate(promo);
      if (rate <= 0) {
        await Swal.fire({
          icon: 'error',
          title: 'Código no válido',
          text: 'No existe ese código de descuento. Comprueba el código e inténtalo de nuevo.',
          confirmButtonColor: '#d6001c',
        });
        return;
      }
      await Swal.fire({
        icon: 'success',
        title: '¡Código confirmado!',
        text: `Se aplicará un descuento del ${Math.round(rate * 100)}% al reservar.`,
        confirmButtonColor: '#d6001c',
      });
    }

    const queryParams: Record<string, string> = {};
    if (this.startDate && this.endDate) {
      queryParams['startDate'] = this.startDate;
      queryParams['endDate'] = this.endDate;
    }
    if (normalizedCity) {
      queryParams['city'] = normalizedCity;
    }
    if (promo) {
      queryParams['promoCode'] = promo;
    }

    this.router.navigate(['/cars'], { queryParams });
  }
}
