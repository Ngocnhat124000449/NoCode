import { RiskSignal, RiskResult } from './risk-signal';
import { REASON_CODES, ReasonCode } from './reason-codes';
import rules from './rules.json';

export function scoreCall(signal: RiskSignal): RiskResult {
  let rawScore = 0;
  const firedCodes: ReasonCode[] = [];

  for (const rule of rules.rules) {
    if (signal[rule.signal as keyof RiskSignal]) {
      rawScore += rule.weight;
      firedCodes.push(rule.code as ReasonCode);
    }
  }

  const reportCount = signal.communityReportCount ?? 0;
  if (reportCount >= rules.communityReportBoost.threshold20) {
    rawScore += rules.communityReportBoost.boost20;
    firedCodes.push('RC040');
  } else if (reportCount >= rules.communityReportBoost.threshold5) {
    rawScore += rules.communityReportBoost.boost5;
    firedCodes.push('RC040');
  } else if (reportCount >= rules.communityReportBoost.threshold1) {
    rawScore += rules.communityReportBoost.boost1;
    firedCodes.push('RC040');
  }

  if (signal.telcoFlagged) {
    rawScore += rules.telcoFlaggedBoost;
    firedCodes.push('RC041');
  }
  if (signal.spoofDetected) {
    rawScore += rules.spoofDetectedBoost;
    firedCodes.push('RC042');
  }

  const score = Math.min(100, Math.max(0, rawScore));
  const { level, action } = classifyScore(score);

  const totalSignals = rules.rules.length;
  const providedSignals = rules.rules.filter(
    (r) => signal[r.signal as keyof RiskSignal] !== undefined,
  ).length;
  const confidence = +(providedSignals / totalSignals).toFixed(2);

  const uniqueCodes = [...new Set(firedCodes)].slice(0, 5);
  const reasons = uniqueCodes.map((code) => `[${code}] ${REASON_CODES[code]}`);

  return { score, level, reasons, confidence, action };
}

function classifyScore(score: number): {
  level: RiskResult['level'];
  action: RiskResult['action'];
} {
  if (score >= 80) return { level: 'critical', action: 'block' };
  if (score >= 60) return { level: 'high', action: 'verify' };
  if (score >= 35) return { level: 'medium', action: 'warn' };
  return { level: 'low', action: 'allow' };
}
