import { ActivationKeyRepo } from '@domain/ports/ActivationKeyRepo';
import { UserRepo } from '@domain/ports/UserRepo';
import { AppError, UnauthorizedError } from '@core/errors';
import jwt from 'jsonwebtoken';
import { env } from '@config';

type Input = { code: string; deviceId: string };
type Output = {
  token: string;
  user: {
    id: string;
    email?: string | null;
    fullName?: string | null;
    role: string;
  };
};

export class ActivateWithKeyUseCase {
  constructor(
    private users: UserRepo,
    private keys: ActivationKeyRepo
  ) {}

  async exec({ code, deviceId }: Input): Promise<Output> {
    const key = await this.keys.findByCode(code);
    if (!key || key.usedAt || key.expiresAt < new Date() || !key.userId) {
      throw new UnauthorizedError('INVALID_OR_EXPIRED');
    }

    // 1 appareil : si deviceId déjà lié à qqn d'autre → refuse
    const existing = await this.users.findByDeviceId(deviceId);
    if (existing && existing.id !== key.userId) {
      throw new AppError('DEVICE_ALREADY_BOUND', 'DEVICE_ALREADY_BOUND', 400);
    }

    await this.users.bindDevice(key.userId, deviceId);
    await this.keys.markUsed(code);

    const user = await this.users.findByEmail(
      (await this.users.findByDeviceId(deviceId))?.email ?? ''
    );
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 'USER_NOT_FOUND', 404);
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role, deviceId },
      env.JWT_SECRET,
      { expiresIn: '180d' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
