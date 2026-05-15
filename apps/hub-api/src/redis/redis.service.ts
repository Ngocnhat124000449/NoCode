import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private failureCount = 0;
  private readonly CIRCUIT_OPEN_THRESHOLD = 3;
  private circuitOpen = false;

  constructor(private readonly config: ConfigService) {
    this.client = new Redis(this.config.get<string>('REDIS_URL', 'redis://localhost:6379'), {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
    });

    this.client.on('error', (err) => {
      this.failureCount++;
      this.logger.error(`Redis error (${this.failureCount}): ${err.message}`);
      if (this.failureCount >= this.CIRCUIT_OPEN_THRESHOLD) {
        this.circuitOpen = true;
        this.logger.warn('Circuit OPEN — Redis bypassed');
      }
    });

    this.client.on('connect', () => {
      this.failureCount = 0;
      this.circuitOpen = false;
      this.logger.log('Redis connected — circuit CLOSED');
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.circuitOpen) return null;
    try {
      const raw = await this.client.get(key);
      if (!raw) return null;
      this.logger.debug(`Cache HIT: ${key}`);
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (this.circuitOpen) return;
    try {
      await this.client.setex(key, ttlSeconds, JSON.stringify(value));
    } catch (err) {
      this.logger.warn(`Cache SET failed for ${key}: ${err}`);
    }
  }

  async del(key: string): Promise<void> {
    if (this.circuitOpen) return;
    try {
      await this.client.del(key);
    } catch {}
  }

  isCircuitOpen(): boolean {
    return this.circuitOpen;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
