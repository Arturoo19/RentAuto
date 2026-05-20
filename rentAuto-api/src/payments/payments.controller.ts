import { Controller, Post, Body } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-intent')
  createIntent(
    @Body()
    body: {
      amount: number;
      receiptEmail?: string;
      carId?: number;
      carBrand?: string;
      carModel?: string;
    },
  ) {
    return this.paymentsService.createPaymentIntent(body.amount, 'eur', body.receiptEmail, {
      carId: body.carId,
      carBrand: body.carBrand,
      carModel: body.carModel,
    });
  }
}
