import { z } from 'zod';

export const CreateProductDto = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  categoryId: z.string().cuid(),
  priceHT: z.number().positive('Le prix HT doit être positif'),
  tvaRate: z.number().min(0).max(100, 'Le taux de TVA doit être entre 0 et 100'),
  sku: z.string().min(1, 'Le SKU est requis'),
  stockQuantity: z.number().int().min(0).default(0),
  isInfiniteStock: z.boolean().default(true),
  minStock: z.number().int().min(0).default(5),
  active: z.boolean().default(true),
  displayOrder: z.number().int().default(0),
});

export type CreateProductDto = z.infer<typeof CreateProductDto>;

export const UpdateProductDto = CreateProductDto.partial();

export type UpdateProductDto = z.infer<typeof UpdateProductDto>;

export const AddProductImageDto = z.object({
  url: z.string().url('L\'URL doit être valide'),
  alt: z.string().min(1, 'Le texte alternatif est requis'),
  displayOrder: z.number().int().default(0),
});

export type AddProductImageDto = z.infer<typeof AddProductImageDto>;

export const AdjustStockDto = z.object({
  productId: z.string().cuid(),
  type: z.enum(['IN', 'OUT', 'CORRECTION', 'RETURN']),
  quantity: z.number().int(),
  reason: z.string().min(1, 'La raison est requise'),
});

export type AdjustStockDto = z.infer<typeof AdjustStockDto>;

export const ListProductsDto = z.object({
  categoryId: z.string().cuid().optional(),
  active: z.boolean().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type ListProductsDto = z.infer<typeof ListProductsDto>;

