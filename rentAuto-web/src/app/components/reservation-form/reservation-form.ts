import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CarsService } from '../../services/cars';
import { AuthService } from '../../services/auth';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';

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

  // Дані користувача
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

    // Підтягуємо дані юзера з authService
    this.currentUser = this.authService.getCurrentUser();

    this.carsService.getCar(this.carId).subscribe({
      next: (data) => {
        this.car = { ...data };
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });

    this.http.get<any[]>(`http://localhost:3000/cars/${this.carId}/booked-dates`).subscribe({
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

  calcTotal(): number {
    const days = this.getDays();
    if (days <= 0) return 0;
    return days * Number(this.car?.pricePerDay);
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
    if (!this.startDate || !this.endDate) {
      alert('Selecciona las fechas');
      return;
    }

    const total = this.calcTotal();
    if (total <= 0) return;

    this.http
      .post<{ clientSecret: string }>('http://localhost:3000/payments/create-intent', {
        amount: total,
      })
      .subscribe(async ({ clientSecret }) => {
        this.clientSecret = clientSecret;

        this.elements = this.stripe!.elements({ clientSecret });
        this.paymentElement = this.elements.create('payment');
        this.paymentElement.mount('#payment-element');

        this.paymentReady = true;
        this.cdr.detectChanges();
      });
  }

  async reservar() {
    if (!this.stripe || !this.elements) return;
    this.paying = true;

    const { error, paymentIntent } = await this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: { return_url: 'http://localhost:4200/cars' },
      redirect: 'if_required',
    });

    if (error) {
      alert(error.message);
      this.paying = false;
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      this.http
        .post('http://localhost:3000/rentals', {
          carId: this.carId,
          startDate: this.startDate,
          endDate: this.endDate,
        })
        .subscribe({
          next: () => {
            alert('¡Reserva y pago completados!');
            this.router.navigate(['/cars']);
          },
          error: () => alert('Pago OK pero error al guardar reserva'),
        });
    }

    this.paying = false;
  }

  goBack() {
    this.router.navigate(['/cars']);
  }
}
