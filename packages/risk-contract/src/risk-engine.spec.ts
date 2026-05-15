import { scoreCall } from './risk-engine';

describe('scoreCall', () => {
  it('returns low risk for empty signal', () => {
    const result = scoreCall({});
    expect(result.score).toBe(0);
    expect(result.level).toBe('low');
    expect(result.reasons).toHaveLength(0);
  });

  it('returns critical for classic scam pattern', () => {
    const result = scoreCall({
      claimsGovernment: true,
      demandsImmediateTransfer: true,
      requestsSecrecy: true,
      threatenedConsequences: true,
    });
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(result.level).toBe('critical');
    expect(result.action).toBe('block');
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('community reports boost score', () => {
    const base = scoreCall({});
    const withReports = scoreCall({ communityReportCount: 20 });
    expect(withReports.score).toBeGreaterThan(base.score);
    expect(withReports.reasons.some((r) => r.includes('RC040'))).toBe(true);
  });

  it('clamps score to 100', () => {
    const result = scoreCall({
      claimsGovernment: true,
      claimsBank: true,
      demandsImmediateTransfer: true,
      createsTimePressure: true,
      threatenedConsequences: true,
      requestsSecrecy: true,
      advisesNoConsult: true,
      involvesMoneytransfer: true,
      involvesUnknownAccount: true,
      communityReportCount: 50,
      spoofDetected: true,
    });
    expect(result.score).toBe(100);
  });

  it('gracefully handles missing telco signals', () => {
    const result = scoreCall({ claimsBank: true });
    expect(result.score).toBeGreaterThan(0);
  });

  it('returns max 5 reason codes', () => {
    const result = scoreCall({
      claimsGovernment: true,
      claimsBank: true,
      demandsImmediateTransfer: true,
      requestsSecrecy: true,
      spoofDetected: true,
      communityReportCount: 10,
    });
    expect(result.reasons.length).toBeLessThanOrEqual(5);
  });

  it('confidence is between 0 and 1', () => {
    const result = scoreCall({ claimsGovernment: true });
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });
});
