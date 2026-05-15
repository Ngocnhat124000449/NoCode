import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RiskTokenService } from './risk-token.service';

const SECRET_64 = 'a'.repeat(64);

const mockResult = {
  score: 75,
  level: 'high' as const,
  reasons: ['[RC001] Caller claims to be government'],
  confidence: 0.8,
  action: 'verify' as const,
};

function makeService(secret = SECRET_64, ttl = 600) {
  return Test.createTestingModule({
    providers: [
      RiskTokenService,
      {
        provide: ConfigService,
        useValue: {
          get: (key: string, def?: any) => {
            if (key === 'RISK_TOKEN_SECRET') return secret;
            if (key === 'RISK_TOKEN_TTL_SECONDS') return ttl;
            return def;
          },
        },
      },
    ],
  })
    .compile()
    .then((m) => m.get(RiskTokenService));
}

describe('RiskTokenService', () => {
  let service: RiskTokenService;

  beforeEach(async () => {
    service = await makeService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generate', () => {
    it('returns a 3-part JWT (header.payload.signature)', () => {
      const { token } = service.generate(mockResult);
      expect(token.split('.')).toHaveLength(3);
    });

    it('returns expiresAt and ttlSeconds', () => {
      const before = Math.floor(Date.now() / 1000);
      const { expiresAt, ttlSeconds } = service.generate(mockResult);
      expect(ttlSeconds).toBe(600);
      expect(expiresAt).toBeGreaterThanOrEqual(before + 600);
    });

    it('token generated in < 10ms', () => {
      const start = Date.now();
      service.generate(mockResult);
      expect(Date.now() - start).toBeLessThan(10);
    });

    it('payload contains no PII', () => {
      const { token } = service.generate(mockResult);
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(
        Buffer.from(payloadB64, 'base64url').toString(),
      );
      expect(payload).not.toHaveProperty('phone');
      expect(payload).not.toHaveProperty('userId');
      expect(payload).not.toHaveProperty('phoneHash');
      expect(payload).not.toHaveProperty('email');
    });

    it('payload contains riskLevel, score, source, issuedAt, expiresAt', () => {
      const { token } = service.generate(mockResult, 'hub');
      const [, payloadB64] = token.split('.');
      const payload = JSON.parse(
        Buffer.from(payloadB64, 'base64url').toString(),
      );
      expect(payload.riskLevel).toBe('high');
      expect(payload.score).toBe(75);
      expect(payload.source).toBe('hub');
      expect(payload.issuedAt).toBeDefined();
      expect(payload.expiresAt).toBeDefined();
    });
  });

  describe('verify', () => {
    it('returns correct payload for valid token', () => {
      const { token } = service.generate(mockResult);
      const payload = service.verify(token);
      expect(payload.riskLevel).toBe('high');
      expect(payload.score).toBe(75);
    });

    it('throws UnauthorizedException for tampered token', () => {
      const { token } = service.generate(mockResult);
      const tampered = token.slice(0, -5) + 'XXXXX';
      expect(() => service.verify(tampered)).toThrow(UnauthorizedException);
      expect(() => service.verify(tampered)).toThrow('Invalid risk token');
    });

    it('throws UnauthorizedException for expired token', async () => {
      const shortLivedService = await makeService(SECRET_64, -1);
      const { token } = shortLivedService.generate(mockResult);
      expect(() => shortLivedService.verify(token)).toThrow(UnauthorizedException);
      expect(() => shortLivedService.verify(token)).toThrow('Risk token expired');
    });

    it('rejects token signed with different secret', async () => {
      const otherService = await makeService('b'.repeat(64));
      const { token } = otherService.generate(mockResult);
      expect(() => service.verify(token)).toThrow(UnauthorizedException);
    });
  });

  describe('constructor', () => {
    it('throws if RISK_TOKEN_SECRET is too short', async () => {
      await expect(makeService('short')).rejects.toThrow(
        'RISK_TOKEN_SECRET must be at least 64 characters',
      );
    });
  });
});
