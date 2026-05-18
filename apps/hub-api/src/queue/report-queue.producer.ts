import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from './queue.constants';
import { PrismaService } from '../prisma/prisma.service';

export interface ScamReportPayload {
  phoneHash: string;
  scenarioType: string;
  reportedAt: Date;
}

@Injectable()
export class ReportQueueProducer {
  private readonly logger = new Logger(ReportQueueProducer.name);

  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @InjectQueue(QUEUE_NAMES.REPORT_PROCESSING)
    private readonly reportQueue?: Queue,
  ) {}

  async enqueueScamReport(payload: ScamReportPayload): Promise<{ jobId: string }> {
    if (!this.reportQueue) {
      const report = await this.prisma.scamReport.create({
        data: {
          phoneHash: payload.phoneHash,
          scenarioType: payload.scenarioType,
          reportedAt: payload.reportedAt ? new Date(payload.reportedAt) : new Date(),
        },
      });
      return { jobId: report.id };
    }

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
