import { normalizePhone } from './phone-normalizer';
import { hashPhone, normalizeAndHash } from './phone-hasher';

const SECRET = 'a'.repeat(32);

describe('normalizePhone', () => {
  it('normalizes 10-digit VN number', () => {
    expect(normalizePhone('0901234567')).toBe('+84901234567');
  });
  it('normalizes +84 prefix', () => {
    expect(normalizePhone('+84901234567')).toBe('+84901234567');
  });
  it('normalizes 0084 prefix', () => {
    expect(normalizePhone('0084901234567')).toBe('+84901234567');
  });
  it('strips spaces and dashes', () => {
    expect(normalizePhone('090 123-4567')).toBe('+84901234567');
  });
  it('throws on invalid number', () => {
    expect(() => normalizePhone('123')).toThrow('Invalid phone number');
  });
});

describe('hashPhone', () => {
  it('produces consistent hash for same input', () => {
    const h1 = hashPhone('+84901234567', SECRET);
    const h2 = hashPhone('+84901234567', SECRET);
    expect(h1).toBe(h2);
  });
  it('produces different hash for different number', () => {
    const h1 = hashPhone('+84901234567', SECRET);
    const h2 = hashPhone('+84901234568', SECRET);
    expect(h1).not.toBe(h2);
  });
  it('is 64-char hex', () => {
    const h = hashPhone('+84901234567', SECRET);
    expect(h).toMatch(/^[0-9a-f]{64}$/);
  });
  it('throws if secret too short', () => {
    expect(() => hashPhone('+84901234567', 'short')).toThrow('PHONE_HMAC_SECRET');
  });
});

describe('normalizeAndHash', () => {
  it('returns e164 and hash', () => {
    const result = normalizeAndHash('0901234567', SECRET);
    expect(result.e164).toBe('+84901234567');
    expect(result.hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
