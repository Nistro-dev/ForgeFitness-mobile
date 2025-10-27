import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@prisma/client';

export function requireRole(allowedRoles: UserRole[]) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const user = (req as any).user;

    if (!user) {
      return reply.status(401).send({
        error: 'UNAUTHORIZED',
        message: 'Authentification requise',
      });
    }

    if (!allowedRoles.includes(user.role)) {
      return reply.status(403).send({
        error: 'FORBIDDEN',
        message: `Accès refusé. Rôles autorisés: ${allowedRoles.join(', ')}`,
      });
    }
  };
}

