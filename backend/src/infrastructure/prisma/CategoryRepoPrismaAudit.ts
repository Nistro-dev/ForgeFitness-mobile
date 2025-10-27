import { CategoryRepo } from '@domain/ports/CategoryRepo';
import { prisma } from './client';
import { AuditLogService, AuditLogData } from '../audit/AuditLogService';

export class CategoryRepoPrismaAudit implements CategoryRepo {
  private auditContext?: Partial<AuditLogData>;

  setAuditContext(context: Partial<AuditLogData>) {
    this.auditContext = context;
  }

  private async logAudit(action: string, entityId: string, oldValue?: any, newValue?: any) {
    if (this.auditContext) {
      await AuditLogService.log({
        ...this.auditContext,
        action,
        entity: 'Category',
        entityId,
        oldValue,
        newValue,
      });
    }
  }

  async findById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  }

  async findMany(options?: { active?: boolean }) {
    return prisma.category.findMany({
      where: options?.active !== undefined ? { active: options.active } : {},
      orderBy: { displayOrder: 'asc' },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    displayOrder?: number;
    active?: boolean;
  }) {
    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        displayOrder: data.displayOrder || 0,
        active: data.active !== undefined ? data.active : true,
      },
    });

    await this.logAudit('CREATE', category.id, null, {
      name: category.name,
      slug: category.slug,
      displayOrder: category.displayOrder,
      active: category.active,
    });

    return category;
  }

  async update(id: string, data: {
    name?: string;
    slug?: string;
    displayOrder?: number;
    active?: boolean;
  }) {
    const oldCategory = await prisma.category.findUnique({ where: { id } });
    
    await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        displayOrder: data.displayOrder,
        active: data.active,
      },
    });

    const newCategory = await prisma.category.findUnique({ where: { id } });

    await this.logAudit('UPDATE', id, {
      name: oldCategory?.name,
      slug: oldCategory?.slug,
      displayOrder: oldCategory?.displayOrder,
      active: oldCategory?.active,
    }, {
      name: newCategory?.name,
      slug: newCategory?.slug,
      displayOrder: newCategory?.displayOrder,
      active: newCategory?.active,
    });
  }

  async delete(id: string) {
    const oldCategory = await prisma.category.findUnique({ where: { id } });
    
    await prisma.category.delete({
      where: { id },
    });

    await this.logAudit('DELETE', id, {
      name: oldCategory?.name,
      slug: oldCategory?.slug,
      displayOrder: oldCategory?.displayOrder,
      active: oldCategory?.active,
    }, null);
  }
}
