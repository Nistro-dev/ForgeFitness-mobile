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

  APP_NAME: z.string().default('Forge Fitness'),
  MAIL_FROM: z.string().min(3),
  ACTIVATION_KEY_TTL_MIN: z.coerce.number().default(60),

  S3_ENDPOINT: z.string().url().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  DEVICE_JWT_JWKS_URL: z.string().url().optional(),
  DEVICE_JWT_PUBLIC_KEY: z.string().optional(),
  DEVICE_JWT_ISSUER: z.string().optional(),
  DEVICE_JWT_AUDIENCE: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
export const isProd = env.NODE_ENV === 'production';