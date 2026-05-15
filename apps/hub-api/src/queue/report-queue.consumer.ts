import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_NAMES, JOB_NAMES } from './queue.constants';
import { PrismaService } from '../prisma/prisma.service';
import { ScamReportPayload } from './report-queue.producer';

@Processor(QUEUE_NAMES.REPORT_PROCESSING, { concurrency: 5 })
export class ReportQueueConsumer extends WorkerHost {
  private readonly logger = new Logger(ReportQueueConsumer.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.log(`Processing job ${job.id}: ${job.name}`);

    switch (job.name) {
      case JOB_NAMES.PROCESS_SCAM_REPORT:
        await this.processScamReport(job.data as ScamReportPayload);
        break;
      default:
        throw new Error(`Unknown job: ${job.name}`);
    }
  }

  private async processScamReport(data: ScamReportPayload): Promise<void> {
    await this.prisma.scamReport.create({
      data: {
        phoneHash: data.phoneHash,
        scenarioType: data.scenarioType,
        reportedAt: data.reportedAt ? new Date(data.reportedAt) : new Date(),
      },
    });
    // TODO Phase 2: trigger risk signal aggregation
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(
      `Job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(
      `Job ${job.id} completed in ${job.processedOn! - job.timestamp}ms`,
    );
  }
}
