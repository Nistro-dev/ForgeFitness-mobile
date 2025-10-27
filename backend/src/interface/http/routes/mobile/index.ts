import { FastifyInstance } from 'fastify';
import authRoutes from './auth.routes';
import qrRoutes from './qr.routes';
import shopRoutes from './shop.routes';

export default async function mobileRoutes(app: FastifyInstance) {
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(qrRoutes, { prefix: '/qr' });
  await app.register(shopRoutes, { prefix: '/shop' });
}

