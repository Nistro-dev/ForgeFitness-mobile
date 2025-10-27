import { Product, ProductImage, Prisma } from '@prisma/client';

export type ProductWithRelations = Product & {
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: ProductImage[];
};

export interface ProductRepo {
  create(data: Prisma.ProductCreateInput): Promise<Product>;
  update(id: string, data: Prisma.ProductUpdateInput): Promise<Product>;
  delete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;
  findById(id: string): Promise<ProductWithRelations | null>;
  findBySlug(slug: string): Promise<ProductWithRelations | null>;
  findMany(params: {
    categoryId?: string;
    active?: boolean;
    archived?: boolean;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{ products: ProductWithRelations[]; total: number }>;
  decrementStock(id: string, quantity: number): Promise<Product>;
  incrementStock(id: string, quantity: number): Promise<Product>;
  addImage(productId: string, data: Prisma.ProductImageCreateWithoutProductInput): Promise<ProductImage>;
  removeImage(imageId: string): Promise<void>;
}

