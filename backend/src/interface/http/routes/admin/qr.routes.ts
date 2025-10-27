import { FastifyInstance } from 'fastify';
import { qrController } from '@if/http/controllers/qr.controller';
import { deviceAuthMiddleware } from '@if/http/middleware/deviceAuth.middleware';

export default async function qrRoutes(app: FastifyInstance) {
  const ctrl = qrController(app);

  app.post('/resolve', { preHandler: [deviceAuthMiddleware] }, ctrl.resolveCode);
}

