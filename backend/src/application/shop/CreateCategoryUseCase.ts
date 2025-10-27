import { CategoryRepo } from '@domain/ports/CategoryRepo';
import { Result, err, ok } from '@core/result';
import { DomainError } from '@core/errors';

export interface CreateCategoryInput {
  name: string;
  slug: string;
  displayOrder?: number;
  active?: boolean;
}

export class CreateCategoryUseCase {
  constructor(private categoryRepo: CategoryRepo) {}

  async execute(input: CreateCategoryInput): Promise<Result<{ id: string }, DomainError>> {
    const existingByName = await this.categoryRepo.findByName(input.name);
    if (existingByName) {
      return err({ code: 'CATEGORY_NAME_EXISTS', message: 'Une catégorie avec ce nom existe déjà' });
    }

    const existingBySlug = await this.categoryRepo.findBySlug(input.slug);
    if (existingBySlug) {
      return err({ code: 'SLUG_ALREADY_EXISTS', message: 'Ce slug existe déjà' });
    }

    try {
      const category = await this.categoryRepo.create({
        name: input.name,
        slug: input.slug,
        displayOrder: input.displayOrder ?? 0,
        active: input.active ?? true,
      });

      return ok({ id: category.id });
    } catch (error: any) {
      return err({ code: 'CATEGORY_CREATION_FAILED', message: error.message || 'Erreur lors de la création de la catégorie' });
    }
  }
}
