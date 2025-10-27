import { prisma } from '../prisma/client';

export interface AuditLogData {
  userId?: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogFilters {
  entity?: string;
  action?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface AuditLogStats {
  totalLogs: number;
  logsByEntity: Record<string, number>;
  logsByAction: Record<string, number>;
  recentActivity: any[];
}

export class AuditLogService {
  async createLog(data: AuditLogData): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        oldValue: data.oldValue,
        newValue: data.newValue,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    });
  }

  async log(data: AuditLogData): Promise<void> {
    return this.createLog(data);
  }

  async getAllLogs(filters: AuditLogFilters = {}): Promise<any[]> {
    const where: any = {};

    if (filters.entity) {
      where.entity = filters.entity;
    }

    if (filters.action) {
      where.action = filters.action;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.createdAt.lte = new Date(filters.dateTo);
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters.limit || 50,
    });

    return logs;
  }

  async getLogsForEntity(entity: string, entityId: string): Promise<any[]> {
    const logs = await prisma.auditLog.findMany({
      where: {
        entity,
        entityId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return logs;
  }

  async getLogsForUser(userId: string, limit?: number): Promise<any[]> {
    const logs = await prisma.auditLog.findMany({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return logs;
  }

  async getStats(): Promise<AuditLogStats> {
    const totalLogs = await prisma.auditLog.count();

    const logsByEntity = await prisma.auditLog.groupBy({
      by: ['entity'],
      _count: {
        entity: true,
      },
    });

    const logsByAction = await prisma.auditLog.groupBy({
      by: ['action'],
      _count: {
        action: true,
      },
    });

    const recentActivity = await prisma.auditLog.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    return {
      totalLogs,
      logsByEntity: logsByEntity.reduce((acc, item) => {
        acc[item.entity] = item._count.entity;
        return acc;
      }, {} as Record<string, number>),
      logsByAction: logsByAction.reduce((acc, item) => {
        acc[item.action] = item._count.action;
        return acc;
      }, {} as Record<string, number>),
      recentActivity,
    };
  }
}