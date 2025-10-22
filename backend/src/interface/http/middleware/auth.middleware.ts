import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '@config/env';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    sub: string;
    sid: string;
  };
}

export async function authMiddleware(
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.decode(token) as any;
    
    if (!decoded || !decoded.sub) {
      return reply.code(401).send({ error: 'Invalid token' });
    }

    request.user = {
      id: decoded.sub,
      sub: decoded.sub,
      sid: decoded.sid,
    };

  } catch (error) {
    return reply.code(401).send({ error: 'Invalid token' });
  }
}
