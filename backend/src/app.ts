import Fastify from 'fastify';
import { httpErrorHandler } from '@core/httpErrorHandler';
import { securityPlugins } from '@if/http/plugins/security';
import { diPlugin } from '@if/http/plugins/di';
import { authRoutes } from '@if/http/routes/auth.routes';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await securityPlugins(app);
  await diPlugin(app);

  app.get('/health', async () => ({ ok: true, ts: Date.now() }));

  await authRoutes(app);

  app.setErrorHandler(httpErrorHandler);
  return app;
}
