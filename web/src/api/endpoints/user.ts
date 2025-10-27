import apiClient from '../client';
import { User, CreateUserDto, UpdateUserDto, UpdatePasswordDto, UpdateRoleDto, UpdateStatusDto } from '../types/user.types';

export const userApi = {
  list: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/admin/users');
    return data;
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(`/admin/users/${id}`);
    return data;
  },

  create: async (user: CreateUserDto): Promise<User> => {
    const { data } = await apiClient.post<User>('/admin/users', user);
    return data;
  },

  update: async (id: string, user: UpdateUserDto): Promise<User> => {
    const { data } = await apiClient.put<User>(`/admin/users/${id}`, user);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  updatePassword: async (id: string, passwordData: UpdatePasswordDto): Promise<void> => {
    await apiClient.put(`/admin/users/${id}/password`, passwordData);
  },

  updateRole: async (id: string, roleData: UpdateRoleDto): Promise<void> => {
    await apiClient.put(`/admin/users/${id}/role`, roleData);
  },

  updateStatus: async (id: string, statusData: UpdateStatusDto): Promise<void> => {
    await apiClient.put(`/admin/users/${id}/status`, statusData);
  },
};
