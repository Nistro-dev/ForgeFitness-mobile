import Fastify from "fastify";
import { httpErrorHandler } from "@core/httpErrorHandler";
import { securityPlugins } from "@if/http/plugins/security";
import { diPlugin } from "@if/http/plugins/di";
import { devRoutes } from "@if";
import authRoutes from "@if/http/routes/auth.routes";
import qrRoutes from "@if/http/routes/qr.routes";
import healthRoutes from "@if/http/routes/health.routes";
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

  await authRoutes(app);
  await qrRoutes(app);
  await healthRoutes(app);
  await devRoutes(app);

  app.setErrorHandler(httpErrorHandler);
  return app;
}