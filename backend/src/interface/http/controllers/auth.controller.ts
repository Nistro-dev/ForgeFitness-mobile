import { ActivateBody, IssueKeyBody } from '@if/dtos/auth.dto';
import { FastifyInstance } from 'fastify';
import { IssueActivationKeyUseCase } from '../../../application/auth/IssueActivationKeyUseCase';
import { ActivateWithKeyUseCase } from '../../../application/auth/ActivateWithKeyUseCase';

export const authController = (app: FastifyInstance) => ({
  issueKey: async (req: any, reply: any) => {
    const body = IssueKeyBody.parse(req.body);
    const uc = app.diContainer.resolve<IssueActivationKeyUseCase>('issueActivationKeyUseCase');
    const result = await uc.execute(body);
    return reply.code(200).send(result);
  },

  activate: async (req: any, reply: any) => {
    const body = ActivateBody.parse(req.body);
    const uc = app.diContainer.resolve<ActivateWithKeyUseCase>('activateWithKeyUseCase');
    const result = await uc.execute(body);
    return reply.code(200).send(result);
  },
});