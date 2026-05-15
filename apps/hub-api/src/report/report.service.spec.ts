import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ReportService } from './report.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReportQueueProducer } from '../queue/report-queue.producer';
import { PhoneHashService } from '../phone/phone-hash.service';
import { ScenarioType } from './dto/create-report.dto';

const mockPrisma = {
  scamReport: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

const mockQueue = {
  enqueueScamReport: jest.fn().mockResolvedValue({ jobId: 'job-001' }),
};

const mockPhoneHash = {
  hash: jest.fn().mockReturnValue({
    e164: '+84901234567',
    hash: 'abc123deadbeef'.padEnd(64, '0'),
  }),
};

describe('ReportService', () => {
  let service: ReportService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ReportQueueProducer, useValue: mockQueue },
        { provide: PhoneHashService, useValue: mockPhoneHash },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('returns jobId from queue', async () => {
      const result = await service.create({
        phone: '0901234567',
        scenarioType: ScenarioType.IMPERSONATION,
      });

      expect(result).toEqual({ jobId: 'job-001' });
      expect(mockQueue.enqueueScamReport).toHaveBeenCalledTimes(1);
    });

    it('normalizes and hashes phone before enqueue', async () => {
      await service.create({
        phone: '0901234567',
        scenarioType: ScenarioType.IMPERSONATION,
      });

      expect(mockPhoneHash.hash).toHaveBeenCalledWith('0901234567');
      const enqueueArg = mockQueue.enqueueScamReport.mock.calls[0][0];
      expect(enqueueArg.phoneHash).toBe('abc123deadbeef'.padEnd(64, '0'));
    });

    it('never sends raw phone to queue', async () => {
      await service.create({
        phone: '0901234567',
        scenarioType: ScenarioType.INVESTMENT_FRAUD,
      });

      const enqueueArg = mockQueue.enqueueScamReport.mock.calls[0][0];
      expect(enqueueArg).not.toHaveProperty('phone');
      expect(mockPrisma.scamReport.create).not.toHaveBeenCalled();
    });

    it('rejects invalid phone via PhoneHashService', async () => {
      mockPhoneHash.hash.mockImplementationOnce(() => {
        throw new BadRequestException('Invalid phone number');
      });

      await expect(
        service.create({ phone: '123', scenarioType: ScenarioType.OTHER }),
      ).rejects.toThrow(BadRequestException);
    });

    it('uses provided reportedAt when given', async () => {
      const reportedAt = '2026-01-15T10:00:00.000Z';

      await service.create({
        phone: '0901234567',
        scenarioType: ScenarioType.LOTTERY_SCAM,
        reportedAt,
      });

      const enqueueArg = mockQueue.enqueueScamReport.mock.calls[0][0];
      expect(enqueueArg.reportedAt).toEqual(new Date(reportedAt));
    });
  });

  describe('getReportCountByPhone', () => {
    it('hashes phone and returns count', async () => {
      mockPrisma.scamReport.count.mockResolvedValue(7);

      const result = await service.getReportCountByPhone('0901234567');

      expect(mockPhoneHash.hash).toHaveBeenCalledWith('0901234567');
      expect(result.count).toBe(7);
      expect(result.phoneHash).toBe('abc123deadbeef'.padEnd(64, '0'));
    });
  });
});
