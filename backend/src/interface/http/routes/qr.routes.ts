import { FastifyInstance } from 'fastify';
import { qrController } from '../controllers/qr.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export default async function qrRoutes(app: FastifyInstance) {
  const ctrl = qrController(app);

  app.post('/api/qr/token', {
    preHandler: [authMiddleware],
    handler: ctrl.issueToken,
  });

  app.post('/api/qr/validate', {
    handler: ctrl.validateToken,
  });
}
