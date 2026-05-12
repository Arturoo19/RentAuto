import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  async createPaymentIntent(amount: number, currency = 'eur', receiptEmail?: string) {
    const email = receiptEmail?.trim();
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe працює в центах
      currency,
      ...(email ? { receipt_email: email } : {}),
    });
    return { clientSecret: paymentIntent.client_secret };
  }
}
