import { CategoryRepo } from '@domain/ports/CategoryRepo';
import { Category } from '@prisma/client';
import { Result, ok } from '@core/result';

export class ListCategoriesUseCase {
  constructor(private categoryRepo: CategoryRepo) {}

  async execute(activeOnly: boolean = true): Promise<Result<Category[], never>> {
    const categories = await this.categoryRepo.findMany({ 
      active: activeOnly ? true : undefined 
    });

    return ok(categories);
  }
}

