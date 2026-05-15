import { createHmac } from 'crypto';
import { normalizePhone } from './phone-normalizer';

export function hashPhone(e164Phone: string, secret: string): string {
  if (!secret || secret.length < 32) {
    throw new Error('PHONE_HMAC_SECRET must be at least 32 characters');
  }
  return createHmac('sha256', secret).update(e164Phone).digest('hex');
}

export function normalizeAndHash(
  rawPhone: string,
  secret: string,
): { e164: string; hash: string } {
  const e164 = normalizePhone(rawPhone);
  const hash = hashPhone(e164, secret);
  return { e164, hash };
}
