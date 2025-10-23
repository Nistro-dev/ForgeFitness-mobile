import { ActivateWithKeyUseCase } from '@app/auth/ActivateWithKeyUseCase';
import { IssueActivationKeyUseCase } from '@app/auth/IssueActivationKeyUseCase';
import { IssueQrCodeUseCase } from '@app/qr/IssueQrCodeUseCase';
import { ResolveQrCodeUseCase } from '@app/qr/ResolveQrCodeUseCase';
import { ActivationKeyRepoPrisma, DeviceRepoPrisma, NodemailerMailer, SessionRepoPrisma, UserRepoPrisma } from '@infra';
import { RedisClient } from '../infrastructure/cache/RedisClient';
import { JWTService } from '../infrastructure/jwt/JWTService';
import { KeyManager } from '../infrastructure/crypto/KeyManager';
import { asClass, createContainer, InjectionMode } from 'awilix';

export const makeContainer = () => {
  const container = createContainer({
    injectionMode: InjectionMode.CLASSIC,
  });

  container.register({
    userRepo: asClass(UserRepoPrisma).singleton(),
    activationKeyRepo: asClass(ActivationKeyRepoPrisma).singleton(),
    sessionRepo: asClass(SessionRepoPrisma).singleton(),
    deviceRepo: asClass(DeviceRepoPrisma).singleton(),
    mailer: asClass(NodemailerMailer).singleton(),

    redisClient: asClass(RedisClient).singleton(),
    jwtService: asClass(JWTService).singleton(),
    keyManager: asClass(KeyManager).singleton(),

    // Use Cases
    issueActivationKeyUseCase: asClass(IssueActivationKeyUseCase).scoped(),
    activateWithKeyUseCase: asClass(ActivateWithKeyUseCase).scoped(),
    issueQrCodeUseCase: asClass(IssueQrCodeUseCase).scoped(),
    resolveQrCodeUseCase: asClass(ResolveQrCodeUseCase).scoped(),
  });

  return container;
};