import { createHash } from 'crypto';
import { RedisClient } from '@infra/cache/RedisClient';
import { prisma } from '@infra/prisma/client';
import { env } from '@config/env';

type Input = {
  code: string;
  audienceDeclared: string;
  deviceId: string;
  now?: number;
};

type Output = {
  decision: 'authorized' | 'denied';
  reason: 'expired' | 'invalid_code' | 'wrong_audience' | 'replayed' | 'user_inactive' | 'rate_limited' | 'repeat' | null;
  userId: string | null;
  expiresAt: string | null;
};

export class ResolveQrCodeUseCase {
  constructor(private readonly redisClient: RedisClient) {}

  async execute(input: Input): Promise<Output> {
    const now = input.now ?? Math.floor(Date.now() / 1000);
    const key = `qr:code:${input.code}`;
    const raw = await this.redisClient.get(key);

    const tokenHash = sha256(input.code);
    let userId: string | null = null;
    let expiresAt: string | null = null;

    if (!raw) {
      await this.log(input, { result: 'INVALID', reason: 'invalid_code', tokenHash, userId: null, audInToken: null });
      return { decision: 'denied', reason: 'invalid_code', userId: null, expiresAt: null };
    }

    const payload = safeParseJSON(raw) as {
      userId: string; aud: string; scope: string; exp: number; jti: string; createdAt: number;
    };
    userId = payload.userId;
    expiresAt = new Date(payload.exp * 1000).toISOString();

    if (now > payload.exp) {
      await this.markConsumed(input.code);
      await this.log(input, { result: 'EXPIRED', reason: 'expired', tokenHash, userId, audInToken: payload.aud });
      return { decision: 'denied', reason: 'expired', userId, expiresAt };
    }

    if (input.audienceDeclared !== payload.aud) {
      await this.log(input, { result: 'WRONG_AUDIENCE', reason: 'wrong_audience', tokenHash, userId, audInToken: payload.aud });
      return { decision: 'denied', reason: 'wrong_audience', userId, expiresAt };
    }

    if (!env.QR_ALLOW_REUSE) {
      const consumedOk = await this.redisClient.setIfNotExists(`qr:consumed:${input.code}`, '1', 10 * 60);
      if (!consumedOk) {
        await this.log(input, { result: 'DENY', reason: 'replayed', tokenHash, userId, audInToken: payload.aud });
        return { decision: 'denied', reason: 'replayed', userId, expiresAt };
      }
    }

    if (!env.QR_ALLOW_REUSE) {
      const ttlLeft = Math.max(1, payload.exp - now + 60);
      const seenOk = await this.redisClient.setIfNotExists(`qr:seen:${payload.jti}`, '1', ttlLeft);
      if (!seenOk) {
        await this.log(input, { result: 'DENY', reason: 'replayed', tokenHash, userId, audInToken: payload.aud });
        return { decision: 'denied', reason: 'replayed', userId, expiresAt };
      }
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId }, select: { status: true } });
    if (!user || user.status !== 'ACTIVE') {
      await this.log(input, { result: 'DENY', reason: 'user_inactive', tokenHash, userId, audInToken: payload.aud });
      return { decision: 'denied', reason: 'user_inactive', userId, expiresAt };
    }

    if (env.QR_REUSE_DEBOUNCE_MS > 0) {
      const debounceKey = `qr:seen:${input.deviceId}:${input.code}`;
      const ms = env.QR_REUSE_DEBOUNCE_MS;
      const already = await this.redisClient.get(debounceKey);
      if (already) {
        await this.log(input, { result: 'ALLOW', reason: 'repeat', tokenHash, userId, audInToken: payload.aud });
        return { decision: 'authorized', reason: 'repeat', userId, expiresAt };
      }
      await this.redisClient.set(debounceKey, '1', Math.ceil(ms / 1000));
    }

    await this.log(input, { result: 'ALLOW', reason: null, tokenHash, userId, audInToken: payload.aud });
    return { decision: 'authorized', reason: null, userId, expiresAt };
  }

  private async markConsumed(code: string) {
    await this.redisClient.setIfNotExists(`qr:consumed:${code}`, '1', 10 * 60);
  }

  private async log(
    input: Input,
    meta: { result: 'ALLOW'|'DENY'|'EXPIRED'|'INVALID'|'WRONG_AUDIENCE'; reason: Output['reason']; tokenHash: string; userId: string | null; audInToken: string | null }
  ) {
    await prisma.qrValidationLog.create({
      data: {
        userId: meta.userId ?? undefined,
        gateId: input.deviceId,
        result: meta.result,
        reason: meta.reason ?? undefined,
        method: 'qr',
        audInToken: meta.audInToken ?? undefined,
        tokenHash: meta.tokenHash,
        latencyMs: null,
        ipAddress: null,
        userAgent: null,
      }
    });
  }
}

function sha256(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

function safeParseJSON(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
