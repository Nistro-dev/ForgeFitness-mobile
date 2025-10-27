import { FastifyInstance } from 'fastify';
import { authController } from '../../controllers/auth.controller';
import { requireRole } from '../../middleware/roleAuth.middleware';

export default async function authRoutes(app: FastifyInstance) {
  const ctrl = authController(app);

  app.post('/issue-key', { preHandler: [requireRole(['ADMIN'])] }, ctrl.issueKey);
}

