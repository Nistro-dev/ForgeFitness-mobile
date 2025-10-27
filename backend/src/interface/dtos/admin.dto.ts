import { z } from 'zod';

export const AdminLoginBody = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export type AdminLoginBody = z.infer<typeof AdminLoginBody>;
