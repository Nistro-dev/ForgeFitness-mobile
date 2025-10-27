import { CategoryRepo } from '@domain/ports/CategoryRepo';
import { CategoryRepoPrisma } from './CategoryRepoPrisma';
import { AuditLogService } from '../audit/AuditLogService';
import { RequestContext } from '../audit/RequestContext';
import { Prisma } from '@prisma/client';

export class CategoryRepoPrismaAudit extends CategoryRepoPrisma implements CategoryRepo {
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
        entity: 'Category',
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

  async create(data: Prisma.CategoryCreateInput) {
    const category = await super.create(data);
    
    await this.logAction('CREATE', category.id, null, {
      name: category.name,
      slug: category.slug,
      displayOrder: category.displayOrder,
      active: category.active,
    });

    return category;
  }

  async update(id: string, data: Prisma.CategoryUpdateInput) {
    const oldCategory = await this.findById(id);
    
    const category = await super.update(id, data);
    
    await this.logAction('UPDATE', id, {
      name: oldCategory?.name,
      slug: oldCategory?.slug,
      displayOrder: oldCategory?.displayOrder,
      active: oldCategory?.active,
    }, {
      name: category.name,
      slug: category.slug,
      displayOrder: category.displayOrder,
      active: category.active,
    });

    return category;
  }

  async delete(id: string) {
    const oldCategory = await this.findById(id);
    
    await super.delete(id);
    
    await this.logAction('DELETE', id, {
      name: oldCategory?.name,
      slug: oldCategory?.slug,
      displayOrder: oldCategory?.displayOrder,
      active: oldCategory?.active,
    }, null);
  }
}