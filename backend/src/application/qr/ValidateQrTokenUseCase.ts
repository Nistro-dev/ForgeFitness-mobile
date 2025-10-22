import { Result, ok, err } from '@core/result';
import { JWTService, QrTokenValidationResult } from '../../infrastructure/jwt/JWTService';
import { RedisClient } from '../../infrastructure/cache/RedisClient';
import { ValidateQrTokenBody, QrValidationResponse } from '@if/dtos/qr.dto';
import { UserRepo } from '@domain/ports/UserRepo';
import { prisma } from '../../infrastructure/prisma/client';

export class ValidateQrTokenUseCase {
  constructor(
    private userRepo: UserRepo,
    private jwtService: JWTService,
    private redisClient: RedisClient
  ) {}

  async execute(
    body: ValidateQrTokenBody,
    ipAddress?: string,
    userAgent?: string
  ): Promise<Result<QrValidationResponse>> {
    const startTime = Date.now();
    let validationResult: QrTokenValidationResult;
    let userId: string | undefined;

    try {
      // 1. Valider le token JWT
      validationResult = this.jwtService.validateQrToken(
        body.token,
        body.gateId,
        30 // tolérance de 30 secondes
      );

      if (!validationResult.valid) {
        await this.logValidationAttempt(
          undefined,
          body.gateId || 'unknown',
          validationResult.reason || 'invalid',
          body.token,
          startTime,
          ipAddress,
          userAgent
        );

        return ok({
          result: validationResult.reason || 'invalid',
          error: validationResult.error,
        });
      }

      userId = validationResult.payload!.sub;

      // 2. Vérifier le statut de l'utilisateur (cache Redis d'abord)
      let userStatus = await this.redisClient.getUserStatus(userId);
      
      if (!userStatus) {
        // Pas en cache, vérifier en base
        const user = await this.userRepo.findById(userId);
        if (!user) {
          await this.logValidationAttempt(
            userId,
            body.gateId || 'unknown',
            'deny',
            body.token,
            startTime,
            ipAddress,
            userAgent
          );

          return ok({
            result: 'deny',
            error: 'User not found',
          });
        }

        userStatus = user.status;
        // Mettre en cache pour 1h
        if (userId && userStatus) {
          await this.redisClient.cacheUserStatus(userId, userStatus, 3600);
        }
      }

      if (userStatus !== 'ACTIVE') {
        await this.logValidationAttempt(
          userId,
          body.gateId || 'unknown',
          'deny',
          body.token,
          startTime,
          ipAddress,
          userAgent
        );

        return ok({
          result: 'deny',
          error: 'User account is disabled or banned',
        });
      }

      // 3. Succès - loguer l'accès autorisé
      await this.logValidationAttempt(
        userId,
        body.gateId || 'unknown',
        'allow',
        body.token,
        startTime,
        ipAddress,
        userAgent
      );

      return ok({
        result: 'allow',
        sub: userId,
        allowedUntil: validationResult.payload!.exp,
      });

    } catch (error) {
      console.error('Error validating QR token:', error);
      
      await this.logValidationAttempt(
        userId,
        body.gateId || 'unknown',
        'invalid',
        body.token,
        startTime,
        ipAddress,
        userAgent
      );

      return ok({
        result: 'invalid',
        error: 'Token validation failed',
      });
    }
  }

  private async logValidationAttempt(
    userId: string | undefined,
    gateId: string,
    result: 'allow' | 'deny' | 'expired' | 'invalid' | 'wrong_audience',
    token: string,
    startTime: number,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const latencyMs = Date.now() - startTime;
      const tokenHash = this.jwtService.hashToken(token);
      
      // Extraire le kid du token si possible
      let kid: string | undefined;
      try {
        const payload = this.jwtService.extractPayload(token);
        // Le kid est dans le header, pas le payload
        // On peut l'extraire du token décodé
        const decoded = require('jsonwebtoken').decode(token, { complete: true });
        kid = decoded?.header?.kid;
      } catch {
        // Ignore si on ne peut pas extraire le kid
      }

      await prisma.qrValidationLog.create({
        data: {
          userId,
          gateId,
          result: result.toUpperCase() as any,
          tokenHash,
          kid,
          latencyMs,
          ipAddress,
          userAgent,
        },
      });
    } catch (logError) {
      console.error('Failed to log QR validation attempt:', logError);
      // Ne pas faire échouer la validation à cause d'un problème de logging
    }
  }
}
