import { OrderRepo } from '@domain/ports/OrderRepo';
import { prisma } from './client';
import { AuditLogService, AuditLogData } from '../audit/AuditLogService';
import { OrderStatus } from '@prisma/client';

export class OrderRepoPrismaAudit implements OrderRepo {
  private auditContext?: Partial<AuditLogData>;

  setAuditContext(context: Partial<AuditLogData>) {
    this.auditContext = context;
  }

  private async logAudit(action: string, entityId: string, oldValue?: any, newValue?: any) {
    if (this.auditContext) {
      await AuditLogService.log({
        ...this.auditContext,
        action,
        entity: 'Order',
        entityId,
        oldValue,
        newValue,
      });
    }
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: { product: true }
        },
        invoice: true,
        transaction: true,
      },
    });
  }

  async findMany(options?: { userId?: string; status?: OrderStatus }) {
    return prisma.order.findMany({
      where: {
        userId: options?.userId,
        status: options?.status,
      },
      include: {
        user: true,
        items: {
          include: { product: true }
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    orderNumber: string;
    userId: string;
    totalHT: number;
    totalTTC: number;
    tvaTotal: number;
    paymentMethod: string;
    status?: OrderStatus;
    notes?: string;
  }) {
    const order = await prisma.order.create({
      data: {
        orderNumber: data.orderNumber,
        userId: data.userId,
        totalHT: data.totalHT,
        totalTTC: data.totalTTC,
        tvaTotal: data.tvaTotal,
        paymentMethod: data.paymentMethod as any,
        status: data.status || OrderStatus.PENDING,
        notes: data.notes,
      },
    });

    await this.logAudit('CREATE', order.id, null, {
      orderNumber: order.orderNumber,
      userId: order.userId,
      totalHT: order.totalHT,
      totalTTC: order.totalTTC,
      status: order.status,
    });

    return order;
  }

  async updateStatus(id: string, status: OrderStatus) {
    const oldOrder = await prisma.order.findUnique({ where: { id } });
    
    await prisma.order.update({
      where: { id },
      data: { status },
    });

    await this.logAudit('UPDATE_STATUS', id, {
      status: oldOrder?.status,
    }, {
      status,
    });
  }

  async markAsPaid(id: string, paidAt: Date) {
    const oldOrder = await prisma.order.findUnique({ where: { id } });
    
    await prisma.order.update({
      where: { id },
      data: { 
        status: OrderStatus.PAID,
        paidAt,
      },
    });

    await this.logAudit('MARK_AS_PAID', id, {
      status: oldOrder?.status,
      paidAt: oldOrder?.paidAt,
    }, {
      status: OrderStatus.PAID,
      paidAt,
    });
  }

  async addInvoice(id: string, invoiceNumber: string) {
    const oldOrder = await prisma.order.findUnique({ where: { id } });
    
    await prisma.order.update({
      where: { id },
      data: { invoiceNumber },
    });

    await this.logAudit('ADD_INVOICE', id, {
      invoiceNumber: oldOrder?.invoiceNumber,
    }, {
      invoiceNumber,
    });
  }
}
