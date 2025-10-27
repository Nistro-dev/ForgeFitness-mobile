import { OrderRepo } from '@domain/ports/OrderRepo';
import { InvoiceGenerator } from '@domain/ports/InvoiceGenerator';
import { prisma } from '@infra/prisma/client';
import { Result, err, ok } from '@core/result';
import { DomainError } from '@core/errors';
import { GenerateInvoiceUseCase } from './GenerateInvoiceUseCase';

export interface ConfirmPaymentInput {
  orderId: string;
  stripePaymentIntentId: string;
  amount: number;
}

export class ConfirmPaymentUseCase {
  constructor(
    private orderRepo: OrderRepo,
    private invoiceGenerator: InvoiceGenerator
  ) {}

  async execute(input: ConfirmPaymentInput): Promise<Result<void, DomainError>> {
    const order = await this.orderRepo.findById(input.orderId);
    
    if (!order) {
      return err({ code: 'ORDER_NOT_FOUND', message: 'Commande introuvable' });
    }

    try {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: input.orderId },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        }),
        prisma.paymentTransaction.create({
          data: {
            orderId: input.orderId,
            stripePaymentIntentId: input.stripePaymentIntentId,
            amount: input.amount,
            currency: 'EUR',
            status: 'succeeded',
          },
        }),
      ]);

      const generateInvoiceUseCase = new GenerateInvoiceUseCase(this.orderRepo, this.invoiceGenerator);
      generateInvoiceUseCase.execute(input.orderId).catch((error) => {
        console.error('Erreur génération facture:', error);
      });

      return ok(undefined);
    } catch (error: any) {
      return err({ code: 'PAYMENT_CONFIRMATION_FAILED', message: error.message });
    }
  }
}

