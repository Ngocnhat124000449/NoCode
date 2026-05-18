import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { PhoneModule } from './phone/phone.module';
import { QueueModule } from './queue/queue.module';
import { ReportModule } from './report/report.module';
import { RiskModule } from './risk/risk.module';
import { MetricsModule } from './metrics/metrics.module';
import { ThrottleModule } from './throttle/throttle.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';

const redisUrl = process.env.REDIS_URL;
const shouldUseBull = !redisUrl || (/^rediss?:\/\//.test(redisUrl) && !redisUrl.includes('replace_with'));

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 3000,  limit: 3  },
      { name: 'report', ttl: 60000, limit: 5  },
      { name: 'lookup', ttl: 60000, limit: 30 },
    ]),
    ...(shouldUseBull
      ? [
          BullModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
              connection: {
                url: config.get<string>('REDIS_URL', 'redis://localhost:6379'),
                lazyConnect: true,
                enableReadyCheck: false,
                maxRetriesPerRequest: null,
                connectTimeout: 5000,
              },
            }),
          }),
        ]
      : []),
    PrismaModule,
    RedisModule,
    PhoneModule,
    QueueModule,
    ReportModule,
    RiskModule,
    MetricsModule,
    ThrottleModule,
    AuthModule,
    NotificationModule,
  ],
})
export class AppModule {}
