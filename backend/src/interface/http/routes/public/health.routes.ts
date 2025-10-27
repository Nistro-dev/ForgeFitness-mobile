import { FastifyInstance } from 'fastify';
import { healthController } from '../../controllers/health.controller';

export default async function healthRoutes(app: FastifyInstance) {
  const ctrl = healthController(app);

  app.get('/detailed', ctrl.healthDetailed);
  app.get('/jwt-keys', ctrl.jwtKeys);
}

