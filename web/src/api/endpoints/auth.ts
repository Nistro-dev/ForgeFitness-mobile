import apiClient from '../client';
import type { LoginDto, AuthResponse, User, IssueKeyDto, IssueKeyResponse } from '../types/auth.types';

export const authApi = {
  login: async (credentials: LoginDto): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/public/admin/login', credentials);
    return data;
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  issueKey: async (userData: IssueKeyDto): Promise<IssueKeyResponse> => {
    const { data } = await apiClient.post<IssueKeyResponse>('/admin/auth/issue-key', userData);
    return data;
  },
};
