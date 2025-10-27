export interface CreatePaymentIntentInput {
  amount: number; // En centimes (ex: 1050 = 10.50€)
  currency: string;
  orderId: string;
  customerEmail: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentOutput {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface PaymentProvider {
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentOutput>;
  confirmPayment(paymentIntentId: string): Promise<boolean>;
  refundPayment(paymentIntentId: string, amount?: number): Promise<void>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
  handleWebhookEvent(event: any): Promise<void>;
}

