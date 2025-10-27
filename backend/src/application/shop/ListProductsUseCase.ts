import { ProductRepo, ProductWithRelations } from '@domain/ports/ProductRepo';
import { Result, ok } from '@core/result';

export interface ListProductsInput {
  categoryId?: string;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListProductsOutput {
  products: ProductWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListProductsUseCase {
  constructor(private productRepo: ProductRepo) {}

  async execute(input: ListProductsInput): Promise<Result<ListProductsOutput, never>> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const skip = (page - 1) * limit;

    const { products, total } = await this.productRepo.findMany({
      categoryId: input.categoryId,
      active: input.active,
      search: input.search,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return ok({
      products,
      total,
      page,
      limit,
      totalPages,
    });
  }
}

