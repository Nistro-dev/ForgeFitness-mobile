import { FastifyInstance } from 'fastify';
import { qrController } from '@if/http/controllers/qr.controller';
import { authMiddleware } from '@if/http/middleware/auth.middleware';
import { deviceAuthMiddleware } from '@if/http/middleware/deviceAuth.middleware';

export default async function qrRoutes(app: FastifyInstance) {
  const ctrl = qrController(app);

  app.post('/api/qr/code', { preHandler: [authMiddleware] }, ctrl.issueCode);
  app.post('/api/qr/resolve', { preHandler: [deviceAuthMiddleware] }, ctrl.resolveCode);
}