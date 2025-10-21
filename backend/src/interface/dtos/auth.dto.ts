import { z } from 'zod';

export const IssueKeyBody = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export type IssueKeyBody = z.infer<typeof IssueKeyBody>;

export const ActivateBody = z.object({
  key: z.string().min(6).max(32),
  device: z.object({
    deviceId: z.string().min(4),
    platform: z.enum(['IOS', 'ANDROID']),
    model: z.string().optional(),
    osVersion: z.string().optional(),
    appVersion: z.string().optional(),
  }),
});

export type ActivateBody = z.infer<typeof ActivateBody>;