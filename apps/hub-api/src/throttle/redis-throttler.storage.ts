import { Injectable } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage {
  constructor(private readonly redis: RedisService) {}

  async increment(
    key: string,
    ttl: number,
  ): Promise<{ totalHits: number; timeToExpire: number; isBlocked: boolean; timeToBlockExpire: number }> {
    const redisKey = `throttle:${key}`;
    const current = await this.redis.get<number>(redisKey);
    const totalHits = (current ?? 0) + 1;
    await this.redis.set(redisKey, totalHits, Math.ceil(ttl / 1000));
    return { totalHits, timeToExpire: ttl, isBlocked: false, timeToBlockExpire: 0 };
  }
}
