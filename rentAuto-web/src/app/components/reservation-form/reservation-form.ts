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
import {
  computeRentalPricingBreakdown,
  type RentalPricingBreakdown,
} from '../../utils/rental-pricing';
import { getPromoDiscountRate } from '../../utils/rental-pricing';

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
  /** Carried from home → cars via query string; validated server-side. */
  promoCode = '';

  // Stripe
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  paymentElement: any = null;
  clientSecret = '';
  paying = false;
  paymentReady = false;

  promoApplied = false;
  promoError = false;
  promoRate = 0;

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
    this.promoCode = (this.route.snapshot.queryParams['promoCode'] || '').trim();
    if (this.promoCode) {
      this.promoRate = getPromoDiscountRate(this.promoCode);
      this.promoApplied = this.promoRate > 0;
    }

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

    const stripeLoadOptions =
      this.currentUser?.role === 'admin'
        ? undefined
        : {
            developerTools: {
              assistant: { enabled: false },
            },
          };

    this.stripe = await loadStripe(
      environment.stripePublicKey,
      stripeLoadOptions as Parameters<typeof loadStripe>[1],
    );
  }

  onPromoInput() {
    this.promoApplied = false;
    this.promoError = false;
  }

  applyPromo() {
    const rate = getPromoDiscountRate(this.promoCode);
    this.promoRate = rate;
    if (rate > 0) {
      this.promoApplied = true;
      this.promoError = false;
    } else {
      this.promoApplied = false;
      this.promoError = true;
    }
  }

  /** Sandbox (pk_test_): show how to pay without real charges. */
  get showStripeTestPaymentHint(): boolean {
    const key = environment.stripePublicKey ?? '';
    if (!key.startsWith('pk_test_')) return false;
    if (!this.car || !this.startDate || !this.endDate || this.dateError) return false;
    return this.availableStatuses.includes(this.car.status);
  }

  getPricingBreakdown(): RentalPricingBreakdown {
    const pricePerDay = Number(this.car?.pricePerDay || 0);
    return computeRentalPricingBreakdown(pricePerDay, this.startDate, this.endDate, this.promoCode);
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

    const receiptEmail = this.currentUser?.email?.trim();
    this.http
      .post<{ clientSecret: string }>(`${environment.apiUrl}/payments/create-intent`, {
        amount: total,
        receiptEmail: receiptEmail || undefined,
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

    const receiptEmail = this.currentUser?.email?.trim();
    if (!receiptEmail) {
      Swal.fire({
        icon: 'warning',
        title: 'Email requerido',
        text: 'Inicia sesión con una cuenta que tenga email para recibir el comprobante y completar el pago.',
        confirmButtonColor: '#d6001c',
      });
      return;
    }

    this.paying = true;

    const { error, paymentIntent } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: 'https://rent-auto-sepia.vercel.app/cars',
        receipt_email: receiptEmail,
      },
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
          ...(this.promoCode ? { promoCode: this.promoCode } : {}),
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
