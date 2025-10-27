import { z } from 'zod';
import { UserRole, UserStatus } from '@prisma/client';

export const CreateUserDto = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
});

export const UpdateUserDto = z.object({
  email: z.string().email().optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
});

export const UpdatePasswordDto = z.object({
  password: z.string().min(6),
});

export const UpdateRoleDto = z.object({
  role: z.nativeEnum(UserRole),
});

export const UpdateStatusDto = z.object({
  status: z.nativeEnum(UserStatus),
});

export type CreateUserInput = z.infer<typeof CreateUserDto>;
export type UpdateUserInput = z.infer<typeof UpdateUserDto>;
export type UpdatePasswordInput = z.infer<typeof UpdatePasswordDto>;
export type UpdateRoleInput = z.infer<typeof UpdateRoleDto>;
export type UpdateStatusInput = z.infer<typeof UpdateStatusDto>;
