import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  async createPaymentIntent(amount: number, currency = 'eur') {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe працює в центах
      currency,
    });
    return { clientSecret: paymentIntent.client_secret };
  }
}
