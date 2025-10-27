import { ProductRepo } from '@domain/ports/ProductRepo';
import { prisma } from './client';
import { AuditLogService, AuditLogData } from '../audit/AuditLogService';

export class ProductRepoPrismaAudit implements ProductRepo {
  private auditContext?: Partial<AuditLogData>;

  setAuditContext(context: Partial<AuditLogData>) {
    this.auditContext = context;
  }

  private async logAudit(action: string, entityId: string, oldValue?: any, newValue?: any) {
    if (this.auditContext) {
      await AuditLogService.log({
        ...this.auditContext,
        action,
        entity: 'Product',
        entityId,
        oldValue,
        newValue,
      });
    }
  }

  async findById(id: string) {
    return prisma.product.findUnique({ 
      where: { id },
      include: { category: true, creator: true }
    });
  }

  async findMany(options?: { categoryId?: string; active?: boolean; archived?: boolean }) {
    return prisma.product.findMany({
      where: {
        categoryId: options?.categoryId,
        active: options?.active,
        archived: options?.archived,
      },
      include: { category: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async create(data: {
    name: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    categoryId: string;
    priceHT: number;
    tvaRate: number;
    sku: string;
    stockQuantity?: number;
    isInfiniteStock?: boolean;
    minStock?: number;
    active?: boolean;
    archived?: boolean;
    displayOrder?: number;
    createdBy: string;
  }) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        categoryId: data.categoryId,
        priceHT: data.priceHT,
        tvaRate: data.tvaRate,
        sku: data.sku,
        stockQuantity: data.stockQuantity || 0,
        isInfiniteStock: data.isInfiniteStock !== undefined ? data.isInfiniteStock : true,
        minStock: data.minStock || 5,
        active: data.active !== undefined ? data.active : true,
        archived: data.archived !== undefined ? data.archived : false,
        displayOrder: data.displayOrder || 0,
        createdBy: data.createdBy,
      },
    });

    await this.logAudit('CREATE', product.id, null, {
      name: product.name,
      slug: product.slug,
      categoryId: product.categoryId,
      priceHT: product.priceHT,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      active: product.active,
    });

    return product;
  }

  async update(id: string, data: {
    name?: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    categoryId?: string;
    priceHT?: number;
    tvaRate?: number;
    sku?: string;
    stockQuantity?: number;
    isInfiniteStock?: boolean;
    minStock?: number;
    active?: boolean;
    archived?: boolean;
    displayOrder?: number;
  }) {
    const oldProduct = await prisma.product.findUnique({ where: { id } });
    
    await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        shortDescription: data.shortDescription,
        categoryId: data.categoryId,
        priceHT: data.priceHT,
        tvaRate: data.tvaRate,
        sku: data.sku,
        stockQuantity: data.stockQuantity,
        isInfiniteStock: data.isInfiniteStock,
        minStock: data.minStock,
        active: data.active,
        archived: data.archived,
        displayOrder: data.displayOrder,
      },
    });

    const newProduct = await prisma.product.findUnique({ where: { id } });

    await this.logAudit('UPDATE', id, {
      name: oldProduct?.name,
      slug: oldProduct?.slug,
      categoryId: oldProduct?.categoryId,
      priceHT: oldProduct?.priceHT,
      sku: oldProduct?.sku,
      stockQuantity: oldProduct?.stockQuantity,
      active: oldProduct?.active,
    }, {
      name: newProduct?.name,
      slug: newProduct?.slug,
      categoryId: newProduct?.categoryId,
      priceHT: newProduct?.priceHT,
      sku: newProduct?.sku,
      stockQuantity: newProduct?.stockQuantity,
      active: newProduct?.active,
    });
  }

  async delete(id: string) {
    const oldProduct = await prisma.product.findUnique({ where: { id } });
    
    await prisma.product.delete({
      where: { id },
    });

    await this.logAudit('DELETE', id, {
      name: oldProduct?.name,
      slug: oldProduct?.slug,
      categoryId: oldProduct?.categoryId,
      sku: oldProduct?.sku,
    }, null);
  }

  async adjustStock(productId: string, quantity: number, reason: string, createdBy: string) {
    const oldProduct = await prisma.product.findUnique({ where: { id: productId } });
    
    await prisma.product.update({
      where: { id: productId },
      data: {
        stockQuantity: oldProduct!.stockQuantity + quantity,
      },
    });

    await this.logAudit('ADJUST_STOCK', productId, {
      stockQuantity: oldProduct?.stockQuantity,
    }, {
      stockQuantity: oldProduct!.stockQuantity + quantity,
      adjustment: quantity,
      reason,
    });
  }
}
