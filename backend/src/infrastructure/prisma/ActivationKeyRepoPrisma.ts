import { prisma } from './client';
import type { ActivationKeyRepo } from '../../domain/ports/ActivationKeyRepo';

export class ActivationKeyRepoPrisma implements ActivationKeyRepo {
  async invalidateActiveForUser(userId: string) {
    await prisma.activationKey.updateMany({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    })
  }

  async create(data: { userId: string; key: string; expiresAt: Date }) {
    return prisma.activationKey.create({
      data: {
        userId: data.userId,
        key: data.key,
        expiresAt: data.expiresAt,
      },
    })
  }

  async findActiveByUserId(userId: string) {
    return prisma.activationKey.findFirst({
      where: {
        userId,
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async invalidate(id: string, reason: string) {
    await prisma.activationKey.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async markUsed(id: string) {
    await prisma.activationKey.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}