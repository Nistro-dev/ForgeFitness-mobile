import apiClient from '../client';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../types/category.types';

export const categoryApi = {
  list: async (): Promise<Category[]> => {
    const { data } = await apiClient.get<Category[]>('/admin/shop/categories');
    return data;
  },

  create: async (category: CreateCategoryDto): Promise<Category> => {
    const { data } = await apiClient.post<Category>('/admin/shop/categories', category);
    return data;
  },

  update: async (id: string, category: UpdateCategoryDto): Promise<Category> => {
    const { data } = await apiClient.put<Category>(`/admin/shop/categories/${id}`, category);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/shop/categories/${id}`);
  },

  getById: async (id: string): Promise<Category> => {
    const { data } = await apiClient.get<Category>(`/admin/shop/categories/${id}`);
    return data;
  },
};
