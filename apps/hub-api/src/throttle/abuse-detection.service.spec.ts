import { Test, TestingModule } from '@nestjs/testing';
import { AbuseDetectionService } from './abuse-detection.service';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

const mockRedis = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
};

const mockPrisma = {
  bannedIp: {
    findFirst: jest.fn(),
    upsert: jest.fn(),
  },
  abuseEvent: {
    create: jest.fn(),
  },
};

describe('AbuseDetectionService', () => {
  let service: AbuseDetectionService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AbuseDetectionService,
        { provide: RedisService, useValue: mockRedis },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AbuseDetectionService>(AbuseDetectionService);
  });

  describe('isBanned', () => {
    it('returns false for clean IP with no soft or hard ban', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.bannedIp.findFirst.mockResolvedValue(null);

      const result = await service.isBanned('1.2.3.4');
      expect(result).toBe(false);
    });

    it('returns true when soft ban is in Redis', async () => {
      mockRedis.get.mockResolvedValue(true);

      const result = await service.isBanned('1.2.3.4');
      expect(result).toBe(true);
      expect(mockPrisma.bannedIp.findFirst).not.toHaveBeenCalled();
    });

    it('returns true when hard ban exists in DB', async () => {
      mockRedis.get.mockResolvedValue(null);
      mockPrisma.bannedIp.findFirst.mockResolvedValue({ ip: '1.2.3.4', active: true });

      const result = await service.isBanned('1.2.3.4');
      expect(result).toBe(true);
    });
  });

  describe('softBan', () => {
    it('sets Redis key with 15-min TTL and logs AbuseEvent', async () => {
      mockRedis.set.mockResolvedValue('OK');
      mockPrisma.abuseEvent.create.mockResolvedValue({});

      await service.softBan('5.6.7.8', 'burst detected');

      expect(mockRedis.set).toHaveBeenCalledWith('ban:soft:5.6.7.8', true, 900);
      expect(mockPrisma.abuseEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ip: '5.6.7.8', banType: 'soft' }),
        }),
      );
    });
  });

  describe('hardBan', () => {
    it('upserts BannedIp record in DB', async () => {
      mockPrisma.bannedIp.upsert.mockResolvedValue({});

      await service.hardBan('9.9.9.9', 'permanent ban');

      expect(mockPrisma.bannedIp.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ip: '9.9.9.9' },
          create: expect.objectContaining({ ip: '9.9.9.9', active: true }),
        }),
      );
    });
  });

  describe('recordRequest', () => {
    it('increments counter and does not ban below threshold', async () => {
      mockRedis.get.mockResolvedValue(3);
      mockRedis.set.mockResolvedValue('OK');

      await service.recordRequest('2.2.2.2', '/report');

      expect(mockRedis.set).toHaveBeenCalledWith('abuse:rate:2.2.2.2:/report', 4, 60);
      expect(mockPrisma.abuseEvent.create).not.toHaveBeenCalled();
    });

    it('triggers soft ban when request count reaches threshold (10)', async () => {
      mockRedis.get.mockResolvedValueOnce(9);
      mockRedis.set.mockResolvedValue('OK');
      mockPrisma.abuseEvent.create.mockResolvedValue({});

      await service.recordRequest('3.3.3.3', '/report');

      expect(mockPrisma.abuseEvent.create).toHaveBeenCalledTimes(1);
    });
  });
});
