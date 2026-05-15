import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from './queue.constants';

export interface ScamReportPayload {
  phoneHash: string;
  scenarioType: string;
  reportedAt: Date;
}

@Injectable()
export class ReportQueueProducer {
  private readonly logger = new Logger(ReportQueueProducer.name);

  constructor(
    @InjectQueue(QUEUE_NAMES.REPORT_PROCESSING)
    private readonly reportQueue: Queue,
  ) {}

  async enqueueScamReport(payload: ScamReportPayload): Promise<{ jobId: string }> {
    const job = await this.reportQueue.add(
      JOB_NAMES.PROCESS_SCAM_REPORT,
      payload,
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 100,
        removeOnFail: false,
      },
    );
    this.logger.log(`Enqueued report job: ${job.id}`);
    return { jobId: job.id as string };
  }
}
