import { useState, useEffect, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { RiskCacheService, CachedRiskEntry } from '../cache/RiskCacheService';
import { normalizePhone } from '../utils/riskUtils';
import { riskApi } from '../api/apiClient';

// Cache key = normalized E.164 phone (no HMAC on client — server handles hashing)
function cacheKey(phone: string): string {
  return normalizePhone(phone);
}

interface LookupState {
  data:            CachedRiskEntry | null;
  isLoading:       boolean;
  isStale:         boolean;
  cacheAgeMinutes: number | null;
  error:           string | null;
}

async function fetchRisk(phone: string): Promise<Omit<CachedRiskEntry, 'cachedAt'>> {
  const json = await riskApi.lookup(phone);
  return {
    score:   json.score,
    level:   json.level as CachedRiskEntry['level'],
    reasons: json.reasons ?? [],
    source:  'api',
  };
}

export function useRiskLookup(rawPhone: string) {
  const [state, setState] = useState<LookupState>({
    data: null, isLoading: true, isStale: false,
    cacheAgeMinutes: null, error: null,
  });

  const ck = cacheKey(rawPhone);

  const lookup = useCallback(async () => {
    setState(s => ({ ...s, isLoading: true, error: null }));

    // 1. Synchronous MMKV read (< 5ms)
    const cached = RiskCacheService.get(ck);
    if (cached) {
      setState({
        data: cached, isLoading: false, isStale: false,
        cacheAgeMinutes: RiskCacheService.getAgeMinutes(ck), error: null,
      });
    }

    // 2. Check network before API call
    const net = await NetInfo.fetch();
    if (!net.isConnected) {
      setState(s => ({
        ...s, isLoading: false, isStale: !!cached,
        error: cached ? null : 'Không có kết nối mạng',
      }));
      return;
    }

    // 3. Fetch from API — server normalizes + hashes phone internally
    try {
      const fresh = await fetchRisk(rawPhone);
      RiskCacheService.set(ck, fresh);
      setState({
        data: { ...fresh, cachedAt: Date.now() },
        isLoading: false, isStale: false, cacheAgeMinutes: 0, error: null,
      });
    } catch {
      setState(s => ({
        ...s, isLoading: false, isStale: !!cached,
        error: cached ? null : 'Không thể tải dữ liệu rủi ro',
      }));
    }
  }, [ck, rawPhone]);

  useEffect(() => { void lookup(); }, [lookup]);

  // Auto-refresh on network reconnect
  useEffect(() => {
    const unsub = NetInfo.addEventListener(net => {
      if (net.isConnected) void lookup();
    });
    return unsub;
  }, [lookup]);

  return { ...state, refetch: lookup };
}
