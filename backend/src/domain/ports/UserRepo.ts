import { User } from "@prisma/client";

export interface UserRepo {
  findById(id: string): Promise<User | null>;
  
  findByEmail(email: string): Promise<User | null>;
  
  create(data: {
    email: string;
    firstName: string;
    lastName: string;
  }): Promise<User>;

  updateNames(
    userId: string,
    names: { firstName: string; lastName: string }
  ): Promise<void>;

  setCurrentActivationKey(
    userId: string,
    activationKeyId: string | null
  ): Promise<void>;

  updateCurrentPointers(params: {
    userId: string;
    deviceId?: string | null;
    sessionId?: string | null;
    activationKeyId?: string | null;
  }): Promise<void>;
}
