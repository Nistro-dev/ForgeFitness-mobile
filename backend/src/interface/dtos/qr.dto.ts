import { z } from 'zod';

export const IssueCodeBody = z.object({
  scope: z.string().min(1).default('entry'),
  audience: z.string().min(2),
});
export type IssueCodeBody = z.infer<typeof IssueCodeBody>;

export const IssueCodeResponse = z.object({
  code: z.string(),
  expiresAt: z.string(),
  serverNow: z.string(),
  ttlSeconds: z.number().int().positive(),
  userStatus: z.enum(['ACTIVE', 'DISABLED', 'BANNED']),
});
export type IssueCodeResponse = z.infer<typeof IssueCodeResponse>;

export const ResolveCodeBody = z.object({
  code: z.string().min(8),
  audience: z.string().min(2),
});
export type ResolveCodeBody = z.infer<typeof ResolveCodeBody>;

export const ResolveCodeResponse = z.object({
  decision: z.enum(['authorized', 'denied']),
  reason: z.enum(['expired','invalid_code','wrong_audience','replayed','user_inactive','rate_limited']).nullable(),
  userId: z.string().nullable(),
  expiresAt: z.string().nullable(),
});
export type ResolveCodeResponse = z.infer<typeof ResolveCodeResponse>;