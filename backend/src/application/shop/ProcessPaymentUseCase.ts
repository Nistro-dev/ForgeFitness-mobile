import { PaymentProvider } from '@domain/ports/PaymentProvider';
import { OrderRepo } from '@domain/ports/OrderRepo';
import { Result, err, ok } from '@core/result';
import { DomainError } from '@core/errors';

export interface ProcessPaymentInput {
  orderId: string;
  customerEmail: string;
}

export interface ProcessPaymentOutput {
  paymentIntentId: string;
  clientSecret: string;
}

export class ProcessPaymentUseCase {
  constructor(
    private orderRepo: OrderRepo,
    private paymentProvider: PaymentProvider
  ) {}

  async execute(input: ProcessPaymentInput): Promise<Result<ProcessPaymentOutput, DomainError>> {
    const order = await this.orderRepo.findById(input.orderId);
    
    if (!order) {
      return err({ code: 'ORDER_NOT_FOUND', message: 'Commande introuvable' });
    }

    if (order.status !== 'PENDING') {
      return err({ code: 'ORDER_ALREADY_PROCESSED', message: 'La commande a déjà été traitée' });
    }

    const amountInCents = Math.round(Number(order.totalTTC) * 100);

    try {
      const payment = await this.paymentProvider.createPaymentIntent({
        amount: amountInCents,
        currency: 'eur',
        orderId: order.id,
        customerEmail: input.customerEmail,
        metadata: {
          orderNumber: order.orderNumber,
        },
      });

      return ok({
        paymentIntentId: payment.paymentIntentId,
        clientSecret: payment.clientSecret,
      });
    } catch (error: any) {
      return err({ code: 'PAYMENT_ERROR', message: error.message || 'Erreur lors de la création du paiement' });
    }
  }
}

