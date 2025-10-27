import { Order, OrderItem, Prisma, OrderStatus } from '@prisma/client';

export type OrderWithRelations = Order & {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  items: (OrderItem & {
    product: {
      id: string;
      name: string;
      slug: string;
    };
  })[];
};

export interface OrderRepo {
  create(data: Prisma.OrderCreateInput): Promise<Order>;
  update(id: string, data: Prisma.OrderUpdateInput): Promise<Order>;
  findById(id: string): Promise<OrderWithRelations | null>;
  findByOrderNumber(orderNumber: string): Promise<OrderWithRelations | null>;
  findManyByUser(userId: string, params: { skip?: number; take?: number }): Promise<{ orders: OrderWithRelations[]; total: number }>;
  findMany(params: {
    userId?: string;
    status?: OrderStatus;
    skip?: number;
    take?: number;
  }): Promise<{ orders: OrderWithRelations[]; total: number }>;
  updateStatus(id: string, status: OrderStatus, notes?: string): Promise<Order>;
  generateOrderNumber(): Promise<string>;
}

