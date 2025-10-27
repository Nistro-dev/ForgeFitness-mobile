import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AuditLogService } from '@infra/audit/AuditLogService';

export function auditController(app: FastifyInstance) {
  return {
    async getAllLogs(req: FastifyRequest<{ Querystring: { limit?: string } }>, reply: FastifyReply) {
      const limit = parseInt(req.query.limit || '100');
      const logs = await AuditLogService.getAllLogs(limit);
      return reply.send(logs);
    },

    async getLogsForEntity(req: FastifyRequest<{ Params: { entity: string; entityId: string } }>, reply: FastifyReply) {
      const { entity, entityId } = req.params;
      const logs = await AuditLogService.getLogsForEntity(entity, entityId);
      return reply.send(logs);
    },

    async getLogsForUser(req: FastifyRequest<{ Params: { userId: string }; Querystring: { limit?: string } }>, reply: FastifyReply) {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit || '50');
      const logs = await AuditLogService.getLogsForUser(userId, limit);
      return reply.send(logs);
    },
  };
}
