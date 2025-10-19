import { Role } from '@prisma/client';

export interface UserDTO {
  id: string;
  email?: string | null;
  fullName?: string | null;
  role: Role;
  deviceId?: string | null;
}

export interface UserRepo {
  findByEmail(email: string): Promise<UserDTO | null>;
  findByDeviceId(deviceId: string): Promise<UserDTO | null>;
  create(data: { email?: string; fullName?: string; role: Role }): Promise<UserDTO>;
  bindDevice(userId: string, deviceId: string): Promise<void>;
}
