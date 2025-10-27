import { z } from 'zod';

export const CartItemDto = z.object({
  productId: z.string().cuid(),
  quantity: z.number().int().positive('La quantité doit être positive'),
});

export type CartItemDto = z.infer<typeof CartItemDto>;

export const CreateOrderDto = z.object({
  items: z.array(CartItemDto).min(1, 'Le panier doit contenir au moins un produit'),
  paymentMethod: z.enum(['CARD', 'APPLE_PAY', 'GOOGLE_PAY']),
  notes: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderDto>;

export const UpdateOrderStatusDto = z.object({
  status: z.enum(['PENDING', 'PAID', 'CANCELLED', 'REFUNDED']),
  notes: z.string().optional(),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusDto>;

export const ListOrdersDto = z.object({
  userId: z.string().cuid().optional(),
  status: z.enum(['PENDING', 'PAID', 'CANCELLED', 'REFUNDED']).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export type ListOrdersDto = z.infer<typeof ListOrdersDto>;

