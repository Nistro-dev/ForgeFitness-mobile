import { FastifyRequest } from 'fastify';

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
}

export function extractRequestContext(req: FastifyRequest): RequestContext {
  return {
    ipAddress: req.ip || req.headers['x-forwarded-for'] as string || req.headers['x-real-ip'] as string,
    userAgent: req.headers['user-agent'],
    userId: (req as any).user?.id,
  };
}
