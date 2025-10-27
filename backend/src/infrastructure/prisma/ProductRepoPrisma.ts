import { Prisma, Product, ProductImage } from '@prisma/client';
import { ProductRepo, ProductWithRelations } from '@domain/ports/ProductRepo';
import { prisma } from './client';

export class ProductRepoPrisma implements ProductRepo {

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return prisma.product.create({ data });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.product.update({
      where: { id },
      data: { 
        archived: true,
        active: false 
      }
    });
  }

  async hardDelete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  async findById(id: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<ProductWithRelations | null> {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async findMany(params: {
    categoryId?: string;
    active?: boolean;
    archived?: boolean;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{ products: ProductWithRelations[]; total: number }> {
    const where: Prisma.ProductWhereInput = {
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.active !== undefined && { active: params.active }),
      ...(params.archived !== undefined && { archived: params.archived }),
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: 'insensitive' } },
          { description: { contains: params.search, mode: 'insensitive' } },
          { sku: { contains: params.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: params.skip,
        take: params.take,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          images: {
            orderBy: { displayOrder: 'asc' },
          },
        },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total };
  }

  async decrementStock(id: string, quantity: number): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        stockQuantity: {
          decrement: quantity,
        },
      },
    });
  }

  async incrementStock(id: string, quantity: number): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        stockQuantity: {
          increment: quantity,
        },
      },
    });
  }

  async addImage(productId: string, data: Prisma.ProductImageCreateWithoutProductInput): Promise<ProductImage> {
    return prisma.productImage.create({
      data: {
        ...data,
        product: {
          connect: { id: productId },
        },
      },
    });
  }

  async removeImage(imageId: string): Promise<void> {
    await prisma.productImage.delete({ where: { id: imageId } });
  }
}

