import { FastifyInstance } from 'fastify';
import { auditController } from '../../controllers/audit.controller';

export default async function auditRoutes(app: FastifyInstance) {
  const auditCtrl = auditController(app);

  app.get('/logs', auditCtrl.getAllLogs);
  app.get('/logs/entity/:entity/:entityId', auditCtrl.getLogsForEntity);
  app.get('/logs/user/:userId', auditCtrl.getLogsForUser);
  app.get('/stats', auditCtrl.getStats);
}