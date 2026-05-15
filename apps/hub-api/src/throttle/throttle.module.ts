import { Module, Global } from '@nestjs/common';
import { AbuseDetectionService } from './abuse-detection.service';
import { BanCheckGuard } from './ban-check.guard';
import { RedisThrottlerStorage } from './redis-throttler.storage';

@Global()
@Module({
  providers: [AbuseDetectionService, BanCheckGuard, RedisThrottlerStorage],
  exports: [AbuseDetectionService, BanCheckGuard, RedisThrottlerStorage],
})
export class ThrottleModule {}
