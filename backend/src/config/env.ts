import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(16),

  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_KID: z.string().optional(),

  REDIS_URL: z.string().optional(),

  MAIL_SMTP_HOST: z.string(),
  MAIL_SMTP_PORT: z.coerce.number().default(587),
  MAIL_SMTP_USER: z.string().optional(),
  MAIL_SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().min(3),

  APP_NAME: z.string().default('Forge Fitness'),
  ACTIVATION_KEY_TTL_MIN: z.coerce.number().default(60),

  S3_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  DEVICE_JWT_JWKS_URL: z.string().url().optional(),
  DEVICE_JWT_PUBLIC_KEY: z.string().optional(),
  DEVICE_JWT_ISSUER: z.string().optional(),
  DEVICE_JWT_AUDIENCE: z.string().optional(),
  DEVICE_JWT_ALG: z.enum(['RS256', 'ES256', 'EdDSA', 'HS256']).default('RS256'),
  DEVICE_JWT_SECRET: z.string().optional(),

  QR_ALLOW_REUSE: z
    .preprocess((v) => (typeof v === 'string' ? v.toLowerCase() : v), z.enum(['true','false']).default('true'))
    .transform((v) => v === 'true'),
  QR_REUSE_DEBOUNCE_MS: z.coerce.number().default(1000),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
})
.superRefine((val, ctx) => {
  const isProd = val.NODE_ENV === 'production';
  const isHS = val.DEVICE_JWT_ALG === 'HS256';
  const isAsym = !isHS;

  if (isProd) {
    const missing: string[] = [];
    if (!val.DEVICE_JWT_ISSUER) missing.push('DEVICE_JWT_ISSUER');
    if (!val.DEVICE_JWT_AUDIENCE) missing.push('DEVICE_JWT_AUDIENCE');
    if (missing.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Missing required env in production: ${missing.join(', ')}`,
        path: ['DEVICE_JWT_ISSUER'],
      });
    }
  }

  if (isProd && isHS) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'HS256 is not allowed in production. Use RS256/ES256/EdDSA with JWKS.',
      path: ['DEVICE_JWT_ALG'],
    });
  }

  if (isHS && !val.DEVICE_JWT_SECRET) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'DEVICE_JWT_SECRET is required when DEVICE_JWT_ALG=HS256.',
      path: ['DEVICE_JWT_SECRET'],
    });
  }

  if (isAsym) {
    if (!val.DEVICE_JWT_JWKS_URL && !val.DEVICE_JWT_PUBLIC_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide DEVICE_JWT_JWKS_URL (recommended) or DEVICE_JWT_PUBLIC_KEY for asymmetric algorithms.',
        path: ['DEVICE_JWT_JWKS_URL'],
      });
    }
  }
});

export const env = EnvSchema.parse(process.env);
export const isProd = env.NODE_ENV === 'production';