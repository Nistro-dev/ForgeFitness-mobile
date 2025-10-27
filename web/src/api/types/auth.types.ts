export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'COACH';
}

export interface IssueKeyDto {
  email: string;
  firstName: string;
  lastName: string;
}

export interface IssueKeyResponse {
  userId: string;
  email: string;
  expiresAt: string;
}