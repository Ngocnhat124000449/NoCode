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

  async create(dto: CreateReportDto, reporterId?: string): Promise<{ jobId: string }> {
    const { hash: phoneHash } = this.phoneHash.hash(dto.phone);

    this.logger.log(`Enqueuing report scenario=${dto.scenarioType} hash=${phoneHash.slice(0, 8)}...`);

    return this.reportQueue.enqueueScamReport({
      phoneHash,
      scenarioType: dto.scenarioType,
      reporterId,
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

  /** List reports submitted by a specific user, newest first. */
  async findByReporter(reporterId: string, limit = 50) {
    return this.prisma.scamReport.findMany({
      where: { reporterId },
      orderBy: { reportedAt: 'desc' },
      take: limit,
    });
  }

  /** Single report by id. Returns null if not found OR if not owned by reporterId. */
  async findOneOwned(id: string, reporterId: string) {
    const report = await this.prisma.scamReport.findUnique({ where: { id } });
    if (!report || report.reporterId !== reporterId) return null;
    return report;
  }

  /** Per-user counters used by HomeScreen. */
  async getStatsForUser(reporterId: string) {
    const reportCount = await this.prisma.scamReport.count({ where: { reporterId } });
    // Trust score is a simple monotonic function of report count, capped at 100.
    // 0 reports → 50 (neutral baseline), every 2 reports adds 5 points.
    const trustScore = Math.min(100, 50 + Math.floor(reportCount / 2) * 5);
    return { reportCount, trustScore };
  }
}
