import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import type { RiskResult } from '@icproject/risk-contract';
import type { RiskTokenPayload, RiskTokenResponse } from '@icproject/risk-contract';

@Injectable()
export class RiskTokenService {
  private readonly logger = new Logger(RiskTokenService.name);
  private readonly secret: string;
  private readonly ttl: number;

  constructor(private readonly config: ConfigService) {
    const secret = this.config.get<string>('RISK_TOKEN_SECRET', '');
    const ttl = this.config.get<number>('RISK_TOKEN_TTL_SECONDS', 600);

    if (!secret || secret.length < 64) {
      throw new Error('RISK_TOKEN_SECRET must be at least 64 characters');
    }

    this.secret = secret;
    this.ttl = Number(ttl);
  }

  generate(result: RiskResult, source = 'hub'): RiskTokenResponse {
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + this.ttl;

    const payload: RiskTokenPayload = {
      riskLevel: result.level,
      score: result.score,
      source,
      issuedAt: now,
      expiresAt,
    };

    const token = jwt.sign(payload, this.secret, {
      algorithm: 'HS256',
      expiresIn: this.ttl,
      issuer: 'icproject-hub',
      audience: 'icproject-bank-gate',
    });

    this.logger.debug(
      `Risk token generated: level=${payload.riskLevel} score=${payload.score} ttl=${this.ttl}s`,
    );

    return { token, expiresAt, ttlSeconds: this.ttl };
  }

  verify(token: string): RiskTokenPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
        issuer: 'icproject-hub',
        audience: 'icproject-bank-gate',
      }) as RiskTokenPayload;

      return decoded;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Risk token expired');
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid risk token');
      }
      throw err;
    }
  }
}
