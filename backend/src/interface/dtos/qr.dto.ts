import { z } from 'zod';

export const IssueCodeBody = z.object({
  scope: z.string().min(1).default('entry'),
  audience: z.string().min(2), // ex: "entrance-a"
});
export type IssueCodeBody = z.infer<typeof IssueCodeBody>;

export const IssueCodeResponse = z.object({
  code: z.string(),
  expiresAt: z.string(),  // ISO
  serverNow: z.string(),  // ISO
  ttlSeconds: z.number().int().positive(),
});
export type IssueCodeResponse = z.infer<typeof IssueCodeResponse>;