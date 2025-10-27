import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserDto, UpdateUserDto, UpdatePasswordDto, UpdateRoleDto, UpdateStatusDto } from '@if/dtos/user.dto';
import { CreateUserUseCase } from '@app/user/CreateUserUseCase';
import { ListUsersUseCase } from '@app/user/ListUsersUseCase';
import { UpdateUserUseCase } from '@app/user/UpdateUserUseCase';
import { DeleteUserUseCase } from '@app/user/DeleteUserUseCase';
import { UpdatePasswordUseCase } from '@app/user/UpdatePasswordUseCase';
import { UpdateRoleUseCase } from '@app/user/UpdateRoleUseCase';
import { UpdateStatusUseCase } from '@app/user/UpdateStatusUseCase';
import { UserRepo } from '@domain/ports/UserRepo';

export function userController(app: FastifyInstance) {
  const userRepo = app.diContainer.resolve<UserRepo>('userRepo');

  return {
    async list(req: FastifyRequest, reply: FastifyReply) {
      const useCase = new ListUsersUseCase(userRepo);
      const result = await useCase.execute();

      if (!result.ok) return reply.status(500).send({ error: 'INTERNAL_ERROR' });
      return reply.status(200).send(result.value);
    },

    async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;

      const user = await userRepo.findById(id);
      if (!user) {
        return reply.status(404).send({
          error: 'USER_NOT_FOUND',
          message: 'Utilisateur introuvable',
        });
      }

      return reply.status(200).send(user);
    },

    async create(req: FastifyRequest, reply: FastifyReply) {
      const body = CreateUserDto.parse(req.body);

      const useCase = new CreateUserUseCase(userRepo);
      const result = await useCase.execute(body);

      if (!result.ok) {
        return reply.status(400).send({
          error: result.error.code,
          message: result.error.message,
        });
      }

      return reply.status(201).send(result.value);
    },

    async update(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;
      
      if (!req.body) {
        return reply.status(400).send({
          error: 'BAD_REQUEST',
          message: 'Body de la requête manquant',
        });
      }
      
      const body = UpdateUserDto.parse(req.body);

      const useCase = new UpdateUserUseCase(userRepo);
      const result = await useCase.execute({ id, ...body });

      if (!result.ok) {
        return reply.status(400).send({
          error: result.error.code,
          message: result.error.message,
        });
      }

      return reply.status(200).send(result.value);
    },

    async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;

      const useCase = new DeleteUserUseCase(userRepo);
      const result = await useCase.execute(id);

      if (!result.ok) {
        return reply.status(400).send({
          error: result.error.code,
          message: result.error.message,
        });
      }

      return reply.status(204).send();
    },

    async updatePassword(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;
      
      if (!req.body) {
        return reply.status(400).send({
          error: 'BAD_REQUEST',
          message: 'Body de la requête manquant',
        });
      }
      
      try {
        const body = UpdatePasswordDto.parse(req.body);

        const useCase = new UpdatePasswordUseCase(userRepo);
        const result = await useCase.execute({ id, password: body.password });

        if (!result.ok) {
          return reply.status(400).send({
            error: result.error.code,
            message: result.error.message,
          });
        }

        return reply.status(200).send({ message: 'Mot de passe mis à jour' });
      } catch (error: any) {
        if (error.name === 'ZodError') {
          return reply.status(400).send({
            error: 'VALIDATION_ERROR',
            message: 'Le mot de passe doit contenir au moins 6 caractères',
          });
        }
        throw error;
      }
    },

    async updateRole(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;
      const body = UpdateRoleDto.parse(req.body);

      const useCase = new UpdateRoleUseCase(userRepo);
      const result = await useCase.execute({ id, role: body.role });

      if (!result.ok) {
        return reply.status(400).send({
          error: result.error.code,
          message: result.error.message,
        });
      }

      return reply.status(200).send({ message: 'Rôle mis à jour' });
    },

    async updateStatus(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;
      const body = UpdateStatusDto.parse(req.body);

      const useCase = new UpdateStatusUseCase(userRepo);
      const result = await useCase.execute({ id, status: body.status });

      if (!result.ok) {
        return reply.status(400).send({
          error: result.error.code,
          message: result.error.message,
        });
      }

      return reply.status(200).send({ message: 'Statut mis à jour' });
    },
  };
}
