import { Prisma, Order, OrderStatus } from '@prisma/client';
import { OrderRepo, OrderWithRelations } from '@domain/ports/OrderRepo';
import { prisma } from './client';

export class OrderRepoPrisma implements OrderRepo {

  async create(data: Prisma.OrderCreateInput): Promise<Order> {
    return prisma.order.create({ data });
  }

  async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data,
    });
  }

  async findById(id: string): Promise<OrderWithRelations | null> {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderWithRelations | null> {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    });
  }

  async findManyByUser(userId: string, params: { skip?: number; take?: number }): Promise<{ orders: OrderWithRelations[]; total: number }> {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip: params.skip,
        take: params.take,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { userId } }),
    ]);

    return { orders, total };
  }

  async findMany(params: {
    userId?: string;
    status?: OrderStatus;
    skip?: number;
    take?: number;
  }): Promise<{ orders: OrderWithRelations[]; total: number }> {
    const where: Prisma.OrderWhereInput = {
      ...(params.userId && { userId: params.userId }),
      ...(params.status && { status: params.status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where }),
    ]);

    return { orders, total };
  }

  async updateStatus(id: string, status: OrderStatus, notes?: string): Promise<Order> {
    return prisma.order.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes }),
        ...(status === 'PAID' && { paidAt: new Date() }),
      },
    });
  }

  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    
    const sequence = await prisma.invoiceSequence.upsert({
      where: { year },
      update: {
        last: {
          increment: 1,
        },
      },
      create: {
        year,
        last: 1,
      },
    });

    return `FF-${year}-${String(sequence.last).padStart(6, '0')}`;
  }
}

