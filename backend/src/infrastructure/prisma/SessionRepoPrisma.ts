import { SessionRepo } from "@domain";
import { prisma } from "./client";

export class SessionRepoPrisma implements SessionRepo {
  async revokeAllForUser(userId: string) {
    await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async create(params: {
    userId: string;
    deviceId?: string | null;
    expiresAt: Date;
  }) {
    const session = await prisma.session.create({
      data: {
        userId: params.userId,
        deviceId: params.deviceId ?? undefined,
        expiresAt: params.expiresAt,
      },
      select: { id: true },
    });
    return session;
  }
}