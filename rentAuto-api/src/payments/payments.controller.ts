import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  createIntent(@Body() body: { amount: number }) {
    return this.paymentsService.createPaymentIntent(body.amount);
  }
}
