import { OrderRepo } from '@domain/ports/OrderRepo';
import { ProductRepo } from '@domain/ports/ProductRepo';
import { StockMovementRepo } from '@domain/ports/StockMovementRepo';
import { Mailer } from '@domain/ports/Mailer';
import { CheckStockAlertUseCase } from './CheckStockAlertUseCase';
import { Result, err, ok } from '@core/result';
import { DomainError } from '@core/errors';
import { PaymentMethod } from '@prisma/client';

export interface CreateOrderInput {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CreateOrderOutput {
  orderId: string;
  orderNumber: string;
  totalTTC: number;
}

export class CreateOrderUseCase {
  constructor(
    private orderRepo: OrderRepo,
    private productRepo: ProductRepo,
    private stockMovementRepo: StockMovementRepo,
    private mailer: Mailer
  ) {}

  async execute(input: CreateOrderInput): Promise<Result<CreateOrderOutput, DomainError>> {
    const products = await Promise.all(
      input.items.map(item => this.productRepo.findById(item.productId))
    );

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const item = input.items[i];

      if (!product) {
        return err({ code: 'PRODUCT_NOT_FOUND', message: `Produit ${item.productId} introuvable` });
      }

      if (!product.active) {
        return err({ code: 'PRODUCT_INACTIVE', message: `Le produit ${product.name} n'est plus disponible` });
      }

      if (!product.isInfiniteStock && product.stockQuantity < item.quantity) {
        return err({ 
          code: 'INSUFFICIENT_STOCK', 
          message: `Stock insuffisant pour ${product.name}. Disponible: ${product.stockQuantity}` 
        });
      }
    }

    let totalHT = 0;
    let totalTTC = 0;
    let tvaTotal = 0;

    const orderItems = input.items.map((item, index) => {
      const product = products[index]!;
      const itemTotalHT = Number(product.priceHT) * item.quantity;
      const tvaAmount = itemTotalHT * (Number(product.tvaRate) / 100);
      const itemTotalTTC = itemTotalHT + tvaAmount;

      totalHT += itemTotalHT;
      tvaTotal += tvaAmount;
      totalTTC += itemTotalTTC;

      return {
        productId: product.id,
        quantity: item.quantity,
        priceHT: product.priceHT,
        tvaRate: product.tvaRate,
        totalHT: itemTotalHT,
        totalTTC: itemTotalTTC,
      };
    });

    const orderNumber = await this.orderRepo.generateOrderNumber();

    const order = await this.orderRepo.create({
      orderNumber,
      totalHT,
      totalTTC,
      tvaTotal,
      paymentMethod: input.paymentMethod,
      notes: input.notes,
      user: {
        connect: { id: input.userId },
      },
      items: {
        create: orderItems,
      },
    });

    const checkStockAlertUseCase = new CheckStockAlertUseCase(this.productRepo, this.mailer);
    
    for (const item of input.items) {
      const product = products.find(p => p?.id === item.productId)!;
      
      if (!product.isInfiniteStock) {
        await this.productRepo.decrementStock(item.productId, item.quantity);
        
        await this.stockMovementRepo.create({
          type: 'SALE',
          quantity: -item.quantity,
          reason: `Vente - Commande ${orderNumber}`,
          product: {
            connect: { id: item.productId },
          },
          creator: {
            connect: { id: input.userId },
          },
        });

        checkStockAlertUseCase.execute(item.productId).catch((error) => {
          console.error('Erreur vérification alerte stock:', error);
        });
      }
    }

    return ok({
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalTTC,
    });
  }
}

