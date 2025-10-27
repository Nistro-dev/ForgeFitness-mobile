import Fastify from "fastify";
import { httpErrorHandler } from "@core/httpErrorHandler";
import { securityPlugins } from "@if/http/plugins/security";
import { diPlugin } from "@if/http/plugins/di";
import publicRoutes from "@if/http/routes/public";
import mobileRoutes from "@if/http/routes/mobile";
import adminRoutes from "@if/http/routes/admin";
import devRoutes from "@if/http/routes/dev";
import webhookRoutes from "@if/http/routes/webhook.routes";
import { makeContainer } from "@di/container";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await securityPlugins(app);
  await diPlugin(app);

  app.get("/health", async () => ({
    status: "ok",
    timestamp: new Date().toISOString(),
  }));

  const mailer =
    app.diContainer.resolve<import("./domain/ports/Mailer").Mailer>("mailer");
  try {
    if (
      "verifyConnection" in mailer &&
      typeof (mailer as any).verifyConnection === "function"
    ) {
      await (mailer as any).verifyConnection();
      app.log.info("SMTP OK");
    }
  } catch (e) {
    app.log.error({ err: e }, "SMTP verification failed");
  }

  await app.register(publicRoutes, { prefix: '/api/public' });
  await app.register(mobileRoutes, { prefix: '/api/mobile' });
  await app.register(adminRoutes, { prefix: '/api/admin' });
  await app.register(webhookRoutes, { prefix: '/api/webhooks' });
  
  if (process.env.NODE_ENV === 'development') {
    await app.register(devRoutes, { prefix: '/api/dev' });
  }

  app.setErrorHandler(httpErrorHandler);
  return app;
}