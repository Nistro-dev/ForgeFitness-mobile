import jwt from 'jsonwebtoken';
import { KeyManager } from '../crypto/KeyManager';
import { createHash } from 'crypto';

export interface QrTokenPayload {
  iss: string;
  sub: string;
  scope: string;
  iat: number;
  nbf: number;
  exp: number;
  aud?: string;
  jti?: string;
}

export interface QrTokenResponse {
  token: string;
  exp: number;
  kid: string;
  serverTime: number;
  refreshAt: number;
  ttlSeconds: number;
  aud?: string;
}

export interface QrTokenValidationResult {
  valid: boolean;
  payload?: QrTokenPayload;
  error?: string;
  reason?: 'expired' | 'invalid' | 'wrong_audience' | 'deny';
}

export class JWTService {
  private keyManager: KeyManager;

  constructor() {
    this.keyManager = KeyManager.getInstance();
  }

  public generateQrToken(
    userId: string,
    gateId?: string,
    ttlSeconds = 300
  ): QrTokenResponse {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttlSeconds;
    const refreshAt = exp - 15;

    const payload: QrTokenPayload = {
      iss: 'forge-fitness-api',
      sub: userId,
      scope: 'entry_access',
      iat: now,
      nbf: now,
      exp: exp,
      jti: this.generateJti(),
    };

    if (gateId) {
      payload.aud = gateId;
    }

    const token = jwt.sign(
      payload,
      this.keyManager.getPrivateKey(),
      {
        algorithm: 'RS256',
        keyid: this.keyManager.getKid(),
      }
    );

    return {
      token,
      exp,
      kid: this.keyManager.getKid(),
      serverTime: now,
      refreshAt,
      ttlSeconds,
      aud: gateId,
    };
  }

  public validateQrToken(
    token: string,
    expectedGateId?: string,
    toleranceSeconds = 30
  ): QrTokenValidationResult {
    try {
      const decoded = jwt.decode(token, { complete: true });
      
      if (!decoded || typeof decoded === 'string') {
        return {
          valid: false,
          error: 'Invalid token format',
          reason: 'invalid',
        };
      }

      const header = decoded.header as any;
      const payload = decoded.payload as QrTokenPayload;

      if (header.alg !== 'RS256') {
        return {
          valid: false,
          error: 'Invalid algorithm',
          reason: 'invalid',
        };
      }

      if (header.kid !== this.keyManager.getKid()) {
        return {
          valid: false,
          error: 'Invalid key ID',
          reason: 'invalid',
        };
      }

      const now = Math.floor(Date.now() / 1000);
      const tolerance = toleranceSeconds;

      if (payload.exp && payload.exp < now - tolerance) {
        return {
          valid: false,
          error: 'Token expired',
          reason: 'expired',
        };
      }

      if (payload.nbf && payload.nbf > now + tolerance) {
        return {
          valid: false,
          error: 'Token not yet valid',
          reason: 'invalid',
        };
      }

      if (payload.scope !== 'entry_access') {
        return {
          valid: false,
          error: 'Invalid scope',
          reason: 'deny',
        };
      }

      if (expectedGateId && payload.aud && payload.aud !== expectedGateId) {
        return {
          valid: false,
          error: 'Wrong audience',
          reason: 'wrong_audience',
        };
      }

      try {
        jwt.verify(token, this.keyManager.getPublicKey(), {
          algorithms: ['RS256'],
          clockTolerance: tolerance,
        });
      } catch (verifyError) {
        return {
          valid: false,
          error: 'Invalid signature',
          reason: 'invalid',
        };
      }

      return {
        valid: true,
        payload,
      };

    } catch (error) {
      return {
        valid: false,
        error: 'Token validation failed',
        reason: 'invalid',
      };
    }
  }

  public hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private generateJti(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `qr_${timestamp}_${random}`;
  }

  public extractPayload(token: string): QrTokenPayload | null {
    try {
      const decoded = jwt.decode(token) as QrTokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }
}
