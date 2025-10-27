import { FastifyInstance } from 'fastify';
import { requireRole } from '@if/http/middleware/roleAuth.middleware';
import { userController } from '../../controllers/user.controller';

export default async function userRoutes(app: FastifyInstance) {
  const ctrl = userController(app);

  app.get('/', { preHandler: [requireRole(['ADMIN', 'COACH'])] }, ctrl.list);
  app.get<{ Params: { id: string } }>('/:id', { preHandler: [requireRole(['ADMIN', 'COACH'])] }, ctrl.getById);
  app.post('/', { preHandler: [requireRole(['ADMIN'])] }, ctrl.create);
  app.put<{ Params: { id: string } }>('/:id', { preHandler: [requireRole(['ADMIN'])] }, ctrl.update);
  app.delete<{ Params: { id: string } }>('/:id', { preHandler: [requireRole(['ADMIN'])] }, ctrl.delete);
  app.put<{ Params: { id: string } }>('/:id/password', { preHandler: [requireRole(['ADMIN'])] }, ctrl.updatePassword);
  app.put<{ Params: { id: string } }>('/:id/role', { preHandler: [requireRole(['ADMIN'])] }, ctrl.updateRole);
  app.put<{ Params: { id: string } }>('/:id/status', { preHandler: [requireRole(['ADMIN'])] }, ctrl.updateStatus);
}
