import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/api/endpoints/audit';
import { AuditLogFilters } from '@/api/types/audit.types';

export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: () => auditApi.getAllLogs(filters),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useAuditLogsForEntity = (entity: string, entityId: string) => {
  return useQuery({
    queryKey: ['audit-logs', 'entity', entity, entityId],
    queryFn: () => auditApi.getLogsForEntity(entity, entityId),
    enabled: !!entity && !!entityId,
  });
};

export const useAuditLogsForUser = (userId: string, limit?: number) => {
  return useQuery({
    queryKey: ['audit-logs', 'user', userId, limit],
    queryFn: () => auditApi.getLogsForUser(userId, limit),
    enabled: !!userId,
  });
};

export const useAuditStats = () => {
  return useQuery({
    queryKey: ['audit-stats'],
    queryFn: auditApi.getStats,
    refetchInterval: 60000, // Refresh every minute
  });
};
