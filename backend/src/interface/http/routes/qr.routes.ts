import { FastifyInstance } from 'fastify';
import { qrController } from '../controllers/qr.controller';
import { authMiddleware } from '../middleware/auth.middleware';

export default async function qrRoutes(app: FastifyInstance) {
  const ctrl = qrController(app);

  // Endpoint pour émettre un token QR (authentifié)
  app.post('/api/qr/token', {
    preHandler: [authMiddleware],
    handler: ctrl.issueToken,
  });

  // Endpoint pour valider un token QR (appelé par la borne)
  app.post('/api/qr/validate', {
    handler: ctrl.validateToken,
  });
}
