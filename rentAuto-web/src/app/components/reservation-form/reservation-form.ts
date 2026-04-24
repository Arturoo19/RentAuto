import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CarsService } from '../../services/cars';
import { AuthService } from '../../services/auth';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

type PricingBreakdown = {
  days: number;
  pricePerDay: number;
  baseTotal: number;
  weekendDays: number;
  weekendSurcharge: number;
  longRentalDiscount: number;
  finalTotal: number;
};

@Component({
  selector: 'app-reservation-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservation-form.html',
  styleUrl: './reservation-form.css',
})
export class ReservationForm implements OnInit {
  carId!: number;
  startDate = '';
  endDate = '';
  car: any = null;
  today = new Date().toISOString().split('T')[0];
  bookedRanges: { startDate: string; endDate: string }[] = [];
  dateError = '';

  currentUser: any = null;
  phone = '';
  dni = '';

  // Stripe
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  paymentElement: any = null;
  clientSecret = '';
  paying = false;
  paymentReady = false;

  private readonly weekendAumentoPrecio = 0.15;
  private readonly longRentalDiscountRate = 0.1;
  private readonly longRentalDays = 7;
  private readonly availableStatuses = ['Disponible', 'available', 'availible'];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private carsService: CarsService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    this.carId = Number(this.route.snapshot.paramMap.get('id'));
    this.startDate = this.route.snapshot.queryParams['startDate'] || '';
    this.endDate = this.route.snapshot.queryParams['endDate'] || '';

    this.currentUser = this.authService.getCurrentUser();

    this.carsService.getCar(this.carId).subscribe({
      next: (data) => {
        this.car = { ...data };
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });

    this.http.get<any[]>(`${environment.apiUrl}/cars/${this.carId}/booked-dates`).subscribe({
      next: (data) => {
        this.bookedRanges = data;
      },
    });

    this.stripe = await loadStripe(environment.stripePublicKey);
  }

  getDays(): number {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  private roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private countWeekendDays(): number {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(`${this.startDate}T00:00:00`);
    const end = new Date(`${this.endDate}T00:00:00`);
    let weekendDays = 0;
    const current = new Date(start);

    while (current < end) {
      const day = current.getDay();
      if (day === 0 || day === 6) weekendDays += 1;
      current.setDate(current.getDate() + 1);
    }

    return weekendDays;
  }

  getPricingBreakdown(): PricingBreakdown {
    const days = this.getDays();
    const pricePerDay = Number(this.car?.pricePerDay || 0);
    if (days <= 0 || pricePerDay <= 0) {
      return {
        days: 0,
        pricePerDay: 0,
        baseTotal: 0,
        weekendDays: 0,
        weekendSurcharge: 0,
        longRentalDiscount: 0,
        finalTotal: 0,
      };
    }

    const baseTotal = days * pricePerDay;
    const weekendDays = this.countWeekendDays();
    const weekendSurcharge = weekendDays * pricePerDay * this.weekendAumentoPrecio;
    const longRentalDiscount =
      days > this.longRentalDays ? baseTotal * this.longRentalDiscountRate : 0;
    const finalTotal = baseTotal + weekendSurcharge - longRentalDiscount;

    return {
      days,
      pricePerDay,
      baseTotal: this.roundCurrency(baseTotal),
      weekendDays,
      weekendSurcharge: this.roundCurrency(weekendSurcharge),
      longRentalDiscount: this.roundCurrency(longRentalDiscount),
      finalTotal: this.roundCurrency(finalTotal),
    };
  }

  calcTotal(): number {
    return this.getPricingBreakdown().finalTotal;
  }

  isRangeBooked(start: string, end: string): boolean {
    return this.bookedRanges.some((r) => start < r.endDate && end > r.startDate);
  }

  onDateChange() {
    this.dateError = '';
    this.paymentReady = false;
    if (this.startDate && this.endDate) {
      if (this.isRangeBooked(this.startDate, this.endDate)) {
        this.dateError = 'Estas fechas ya están reservadas. Por favor elige otras fechas.';
        this.endDate = '';
      }
    }
  }

  async preparePayment() {
    if (this.car && !this.availableStatuses.includes(this.car.status)) {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible',
        text: 'Este coche está en mantenimiento y no se puede reservar',
        confirmButtonColor: '#d6001c',
      });
      return;
    }

    if (!this.startDate || !this.endDate) {
      Swal.fire({
        icon: 'info',
        title: 'Fechas requeridas',
        text: 'Selecciona las fechas',
        confirmButtonColor: '#d6001c',
      });
      return;
    }

    const total = this.calcTotal();
    if (total <= 0) return;

    this.http
      .post<{ clientSecret: string }>(`${environment.apiUrl}/payments/create-intent`, {
        amount: total,
      })
      .subscribe(async ({ clientSecret }) => {
        this.clientSecret = clientSecret;
        this.elements = this.stripe!.elements({ clientSecret });
        this.paymentElement = this.elements.create('payment');

        this.paymentReady = true;
        this.cdr.detectChanges(); // Angular рендерить div#payment-element

        // Чекаємо один тік щоб DOM оновився
        setTimeout(() => {
          this.paymentElement.mount('#payment-element');
        }, 0);
      });
  }

  async reservar() {
    if (this.car && !this.availableStatuses.includes(this.car.status)) {
      Swal.fire({
        icon: 'warning',
        title: 'No disponible',
        text: 'Este coche está en mantenimiento y no se puede reservar',
        confirmButtonColor: '#d6001c',
      });
      return;
    }

    if (!this.stripe || !this.elements) return;
    this.paying = true;

    const { error, paymentIntent } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: { return_url: 'https://rent-auto-sepia.vercel.app/cars' },
      redirect: 'if_required',
    });

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error de pago',
        text: error.message || 'No se pudo completar el pago',
        confirmButtonColor: '#d6001c',
      });
      this.paying = false;
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      this.http
        .post(`${environment.apiUrl}/rentals`, {
          carId: this.carId,
          startDate: this.startDate,
          endDate: this.endDate,
        })
        .subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Reserva completada',
              text: '¡Reserva y pago completados!',
              timer: 1800,
              showConfirmButton: false,
            });
            this.router.navigate(['/cars']);
          },
          error: (err) => {
            const backendMessage =
              err?.error?.message && typeof err.error.message === 'string'
                ? err.error.message
                : 'Pago OK, pero hubo error al guardar la reserva';
            Swal.fire({
              icon: 'warning',
              title: 'Atención',
              text: backendMessage,
              confirmButtonColor: '#d6001c',
            });
          },
        });
    }

    this.paying = false;
  }

  goBack() {
    this.router.navigate(['/cars']);
  }
}
