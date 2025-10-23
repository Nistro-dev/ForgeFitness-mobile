import { FastifyInstance } from 'fastify';
import { KeyManager } from '../../../infrastructure/crypto/KeyManager';
import { RedisClient } from '../../../infrastructure/cache/RedisClient';

export const healthController = (app: FastifyInstance) => ({
  health: async (req: any, reply: any) => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'forge-fitness-api',
    };
  },

  healthDetailed: async (req: any, reply: any) => {
    try {
      const keyManager = app.diContainer.resolve<KeyManager>('keyManager');
      const redisClient = app.diContainer.resolve<RedisClient>('redisClient');
      
      const keyInfo = keyManager.getKeyInfo();
      let redisStatus = 'disconnected';
      try {
        redisStatus = await redisClient.exists('health-check') ? 'connected' : 'disconnected';
      } catch (error) {
        redisStatus = 'disconnected';
      }
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'forge-fitness-api',
        components: {
          database: 'ok',
          redis: redisStatus,
          jwt: {
            status: keyInfo.valid ? 'ok' : 'error',
            kid: keyInfo.kid,
            algorithm: keyInfo.algorithm,
          },
        },
      };
    } catch (error) {
      app.log.error({ err: error }, 'Health check failed');
      return reply.code(500).send({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  },

  jwtKeys: async (req: any, reply: any) => {
    try {
      const keyManager = app.diContainer.resolve<KeyManager>('keyManager');
      const keyInfo = keyManager.getKeyInfo();
      
      return {
        status: keyInfo.valid ? 'ok' : 'error',
        keys: {
          kid: keyInfo.kid,
          algorithm: keyInfo.algorithm,
          valid: keyInfo.valid,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      app.log.error({ err: error }, 'JWT keys check failed');
      return reply.code(500).send({
        status: 'error',
        error: 'JWT keys check failed',
      });
    }
  },
});
