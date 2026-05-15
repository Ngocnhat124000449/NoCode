export interface RiskSignal {
  claimsGovernment?: boolean;
  claimsBank?: boolean;
  demandsImmediateTransfer?: boolean;
  createsTimePressure?: boolean;
  threatenedConsequences?: boolean;
  requestsSecrecy?: boolean;
  advisesNoConsult?: boolean;
  involvesMoneytransfer?: boolean;
  involvesUnknownAccount?: boolean;
  involvesCryptoOrGiftcard?: boolean;
  communityReportCount?: number;
  telcoFlagged?: boolean;
  spoofDetected?: boolean;
}

export interface RiskResult {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
  confidence: number;
  action: 'allow' | 'warn' | 'verify' | 'block';
}
