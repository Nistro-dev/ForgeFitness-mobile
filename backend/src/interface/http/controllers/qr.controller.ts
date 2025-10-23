import { FastifyInstance } from 'fastify';
import { IssueCodeBody } from '@if/dtos/qr.dto';
import { IssueQrCodeUseCase } from '@app/qr/IssueQrCodeUseCase';
import { AppError } from '@core/errors';
import { AuthenticatedRequest } from '@if/http/middleware/auth.middleware';

export const qrController = (app: FastifyInstance) => {
  const issueUC = app.diContainer.resolve<IssueQrCodeUseCase>('issueQrCodeUseCase');

  return {
    issueCode: async (req: AuthenticatedRequest & { body: unknown }, reply: any) => {
      const user = req.user;
      if (!user?.id) {
        throw new AppError('Unauthorized', 'UNAUTHORIZED', 401);
      }

      // ⚠️ TEMPORAIRE : Le middleware ne récupère pas le statut utilisateur
      // Il faudrait faire une requête à la DB pour récupérer le statut
      const userStatus = 'ACTIVE' as const; // TODO: Récupérer depuis la DB

      const parse = IssueCodeBody.safeParse(req.body);
      if (!parse.success) {
        throw AppError.badRequest('Invalid body', parse.error.issues);
      }

      const result = await issueUC.execute({
        userId: user.id,
        userStatus: userStatus,
        audience: parse.data.audience,
        scope: parse.data.scope,
        ttlSeconds: 300, // TTL fixé produit
      });

      return reply.status(200).send(result);
    },
  };
};