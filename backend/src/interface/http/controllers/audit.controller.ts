import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuditLogService } from '@infra/audit/AuditLogService';

export function auditController(app: FastifyInstance) {
  const auditLogService = app.diContainer.resolve<AuditLogService>('auditLogService');

  return {
    async getAllLogs(req: FastifyRequest, reply: FastifyReply) {
      const query = req.query as {
        entity?: string;
        action?: string;
        userId?: string;
        dateFrom?: string;
        dateTo?: string;
        limit?: string;
      };

      const filters = {
        entity: query.entity,
        action: query.action,
        userId: query.userId,
        dateFrom: query.dateFrom,
        dateTo: query.dateTo,
        limit: query.limit ? parseInt(query.limit) : 50,
      };

      const logs = await auditLogService.getAllLogs(filters);
      return reply.status(200).send(logs);
    },

    async getLogsForEntity(req: FastifyRequest<{ Params: { entity: string; entityId: string } }>, reply: FastifyReply) {
      const { entity, entityId } = req.params;
      
      const logs = await auditLogService.getLogsForEntity(entity, entityId);
      return reply.status(200).send(logs);
    },

    async getLogsForUser(req: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) {
      const { userId } = req.params;
      const query = req.query as { limit?: string };
      
      const limit = query.limit ? parseInt(query.limit) : undefined;
      const logs = await auditLogService.getLogsForUser(userId, limit);
      return reply.status(200).send(logs);
    },

    async getStats(req: FastifyRequest, reply: FastifyReply) {
      const stats = await auditLogService.getStats();
      return reply.status(200).send(stats);
    },
  };
}