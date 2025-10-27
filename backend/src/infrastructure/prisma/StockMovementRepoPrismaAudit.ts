import { StockMovementRepo } from '@domain/ports/StockMovementRepo';
import { prisma } from './client';
import { AuditLogService, AuditLogData } from '../audit/AuditLogService';
import { StockMovementType } from '@prisma/client';

export class StockMovementRepoPrismaAudit implements StockMovementRepo {
  private auditContext?: Partial<AuditLogData>;

  setAuditContext(context: Partial<AuditLogData>) {
    this.auditContext = context;
  }

  private async logAudit(action: string, entityId: string, oldValue?: any, newValue?: any) {
    if (this.auditContext) {
      await AuditLogService.log({
        ...this.auditContext,
        action,
        entity: 'StockMovement',
        entityId,
        oldValue,
        newValue,
      });
    }
  }

  async findById(id: string) {
    return prisma.stockMovement.findUnique({
      where: { id },
      include: {
        product: true,
        creator: true,
      },
    });
  }

  async findMany(options?: { productId?: string; type?: StockMovementType }) {
    return prisma.stockMovement.findMany({
      where: {
        productId: options?.productId,
        type: options?.type,
      },
      include: {
        product: true,
        creator: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    productId: string;
    type: StockMovementType;
    quantity: number;
    reason: string;
    orderId?: string;
    createdBy: string;
  }) {
    const stockMovement = await prisma.stockMovement.create({
      data: {
        productId: data.productId,
        type: data.type,
        quantity: data.quantity,
        reason: data.reason,
        orderId: data.orderId,
        createdBy: data.createdBy,
      },
    });

    await this.logAudit('CREATE', stockMovement.id, null, {
      productId: stockMovement.productId,
      type: stockMovement.type,
      quantity: stockMovement.quantity,
      reason: stockMovement.reason,
      orderId: stockMovement.orderId,
    });

    return stockMovement;
  }

  async findByProductId(productId: string) {
    return prisma.stockMovement.findMany({
      where: { productId },
      include: {
        product: true,
        creator: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStockHistory(productId: string, limit?: number) {
    return prisma.stockMovement.findMany({
      where: { productId },
      include: {
        creator: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
