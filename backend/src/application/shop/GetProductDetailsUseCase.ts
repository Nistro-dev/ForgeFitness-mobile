import { ProductRepo, ProductWithRelations } from '@domain/ports/ProductRepo';
import { Result, err, ok } from '@core/result';
import { DomainError } from '@core/errors';

export class GetProductDetailsUseCase {
  constructor(private productRepo: ProductRepo) {}

  async execute(slugOrId: string): Promise<Result<ProductWithRelations, DomainError>> {
    let product = await this.productRepo.findBySlug(slugOrId);
    
    if (!product) {
      product = await this.productRepo.findById(slugOrId);
    }

    if (!product) {
      return err({ code: 'PRODUCT_NOT_FOUND', message: 'Produit introuvable' });
    }

    return ok(product);
  }
}

