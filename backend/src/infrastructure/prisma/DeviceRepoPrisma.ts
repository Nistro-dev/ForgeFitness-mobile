import { DeviceRepo } from "@domain";
import { prisma } from "./client";

export class DeviceRepoPrisma implements DeviceRepo {
  async upsertForUser(params: {
    userId: string;
    deviceId: string;
    platform: "IOS" | "ANDROID";
    model?: string | null;
    osVersion?: string | null;
    appVersion?: string | null;
  }) {
    const device = await prisma.device.upsert({
      where: { 
        userId_deviceUid: {
          userId: params.userId,
          deviceUid: params.deviceId
        }
      },
      update: {
        platform: params.platform,
        model: params.model ?? null,
        appVersion: params.appVersion ?? null,
        lastSeenAt: new Date(),
      },
      create: {
        deviceUid: params.deviceId,
        userId: params.userId,
        platform: params.platform,
        model: params.model ?? null,
        appVersion: params.appVersion ?? null,
        lastSeenAt: new Date(),
      },
      select: { id: true },
    });
    return device;
  }
}