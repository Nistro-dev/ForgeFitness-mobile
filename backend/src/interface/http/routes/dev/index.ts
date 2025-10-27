import { FastifyInstance } from 'fastify';
import mailRoutes from './mail.routes';

export default async function devRoutes(app: FastifyInstance) {
  await app.register(mailRoutes, { prefix: '/mail' });
}

