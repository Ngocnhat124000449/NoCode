import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { ReportQueueProducer } from './report-queue.producer';
import { ReportQueueConsumer } from './report-queue.consumer';
import { PrismaService } from '../prisma/prisma.service';
import { QUEUE_NAMES, JOB_NAMES } from './queue.constants';

const mockJob = { id: 'job-001', name: JOB_NAMES.PROCESS_SCAM_REPORT };

const mockQueue = {
  add: jest.fn().mockResolvedValue(mockJob),
};

const mockPrisma = {
  scamReport: {
    create: jest.fn().mockResolvedValue({ id: 'report-001' }),
  },
};

describe('ReportQueueProducer', () => {
  let producer: ReportQueueProducer;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportQueueProducer,
        {
          provide: getQueueToken(QUEUE_NAMES.REPORT_PROCESSING),
          useValue: mockQueue,
        },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    producer = module.get<ReportQueueProducer>(ReportQueueProducer);
  });

  it('should be defined', () => {
    expect(producer).toBeDefined();
  });

  describe('enqueueScamReport', () => {
    const payload = {
      phoneHash: 'deadbeef1234',
      scenarioType: 'impersonation',
      reportedAt: new Date('2026-01-01'),
    };

    it('returns jobId on enqueue', async () => {
      const result = await producer.enqueueScamReport(payload);

      expect(result).toEqual({ jobId: 'job-001' });
    });

    it('enqueues with 3 retry attempts', async () => {
      await producer.enqueueScamReport(payload);

      const callOptions = mockQueue.add.mock.calls[0][2];
      expect(callOptions.attempts).toBe(3);
    });

    it('uses exponential backoff', async () => {
      await producer.enqueueScamReport(payload);

      const callOptions = mockQueue.add.mock.calls[0][2];
      expect(callOptions.backoff).toEqual({ type: 'exponential', delay: 2000 });
    });

    it('preserves failed jobs (dead letter)', async () => {
      await producer.enqueueScamReport(payload);

      const callOptions = mockQueue.add.mock.calls[0][2];
      expect(callOptions.removeOnFail).toBe(false);
    });

    it('enqueues with correct job name', async () => {
      await producer.enqueueScamReport(payload);

      expect(mockQueue.add).toHaveBeenCalledWith(
        JOB_NAMES.PROCESS_SCAM_REPORT,
        payload,
        expect.any(Object),
      );
    });

    it('is non-blocking — add() called once and returns', async () => {
      const start = Date.now();
      await producer.enqueueScamReport(payload);
      const elapsed = Date.now() - start;

      expect(mockQueue.add).toHaveBeenCalledTimes(1);
      expect(elapsed).toBeLessThan(50);
    });

    it('writes directly when queue provider is unavailable', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ReportQueueProducer,
          { provide: PrismaService, useValue: mockPrisma },
        ],
      }).compile();
      const fallbackProducer = module.get<ReportQueueProducer>(ReportQueueProducer);

      const result = await fallbackProducer.enqueueScamReport(payload);

      expect(result).toEqual({ jobId: 'report-001' });
      expect(mockPrisma.scamReport.create).toHaveBeenCalledWith({
        data: {
          phoneHash: payload.phoneHash,
          scenarioType: payload.scenarioType,
          reportedAt: payload.reportedAt,
        },
      });
    });
  });
});

describe('ReportQueueConsumer', () => {
  let consumer: ReportQueueConsumer;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportQueueConsumer,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    consumer = module.get<ReportQueueConsumer>(ReportQueueConsumer);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('process', () => {
    it('processes PROCESS_SCAM_REPORT job', async () => {
      const job = {
        id: 'job-001',
        name: JOB_NAMES.PROCESS_SCAM_REPORT,
        data: {
          phoneHash: 'abc123',
          scenarioType: 'impersonation',
          reportedAt: new Date(),
        },
        attemptsMade: 0,
      } as any;

      await consumer.process(job);

      expect(mockPrisma.scamReport.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phoneHash: 'abc123',
          scenarioType: 'impersonation',
        }),
      });
    });

    it('throws for unknown job name', async () => {
      const job = {
        id: 'job-002',
        name: 'unknown-job',
        data: {},
        attemptsMade: 0,
      } as any;

      await expect(consumer.process(job)).rejects.toThrow('Unknown job');
    });
  });
});
