import { FastifyInstance } from 'fastify';
import { fastifyAwilixPlugin } from '@fastify/awilix';
import { container } from '@di/container';

export async function diPlugin(app: FastifyInstance) {
  await app.register(fastifyAwilixPlugin, {
    container,
    disposeOnClose: true,
    disposeOnResponse: false,
    strictBooleanEnforced: false,
  });

  // Optionnel : vérifier que le container est bien là
  app.log.info(`DI ready with registrations: ${Object.keys((app as any).diContainer.registrations).length}`);
}