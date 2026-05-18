export { REASON_CODES } from './reason-codes';
export type { ReasonCode } from './reason-codes';
export type { RiskSignal, RiskResult } from './risk-signal';
export { scoreCall } from './risk-engine';
export type { RiskTokenPayload, RiskTokenResponse } from './risk-token';
export {
  OFFICIAL_NUMBERS,
  HOTLINE_PREFIXES,
  classifyPhone,
  normaliseDigits,
} from './vn-phone-rules';
export type { PhoneClassification } from './vn-phone-rules';
