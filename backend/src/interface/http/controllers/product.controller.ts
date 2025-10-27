import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CreateProductDto, UpdateProductDto, ListProductsDto, AdjustStockDto } from '@if/dtos/product.dto';
import { CreateProductUseCase } from '@app/shop/CreateProductUseCase';
import { ListProductsUseCase } from '@app/shop/ListProductsUseCase';
import { GetProductDetailsUseCase } from '@app/shop/GetProductDetailsUseCase';
import { ProductRepo } from '@domain/ports/ProductRepo';
import { CategoryRepo } from '@domain/ports/CategoryRepo';
import { StockMovementRepo } from '@domain/ports/StockMovementRepo';

export function productController(app: FastifyInstance) {
  const productRepo = app.diContainer.resolve<ProductRepo>('productRepo');
  const categoryRepo = app.diContainer.resolve<CategoryRepo>('categoryRepo');
  const stockMovementRepo = app.diContainer.resolve<StockMovementRepo>('stockMovementRepo');

  return {
    async create(req: FastifyRequest, reply: FastifyReply) {
      const body = CreateProductDto.parse(req.body);
      const user = (req as any).user;

      const useCase = new CreateProductUseCase(productRepo, categoryRepo);
      const result = await useCase.execute({
        ...body,
        createdBy: user.id,
      });

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
      const body = UpdateProductDto.parse(req.body);

      const product = await productRepo.findById(id);
      if (!product) {
        return reply.status(404).send({
          error: 'PRODUCT_NOT_FOUND',
          message: 'Produit introuvable',
        });
      }

      await productRepo.update(id, body);

      return reply.status(200).send({ id });
    },

    async list(req: FastifyRequest, reply: FastifyReply) {
      const query = ListProductsDto.parse(req.query);

      const useCase = new ListProductsUseCase(productRepo);
      const result = await useCase.execute(query);

      if (!result.ok) return reply.status(500).send({ error: 'INTERNAL_ERROR' });
      return reply.status(200).send(result.value);
    },

    async getDetails(req: FastifyRequest<{ Params: { slugOrId: string } }>, reply: FastifyReply) {
      const { slugOrId } = req.params;

      const useCase = new GetProductDetailsUseCase(productRepo);
      const result = await useCase.execute(slugOrId);

      if (!result.ok) {
        return reply.status(404).send({
          error: result.error.code,
          message: result.error.message,
        });
      }

      return reply.status(200).send(result.value);
    },

    async delete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;

      const product = await productRepo.findById(id);
      if (!product) {
        return reply.status(404).send({
          error: 'PRODUCT_NOT_FOUND',
          message: 'Produit introuvable',
        });
      }

      await productRepo.delete(id);

      return reply.status(200).send({ success: true });
    },

    async hardDelete(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;

      const product = await productRepo.findById(id);
      if (!product) {
        return reply.status(404).send({
          error: 'PRODUCT_NOT_FOUND',
          message: 'Produit introuvable',
        });
      }

      await productRepo.hardDelete(id);

      return reply.status(200).send({ success: true });
    },

    async adjustStock(req: FastifyRequest, reply: FastifyReply) {
      const body = AdjustStockDto.parse(req.body);
      const user = (req as any).user;

      const product = await productRepo.findById(body.productId);
      if (!product) {
        return reply.status(404).send({
          error: 'PRODUCT_NOT_FOUND',
          message: 'Produit introuvable',
        });
      }

      if (body.type === 'IN' || body.type === 'RETURN') {
        await productRepo.incrementStock(body.productId, Math.abs(body.quantity));
      } else {
        await productRepo.decrementStock(body.productId, Math.abs(body.quantity));
      }

      await stockMovementRepo.create({
        type: body.type,
        quantity: body.quantity,
        reason: body.reason,
        product: {
          connect: { id: body.productId },
        },
        creator: {
          connect: { id: user.id },
        },
      });

      return reply.status(200).send({ success: true });
    },
  };
}

