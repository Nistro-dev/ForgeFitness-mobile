import { createClient, RedisClientType } from 'redis';
import { env } from '@config/env';

export class RedisClient {
  private client: RedisClientType;
  private isConnected = false;

  constructor() {
    this.client = createClient({
      url: env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
      },
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('✅ Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('❌ Redis Client Disconnected');
      this.isConnected = false;
    });

    this.connect().catch(err => {
      console.warn('⚠️ Redis connection failed, continuing without cache:', err.message);
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.isConnected) {
      return null;
    }
    return await this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected) {
      return; // Ignorer silencieusement si Redis n'est pas connecté
    }
    
    if (ttlSeconds) {
      await this.client.setEx(key, ttlSeconds, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected) {
      return; // Ignorer silencieusement si Redis n'est pas connecté
    }
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (!this.isConnected) {
      return false;
    }
    const result = await this.client.exists(key);
    return result === 1;
  }

  async cacheUserStatus(userId: string, status: string, ttlSeconds = 3600): Promise<void> {
    const key = `user:${userId}:status`;
    await this.set(key, status, ttlSeconds);
  }

  async getUserStatus(userId: string): Promise<string | null> {
    const key = `user:${userId}:status`;
    return await this.get(key);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const key = `user:${userId}:status`;
    await this.del(key);
  }

  async setIfNotExists(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
    if (!this.isConnected) return true;
    if (ttlSeconds) {
      const res = await this.client.set(key, value, { NX: true, EX: ttlSeconds });
      return res === 'OK';
    } else {
      const res = await this.client.set(key, value, { NX: true });
      return res === 'OK';
    }
  }

  async ttl(key: string): Promise<number | null> {
    if (!this.isConnected) return null;
    const t = await this.client.ttl(key);
    return t;
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
