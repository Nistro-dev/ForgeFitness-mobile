import { ProductRepo } from '@domain/ports/ProductRepo';
import { Mailer } from '@domain/ports/Mailer';
import { prisma } from '@infra/prisma/client';
import { logger } from '@infra/logging/logger';

export class CheckStockAlertUseCase {
  constructor(
    private productRepo: ProductRepo,
    private mailer: Mailer
  ) {}

  async execute(productId: string): Promise<void> {
    const product = await this.productRepo.findById(productId);

    if (!product) {
      return;
    }

    if (product.isInfiniteStock) {
      return;
    }

    if (product.stockQuantity < product.minStock) {
      const existingAlert = await prisma.stockAlert.findFirst({
        where: {
          productId: product.id,
          resolved: false,
        },
      });

      if (!existingAlert) {
        await prisma.stockAlert.create({
          data: {
            productId: product.id,
            triggered: true,
            resolved: false,
          },
        });

        logger.warn({
          productId: product.id,
          productName: product.name,
          stockQuantity: product.stockQuantity,
          minStock: product.minStock,
        }, 'Alerte stock bas déclenchée');

        await this.sendStockAlertEmail(product.name, product.stockQuantity, product.minStock);
      }
    } else {
      await prisma.stockAlert.updateMany({
        where: {
          productId: product.id,
          resolved: false,
        },
        data: {
          resolved: true,
          resolvedAt: new Date(),
        },
      });
    }
  }

  private async sendStockAlertEmail(productName: string, currentStock: number, minStock: number): Promise<void> {
    try {
      const adminEmails = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { email: true },
      });

      if (adminEmails.length === 0) {
        logger.warn('Aucun admin trouvé pour envoyer l\'alerte stock');
        return;
      }

      for (const admin of adminEmails) {
        await this.mailer.send({
          to: { email: admin.email },
          subject: `⚠️ Alerte Stock Bas - ${productName}`,
          html: `
            <h2>Alerte Stock Bas</h2>
            <p>Le stock du produit <strong>${productName}</strong> est en dessous du seuil d'alerte.</p>
            <ul>
              <li>Stock actuel : ${currentStock}</li>
              <li>Seuil minimum : ${minStock}</li>
            </ul>
            <p>Veuillez réapprovisionner ce produit dès que possible.</p>
            <p><em>L'équipe Forge Fitness</em></p>
          `,
        });
      }

      logger.info({
        productName,
        recipientCount: adminEmails.length,
      }, 'Email d\'alerte stock envoyé');
    } catch (error) {
      logger.error({ error, productName }, 'Erreur envoi email alerte stock');
    }
  }

  async checkAllProducts(): Promise<void> {
    const { products } = await this.productRepo.findMany({
      active: true,
    });

    for (const product of products) {
      await this.execute(product.id);
    }
  }
}

