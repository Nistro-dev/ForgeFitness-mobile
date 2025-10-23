import { FastifyInstance } from 'fastify';
import { IssueCodeBody, ResolveCodeBody } from '@if/dtos/qr.dto';
import { IssueQrCodeUseCase } from '@app/qr/IssueQrCodeUseCase';
import { ResolveQrCodeUseCase } from '@app/qr/ResolveQrCodeUseCase';
import { AppError } from '@core/errors';
import { AuthenticatedRequest } from '@if/http/middleware/auth.middleware';
import { DeviceAuthenticatedRequest } from '@if/http/middleware/deviceAuth.middleware';

export const qrController = (app: FastifyInstance) => {
  const issueUC = app.diContainer.resolve<IssueQrCodeUseCase>('issueQrCodeUseCase');
  const resolveUC = app.diContainer.resolve<ResolveQrCodeUseCase>('resolveQrCodeUseCase');

  return {
    issueCode: async (req: AuthenticatedRequest & { body: unknown }, reply: any) => {
      const user = req.user;
      if (!user?.id) {
        throw new AppError('Unauthorized', 'UNAUTHORIZED', 401);
      }

      const userStatus = 'ACTIVE' as const;

      const parse = IssueCodeBody.safeParse(req.body);
      if (!parse.success) {
        throw AppError.badRequest('Invalid body', parse.error.issues);
      }

      const result = await issueUC.execute({
        userId: user.id,
        userStatus: userStatus,
        audience: parse.data.audience,
        scope: parse.data.scope,
        ttlSeconds: 300,
      });

      return reply.status(200).send(result);
    },

    resolveCode: async (req: DeviceAuthenticatedRequest & { body: unknown }, reply: any) => {
      if (!req.device?.id) {
        throw new AppError('Unauthorized device', 'UNAUTHORIZED_DEVICE', 401);
      }
      const parse = ResolveCodeBody.safeParse(req.body);
      if (!parse.success) throw AppError.badRequest('Invalid body', parse.error.issues);

      const out = await resolveUC.execute({
        code: parse.data.code,
        audienceDeclared: parse.data.audience,
        deviceId: req.device.id,
      });

      return reply.status(200).send(out);
    },
  };
};