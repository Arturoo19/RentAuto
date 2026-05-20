import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  async createPaymentIntent(
    amount: number,
    currency = 'eur',
    receiptEmail?: string,
    metadata?: { carId?: number; carBrand?: string; carModel?: string },
  ) {
    const email = receiptEmail?.trim();
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe працює в центах
      currency,
      ...(email ? { receipt_email: email } : {}),
      metadata: {
        carId: String(metadata?.carId ?? ''),
        carBrand: metadata?.carBrand ?? '',
        carModel: metadata?.carModel ?? '',
      },
    });
    return { clientSecret: paymentIntent.client_secret };
  }
}
