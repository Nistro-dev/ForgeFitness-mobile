import { Result, ok, err } from '@core/result';
import { JWTService, QrTokenResponse } from '../../infrastructure/jwt/JWTService';
import { RedisClient } from '../../infrastructure/cache/RedisClient';
import { IssueQrTokenBody } from '@if/dtos/qr.dto';
import { UserRepo } from '@domain/ports/UserRepo';

export class IssueQrTokenUseCase {
  constructor(
    private userRepo: UserRepo,
    private jwtService: JWTService,
    private redisClient: RedisClient
  ) {}

  async execute(
    userId: string,
    body: IssueQrTokenBody
  ): Promise<Result<QrTokenResponse>> {
    try {
      // 1. Vérifier que l'utilisateur existe et est actif
      const user = await this.userRepo.findById(userId);
      if (!user) {
        return err('User not found');
      }

      // 2. Vérifier le statut de l'utilisateur
      if (user.status !== 'ACTIVE') {
        return err('User account is disabled or banned');
      }

      // 3. Vérifier le cache Redis d'abord
      const cachedStatus = await this.redisClient.getUserStatus(userId);
      if (cachedStatus && cachedStatus !== 'ACTIVE') {
        return err('User account is disabled or banned');
      }

      // 4. Générer le token QR
      const tokenResponse = this.jwtService.generateQrToken(
        userId,
        body.gateId,
        body.ttlSeconds
      );

      // 5. Mettre à jour le cache Redis
      await this.redisClient.cacheUserStatus(userId, 'ACTIVE', 3600); // Cache 1h

      return ok(tokenResponse);
    } catch (error) {
      console.error('Error issuing QR token:', error);
      return err('Failed to issue QR token');
    }
  }
}
