import { AppError } from './errors';
export function httpErrorHandler(error, _req, reply) {
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
    // Zod validation
    if (error?.issues && error?.name === 'ZodError') {
        reply.status(400).send({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid request',
                details: error.issues,
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
