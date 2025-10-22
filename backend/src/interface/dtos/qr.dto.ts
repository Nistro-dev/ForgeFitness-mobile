import { z } from 'zod';

export const IssueQrTokenBody = z.object({
  gateId: z.string().optional(), // Optionnel - si pas spécifié, token générique
  ttlSeconds: z.number().min(60).max(600).optional().default(300), // 1-10 minutes
});

export type IssueQrTokenBody = z.infer<typeof IssueQrTokenBody>;

export const ValidateQrTokenBody = z.object({
  token: z.string().min(10),
  gateId: z.string().optional(), // Optionnel - pour vérifier l'audience
});

export type ValidateQrTokenBody = z.infer<typeof ValidateQrTokenBody>;

export const QrTokenResponse = z.object({
  token: z.string(),
  exp: z.number(),
  kid: z.string(),
  serverTime: z.number(),
  refreshAt: z.number(),
  ttlSeconds: z.number(),
  aud: z.string().optional(),
});

export type QrTokenResponse = z.infer<typeof QrTokenResponse>;

export const QrValidationResponse = z.object({
  result: z.enum(['allow', 'deny', 'expired', 'invalid', 'wrong_audience']),
  sub: z.string().optional(), // userId si succès
  allowedUntil: z.number().optional(), // timestamp d'expiration si succès
  error: z.string().optional(), // message d'erreur si échec
});

export type QrValidationResponse = z.infer<typeof QrValidationResponse>;
