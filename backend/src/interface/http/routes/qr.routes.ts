import { FastifyInstance } from 'fastify';
import { qrController } from '@if/http/controllers/qr.controller';
import { authMiddleware } from '@if/http/middleware/auth.middleware';

export default async function qrRoutes(app: FastifyInstance) {
  const ctrl = qrController(app);

  // Mobile: issue code
  app.post('/api/qr/code', { preHandler: authMiddleware }, ctrl.issueCode);

  // Étape 2: on ajoutera ici /api/qr/resolve (auth JWT d'équipement)
}