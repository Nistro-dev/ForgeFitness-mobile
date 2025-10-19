import { FastifyInstance } from 'fastify';

export async function authRoutes(app: FastifyInstance) {
  const ctrl = (app as any).diContainer.resolve('authController');
  app.post('/auth/issue', ctrl.issue);
  app.post('/auth/activate', ctrl.activateWithKey);
}