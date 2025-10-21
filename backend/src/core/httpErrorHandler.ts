import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { env } from '@config/env';

export function httpErrorHandler(
  error: FastifyError,
  _req: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: { code: 'BAD_REQUEST', message: 'Validation failed', issues: error.issues },
    });
  }

  // @ts-ignore
  if (error?.isAppError) {
    // @ts-ignore
    const status = error.httpCode ?? 400;
    return reply.status(status).send({
      error: { code: error.code ?? 'APP_ERROR', message: error.message },
    });
  }

  const payload: any = { error: { code: 'INTERNAL', message: 'Internal Server Error' } };
  if (env.NODE_ENV !== 'production') {
    payload.error.detail = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  reply.status(500).send(payload);
}