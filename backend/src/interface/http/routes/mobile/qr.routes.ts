import { FastifyInstance } from 'fastify';
import { qrController } from '@if/http/controllers/qr.controller';
import { authMiddleware } from '@if/http/middleware/auth.middleware';

export default async function qrRoutes(app: FastifyInstance) {
  const ctrl = qrController(app);

  app.post('/issue', { preHandler: [authMiddleware] }, ctrl.issueCode);
}

