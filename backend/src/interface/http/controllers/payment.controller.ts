import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ProcessPaymentUseCase } from '@app/shop/ProcessPaymentUseCase';
import { ConfirmPaymentUseCase } from '@app/shop/ConfirmPaymentUseCase';
import { OrderRepo } from '@domain/ports/OrderRepo';
import { PaymentProvider } from '@domain/ports/PaymentProvider';
import { InvoiceGenerator } from '@domain/ports/InvoiceGenerator';
import { z } from 'zod';

const InitiatePaymentDto = z.object({
  orderId: z.string().cuid(),
});

export function paymentController(app: FastifyInstance) {
  const orderRepo = app.diContainer.resolve<OrderRepo>('orderRepo');
  const paymentProvider = app.diContainer.resolve<PaymentProvider>('paymentProvider');
  const invoiceGenerator = app.diContainer.resolve<InvoiceGenerator>('invoiceGenerator');

  return {
    async initiatePayment(req: FastifyRequest, reply: FastifyReply) {
      const body = InitiatePaymentDto.parse(req.body);
      const user = (req as any).user;

      const useCase = new ProcessPaymentUseCase(orderRepo, paymentProvider);
      const result = await useCase.execute({
        orderId: body.orderId,
        customerEmail: user.email,
      });

      if (!result.ok) {
        return reply.status(400).send({
          error: result.error.code,
          message: result.error.message,
        });
      }

      return reply.status(200).send(result.value);
    },

    async handleStripeWebhook(req: FastifyRequest, reply: FastifyReply) {
      const signature = req.headers['stripe-signature'] as string;

      if (!signature) {
        return reply.status(400).send({ error: 'Missing stripe-signature header' });
      }

      const isValid = paymentProvider.verifyWebhookSignature(
        (req as any).rawBody || JSON.stringify(req.body),
        signature
      );

      if (!isValid) {
        return reply.status(401).send({ error: 'Invalid signature' });
      }

      const event = req.body as any;

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          const confirmUseCase = new ConfirmPaymentUseCase(orderRepo, invoiceGenerator);
          const result = await confirmUseCase.execute({
            orderId,
            stripePaymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount / 100, // Convertir centimes en euros
          });

          if (!result.ok) {
            req.log.error({ error: result.error }, 'Erreur confirmation paiement');
            return reply.status(500).send({ error: 'Payment confirmation failed' });
          }
        }
      }

      return reply.status(200).send({ received: true });
    },
  };
}

