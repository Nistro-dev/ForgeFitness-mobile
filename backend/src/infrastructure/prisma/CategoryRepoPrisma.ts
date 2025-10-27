import { Prisma, Category } from '@prisma/client';
import { CategoryRepo } from '@domain/ports/CategoryRepo';
import { prisma } from './client';

export class CategoryRepoPrisma implements CategoryRepo {

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({ where: { id } });
  }

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { id } });
  }

  async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({ where: { slug } });
  }

  async findByName(name: string): Promise<Category | null> {
    return prisma.category.findFirst({ where: { name } });
  }

  async findMany(params: { active?: boolean }): Promise<Category[]> {
    return prisma.category.findMany({
      where: params.active !== undefined ? { active: params.active } : undefined,
      orderBy: { displayOrder: 'asc' },
    });
  }
}

