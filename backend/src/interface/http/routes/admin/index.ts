import { FastifyInstance } from 'fastify';
import { authMiddleware } from '@if/http/middleware/auth.middleware';
import { requireRole } from '../../middleware/roleAuth.middleware';
import { auditMiddleware } from '../../middleware/audit.middleware';
import authRoutes from './auth.routes';
import qrRoutes from './qr.routes';
import shopRoutes from './shop.routes';
import userRoutes from './user.routes';
import auditRoutes from './audit.routes';

export default async function adminRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authMiddleware);
  app.addHook('onRequest', auditMiddleware());
  
  app.addHook('onRequest', requireRole(['ADMIN', 'COACH']));

  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(qrRoutes, { prefix: '/qr' });
  await app.register(shopRoutes, { prefix: '/shop' });
  await app.register(userRoutes, { prefix: '/users' });
  await app.register(auditRoutes, { prefix: '/audit' });
}

