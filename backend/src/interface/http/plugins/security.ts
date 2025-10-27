import { FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';

export async function securityPlugins(app: FastifyInstance) {
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { 
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  });
  await app.register(rateLimit, { max: 1000, timeWindow: '1 minute' });
}
