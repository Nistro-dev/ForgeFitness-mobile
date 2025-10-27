import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CreateCategoryDto, UpdateCategoryDto } from '@if/dtos/category.dto';
import { CreateCategoryUseCase } from '@app/shop/CreateCategoryUseCase';
import { ListCategoriesUseCase } from '@app/shop/ListCategoriesUseCase';
import { CategoryRepo } from '@domain/ports/CategoryRepo';

export function categoryController(app: FastifyInstance) {
  const categoryRepo = app.diContainer.resolve<CategoryRepo>('categoryRepo');

  return {
    async create(req: FastifyRequest, reply: FastifyReply) {
      const body = CreateCategoryDto.parse(req.body);

      const useCase = new CreateCategoryUseCase(categoryRepo);
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
      const body = UpdateCategoryDto.parse(req.body);

      const category = await categoryRepo.findById(id);
      if (!category) {
        return reply.status(404).send({
          error: 'CATEGORY_NOT_FOUND',
          message: 'Catégorie introuvable',
        });
      }

      await categoryRepo.update(id, body);

      return reply.status(200).send({ id });
    },

    async list(req: FastifyRequest, reply: FastifyReply) {
      const useCase = new ListCategoriesUseCase(categoryRepo);
      const result = await useCase.execute(false);

      if (!result.ok) return reply.status(500).send({ error: 'INTERNAL_ERROR' });
      return reply.status(200).send(result.value);
    },

    async getById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;

      const category = await categoryRepo.findById(id);
      if (!category) {
        return reply.status(404).send({
          error: 'CATEGORY_NOT_FOUND',
          message: 'Catégorie introuvable',
        });
      }

      return reply.status(200).send(category);
    },

    async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;

      const category = await categoryRepo.findById(id);
      if (!category) {
        return reply.status(404).send({
          error: 'CATEGORY_NOT_FOUND',
          message: 'Catégorie introuvable',
        });
      }

      await categoryRepo.delete(id);

      return reply.status(204).send();
    },
  };
}

