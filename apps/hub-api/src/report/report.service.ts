import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueueProducer } from '../queue/report-queue.producer';
import { PhoneHashService } from '../phone/phone-hash.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportService {
  private readonly logger = new Logger(ReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reportQueue: ReportQueueProducer,
    private readonly phoneHash: PhoneHashService,
  ) {}

  async create(dto: CreateReportDto): Promise<{ jobId: string }> {
    const { hash: phoneHash } = this.phoneHash.hash(dto.phone);

    this.logger.log(`Enqueuing report scenario=${dto.scenarioType} hash=${phoneHash.slice(0, 8)}...`);

    return this.reportQueue.enqueueScamReport({
      phoneHash,
      scenarioType: dto.scenarioType,
      reportedAt: dto.reportedAt ? new Date(dto.reportedAt) : new Date(),
    });
  }

  async findByPhone(rawPhone: string) {
    const { hash: phoneHash } = this.phoneHash.hash(rawPhone);
    return this.prisma.scamReport.findMany({
      where: { phoneHash },
      orderBy: { reportedAt: 'desc' },
      take: 50,
    });
  }

  async getReportCountByPhone(rawPhone: string): Promise<{ count: number; phoneHash: string }> {
    const { hash: phoneHash } = this.phoneHash.hash(rawPhone);
    const count = await this.prisma.scamReport.count({ where: { phoneHash } });
    return { count, phoneHash };
  }
}
