import { User, UserRole, UserStatus } from "@prisma/client";

export interface UserRepo {
  findById(id: string): Promise<User | null>;
  
  findByEmail(email: string): Promise<User | null>;
  
  findMany(): Promise<User[]>;
  
  create(data: {
    email: string;
    firstName: string;
    lastName: string;
    password?: string;
    role?: UserRole;
    status?: UserStatus;
  }): Promise<User>;

  update(userId: string, data: {
    email?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<void>;

  updateRole(userId: string, role: UserRole): Promise<void>;

  updateStatus(userId: string, status: UserStatus): Promise<void>;

  delete(userId: string): Promise<void>;

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

  setPassword(userId: string, password: string): Promise<void>;
}
