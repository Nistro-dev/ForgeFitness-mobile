import { FastifyInstance } from 'fastify';
import { paymentController } from '@if/http/controllers/payment.controller';

export default async function webhookRoutes(app: FastifyInstance) {
  const paymentCtrl = paymentController(app);

  app.post('/stripe', paymentCtrl.handleStripeWebhook);
}

