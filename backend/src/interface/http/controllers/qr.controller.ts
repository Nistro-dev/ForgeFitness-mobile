import { FastifyInstance } from 'fastify';
import { IssueQrTokenBody, ValidateQrTokenBody } from '@if/dtos/qr.dto';
import { IssueQrTokenUseCase } from '@app/qr/IssueQrTokenUseCase';
import { ValidateQrTokenUseCase } from '@app/qr/ValidateQrTokenUseCase';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';

export const qrController = (app: FastifyInstance) => ({
  issueToken: async (req: AuthenticatedRequest, reply: any) => {
    try {
      const body = IssueQrTokenBody.parse(req.body);
      
      // Récupérer l'userId depuis le token JWT
      const userId = req.user?.id;
      if (!userId) {
        return reply.code(401).send({ error: 'Authentication required' });
      }

      const useCase = app.diContainer.resolve<IssueQrTokenUseCase>('issueQrTokenUseCase');
      const result = await useCase.execute(userId, body);

      if (!result.ok) {
        return reply.code(403).send({ error: result.error });
      }

      return reply.code(200).send(result.value);
    } catch (error) {
      app.log.error({ err: error }, 'Error in issueToken');
      return reply.code(400).send({ error: 'Invalid request' });
    }
  },

  validateToken: async (req: any, reply: any) => {
    try {
      const body = ValidateQrTokenBody.parse(req.body);
      
      const useCase = app.diContainer.resolve<ValidateQrTokenUseCase>('validateQrTokenUseCase');
      const result = await useCase.execute(
        body,
        req.ip,
        req.headers['user-agent']
      );

      if (!result.ok) {
        return reply.code(500).send({ error: 'Validation failed' });
      }

      // Retourner toujours 200, le résultat est dans le body
      return reply.code(200).send(result.value);
    } catch (error) {
      app.log.error({ err: error }, 'Error in validateToken');
      return reply.code(400).send({ error: 'Invalid request' });
    }
  },
});
