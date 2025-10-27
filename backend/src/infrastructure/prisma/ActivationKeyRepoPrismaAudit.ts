import { ActivationKeyRepo } from '@domain/ports/ActivationKeyRepo';
import { prisma } from './client';
import { AuditLogService, AuditLogData } from '../audit/AuditLogService';

export class ActivationKeyRepoPrismaAudit implements ActivationKeyRepo {
  private auditContext?: Partial<AuditLogData>;

  setAuditContext(context: Partial<AuditLogData>) {
    this.auditContext = context;
  }

  private async logAudit(action: string, entityId: string, oldValue?: any, newValue?: any) {
    if (this.auditContext) {
      await AuditLogService.log({
        ...this.auditContext,
        action,
        entity: 'ActivationKey',
        entityId,
        oldValue,
        newValue,
      });
    }
  }

  async findById(id: string) {
    return prisma.activationKey.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByKey(key: string) {
    return prisma.activationKey.findUnique({
      where: { key },
      include: { user: true },
    });
  }

  async findMany(options?: { userId?: string; expired?: boolean }) {
    const where: any = {};
    
    if (options?.userId) {
      where.userId = options.userId;
    }
    
    if (options?.expired !== undefined) {
      if (options.expired) {
        where.expiresAt = { lt: new Date() };
      } else {
        where.expiresAt = { gte: new Date() };
      }
    }

    return prisma.activationKey.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    userId: string;
    key: string;
    expiresAt: Date;
  }) {
    const activationKey = await prisma.activationKey.create({
      data: {
        userId: data.userId,
        key: data.key,
        expiresAt: data.expiresAt,
      },
    });

    await this.logAudit('CREATE', activationKey.id, null, {
      userId: activationKey.userId,
      key: activationKey.key,
      expiresAt: activationKey.expiresAt,
    });

    return activationKey;
  }

  async markAsUsed(id: string, usedAt: Date) {
    const oldKey = await prisma.activationKey.findUnique({ where: { id } });
    
    await prisma.activationKey.update({
      where: { id },
      data: { usedAt },
    });

    await this.logAudit('MARK_AS_USED', id, {
      usedAt: oldKey?.usedAt,
    }, {
      usedAt,
    });
  }

  async revoke(id: string) {
    const oldKey = await prisma.activationKey.findUnique({ where: { id } });
    
    await prisma.activationKey.delete({
      where: { id },
    });

    await this.logAudit('REVOKE', id, {
      userId: oldKey?.userId,
      key: oldKey?.key,
      expiresAt: oldKey?.expiresAt,
    }, null);
  }

  async revokeAllForUser(userId: string) {
    const keys = await prisma.activationKey.findMany({
      where: { userId },
    });

    await prisma.activationKey.deleteMany({
      where: { userId },
    });

    for (const key of keys) {
      await this.logAudit('REVOKE_ALL_FOR_USER', key.id, {
        userId: key.userId,
        key: key.key,
      }, null);
    }
  }

  async findValidKeyForUser(userId: string) {
    return prisma.activationKey.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
        usedAt: null,
      },
      include: { user: true },
    });
  }
}
