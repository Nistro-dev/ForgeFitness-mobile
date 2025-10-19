import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './errors';

export function httpErrorHandler(
  error: FastifyError,
  _req: FastifyRequest,
  reply: FastifyReply
) {
  if (error instanceof AppError) {
    reply.status(error.status).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  if ((error as any)?.issues && (error as any)?.name === 'ZodError') {
    reply.status(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request',
        details: (error as any).issues,
      },
    });
    return;
  }

  reply.status(500).send({
    error: {
      code: 'INTERNAL',
      message: 'Internal Server Error',
    },
  });
}
