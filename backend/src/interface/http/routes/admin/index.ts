import { FastifyInstance } from 'fastify';
import { authMiddleware } from '@if/http/middleware/auth.middleware';
import { requireRole } from '../../middleware/roleAuth.middleware';
import authRoutes from './auth.routes';
import qrRoutes from './qr.routes';
import shopRoutes from './shop.routes';

export default async function adminRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);
  
  app.addHook('onRequest', requireRole(['ADMIN', 'COACH']));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(qrRoutes, { prefix: '/qr' });
  await app.register(shopRoutes, { prefix: '/shop' });
}

