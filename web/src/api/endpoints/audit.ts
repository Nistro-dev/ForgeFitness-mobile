import apiClient from '../client';
import { AuditLog, AuditLogFilters, AuditLogStats } from '../types/audit.types';

export const auditApi = {
  getAllLogs: async (filters?: AuditLogFilters): Promise<AuditLog[]> => {
    const params = new URLSearchParams();
    if (filters?.entity) params.append('entity', filters.entity);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const { data } = await apiClient.get<AuditLog[]>(`/admin/audit/logs?${params.toString()}`);
    return data;
  },

  getLogsForEntity: async (entity: string, entityId: string): Promise<AuditLog[]> => {
    const { data } = await apiClient.get<AuditLog[]>(`/admin/audit/logs/entity/${entity}/${entityId}`);
    return data;
  },

  getLogsForUser: async (userId: string, limit?: number): Promise<AuditLog[]> => {
    const params = limit ? `?limit=${limit}` : '';
    const { data } = await apiClient.get<AuditLog[]>(`/admin/audit/logs/user/${userId}${params}`);
    return data;
  },

  getStats: async (): Promise<AuditLogStats> => {
    const { data } = await apiClient.get<AuditLogStats>('/admin/audit/stats');
    return data;
  },
};
