import { randomBytes, createHash } from 'crypto';
import { RedisClient } from '@infra/cache/RedisClient';

type Input = {
  userId: string;
  userStatus: 'ACTIVE' | 'DISABLED' | 'BANNED';
  audience: string;
  scope?: string;
  ttlSeconds?: number;
};

type Output = {
  code: string;
  expiresAt: string;
  serverNow: string;
  ttlSeconds: number;
};

export class IssueQrCodeUseCase {
  constructor(private readonly redisClient: RedisClient) {}

  async execute(input: Input): Promise<Output> {
    if (input.userStatus !== 'ACTIVE') {
      const e: any = new Error('User is not active');
      e.isAppError = true;
      e.httpCode = 403;
      e.code = 'USER_INACTIVE';
      throw e;
    }
    const scope = input.scope ?? 'entry';
    const ttl = input.ttlSeconds ?? 300;
    if (!input.audience || input.audience.trim().length < 2) {
      const e: any = new Error('Invalid audience');
      e.isAppError = true;
      e.httpCode = 400;
      e.code = 'BAD_REQUEST';
      throw e;
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttl;

    const jti = toBase32Crockford(randomBytes(16));
    const code = generateShortCode(input.userId, now);
    const payload = {
      userId: input.userId,
      aud: input.audience,
      scope,
      exp,
      jti,
      createdAt: now,
    };

    const ttlRedis = Math.max(1, (exp - now) + 60);
    await this.redisClient.set(`qr:code:${code}`, JSON.stringify(payload), ttlRedis);

    return {
      code,
      expiresAt: new Date(exp * 1000).toISOString(),
      serverNow: new Date(now * 1000).toISOString(),
      ttlSeconds: ttl,
    };
  }
}


function toBase32Crockford(buf: Buffer): string {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  let bits = 0, value = 0, out = '';
  for (const b of buf) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += alphabet[(value << (5 - bits)) & 31];
  return out;
}

function generateShortCode(userId: string, timestamp: number): string {
  const raw = `${userId}:${timestamp}`;
  const shortHash = createHash('sha1').update(raw).digest('hex').substring(0, 10);
  return `FF-${shortHash.toUpperCase()}`;
}
