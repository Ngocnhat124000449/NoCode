export const REASON_CODES = {
  RC001: 'Caller claims to be government official or law enforcement',
  RC002: 'Caller claims to be bank representative',
  RC003: 'Caller uses official-sounding terminology without verification path',
  RC010: 'Caller demands immediate money transfer',
  RC011: 'Caller creates artificial time pressure (must act now)',
  RC012: 'Caller threatens consequences for non-compliance',
  RC020: 'Caller instructs recipient to keep conversation secret',
  RC021: 'Caller advises not to consult family or bank',
  RC030: 'Request involves transferring money to unfamiliar account',
  RC031: 'Request involves cryptocurrency or gift card payment',
  RC032: 'Transfer amount unusually large relative to normal usage',
  RC040: 'Number previously reported as scam by community',
  RC041: 'Number flagged as spam by telco data',
  RC042: 'Number spoofed (mismatches caller ID pattern)',
} as const;

export type ReasonCode = keyof typeof REASON_CODES;
