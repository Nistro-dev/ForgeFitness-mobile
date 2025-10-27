import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { extractRequestContext } from '../../../infrastructure/audit/RequestContext';

export function auditMiddleware(app: FastifyInstance) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const context = extractRequestContext(req);
    const auditService = app.diContainer.resolve('auditLogService');
    
    // Injecter le contexte et l'audit service dans tous les repositories avec audit
    const repositories = [
      'userRepo',
      'categoryRepo', 
      'productRepo',
      'orderRepo',
      'stockMovementRepo',
      'activationKeyRepo',
      'sessionRepo',
      'deviceRepo'
    ];

    for (const repoName of repositories) {
      try {
        const repo = app.diContainer.resolve(repoName) as any;
        if (repo) {
          if (typeof repo.setAuditContext === 'function') {
            repo.setAuditContext(context);
          }
          if (typeof repo.setAuditService === 'function') {
            repo.setAuditService(auditService);
          }
        }
      } catch (error) {
        // Repository non disponible, ignorer silencieusement
      }
    }
  };
}
