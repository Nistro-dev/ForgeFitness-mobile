import { SessionRepo } from '@domain/ports/SessionRepo';
import { prisma } from './client';
import { AuditLogService, AuditLogData } from '../audit/AuditLogService';

export class SessionRepoPrismaAudit implements SessionRepo {
  private auditContext?: Partial<AuditLogData>;

  setAuditContext(context: Partial<AuditLogData>) {
    this.auditContext = context;
  }

  private async logAudit(action: string, entityId: string, oldValue?: any, newValue?: any) {
    if (this.auditContext) {
      await AuditLogService.log({
        ...this.auditContext,
        action,
        entity: 'Session',
        entityId,
        oldValue,
        newValue,
      });
    }
  }

  async findById(id: string) {
    return prisma.session.findUnique({
      where: { id },
      include: { user: true, device: true },
    });
  }

  async findMany(options?: { userId?: string; deviceId?: string }) {
    const where: any = {};
    
    if (options?.userId) {
      where.userId = options.userId;
    }
    
    if (options?.deviceId) {
      where.deviceId = options.deviceId;
    }

    return prisma.session.findMany({
      where,
      include: { user: true, device: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    userId: string;
    deviceId?: string;
    expiresAt: Date;
  }) {
    const session = await prisma.session.create({
      data: {
        userId: data.userId,
        deviceId: data.deviceId,
        expiresAt: data.expiresAt,
      },
    });

    await this.logAudit('CREATE', session.id, null, {
      userId: session.userId,
      deviceId: session.deviceId,
      expiresAt: session.expiresAt,
    });

    return session;
  }

  async revoke(id: string, revokedAt: Date) {
    const oldSession = await prisma.session.findUnique({ where: { id } });
    
    await prisma.session.update({
      where: { id },
      data: { revokedAt },
    });

    await this.logAudit('REVOKE', id, {
      revokedAt: oldSession?.revokedAt,
    }, {
      revokedAt,
    });
  }

  async revokeAllForUser(userId: string) {
    const sessions = await prisma.session.findMany({
      where: { userId },
    });

    await prisma.session.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    for (const session of sessions) {
      await this.logAudit('REVOKE_ALL_FOR_USER', session.id, {
        userId: session.userId,
        deviceId: session.deviceId,
      }, {
        revokedAt: new Date(),
      });
    }
  }

  async findActiveSessionsForUser(userId: string) {
    return prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true, device: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findExpiredSessions() {
    return prisma.session.findMany({
      where: {
        expiresAt: { lt: new Date() },
        revokedAt: null,
      },
      include: { user: true, device: true },
    });
  }
}
