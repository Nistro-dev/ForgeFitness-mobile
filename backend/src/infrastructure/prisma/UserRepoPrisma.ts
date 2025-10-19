import { UserRepo, UserDTO } from '@domain/ports/UserRepo';
import { prisma } from './client';
import { Role } from '@prisma/client';

export class UserRepoPrisma implements UserRepo {
  async findByEmail(email: string): Promise<UserDTO | null> {
    const u = await prisma.user.findUnique({ where: { email } });
    return u ? { ...u } : null;
  }

  async findByDeviceId(deviceId: string): Promise<UserDTO | null> {
    const u = await prisma.user.findFirst({ where: { deviceId } });
    return u ? { ...u } : null;
  }

  async create(data: { email?: string; fullName?: string; role: Role }): Promise<UserDTO> {
    const u = await prisma.user.create({ data });
    return { ...u };
  }

  async bindDevice(userId: string, deviceId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { deviceId },
    });
  }
}
