import { UserRepo } from '@domain';
import { UserRole, UserStatus } from '@prisma/client';
import { prisma } from './client';
import { AuditLogService, AuditLogData } from '../audit/AuditLogService';

export class UserRepoPrisma implements UserRepo {
  private auditContext?: Partial<AuditLogData>;

  setAuditContext(context: Partial<AuditLogData>) {
    this.auditContext = context;
  }

  private async logAudit(action: string, entityId: string, oldValue?: any, newValue?: any) {
    if (this.auditContext) {
      await AuditLogService.log({
        ...this.auditContext,
        action,
        entity: 'User',
        entityId,
        oldValue,
        newValue,
      });
    }
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findMany() {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: { 
    email: string; 
    firstName: string; 
    lastName: string;
    password?: string;
    role?: UserRole;
    status?: UserStatus;
  }) {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        role: data.role || UserRole.USER,
        status: data.status || UserStatus.ACTIVE,
      },
    });

    await this.logAudit('CREATE', user.id, null, {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
    });

    return user;
  }

  async update(userId: string, data: {
    email?: string;
    firstName?: string;
    lastName?: string;
  }) {
    const oldUser = await prisma.user.findUnique({ where: { id: userId } });
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });

    const newUser = await prisma.user.findUnique({ where: { id: userId } });

    await this.logAudit('UPDATE', userId, {
      email: oldUser?.email,
      firstName: oldUser?.firstName,
      lastName: oldUser?.lastName,
    }, {
      email: newUser?.email,
      firstName: newUser?.firstName,
      lastName: newUser?.lastName,
    });
  }

  async updateRole(userId: string, role: UserRole) {
    const oldUser = await prisma.user.findUnique({ where: { id: userId } });
    
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    await this.logAudit('UPDATE_ROLE', userId, {
      role: oldUser?.role,
    }, {
      role,
    });
  }

  async updateStatus(userId: string, status: UserStatus) {
    const oldUser = await prisma.user.findUnique({ where: { id: userId } });
    
    await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    await this.logAudit('UPDATE_STATUS', userId, {
      status: oldUser?.status,
    }, {
      status,
    });
  }

  async delete(userId: string) {
    const oldUser = await prisma.user.findUnique({ where: { id: userId } });
    
    await prisma.user.delete({
      where: { id: userId },
    });

    await this.logAudit('DELETE', userId, {
      email: oldUser?.email,
      firstName: oldUser?.firstName,
      lastName: oldUser?.lastName,
      role: oldUser?.role,
      status: oldUser?.status,
    }, null);
  }

  async updateNames(userId: string, names: { firstName: string; lastName: string }) {
    const oldUser = await prisma.user.findUnique({ where: { id: userId } });
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: names.firstName,
        lastName: names.lastName,
      },
    });

    await this.logAudit('UPDATE_NAMES', userId, {
      firstName: oldUser?.firstName,
      lastName: oldUser?.lastName,
    }, {
      firstName: names.firstName,
      lastName: names.lastName,
    });
  }

  async setCurrentActivationKey(userId: string, activationKeyId: string | null) {
    await prisma.user.update({
      where: { id: userId },
      data: { currentActivationKeyId: activationKeyId },
    });

    await this.logAudit('SET_ACTIVATION_KEY', userId, null, {
      activationKeyId,
    });
  }

  async updateCurrentPointers(params: {
    userId: string;
    deviceId?: string | null;
    sessionId?: string | null;
    activationKeyId?: string | null;
  }) {
    await prisma.user.update({
      where: { id: params.userId },
      data: {
        currentDeviceId: params.deviceId ?? undefined,
        currentSessionId: params.sessionId ?? undefined,
        currentActivationKeyId: params.activationKeyId ?? undefined,
      },
    });

    await this.logAudit('UPDATE_POINTERS', params.userId, null, {
      deviceId: params.deviceId,
      sessionId: params.sessionId,
      activationKeyId: params.activationKeyId,
    });
  }

  async setPassword(userId: string, password: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { password },
    });

    await this.logAudit('SET_PASSWORD', userId, null, {
      passwordSet: true,
    });
  }
}
