import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

const SOFT_BAN_TTL = 15 * 60;
const BURST_THRESHOLD = 10;

@Injectable()
export class AbuseDetectionService {
  private readonly logger = new Logger(AbuseDetectionService.name);

  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async isBanned(ip: string): Promise<boolean> {
    const softBan = await this.redis.get<boolean>(`ban:soft:${ip}`);
    if (softBan) return true;

    const hardBan = await this.prisma.bannedIp.findFirst({
      where: { ip, active: true },
    });
    return !!hardBan;
  }

  async softBan(ip: string, reason: string): Promise<void> {
    await this.redis.set(`ban:soft:${ip}`, true, SOFT_BAN_TTL);
    this.logger.warn(`Soft ban applied to ${ip}: ${reason}`);

    await this.prisma.abuseEvent.create({
      data: {
        ip,
        reason,
        banType: 'soft',
        expiresAt: new Date(Date.now() + SOFT_BAN_TTL * 1000),
      },
    });
  }

  async hardBan(ip: string, reason: string): Promise<void> {
    await this.prisma.bannedIp.upsert({
      where: { ip },
      create: { ip, reason, active: true },
      update: { reason, active: true },
    });
    this.logger.error(`Hard ban applied to ${ip}: ${reason}`);
  }

  async recordRequest(ip: string, endpoint: string): Promise<void> {
    const key = `abuse:rate:${ip}:${endpoint}`;
    const current = (await this.redis.get<number>(key)) ?? 0;
    await this.redis.set(key, current + 1, 60);

    if (current + 1 >= BURST_THRESHOLD) {
      await this.softBan(ip, `Burst: ${current + 1} requests to ${endpoint} in 60s`);
    }
  }
}
