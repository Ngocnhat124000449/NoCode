import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

// Mock ioredis
const mockRedisClient = {
  get: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  quit: jest.fn().mockResolvedValue('OK'),
  on: jest.fn(),
};

jest.mock('ioredis', () => {
  const RedisMock = jest.fn().mockImplementation(() => mockRedisClient);
  return { default: RedisMock, __esModule: true };
});

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockRedisClient.on.mockImplementation(() => mockRedisClient);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('redis://localhost:6379') },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('returns parsed value on cache hit', async () => {
      mockRedisClient.get.mockResolvedValue(JSON.stringify({ score: 75 }));

      const result = await service.get<{ score: number }>('risk:abc');

      expect(result).toEqual({ score: 75 });
    });

    it('returns null on cache miss', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get('risk:missing');

      expect(result).toBeNull();
    });

    it('returns null when circuit is open', async () => {
      // Force circuit open
      (service as any).circuitOpen = true;

      const result = await service.get('risk:any');

      expect(result).toBeNull();
      expect(mockRedisClient.get).not.toHaveBeenCalled();
    });

    it('returns null on redis error without throwing', async () => {
      mockRedisClient.get.mockRejectedValue(new Error('ECONNRESET'));

      const result = await service.get('risk:broken');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('calls setex with TTL', async () => {
      mockRedisClient.setex.mockResolvedValue('OK');

      await service.set('risk:abc', { score: 50 }, 300);

      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'risk:abc',
        300,
        JSON.stringify({ score: 50 }),
      );
    });

    it('is no-op when circuit is open', async () => {
      (service as any).circuitOpen = true;

      await service.set('risk:any', { score: 50 }, 300);

      expect(mockRedisClient.setex).not.toHaveBeenCalled();
    });
  });

  describe('del', () => {
    it('calls del on client', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await service.del('risk:abc');

      expect(mockRedisClient.del).toHaveBeenCalledWith('risk:abc');
    });
  });

  describe('circuit breaker', () => {
    it('circuit opens after 3 failures', () => {
      const errorHandler = mockRedisClient.on.mock.calls.find(
        (call) => call[0] === 'error',
      )?.[1];

      expect(errorHandler).toBeDefined();

      // Simulate 3 errors
      errorHandler(new Error('fail 1'));
      errorHandler(new Error('fail 2'));
      errorHandler(new Error('fail 3'));

      expect(service.isCircuitOpen()).toBe(true);
    });

    it('circuit resets on reconnect', () => {
      (service as any).circuitOpen = true;
      (service as any).failureCount = 5;

      const connectHandler = mockRedisClient.on.mock.calls.find(
        (call) => call[0] === 'connect',
      )?.[1];

      expect(connectHandler).toBeDefined();
      connectHandler();

      expect(service.isCircuitOpen()).toBe(false);
      expect((service as any).failureCount).toBe(0);
    });
  });
});
