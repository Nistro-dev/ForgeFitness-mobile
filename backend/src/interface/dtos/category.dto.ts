import { z } from 'zod';

export const CreateCategoryDto = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets'),
  displayOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export type CreateCategoryDto = z.infer<typeof CreateCategoryDto>;

export const UpdateCategoryDto = CreateCategoryDto.partial();

export type UpdateCategoryDto = z.infer<typeof UpdateCategoryDto>;

