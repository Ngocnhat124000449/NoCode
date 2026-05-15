import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PhoneHashService } from './phone-hash.service';

const VALID_SECRET = 'a'.repeat(32);

function makeModule(secret: string) {
  return Test.createTestingModule({
    providers: [
      PhoneHashService,
      {
        provide: ConfigService,
        useValue: { get: jest.fn().mockReturnValue(secret) },
      },
    ],
  }).compile();
}

describe('PhoneHashService', () => {
  let service: PhoneHashService;

  beforeEach(async () => {
    const module: TestingModule = await makeModule(VALID_SECRET);
    service = module.get<PhoneHashService>(PhoneHashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('hash', () => {
    it('returns e164 and 64-char hex hash', () => {
      const result = service.hash('0901234567');

      expect(result.e164).toBe('+84901234567');
      expect(result.hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('is deterministic — same input → same hash', () => {
      const r1 = service.hash('0901234567');
      const r2 = service.hash('0901234567');

      expect(r1.hash).toBe(r2.hash);
    });

    it('normalizes +84 prefix to same hash as 0 prefix', () => {
      const r1 = service.hash('0901234567');
      const r2 = service.hash('+84901234567');

      expect(r1.hash).toBe(r2.hash);
    });

    it('normalizes 0084 prefix to same hash', () => {
      const r1 = service.hash('0901234567');
      const r2 = service.hash('0084901234567');

      expect(r1.hash).toBe(r2.hash);
    });

    it('throws BadRequestException for invalid phone', () => {
      expect(() => service.hash('123')).toThrow(BadRequestException);
    });

    it('produces different hash for different numbers', () => {
      const r1 = service.hash('0901234567');
      const r2 = service.hash('0901234568');

      expect(r1.hash).not.toBe(r2.hash);
    });
  });

  describe('constructor', () => {
    it('throws if PHONE_HMAC_SECRET is too short', async () => {
      await expect(makeModule('short')).rejects.toThrow(
        'PHONE_HMAC_SECRET must be set',
      );
    });
  });
});
