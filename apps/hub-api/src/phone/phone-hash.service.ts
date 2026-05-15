import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { normalizeAndHash, normalizePhone } from '@icproject/shared';

@Injectable()
export class PhoneHashService {
  private readonly secret: string;

  constructor(private readonly config: ConfigService) {
    const secret = this.config.get<string>('PHONE_HMAC_SECRET');
    if (!secret || secret.length < 32) {
      throw new Error('PHONE_HMAC_SECRET must be set and at least 32 characters');
    }
    this.secret = secret;
  }

  normalize(rawPhone: string): string {
    try {
      return normalizePhone(rawPhone);
    } catch (err: any) {
      throw new BadRequestException(`Invalid phone number: ${err.message}`);
    }
  }

  hash(rawPhone: string): { e164: string; hash: string } {
    try {
      return normalizeAndHash(rawPhone, this.secret);
    } catch (err: any) {
      throw new BadRequestException(`Invalid phone number: ${err.message}`);
    }
  }
}
