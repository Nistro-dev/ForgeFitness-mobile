export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'COACH';
  status: 'ACTIVE' | 'DISABLED' | 'BANNED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role?: 'USER' | 'ADMIN' | 'COACH';
  status?: 'ACTIVE' | 'DISABLED' | 'BANNED';
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdatePasswordDto {
  password: string;
}

export interface UpdateRoleDto {
  role: 'USER' | 'ADMIN' | 'COACH';
}

export interface UpdateStatusDto {
  status: 'ACTIVE' | 'DISABLED' | 'BANNED';
}
