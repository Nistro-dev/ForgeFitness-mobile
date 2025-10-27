import { StockMovement, Prisma } from '@prisma/client';

export interface StockMovementRepo {
  create(data: Prisma.StockMovementCreateInput): Promise<StockMovement>;
  findManyByProduct(productId: string, params: { skip?: number; take?: number }): Promise<{ movements: StockMovement[]; total: number }>;
}

