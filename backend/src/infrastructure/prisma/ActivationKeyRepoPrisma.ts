import { ActivationKeyRepo, ActivationKey } from '@domain/ports/ActivationKeyRepo';
import { prisma } from './client';

export class ActivationKeyRepoPrisma implements ActivationKeyRepo {
  async createForUser(userId: string, code: string, expiresAt: Date): Promise<void> {
    await prisma.activationKey.create({
      data: { userId, code, expiresAt },
    });
  }

  async findByCode(code: string): Promise<ActivationKey | null> {
    const k = await prisma.activationKey.findUnique({ where: { code } });
    return k ? ({ ...k } as ActivationKey) : null;
  }

  async markUsed(code: string): Promise<void> {
    await prisma.activationKey.update({
      where: { code },
      data: { usedAt: new Date() },
    });
  }
}
