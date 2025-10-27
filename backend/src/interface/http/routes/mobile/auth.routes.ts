import { FastifyInstance } from 'fastify';
import { authController } from '../../controllers/auth.controller';

export default async function authRoutes(app: FastifyInstance) {
  const ctrl = authController(app);

  app.post('/activate', ctrl.activate);
}

