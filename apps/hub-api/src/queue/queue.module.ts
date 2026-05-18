import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { ReportQueueProducer } from './report-queue.producer';
import { ReportQueueConsumer } from './report-queue.consumer';

const redisUrl = process.env.REDIS_URL;
const shouldUseQueue = !redisUrl || (/^rediss?:\/\//.test(redisUrl) && !redisUrl.includes('replace_with'));

@Module({
  imports: shouldUseQueue
    ? [
        BullModule.registerQueue(
          { name: QUEUE_NAMES.REPORT_PROCESSING },
          { name: QUEUE_NAMES.RISK_SIGNAL_AGGREGATION },
        ),
      ]
    : [],
  providers: shouldUseQueue
    ? [ReportQueueProducer, ReportQueueConsumer]
    : [ReportQueueProducer],
  exports: [ReportQueueProducer],
})
export class QueueModule {}
