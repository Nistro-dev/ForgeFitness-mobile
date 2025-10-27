import { Prisma, StockMovement } from '@prisma/client';
import { StockMovementRepo } from '@domain/ports/StockMovementRepo';
import { prisma } from './client';

export class StockMovementRepoPrisma implements StockMovementRepo {

  async create(data: Prisma.StockMovementCreateInput): Promise<StockMovement> {
    return prisma.stockMovement.create({ data });
  }

  async findManyByProduct(productId: string, params: { skip?: number; take?: number }): Promise<{ movements: StockMovement[]; total: number }> {
    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where: { productId },
        skip: params.skip,
        take: params.take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.stockMovement.count({ where: { productId } }),
    ]);

    return { movements, total };
  }
}

