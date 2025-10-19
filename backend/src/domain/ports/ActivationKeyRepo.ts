export interface ActivationKey {
  id: string;
  code: string;
  expiresAt: Date;
  usedAt?: Date | null;
  userId?: string | null;
}

export interface ActivationKeyRepo {
  createForUser(userId: string, code: string, expiresAt: Date): Promise<void>;
  findByCode(code: string): Promise<ActivationKey | null>;
  markUsed(code: string): Promise<void>;
}
