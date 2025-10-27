import Stripe from 'stripe';
import { PaymentProvider, CreatePaymentIntentInput, CreatePaymentIntentOutput } from '@domain/ports/PaymentProvider';
import { logger } from '../logging/logger';

export class StripePaymentProvider implements PaymentProvider {
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY must be set');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-09-30.clover',
    });

    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentOutput> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: input.amount,
        currency: input.currency,
        metadata: {
          orderId: input.orderId,
          customerEmail: input.customerEmail,
          ...input.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info({ paymentIntentId: paymentIntent.id, orderId: input.orderId }, 'PaymentIntent créé');

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret!,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      };
    } catch (error: any) {
      logger.error({ error: error.message }, 'Erreur création PaymentIntent');
      throw error;
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<boolean> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent.status === 'succeeded';
    } catch (error: any) {
      logger.error({ error: error.message, paymentIntentId }, 'Erreur confirmation paiement');
      return false;
    }
  }

  async refundPayment(paymentIntentId: string, amount?: number): Promise<void> {
    try {
      await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
      });

      logger.info({ paymentIntentId, amount }, 'Remboursement créé');
    } catch (error: any) {
      logger.error({ error: error.message, paymentIntentId }, 'Erreur remboursement');
      throw error;
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      logger.warn('STRIPE_WEBHOOK_SECRET non configuré, signature non vérifiée');
      return false;
    }

    try {
      this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
      return true;
    } catch (error: any) {
      logger.error({ error: error.message }, 'Signature webhook invalide');
      return false;
    }
  }

  async handleWebhookEvent(event: any): Promise<void> {
    logger.info({ type: event.type, id: event.id }, 'Webhook Stripe reçu');

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;
      default:
        logger.info({ type: event.type }, 'Type de webhook non géré');
    }
  }

  private async handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;
    logger.info({ orderId, paymentIntentId: paymentIntent.id }, 'Paiement réussi');
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const orderId = paymentIntent.metadata.orderId;
    logger.error({ orderId, paymentIntentId: paymentIntent.id }, 'Paiement échoué');
  }
}

