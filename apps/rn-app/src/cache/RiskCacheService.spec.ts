const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: (k: string) => mockStore.get(k) ?? undefined,
    set:       (k: string, v: string) => mockStore.set(k, v),
    delete:    (k: string) => mockStore.delete(k),
  })),
}));

import { RiskCacheService } from './RiskCacheService';

beforeEach(() => mockStore.clear());

describe('RiskCacheService', () => {
  const phone = '+84988000111';
  const entry = { score: 97, level: 'critical' as const, reasons: ['[RC001]'], source: 'api' as const };

  it('returns null for missing key', () => {
    expect(RiskCacheService.get('unknown')).toBeNull();
  });

  it('stores and retrieves entry', () => {
    RiskCacheService.set(phone, entry);
    const result = RiskCacheService.get(phone);
    expect(result).not.toBeNull();
    expect(result!.score).toBe(97);
    expect(result!.level).toBe('critical');
  });

  it('returns null for stale entry (expired TTL)', () => {
    const stale = JSON.stringify({ ...entry, cachedAt: Date.now() - 2 * 60 * 60 * 1000 });
    mockStore.set(`risk:${phone}`, stale);
    expect(RiskCacheService.get(phone)).toBeNull();
    expect(mockStore.has(`risk:${phone}`)).toBe(false);
  });

  it('returns null for corrupted JSON', () => {
    mockStore.set(`risk:${phone}`, '{bad json}');
    expect(RiskCacheService.get(phone)).toBeNull();
  });

  it('invalidate removes entry', () => {
    RiskCacheService.set(phone, entry);
    RiskCacheService.invalidate(phone);
    expect(RiskCacheService.get(phone)).toBeNull();
  });

  it('getAgeMinutes returns null for missing key', () => {
    expect(RiskCacheService.getAgeMinutes('missing')).toBeNull();
  });

  it('getAgeMinutes returns 0 for fresh entry', () => {
    RiskCacheService.set(phone, entry);
    expect(RiskCacheService.getAgeMinutes(phone)).toBe(0);
  });
});
