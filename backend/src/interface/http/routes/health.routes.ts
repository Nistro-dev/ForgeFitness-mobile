import { FastifyInstance } from 'fastify';
import { healthController } from '../controllers/health.controller';

export default async function healthRoutes(app: FastifyInstance) {
  const ctrl = healthController(app);

  // Endpoint de santé détaillé
  app.get('/health/detailed', ctrl.healthDetailed);

  // Endpoint pour vérifier les clés JWT
  app.get('/health/jwt-keys', ctrl.jwtKeys);
}
