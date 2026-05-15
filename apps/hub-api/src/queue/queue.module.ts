import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from './queue.constants';
import { ReportQueueProducer } from './report-queue.producer';
import { ReportQueueConsumer } from './report-queue.consumer';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.REPORT_PROCESSING },
      { name: QUEUE_NAMES.RISK_SIGNAL_AGGREGATION },
    ),
  ],
  providers: [ReportQueueProducer, ReportQueueConsumer],
  exports: [ReportQueueProducer],
})
export class QueueModule {}
