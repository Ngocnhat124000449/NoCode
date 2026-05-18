import { riskCache } from './mmkv-instances';
import type { RiskLevel } from '../utils/riskUtils';

export interface CachedRiskEntry {
  score:      number;
  level:      RiskLevel;
  reasons:    string[];
  cachedAt:   number;   // Unix timestamp ms
  source:     'api' | 'local';
}

const RISK_TTL_MS = 60 * 60 * 1000; // 1 hour — matches Kotlin RiskLocalCache TTL

function key(phoneHash: string): string {
  return `risk:${phoneHash}`;
}

export const RiskCacheService = {
  get(phoneHash: string): CachedRiskEntry | null {
    const raw = riskCache.getString(key(phoneHash));
    if (!raw) return null;
    try {
      const entry: CachedRiskEntry = JSON.parse(raw);
      if (Date.now() - entry.cachedAt > RISK_TTL_MS) {
        riskCache.delete(key(phoneHash));
        return null;
      }
      return entry;
    } catch {
      riskCache.delete(key(phoneHash));
      return null;
    }
  },

  set(phoneHash: string, data: Omit<CachedRiskEntry, 'cachedAt'>): void {
    const entry: CachedRiskEntry = { ...data, cachedAt: Date.now() };
    riskCache.set(key(phoneHash), JSON.stringify(entry));
  },

  invalidate(phoneHash: string): void {
    riskCache.delete(key(phoneHash));
  },

  getAgeMinutes(phoneHash: string): number | null {
    const raw = riskCache.getString(key(phoneHash));
    if (!raw) return null;
    try {
      const { cachedAt } = JSON.parse(raw) as CachedRiskEntry;
      return Math.floor((Date.now() - cachedAt) / 60_000);
    } catch {
      return null;
    }
  },
};
