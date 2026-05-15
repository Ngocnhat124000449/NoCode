export const CACHE_TTL = {
  RISK_LOOKUP: 300,       // 5 min — phone risk score
  REPORT_TRENDING: 60,    // 1 min — trending scam numbers
  RATE_LIMIT_WINDOW: 60,  // 1 min — rate limiting window
  RISK_TOKEN: 900,        // 15 min — risk token validity
} as const;
