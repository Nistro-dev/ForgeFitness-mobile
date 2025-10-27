import { FastifyInstance } from 'fastify';
import { requireRole } from '@if/http/middleware/roleAuth.middleware';
import { productController } from '@if/http/controllers/product.controller';
import { categoryController } from '@if/http/controllers/category.controller';
import { orderController } from '@if/http/controllers/order.controller';

export default async function shopRoutes(app: FastifyInstance) {
  const productCtrl = productController(app);
  const categoryCtrl = categoryController(app);
  const orderCtrl = orderController(app);

  app.post('/products', { preHandler: [requireRole(['ADMIN'])] }, productCtrl.create);
  app.put<{ Params: { id: string } }>('/products/:id', { preHandler: [requireRole(['ADMIN'])] }, productCtrl.update);
  app.delete<{ Params: { id: string } }>('/products/:id', { preHandler: [requireRole(['ADMIN'])] }, productCtrl.delete);
  app.delete<{ Params: { id: string } }>('/products/:id/hard', { preHandler: [requireRole(['ADMIN'])] }, productCtrl.hardDelete);
  
  app.get('/products', productCtrl.list);

  app.post('/categories', { preHandler: [requireRole(['ADMIN'])] }, categoryCtrl.create);
  app.put<{ Params: { id: string } }>('/categories/:id', { preHandler: [requireRole(['ADMIN'])] }, categoryCtrl.update);
  app.delete<{ Params: { id: string } }>('/categories/:id', { preHandler: [requireRole(['ADMIN'])] }, categoryCtrl.delete);
  app.get('/categories', categoryCtrl.list);

  app.post('/stock/adjust', { preHandler: [requireRole(['ADMIN'])] }, productCtrl.adjustStock);

  app.get('/orders', orderCtrl.listAll);
  app.get<{ Params: { id: string } }>('/orders/:id', orderCtrl.getDetails);
  app.put<{ Params: { id: string } }>('/orders/:id/status', { preHandler: [requireRole(['ADMIN'])] }, orderCtrl.updateStatus);
}

