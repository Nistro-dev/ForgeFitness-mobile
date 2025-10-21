export interface SessionRepo {
  revokeAllForUser(userId: string): Promise<void>;
  create(params: {
    userId: string;
    deviceId?: string | null;
    expiresAt: Date;
  }): Promise<{ id: string }>;
}
export default SessionRepo;