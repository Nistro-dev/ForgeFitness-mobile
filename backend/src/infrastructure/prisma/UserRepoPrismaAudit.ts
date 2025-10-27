import { UserRepo } from '@domain/ports/UserRepo';
import { UserRole, UserStatus } from '@prisma/client';
import { UserRepoPrisma } from './UserRepoPrisma';
import { AuditLogService } from '../audit/AuditLogService';
import { RequestContext } from '../audit/RequestContext';

export class UserRepoPrismaAudit extends UserRepoPrisma implements UserRepo {
  private auditContext: RequestContext | null = null;
  private auditService!: AuditLogService;

  constructor() {
    super();
    // L'AuditLogService sera injecté via setAuditService
  }

  setAuditService(auditService: AuditLogService): void {
    this.auditService = auditService;
  }

  setAuditContext(context: RequestContext): void {
    this.auditContext = context;
  }

  private async logAction(action: string, entityId: string, oldValue?: any, newValue?: any): Promise<void> {
    if (!this.auditContext) return;

    try {
      await this.auditService.log({
        userId: this.auditContext.userId,
        action,
        entity: 'User',
        entityId,
        oldValue,
        newValue,
        ipAddress: this.auditContext.ipAddress,
        userAgent: this.auditContext.userAgent,
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'audit log:', error);
    }
  }

  async create(data: { 
    email: string; 
    firstName: string; 
    lastName: string;
    password?: string;
    role?: UserRole;
    status?: UserStatus;
  }) {
    const user = await super.create(data);
    
    await this.logAction('CREATE', user.id, null, {
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
    const oldUser = await this.findById(userId);
    
    await super.update(userId, data);
    
    const newUser = await this.findById(userId);
    
    await this.logAction('UPDATE', userId, {
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
    const oldUser = await this.findById(userId);
    
    await super.updateRole(userId, role);
    
    await this.logAction('UPDATE_ROLE', userId, {
      role: oldUser?.role,
    }, {
      role,
    });
  }

  async updateStatus(userId: string, status: UserStatus) {
    const oldUser = await this.findById(userId);
    
    await super.updateStatus(userId, status);
    
    await this.logAction('UPDATE_STATUS', userId, {
      status: oldUser?.status,
    }, {
      status,
    });
  }

  async delete(userId: string) {
    const oldUser = await this.findById(userId);
    
    await super.delete(userId);
    
    await this.logAction('DELETE', userId, {
      email: oldUser?.email,
      firstName: oldUser?.firstName,
      lastName: oldUser?.lastName,
      role: oldUser?.role,
      status: oldUser?.status,
    }, null);
  }

  async setPassword(userId: string, password: string) {
    await super.setPassword(userId, password);
    
    await this.logAction('UPDATE_PASSWORD', userId, null, {
      passwordChanged: true,
    });
  }
}