import { FastifyInstance } from 'fastify';
import { healthController } from '../controllers/health.controller';

export default async function healthRoutes(app: FastifyInstance) {
  const ctrl = healthController(app);

  app.get('/health/detailed', ctrl.healthDetailed);

  app.get('/health/jwt-keys', ctrl.jwtKeys);
}
