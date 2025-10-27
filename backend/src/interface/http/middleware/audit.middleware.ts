import { FastifyRequest, FastifyReply } from 'fastify';
import { extractRequestContext } from '../../../infrastructure/audit/RequestContext';

export function auditMiddleware() {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const context = extractRequestContext(req);
    
    // Injecter le contexte dans tous les repositories avec audit
    if (req.diContainer) {
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
        const repo = req.diContainer.resolve(repoName);
        if (repo && typeof repo.setAuditContext === 'function') {
          repo.setAuditContext(context);
        }
      }
    }
  };
}
