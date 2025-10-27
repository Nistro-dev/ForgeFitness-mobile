import { FastifyInstance } from 'fastify';
import { AdminLoginBody } from '@if/dtos/admin.dto';
import { AdminLoginUseCase } from '../../../application/auth/AdminLoginUseCase';

export const adminController = (app: FastifyInstance) => ({
  login: async (req: any, reply: any) => {
    const body = AdminLoginBody.parse(req.body);
    const uc = app.diContainer.resolve<AdminLoginUseCase>('adminLoginUseCase');
    const result = await uc.execute(body);
    return reply.code(200).send(result);
  },
});
