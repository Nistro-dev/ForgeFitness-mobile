import { OrderRepo } from '@domain/ports/OrderRepo';
import { InvoiceGenerator } from '@domain/ports/InvoiceGenerator';
import { prisma } from '@infra/prisma/client';
import { Result, err, ok } from '@core/result';
import { DomainError } from '@core/errors';

export class GenerateInvoiceUseCase {
  constructor(
    private orderRepo: OrderRepo,
    private invoiceGenerator: InvoiceGenerator
  ) {}

  async execute(orderId: string): Promise<Result<{ invoiceNumber: string; pdfUrl: string }, DomainError>> {
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      return err({ code: 'ORDER_NOT_FOUND', message: 'Commande introuvable' });
    }

    if (order.status !== 'PAID') {
      return err({ code: 'ORDER_NOT_PAID', message: 'La commande doit être payée pour générer une facture' });
    }

    const existingInvoice = await prisma.invoice.findUnique({
      where: { orderId },
    });

    if (existingInvoice) {
      return ok({
        invoiceNumber: existingInvoice.invoiceNumber,
        pdfUrl: existingInvoice.pdfUrl || '',
      });
    }

    const invoiceNumber = await this.invoiceGenerator.generateInvoiceNumber();

    const invoiceData = {
      invoiceNumber,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customerName: `${order.user.firstName} ${order.user.lastName}`,
      customerEmail: order.user.email,
      items: order.items.map(item => ({
        productName: item.product.name,
        quantity: item.quantity,
        priceHT: Number(item.priceHT),
        tvaRate: Number(item.tvaRate),
        totalHT: Number(item.totalHT),
        totalTTC: Number(item.totalTTC),
      })),
      totalHT: Number(order.totalHT),
      totalTVA: Number(order.tvaTotal),
      totalTTC: Number(order.totalTTC),
    };

    const pdfBuffer = await this.invoiceGenerator.generatePDF(invoiceData);

    const pdfUrl = await this.invoiceGenerator.savePDF(pdfBuffer, invoiceNumber);

    await prisma.invoice.create({
      data: {
        invoiceNumber,
        orderId: order.id,
        userId: order.userId,
        totalHT: order.totalHT,
        totalTTC: order.totalTTC,
        tvaTotal: order.tvaTotal,
        pdfUrl,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { invoiceNumber },
    });

    this.invoiceGenerator
      .sendByEmail(pdfUrl, order.user.email, invoiceNumber)
      .catch((error) => {
        console.error('Erreur envoi email facture:', error);
      });

    return ok({ invoiceNumber, pdfUrl });
  }
}

