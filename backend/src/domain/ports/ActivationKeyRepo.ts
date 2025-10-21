import { ActivationKey } from "@prisma/client";

export interface ActivationKeyRepo {
  create(data: {
    userId: string;
    key: string;
    expiresAt: Date;
  }): Promise<ActivationKey>;

  invalidateActiveForUser(userId: string): Promise<void>;

  findActiveByUserId(userId: string): Promise<ActivationKey | null>;

  invalidate(id: string, reason: string): Promise<void>;

  markUsed(id: string): Promise<void>;
}