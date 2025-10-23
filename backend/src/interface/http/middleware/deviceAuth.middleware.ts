import { FastifyReply, FastifyRequest } from 'fastify';
import jwt, { JwtHeader, SigningKeyCallback } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { env } from '@config/env';

export interface DeviceAuthenticatedRequest extends FastifyRequest {
  device?: { id: string; iss?: string; aud?: string };
}

const isHS = env.DEVICE_JWT_ALG === 'HS256';

const jwks = !isHS && env.DEVICE_JWT_JWKS_URL
  ? jwksClient({
      jwksUri: env.DEVICE_JWT_JWKS_URL,
      cache: true,
      cacheMaxEntries: 8,
      cacheMaxAge: 10 * 60 * 1000,
      timeout: 5000,
    })
  : null;

function getKey(header: JwtHeader, cb: SigningKeyCallback) {
  if (!jwks) return cb(new Error('JWKS not configured'));
  if (!header.kid) return cb(new Error('Missing kid in JWT header'));
  jwks.getSigningKey(header.kid, (err, key) => {
    if (err) return cb(err);
    if (!key) return cb(new Error('No key found'));
    const publicKey = key.getPublicKey();
    cb(null, publicKey);
  });
}

export async function deviceAuthMiddleware(
  request: DeviceAuthenticatedRequest,
  reply: FastifyReply
) {
  const auth = request.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return reply.code(401).send({ error: { code: 'UNAUTHORIZED_DEVICE', message: 'Missing device token' }});
  }
  const token = auth.substring(7);

  try {
    const expectedAlg = env.DEVICE_JWT_ALG; // 'HS256' | 'RS256' | 'ES256' | 'EdDSA'
    const header = jwt.decode(token, { complete: true }) as { header: JwtHeader } | null;
    const alg = header?.header?.alg;
    if (!alg || alg !== expectedAlg) {
      return reply.code(401).send({ error: { code: 'UNAUTHORIZED_DEVICE', message: `Invalid alg: expected ${expectedAlg}, got ${alg || 'undefined'}` }});
    }

    let decoded: any;

    if (isHS) {
      const secret = process.env.DEVICE_JWT_SECRET ?? env.JWT_SECRET;
      if (!secret) {
        return reply.code(401).send({ error: { code: 'UNAUTHORIZED_DEVICE', message: 'HS256 selected but no DEVICE_JWT_SECRET/JWT_SECRET set' }});
      }
      decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer: env.DEVICE_JWT_ISSUER,
        audience: env.DEVICE_JWT_AUDIENCE,
        clockTolerance: 60,
      });
    } else {
      if (!jwks) {
        return reply.code(401).send({ error: { code: 'UNAUTHORIZED_DEVICE', message: 'JWKS not configured' }});
      }
      decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, getKey, {
          algorithms: [expectedAlg as jwt.Algorithm],
          issuer: env.DEVICE_JWT_ISSUER,
          audience: env.DEVICE_JWT_AUDIENCE,
          clockTolerance: 60,
        }, (err, payload) => err ? reject(err) : resolve(payload));
      });
    }

    if (!decoded?.sub) {
      return reply.code(401).send({ error: { code: 'UNAUTHORIZED_DEVICE', message: 'Invalid device token (sub missing)' }});
    }

    request.device = { id: decoded.sub, iss: decoded.iss, aud: decoded.aud };
  } catch (e: any) {
    return reply.code(401).send({ error: { code: 'UNAUTHORIZED_DEVICE', message: e?.message ?? 'Invalid device token' }});
  }
}
