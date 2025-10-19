import { z } from 'zod';
export const IssueKeyDto = z.object({
    email: z.string().email(),
    fullName: z.string().min(1),
    role: z.enum(['MEMBER', 'COACH', 'ADMIN']).default('MEMBER'),
});
export const ActivateDto = z.object({
    code: z.string().min(6),
    deviceId: z.string().min(6),
});
