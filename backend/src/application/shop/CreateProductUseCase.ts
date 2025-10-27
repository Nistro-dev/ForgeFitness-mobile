import { ProductRepo } from '@domain/ports/ProductRepo';
import { CategoryRepo } from '@domain/ports/CategoryRepo';
import { Result, err, ok } from '@core/result';
import { DomainError } from '@core/errors';

export interface CreateProductInput {
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
  displayOrder?: number;
  createdBy: string;
}

export class CreateProductUseCase {
  constructor(
    private productRepo: ProductRepo,
    private categoryRepo: CategoryRepo
  ) {}

  async execute(input: CreateProductInput): Promise<Result<{ id: string }, DomainError>> {
    const category = await this.categoryRepo.findById(input.categoryId);
    if (!category) {
      return err({ code: 'CATEGORY_NOT_FOUND', message: 'Catégorie introuvable' });
    }

    const existingBySlug = await this.productRepo.findBySlug(input.slug);
    if (existingBySlug) {
      return err({ code: 'SLUG_ALREADY_EXISTS', message: 'Ce slug existe déjà' });
    }

    try {
      const product = await this.productRepo.create({
        name: input.name,
        slug: input.slug,
        description: input.description,
        shortDescription: input.shortDescription,
        priceHT: input.priceHT,
        tvaRate: input.tvaRate,
        sku: input.sku,
        stockQuantity: input.stockQuantity ?? 0,
        isInfiniteStock: input.isInfiniteStock ?? true,
        minStock: input.minStock ?? 5,
        active: input.active ?? true,
        displayOrder: input.displayOrder ?? 0,
        category: {
          connect: { id: input.categoryId },
        },
        creator: {
          connect: { id: input.createdBy },
        },
      });

      return ok({ id: product.id });
    } catch (error: any) {
      if (error.code === 'P2002') {
        return err({ code: 'SKU_ALREADY_EXISTS', message: 'Ce SKU existe déjà' });
      }
      throw error;
    }
  }
}

