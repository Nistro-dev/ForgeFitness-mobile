import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    sub: string;
    sid: string;
    role: string;
  };
}

export async function authMiddleware(
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);

    const decoded = jwt.verify(token, env.JWT_PUBLIC_KEY ?? env.JWT_SECRET) as any;

    if (!decoded?.sub) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    request.user = {
      id: decoded.sub,
      sub: decoded.sub,
      sid: decoded.sid,
      role: decoded.role,
    };

  } catch {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}
