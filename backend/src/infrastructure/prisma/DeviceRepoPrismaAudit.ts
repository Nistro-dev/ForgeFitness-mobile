import { DeviceRepo } from '@domain/ports/DeviceRepo';
import { prisma } from './client';
import { AuditLogService, AuditLogData } from '../audit/AuditLogService';
import { Platform } from '@prisma/client';

export class DeviceRepoPrismaAudit implements DeviceRepo {
  private auditContext?: Partial<AuditLogData>;

  setAuditContext(context: Partial<AuditLogData>) {
    this.auditContext = context;
  }

  private async logAudit(action: string, entityId: string, oldValue?: any, newValue?: any) {
    if (this.auditContext) {
      await AuditLogService.log({
        ...this.auditContext,
        action,
        entity: 'Device',
        entityId,
        oldValue,
        newValue,
      });
    }
  }

  async findById(id: string) {
    return prisma.device.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async findByDeviceUid(deviceUid: string) {
    return prisma.device.findFirst({
      where: { deviceUid },
      include: { user: true },
    });
  }

  async findMany(options?: { userId?: string; platform?: Platform }) {
    const where: any = {};
    
    if (options?.userId) {
      where.userId = options.userId;
    }
    
    if (options?.platform) {
      where.platform = options.platform;
    }

    return prisma.device.findMany({
      where,
      include: { user: true },
      orderBy: { lastSeenAt: 'desc' },
    });
  }

  async create(data: {
    userId: string;
    deviceUid: string;
    platform: Platform;
    model?: string;
    appVersion?: string;
  }) {
    const device = await prisma.device.create({
      data: {
        userId: data.userId,
        deviceUid: data.deviceUid,
        platform: data.platform,
        model: data.model,
        appVersion: data.appVersion,
      },
    });

    await this.logAudit('CREATE', device.id, null, {
      userId: device.userId,
      deviceUid: device.deviceUid,
      platform: device.platform,
      model: device.model,
      appVersion: device.appVersion,
    });

    return device;
  }

  async updateLastSeen(id: string, lastSeenAt: Date) {
    const oldDevice = await prisma.device.findUnique({ where: { id } });
    
    await prisma.device.update({
      where: { id },
      data: { lastSeenAt },
    });

    await this.logAudit('UPDATE_LAST_SEEN', id, {
      lastSeenAt: oldDevice?.lastSeenAt,
    }, {
      lastSeenAt,
    });
  }

  async revoke(id: string, revokedAt: Date) {
    const oldDevice = await prisma.device.findUnique({ where: { id } });
    
    await prisma.device.update({
      where: { id },
      data: { revokedAt },
    });

    await this.logAudit('REVOKE', id, {
      revokedAt: oldDevice?.revokedAt,
    }, {
      revokedAt,
    });
  }

  async revokeAllForUser(userId: string) {
    const devices = await prisma.device.findMany({
      where: { userId },
    });

    await prisma.device.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    for (const device of devices) {
      await this.logAudit('REVOKE_ALL_FOR_USER', device.id, {
        userId: device.userId,
        deviceUid: device.deviceUid,
      }, {
        revokedAt: new Date(),
      });
    }
  }

  async findActiveDevicesForUser(userId: string) {
    return prisma.device.findMany({
      where: {
        userId,
        revokedAt: null,
      },
      include: { user: true },
      orderBy: { lastSeenAt: 'desc' },
    });
  }
}
