import { FastifyInstance } from 'fastify';
import { authMiddleware } from '@if/http/middleware/auth.middleware';
import { productController } from '@if/http/controllers/product.controller';
import { categoryController } from '@if/http/controllers/category.controller';
import { orderController } from '@if/http/controllers/order.controller';
import { paymentController } from '@if/http/controllers/payment.controller';

export default async function shopRoutes(app: FastifyInstance) {
  const productCtrl = productController(app);
  const categoryCtrl = categoryController(app);
  const orderCtrl = orderController(app);
  const paymentCtrl = paymentController(app);

  app.get('/products', { preHandler: [authMiddleware] }, productCtrl.list);
  app.get<{ Params: { slugOrId: string } }>('/products/:slugOrId', { preHandler: [authMiddleware] }, productCtrl.getDetails);
  app.get('/categories', { preHandler: [authMiddleware] }, categoryCtrl.list);

  app.post('/orders', { preHandler: [authMiddleware] }, orderCtrl.create);
  app.get('/orders', { preHandler: [authMiddleware] }, orderCtrl.listMine);
  app.get<{ Params: { id: string } }>('/orders/:id', { preHandler: [authMiddleware] }, orderCtrl.getDetails);

  app.post('/payment/initiate', { preHandler: [authMiddleware] }, paymentCtrl.initiatePayment);
}

