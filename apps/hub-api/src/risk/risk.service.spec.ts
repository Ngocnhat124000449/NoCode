import { Test, TestingModule } from '@nestjs/testing';
import { RiskService } from './risk.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { PhoneHashService } from '../phone/phone-hash.service';
import { MetricsService } from '../metrics/metrics.service';

const mockPrisma = {
  riskScore: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
  scamReport: {
    count: jest.fn(),
  },
};

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockPhoneHash = {
  hash: jest.fn().mockReturnValue({
    e164: '+84901234567',
    hash: 'deadbeef1234'.padEnd(64, '0'),
  }),
};

const mockEndTimer = jest.fn();
const mockMetrics = {
  lookupLatency: { startTimer: jest.fn().mockReturnValue(mockEndTimer) },
  cacheHits: { inc: jest.fn() },
  cacheMisses: { inc: jest.fn() },
  callTimeouts: { inc: jest.fn() },
  reportsTotal: { inc: jest.fn() },
  falsePositives: { inc: jest.fn() },
};

describe('RiskService', () => {
  let service: RiskService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockMetrics.lookupLatency.startTimer.mockReturnValue(mockEndTimer);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiskService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedis },
        { provide: PhoneHashService, useValue: mockPhoneHash },
        { provide: MetricsService, useValue: mockMetrics },
      ],
    }).compile();

    service = module.get<RiskService>(RiskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('score — real engine', () => {
    it('returns 0/low/allow for empty signals', async () => {
      const result = await service.score({});
      expect(result.score).toBe(0);
      expect(result.level).toBe('low');
      expect(result.action).toBe('allow');
      expect(result.reasons).toHaveLength(0);
    });

    it('returns critical for classic scam pattern', async () => {
      const result = await service.score({
        claimsGovernment: true,
        demandsImmediateTransfer: true,
        requestsSecrecy: true,
        threatenedConsequences: true,
      });
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.level).toBe('critical');
      expect(result.action).toBe('block');
      expect(result.reasons.length).toBeGreaterThan(0);
    });

    it('returns medium for mild signals', async () => {
      const result = await service.score({
        claimsBank: true,
        createsTimePressure: true,
      });
      expect(result.score).toBeGreaterThanOrEqual(35);
      expect(['medium', 'high', 'critical']).toContain(result.level);
    });

    it('reason codes have [RCxxx] prefix', async () => {
      const result = await service.score({ claimsGovernment: true });
      expect(result.reasons[0]).toMatch(/^\[RC\d{3}\]/);
    });

    it('confidence is between 0 and 1', async () => {
      const result = await service.score({ claimsGovernment: true });
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('clamps score to max 100', async () => {
      const result = await service.score({
        claimsGovernment: true,
        claimsBank: true,
        demandsImmediateTransfer: true,
        createsTimePressure: true,
        threatenedConsequences: true,
        requestsSecrecy: true,
        advisesNoConsult: true,
        involvesMoneytransfer: true,
        involvesUnknownAccount: true,
        involvesCryptoOrGiftcard: true,
        communityReportCount: 50,
        spoofDetected: true,
      });
      expect(result.score).toBe(100);
    });
  });

  describe('scoreByPhone', () => {
    it('enriches signals with communityReportCount from DB', async () => {
      mockPrisma.scamReport.count.mockResolvedValue(5);
      mockPrisma.riskScore.upsert.mockResolvedValue({});
      mockRedis.del.mockResolvedValue(1);

      const result = await service.scoreByPhone('0901234567', {
        claimsGovernment: true,
      });

      expect(mockPrisma.scamReport.count).toHaveBeenCalledWith({
        where: { phoneHash: 'deadbeef1234'.padEnd(64, '0') },
      });
      // With claimsGovernment(25) + communityReportCount>=5 boost(20) = 45 → medium
      expect(result.score).toBeGreaterThan(0);
      expect(result.reasons.some((r) => r.includes('RC040'))).toBe(true);
    });

    it('persists score after computation', async () => {
      mockPrisma.scamReport.count.mockResolvedValue(0);
      mockPrisma.riskScore.upsert.mockResolvedValue({});
      mockRedis.del.mockResolvedValue(1);

      await service.scoreByPhone('0901234567', { claimsBank: true });

      expect(mockPrisma.riskScore.upsert).toHaveBeenCalledTimes(1);
      expect(mockRedis.del).toHaveBeenCalledTimes(1);
    });
  });

  describe('getStoredScore — cache-first strategy', () => {
    it('returns cached value without hitting DB', async () => {
      const cached = { score: 75, level: 'high' };
      mockRedis.get.mockResolvedValue(cached);

      const result = await service.getStoredScore('deadbeef1234');

      expect(result).toEqual(cached);
      expect(mockPrisma.riskScore.findUnique).not.toHaveBeenCalled();
    });

    it('falls back to DB on cache miss and stores result', async () => {
      mockRedis.get.mockResolvedValue(null);
      const dbRecord = { phoneHash: 'deadbeef1234', score: 50, level: 'medium' };
      mockPrisma.riskScore.findUnique.mockResolvedValue(dbRecord);

      const result = await service.getStoredScore('deadbeef1234');

      expect(result).toEqual(dbRecord);
      expect(mockRedis.set).toHaveBeenCalledWith('risk:deadbeef1234', dbRecord, 300);
    });

    it('returns null when both cache and DB miss', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.riskScore.findUnique.mockResolvedValue(null);

      const result = await service.getStoredScore('unknownhash');
      expect(result).toBeNull();
    });
  });

  describe('upsertScore', () => {
    it('invalidates cache after upsert', async () => {
      mockPrisma.riskScore.upsert.mockResolvedValue({ phoneHash: 'abc123' });

      await service.upsertScore('abc123', {
        score: 80,
        level: 'critical',
        reasons: ['[RC001] ...'],
        confidence: 0.9,
        action: 'block',
      });

      expect(mockRedis.del).toHaveBeenCalledWith('risk:abc123');
    });
  });
});
