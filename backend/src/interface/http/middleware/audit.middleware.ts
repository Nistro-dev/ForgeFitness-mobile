import { FastifyRequest, FastifyReply } from 'fastify';
import { extractRequestContext } from '../audit/RequestContext';

export function auditMiddleware() {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const context = extractRequestContext(req);
    
    // Injecter le contexte dans les repositories
    if (req.diContainer) {
      const userRepo = req.diContainer.resolve('userRepo');
      if (userRepo && typeof userRepo.setAuditContext === 'function') {
        userRepo.setAuditContext(context);
      }
      
      const categoryRepo = req.diContainer.resolve('categoryRepo');
      if (categoryRepo && typeof categoryRepo.setAuditContext === 'function') {
        categoryRepo.setAuditContext(context);
      }
    }
  };
}
