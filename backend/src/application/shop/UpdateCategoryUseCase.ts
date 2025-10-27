import { CategoryRepo } from '@domain/ports/CategoryRepo';
import { Category } from '@prisma/client';
import { Result, ok, err } from '@core/result';
import { NotFoundError, AppError } from '@core/errors';

type Input = {
  id: string;
  name?: string;
  slug?: string;
  displayOrder?: number;
  active?: boolean;
};

type Output = Category;

export class UpdateCategoryUseCase {
  constructor(private categoryRepo: CategoryRepo) {}

  async execute(input: Input): Promise<Result<Output, AppError>> {
    const existingCategory = await this.categoryRepo.findById(input.id);
    if (!existingCategory) {
      return err(new NotFoundError('Catégorie introuvable'));
    }

    const updateData = {
      name: input.name,
      slug: input.slug,
      displayOrder: input.displayOrder,
      active: input.active,
    };

    await this.categoryRepo.update(input.id, updateData);

    const updatedCategory = await this.categoryRepo.findById(input.id);
    if (!updatedCategory) {
      return err(AppError.badRequest('Échec de la mise à jour'));
    }

    return ok(updatedCategory);
  }
}
