import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CreateOrderDto, ListOrdersDto, UpdateOrderStatusDto } from '@if/dtos/order.dto';
import { CreateOrderUseCase } from '@app/shop/CreateOrderUseCase';
import { OrderRepo } from '@domain/ports/OrderRepo';
import { ProductRepo } from '@domain/ports/ProductRepo';
import { StockMovementRepo } from '@domain/ports/StockMovementRepo';
import { Mailer } from '@domain/ports/Mailer';

export function orderController(app: FastifyInstance) {
  const orderRepo = app.diContainer.resolve<OrderRepo>('orderRepo');
  const productRepo = app.diContainer.resolve<ProductRepo>('productRepo');
  const stockMovementRepo = app.diContainer.resolve<StockMovementRepo>('stockMovementRepo');
  const mailer = app.diContainer.resolve<Mailer>('mailer');

  return {
    async create(req: FastifyRequest, reply: FastifyReply) {
      const body = CreateOrderDto.parse(req.body);
      const user = (req as any).user;

      const useCase = new CreateOrderUseCase(
        orderRepo,
        productRepo,
        stockMovementRepo,
        mailer
      );

      const result = await useCase.execute({
        userId: user.id,
        items: body.items,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
      });

      if (!result.ok) {
        return reply.status(400).send({
          error: result.error.code,
          message: result.error.message,
        });
      }

      return reply.status(201).send(result.value);
    },

    async listMine(req: FastifyRequest, reply: FastifyReply) {
      const user = (req as any).user;
      const query: any = req.query;
      const page = parseInt(query.page) || 1;
      const limit = parseInt(query.limit) || 20;

      const result = await orderRepo.findManyByUser(user.id, {
        skip: (page - 1) * limit,
        take: limit,
      });

      return reply.status(200).send({
        orders: result.orders,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      });
    },

    async getDetails(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;
      const user = (req as any).user;

      const order = await orderRepo.findById(id);

      if (!order) {
        return reply.status(404).send({
          error: 'ORDER_NOT_FOUND',
          message: 'Commande introuvable',
        });
      }

      if (user.role === 'USER' && order.userId !== user.id) {
        return reply.status(403).send({
          error: 'FORBIDDEN',
          message: 'Vous ne pouvez pas accéder à cette commande',
        });
      }

      return reply.status(200).send(order);
    },

    async listAll(req: FastifyRequest, reply: FastifyReply) {
      const query = ListOrdersDto.parse(req.query);

      const result = await orderRepo.findMany({
        userId: query.userId,
        status: query.status,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      });

      return reply.status(200).send({
        orders: result.orders,
        total: result.total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(result.total / query.limit),
      });
    },

    async updateStatus(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
      const { id } = req.params;
      const body = UpdateOrderStatusDto.parse(req.body);

      const order = await orderRepo.findById(id);
      if (!order) {
        return reply.status(404).send({
          error: 'ORDER_NOT_FOUND',
          message: 'Commande introuvable',
        });
      }

      await orderRepo.updateStatus(id, body.status, body.notes);

      return reply.status(200).send({ id, status: body.status });
    },
  };
}

