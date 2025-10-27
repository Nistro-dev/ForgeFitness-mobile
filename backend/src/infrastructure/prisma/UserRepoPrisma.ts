import { UserRepo } from '@domain';
import { prisma } from './client';

export class UserRepoPrisma implements UserRepo {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: { email: string; firstName: string; lastName: string }) {
    return prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      },
    });
  }

  async updateNames(userId: string, names: { firstName: string; lastName: string }) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: names.firstName,
        lastName: names.lastName,
      },
    });
  }

  async setCurrentActivationKey(userId: string, activationKeyId: string | null) {
    await prisma.user.update({
      where: { id: userId },
      data: { currentActivationKeyId: activationKeyId },
    });
  }

  async updateCurrentPointers(params: {
    userId: string;
    deviceId?: string | null;
    sessionId?: string | null;
    activationKeyId?: string | null;
  }) {
    await prisma.user.update({
      where: { id: params.userId },
      data: {
        currentDeviceId: params.deviceId ?? undefined,
        currentSessionId: params.sessionId ?? undefined,
        currentActivationKeyId: params.activationKeyId ?? undefined,
      },
    });
  }

  async setPassword(userId: string, password: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { password },
    });
  }
}