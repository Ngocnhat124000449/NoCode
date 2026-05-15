import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PhoneHashService } from '../phone/phone-hash.service';
import { MetricsService } from '../metrics/metrics.service';
import { CACHE_TTL } from '../redis/redis.constants';
import { RiskScoreDto } from './dto/risk-score.dto';
import { scoreCall } from '@icproject/risk-contract';

@Injectable()
export class RiskService {
  private readonly logger = new Logger(RiskService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly phoneHash: PhoneHashService,
    private readonly metrics: MetricsService,
  ) {}

  async score(signals: RiskScoreDto) {
    const result = scoreCall(signals);
    this.logger.log(
      `Scored: ${result.score} (${result.level}) confidence=${result.confidence} action=${result.action}`,
    );
    return result;
  }

  async scoreByPhone(rawPhone: string, signals: RiskScoreDto) {
    const { hash: phoneHash } = this.phoneHash.hash(rawPhone);

    const communityReportCount = await this.prisma.scamReport.count({
      where: { phoneHash },
    });

    const enrichedSignals = { ...signals, communityReportCount };
    const result = scoreCall(enrichedSignals);

    this.logger.log(
      `Scored phone ${phoneHash.slice(0, 8)}...: ${result.score} (${result.level}) reports=${communityReportCount}`,
    );

    await this.upsertScore(phoneHash, result);

    return result;
  }

  async lookupByPhone(rawPhone: string) {
    const { hash: phoneHash } = this.phoneHash.hash(rawPhone);
    return this.getStoredScore(phoneHash);
  }

  async getStoredScore(phoneHash: string) {
    const cacheKey = `risk:${phoneHash}`;
    const end = this.metrics.lookupLatency.startTimer();

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      this.metrics.cacheHits.inc();
      end({ source: 'cache' });
      this.logger.debug(`Cache HIT for risk score: ${phoneHash.slice(0, 8)}...`);
      return cached;
    }

    this.metrics.cacheMisses.inc();
    this.logger.log(`Cache MISS — querying DB for: ${phoneHash.slice(0, 8)}...`);
    const result = await this.prisma.riskScore.findUnique({ where: { phoneHash } });

    if (result) {
      await this.redis.set(cacheKey, result, CACHE_TTL.RISK_LOOKUP);
    }

    end({ source: 'db' });
    return result;
  }

  async upsertScore(
    phoneHash: string,
    result: {
      score: number;
      level: string;
      reasons: string[];
      confidence: number;
      action: string;
    },
  ) {
    const record = await this.prisma.riskScore.upsert({
      where: { phoneHash },
      update: { ...result, updatedAt: new Date() },
      create: { phoneHash, ...result },
    });

    await this.redis.del(`risk:${phoneHash}`);
    return record;
  }
}
