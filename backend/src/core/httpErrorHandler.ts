import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { ZodError } from "zod";
import { env } from "@config/env";
import { AppError } from "./errors";

export function httpErrorHandler(
  error: FastifyError,
  _req: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: {
        code: "BAD_REQUEST",
        message: "Validation failed",
        issues: error.issues,
      },
    });
  }

  if (error instanceof AppError || (error as any)?.isAppError) {
    const e = error as any;
    const status = e.httpCode ?? e.status ?? 400;

    const payload: any = {
      error: {
        code: e.code ?? "APP_ERROR",
        message: e.message,
      },
    };

    if (e.details !== undefined) {
      payload.error.detail = e.details;
    }

    return reply.status(status).send(payload);
  }

  const payload: any = {
    error: { code: "INTERNAL", message: "Internal Server Error" },
  };

  if (env.NODE_ENV !== "production") {
    payload.error.detail = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return reply.status(500).send(payload);
}