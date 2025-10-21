import { FastifyInstance } from "fastify";
import { authController } from "../controllers/auth.controller";

export default async function authRoutes(app: FastifyInstance) {
  const ctrl = authController(app);

  app.post("/auth/issue-key", ctrl.issueKey);
  app.post("/auth/activate", ctrl.activate);
}