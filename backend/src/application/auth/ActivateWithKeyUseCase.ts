import { AppError } from '@core';
import { ActivationKeyRepo, DeviceRepo, SessionRepo, UserRepo } from '@domain';
import { addDays, isAfter } from 'date-fns';
import jwt from 'jsonwebtoken';
import { env } from '@config';

type Input = {
  key: string;
  device: {
    deviceId: string;
    platform: 'IOS' | 'ANDROID';
    model?: string;
    osVersion?: string;
    appVersion?: string;
  };
};

type Output = {
  token: string;
  expiresAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
};

export class ActivateWithKeyUseCase {
  constructor(
    private userRepo: UserRepo,
    private activationKeyRepo: ActivationKeyRepo,
    private sessionRepo: SessionRepo,
    private deviceRepo: DeviceRepo,
  ) {}

  async execute(input: Input): Promise<Output> {
    // Trouver la clé d'activation par le code
    const ak = await this.activationKeyRepo.findByKey(input.key);
    if (!ak) throw AppError.badRequest('INVALID_KEY');

    // Vérifier que la clé n'est pas déjà utilisée
    if (ak.usedAt) throw AppError.badRequest('KEY_ALREADY_USED');

    // Récupérer l'utilisateur associé à la clé
    const user = await this.userRepo.findById(ak.userId);
    if (!user) throw AppError.badRequest('USER_NOT_FOUND');

    const now = new Date();
    if (isAfter(now, ak.expiresAt)) {
      await this.activationKeyRepo.invalidate(ak.id, 'EXPIRED');
      throw AppError.badRequest('KEY_EXPIRED');
    }

    await this.activationKeyRepo.markUsed(ak.id);

    const device = await this.deviceRepo.upsertForUser({
      userId: user.id,
      deviceId: input.device.deviceId,
      platform: input.device.platform,
      model: input.device.model,
      osVersion: input.device.osVersion,
      appVersion: input.device.appVersion,
    });

    await this.sessionRepo.revokeAllForUser(user.id);
    const sessionTtlDays = 30;
    const session = await this.sessionRepo.create({
      userId: user.id,
      deviceId: device.id,
      expiresAt: addDays(now, sessionTtlDays),
    });

    await this.userRepo.updateCurrentPointers({
      userId: user.id,
      deviceId: device.id,
      sessionId: session.id,
      activationKeyId: ak.id,
    });

    const token = jwt.sign(
      { sub: user.id, sid: session.id },
      env.JWT_SECRET,
      { expiresIn: `${sessionTtlDays}d`, issuer: 'forge-fitness' },
    );

    return {
      token,
      expiresAt: addDays(now, sessionTtlDays).toISOString(),
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    };
  }
}