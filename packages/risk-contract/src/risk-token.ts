export interface RiskTokenPayload {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  source: string;
  issuedAt: number;
  expiresAt: number;
  // NO phone number, NO user ID, NO PII
}

export interface RiskTokenResponse {
  token: string;
  expiresAt: number;
  ttlSeconds: number;
}
