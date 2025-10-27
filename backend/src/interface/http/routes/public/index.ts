import { FastifyInstance } from 'fastify';
import healthRoutes from './health.routes';
import { adminController } from '../../controllers/admin.controller';

export default async function publicRoutes(app: FastifyInstance) {
  await app.register(healthRoutes, { prefix: '/health' });
  
  const adminCtrl = adminController(app);
  app.post('/admin/login', adminCtrl.login);
}

